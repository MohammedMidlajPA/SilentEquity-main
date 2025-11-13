const { stripe } = require('../config/stripe');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { sendPaymentConfirmationEmail } = require('../utils/email');
const { logPaymentCreation, logPaymentSuccess, logPaymentFailure, logWebhookEvent } = require('../utils/logger');
const { convertUSDToINR } = require('../utils/currency');
const { validatePaymentRequest, validateStripeSessionId } = require('../utils/validation');
const mongoose = require('mongoose');

/**
 * Create Stripe Checkout Session
 * Unified payment flow for both Card and UPI payments
 * Stripe automatically handles 3D Secure, mobile optimization, and sends receipt emails
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    // No user details required - Stripe Checkout will collect them
    // This simplifies the flow: user clicks "Reserve your slot" → goes directly to Stripe

    // Get base price from environment
    const basePrice = parseFloat(process.env.WEBINAR_PRICE);
    if (!basePrice || basePrice <= 0) {
      return res.status(500).json({
        success: false,
        message: 'Webinar price not configured'
      });
    }
    
    // Convert USD to INR using real-time or cached exchange rate
    const amountInINR = await convertUSDToINR(basePrice);
    
    if (!amountInINR || amountInINR <= 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate payment amount'
      });
    }
    
    // Validate required environment variables
    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({
        success: false,
        message: 'Frontend URL not configured'
      });
    }

    // Google Form URL for verification (users must complete after payment)
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScxS_5gOlOif-wuXM8JFgnac1gQC9hqLBb9EWLAKmszFKNDxg/viewform?usp=publish-editor';

    // Create Stripe Checkout Session
    // Stripe will collect customer name, email, and phone automatically
    // Using INR currency for Indian market
    // Note: Omitting payment_method_types allows Stripe to automatically show all available methods
    // based on your Dashboard settings, including UPI if enabled for your account
    const checkoutSession = await stripe.checkout.sessions.create({
      // Omitting payment_method_types lets Stripe auto-detect and show all eligible payment methods
      // This includes UPI if your account has it enabled in Dashboard > Settings > Payment Methods
      // Stripe will show the most relevant methods based on customer location and currency
      // For Indian customers with INR, Stripe will show UPI if available, otherwise card
      line_items: [{
        price_data: {
          currency: 'inr', // INR required for UPI, cards will work with currency conversion
          product_data: {
            name: 'Silent Edge Execution Masterclass',
            description: 'Webinar Registration - Access to exclusive trading masterclass'
          },
          unit_amount: amountInINR,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}`,
      // Stripe will collect customer information (name, email, phone)
      billing_address_collection: 'required', // Collect billing address
      // Stripe will automatically send receipt email
      // Metadata will be populated from Stripe's collected data via webhook
      metadata: {
        webinarTitle: 'Silent Edge Execution Masterclass',
        originalAmountUSD: basePrice.toFixed(2),
        amountINR: (amountInINR / 100).toFixed(2),
        googleFormUrl: GOOGLE_FORM_URL
      },
      // Allow payment method selection (card or UPI)
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic' // Automatic 3D Secure handling
        }
      },
      // Expire checkout session after 24 hours
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    });
    
    console.log('✅ Checkout session created:', checkoutSession.id);

    logPaymentCreation({
      amount: amountInINR,
      currency: 'inr',
      paymentMethod: 'checkout',
      stripePaymentIntentId: checkoutSession.id,
      originalAmountUSD: basePrice
    });

    res.status(200).json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    });

  } catch (error) {
    console.error('❌ Create checkout session error:', error);
    
    // Determine error type
    let statusCode = 500;
    let errorMessage = 'Failed to create checkout session';
    
    if (error.type === 'StripeInvalidRequestError') {
      statusCode = 400;
      errorMessage = 'Invalid payment request';
    } else if (error.type === 'StripeAPIError') {
      statusCode = 502;
      errorMessage = 'Payment service temporarily unavailable';
    }
    
    logPaymentFailure({
      error: error.message,
      errorType: 'checkout_session_creation_failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      amount: parseFloat(process.env.WEBINAR_PRICE) || 0
    });
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify Checkout Session
 * Check payment status when user returns from Stripe Checkout
 */
exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.query;

    // Validate session ID format
    const sessionValidation = validateStripeSessionId(sessionId);
    if (!sessionValidation.valid) {
      return res.status(400).json({
        success: false,
        message: sessionValidation.error
      });
    }

    // Retrieve checkout session from Stripe with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    let session;
    try {
      session = await Promise.race([
        stripe.checkout.sessions.retrieve(sessionValidation.value, {
          expand: ['payment_intent', 'payment_intent.charges']
        }),
        new Promise((_, reject) => {
          timeoutId;
          setTimeout(() => reject(new Error('Request timeout')), 10000);
        })
      ]);
      clearTimeout(timeoutId);
    } catch (stripeError) {
      clearTimeout(timeoutId);
      if (stripeError.type === 'StripeInvalidRequestError') {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      throw stripeError;
    }

    // Find payment record
    const payment = await Payment.findOne({
      stripePaymentIntentId: session.id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Get receipt URL if available
    let receiptUrl = null;
    if (session.payment_intent && session.payment_intent.charges && session.payment_intent.charges.data.length > 0) {
      const charge = session.payment_intent.charges.data[0];
      receiptUrl = charge.receipt_url;
    }

    // Return session status
    res.status(200).json({
      success: true,
      paymentStatus: session.payment_status,
      status: session.payment_status === 'paid' ? 'succeeded' : session.payment_status,
      hasPaid: session.payment_status === 'paid',
      receiptUrl: receiptUrl,
      amount: session.amount_total,
      currency: session.currency,
      paymentMethod: session.payment_method_types?.[0] || 'unknown'
    });

  } catch (error) {
    console.error('❌ Verify checkout session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify checkout session',
      error: error.message
    });
  }
};

/**
 * Create Payment Intent with 3D Secure Authentication
 * Step 1: Initialize payment with mandatory authentication
 * @deprecated Use createCheckoutSession instead
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { name, email, phone } = req.body;   

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and phone are required'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Get or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        phone
      });
      await user.save();
      console.log('✅ New user created:', email);
    } else {
      // Update user details if changed
      user.name = name;
      user.phone = phone;
      await user.save();
      console.log('✅ User updated:', email);
    }

    // Calculate amount in cents
    const amount = Math.round((parseFloat(process.env.WEBINAR_PRICE) || 4.5) * 100);

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      // let Stripe choose payment methods automatically
      automatic_payment_methods: { enabled: true },
      // prefer automatic 3DS handling rather than forcing 'any'
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      },
      metadata: {
        userId: user._id.toString(),
        userName: name,
        userEmail: email,
        userPhone: phone,
        webinarTitle: 'Silent Edge Execution Masterclass'
      },
      description: 'Silent Edge Execution Masterclass Registration'
    });

    // Note: return_url is not needed here - Stripe Elements handles 3D Secure automatically
    // Create pending payment record
    const payment = new Payment({
      user: user._id,
      userName: name,
      userEmail: email,
      userPhone: phone,
      stripePaymentIntentId: paymentIntent.id,
      amount: amount,
      currency: 'usd',
      status: 'pending',
      webinarTitle: 'Silent Equity Webinar '
    });

    await payment.save();
    console.log('✅ Payment intent created with 3D Secure:', paymentIntent.id);

    logPaymentCreation({
      userId: user._id.toString(),
      amount: amount,
      currency: 'usd',
      paymentMethod: 'card',
      stripePaymentIntentId: paymentIntent.id
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      requiresAuthentication: true // Flag to inform frontend
    });

  } catch (error) {
    console.error('❌ Create payment intent error:', error);
    logPaymentFailure({
      error: error.message,
      errorType: 'payment_intent_creation_failed',
      amount: Math.round((parseFloat(process.env.WEBINAR_PRICE) || 4.5) * 100)
    });
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

/**
 * Confirm Payment
 * Step 2: Verify payment succeeded after 3D Secure authentication
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required'
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // ✅ Handle different payment statuses
    if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_source_action') {
      return res.status(200).json({
        success: false,
        requiresAction: true,
        message: 'Payment requires additional authentication',
        status: paymentIntent.status
      });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status
      });
    }

    // Find and update payment record
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Check if already processed
    if (payment.status === 'succeeded') {
      return res.status(200).json({
        success: true,
        message: 'Payment already processed',
        meetingLink: payment.meetingLink,
        alreadyProcessed: true
      });
    }

    // Update payment record
    payment.status = 'succeeded';
    payment.paidAt = new Date();
    payment.meetingLink = process.env.WEBINAR_MEETING_LINK;
    payment.stripeChargeId = paymentIntent.latest_charge;
    payment.paymentMethod = paymentIntent.payment_method_types[0];

    await payment.save();

    // Update user's registered webinars
    const user = await User.findById(payment.user);
    if (!user.registeredWebinars.includes(payment._id)) {
      user.registeredWebinars.push(payment._id);
      await user.save();
    }

    console.log('✅ Payment confirmed after 3D Secure:', paymentIntentId);

    logPaymentSuccess({
      paymentId: payment._id.toString(),
      userId: payment.user.toString(),
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      stripePaymentIntentId: paymentIntentId
    });

    // ✅ Get Stripe receipt URL
    let receiptUrl = null;
    if (paymentIntent.latest_charge) {
      try {
        const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
        receiptUrl = charge.receipt_url;
        console.log('✅ Receipt URL generated:', receiptUrl);
      } catch (error) {
        console.error('⚠️ Could not retrieve receipt URL:', error.message);
      }
    }

    // Send confirmation email with receipt (non-blocking)
    const emailData = {
      userName: payment.userName,
      userEmail: payment.userEmail,
      amount: payment.amount,
      meetingLink: payment.meetingLink,
      webinarTitle: payment.webinarTitle,
      receiptUrl: receiptUrl,
      paymentId: payment._id.toString(),
      transactionId: paymentIntent.latest_charge,
      paidAt: payment.paidAt
    };

    // Send email asynchronously (don't block response)
    sendPaymentConfirmationEmail(emailData).catch(err => {
      console.error('⚠️ Failed to send confirmation email:', err.message);
    });
    console.log('✅ Payment confirmed, email queued:', payment.userEmail);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      meetingLink: payment.meetingLink,
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt
      }
    });

  } catch (error) {
    console.error('❌ Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

/**
 * Create UPI Payment Intent
 * Create payment intent for UPI payments
 */
exports.createUPIPaymentIntent = async (req, res) => {
  try {
    const { upiId, name, email, phone, amount } = req.body;

    // Validate input
    if (!upiId || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID, name, email, and phone are required'
      });
    }

    // Validate UPI format
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UPI ID format'
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Get or create user
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      user = new User({
        name,
        email: email.toLowerCase(),
        phone
      });
      await user.save();
      console.log('✅ New user created:', email);
    } else {
      user.name = name;
      user.phone = phone;
      await user.save();
      console.log('✅ User updated:', email);
    }

    // Calculate amount in cents
    const paymentAmount = amount ? Math.round(parseFloat(amount) * 100) : Math.round((parseFloat(process.env.WEBINAR_PRICE) || 4.5) * 100);

    // Try to create UPI payment intent
    // Note: UPI support varies by region. For India, we'll use Payment Links as fallback
    let paymentIntent;
    let paymentLink = null;

    try {
      // Try creating payment intent with UPI
      paymentIntent = await stripe.paymentIntents.create({
        amount: paymentAmount,
        currency: 'inr', // UPI is primarily for India, use INR
        payment_method_types: ['upi'],
        metadata: {
          userId: user._id.toString(),
          userName: name,
          userEmail: email,
          userPhone: phone,
          upiId: upiId.trim(),
          webinarTitle: 'Silent Edge Execution Masterclass'
        },
        description: 'Silent Edge Execution Masterclass Registration - UPI'
      });
    } catch (stripeError) {
      // If UPI payment intent fails, create a Payment Link as fallback
      console.log('⚠️ UPI Payment Intent not available, creating Payment Link...');
      
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['upi'],
          line_items: [{
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'Silent Edge Execution Masterclass',
                description: 'Webinar Registration'
              },
              unit_amount: paymentAmount,
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment`,
          metadata: {
            userId: user._id.toString(),
            userName: name,
            userEmail: email,
            userPhone: phone,
            upiId: upiId.trim(),
            webinarTitle: 'Silent Edge Execution Masterclass'
          },
          customer_email: email,
        });

        paymentLink = session.url;
        console.log('✅ Payment Link created for UPI:', session.id);
      } catch (checkoutError) {
        console.error('❌ Failed to create Payment Link:', checkoutError);
        throw new Error('UPI payment is not available in your region. Please use card payment.');
      }
    }

    // Create payment record
    const payment = new Payment({
      user: user._id,
      userName: name,
      userEmail: email,
      userPhone: phone,
      stripePaymentIntentId: paymentIntent?.id || 'payment_link',
      amount: paymentAmount,
      currency: paymentIntent ? 'inr' : 'inr',
      status: 'pending',
      webinarTitle: 'Silent Equity Webinar - UPI',
      paymentMethod: 'upi'
    });

    await payment.save();
    console.log('✅ UPI payment intent/link created:', paymentIntent?.id || paymentLink);

    res.status(200).json({
      success: true,
      paymentIntentId: paymentIntent?.id,
      clientSecret: paymentIntent?.client_secret,
      paymentLink: paymentLink,
      amount: paymentAmount,
      requiresRedirect: !!paymentLink
    });

  } catch (error) {
    console.error('❌ Create UPI payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create UPI payment',
      error: error.message
    });
  }
};

/**
 * Get Payment Status
 * Check if user has already paid
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { email, paymentIntentId } = req.query;

    if (paymentIntentId) {
      // Check by payment intent ID
      const payment = await Payment.findOne({
        stripePaymentIntentId: paymentIntentId
      });

      if (!payment) {
        return res.status(200).json({
          success: true,
          status: 'not_found'
        });
      }

      // If payment is pending, check with Stripe
      if (payment.status === 'pending') {
        try {
          const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
          return res.status(200).json({
            success: true,
            status: intent.status,
            paymentIntent: intent
          });
        } catch (stripeError) {
          return res.status(200).json({
            success: true,
            status: payment.status
          });
        }
      }

      return res.status(200).json({
        success: true,
        status: payment.status,
        hasPaid: payment.status === 'succeeded',
        meetingLink: payment.meetingLink,
        paidAt: payment.paidAt
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email or paymentIntentId is required'
      });
    }

    const payment = await Payment.findOne({
      userEmail: email.toLowerCase(),
      status: 'succeeded'
    }).sort({ paidAt: -1 });

    if (!payment) {
      return res.status(200).json({
        success: true,
        hasPaid: false
      });
    }

    res.status(200).json({
      success: true,
      hasPaid: true,
      meetingLink: payment.meetingLink,
      paidAt: payment.paidAt
    });

  } catch (error) {
    console.error('❌ Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

/**
 * Handle Stripe Webhook Events
 * Process payment status updates from Stripe
 */
exports.handleWebhook = async (req, res) => {
  const event = req.stripeEvent;

  try {
    console.log('📥 Webhook received:', event.type, event.id);

    logWebhookEvent(event.type, {
      id: event.id,
      paymentIntentId: event.data.object?.id,
      status: event.data.object?.status
    });

    switch (event.type) {
      case 'payment_intent.succeeded':
        {
          const paymentIntent = event.data.object;
          console.log('✅ Payment succeeded via webhook:', paymentIntent.id);

          // Find and update payment record
          const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntent.id
          });

          if (payment && payment.status !== 'succeeded') {
            payment.status = 'succeeded';
            payment.paidAt = new Date();
            payment.meetingLink = process.env.WEBINAR_MEETING_LINK;
            payment.stripeChargeId = paymentIntent.latest_charge;
            payment.paymentMethod = paymentIntent.payment_method_types?.[0] || 'unknown';
            await payment.save();

            // Update user's registered webinars
            const user = await User.findById(payment.user);
            if (user && !user.registeredWebinars.includes(payment._id)) {
              user.registeredWebinars.push(payment._id);
              await user.save();
            }

            // Send confirmation email
            const emailData = {
              userName: payment.userName,
              userEmail: payment.userEmail,
              amount: payment.amount,
              meetingLink: payment.meetingLink,
              webinarTitle: payment.webinarTitle,
              receiptUrl: paymentIntent.receipt_url || null,
              paymentId: payment._id.toString(),
              transactionId: paymentIntent.latest_charge,
              paidAt: payment.paidAt
            };

            sendPaymentConfirmationEmail(emailData).catch(err => {
              console.error('⚠️ Failed to send confirmation email:', err.message);
            });

            logPaymentSuccess({
              paymentId: payment._id.toString(),
              userId: payment.user.toString(),
              amount: payment.amount,
              currency: payment.currency,
              paymentMethod: payment.paymentMethod,
              stripePaymentIntentId: paymentIntent.id
            });

            console.log('✅ Payment updated via webhook:', paymentIntent.id);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        {
          const paymentIntent = event.data.object;
          console.log('❌ Payment failed via webhook:', paymentIntent.id);

          const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntent.id
          });

          if (payment && payment.status === 'pending') {
            payment.status = 'failed';
            await payment.save();
            
            logPaymentFailure({
              paymentId: payment._id.toString(),
              userId: payment.user.toString(),
              amount: payment.amount,
              error: paymentIntent.last_payment_error?.message || 'Payment failed',
              errorType: 'payment_failed',
              stripePaymentIntentId: paymentIntent.id
            });

            console.log('✅ Payment status updated to failed:', paymentIntent.id);
          }
        }
        break;

      case 'payment_intent.requires_action':
        {
          const paymentIntent = event.data.object;
          console.log('⚠️ Payment requires action:', paymentIntent.id);
          // Payment is waiting for 3D Secure - no action needed, frontend handles it
        }
        break;

      case 'checkout.session.completed':
        {
          const checkoutSession = event.data.object;
          console.log('✅ Checkout session completed:', checkoutSession.id);

          // Handle payment via checkout session (both card and UPI)
          // Stripe collects customer details, so we get them from checkout session
          if (checkoutSession.payment_status === 'paid') {
            // Get customer details from Stripe Checkout
            const customerEmail = checkoutSession.customer_details?.email || checkoutSession.customer_email;
            const customerName = checkoutSession.customer_details?.name || 'Customer';
            const customerPhone = checkoutSession.customer_details?.phone || '';
            const webinarTitle = checkoutSession.metadata?.webinarTitle || 'Silent Edge Execution Masterclass';
            const googleFormUrl = checkoutSession.metadata?.googleFormUrl || 'https://docs.google.com/forms/d/e/1FAIpQLScxS_5gOlOif-wuXM8JFgnac1gQC9hqLBb9EWLAKmszFKNDxg/viewform?usp=publish-editor';

            if (!customerEmail) {
              console.error('❌ No customer email in checkout session:', checkoutSession.id);
              break;
            }

            // Find existing payment record first (idempotency check)
            let payment = await Payment.findOne({
              stripePaymentIntentId: checkoutSession.id
            });

            // If payment already succeeded, skip processing (idempotent)
            if (payment && payment.status === 'succeeded') {
              console.log('ℹ️ Payment already processed (idempotent):', checkoutSession.id);
              break;
            }

            // Find or create user
            let user = await User.findOne({ email: customerEmail.toLowerCase() });
            if (!user) {
              user = new User({
                name: customerName,
                email: customerEmail.toLowerCase(),
                phone: customerPhone
              });
              await user.save();
              console.log('✅ New user created from checkout:', customerEmail);
            } else {
              // Update user details from Stripe
              user.name = customerName;
              if (customerPhone) user.phone = customerPhone;
              await user.save();
            }

            if (!payment) {
              // Create new payment record
              payment = new Payment({
                user: user._id,
                userName: customerName,
                userEmail: customerEmail.toLowerCase(),
                userPhone: customerPhone,
                stripePaymentIntentId: checkoutSession.id,
                amount: checkoutSession.amount_total,
                currency: checkoutSession.currency,
                status: 'succeeded',
                paidAt: new Date(),
                paymentMethod: checkoutSession.payment_method_types?.[0] || 'unknown',
                webinarTitle: webinarTitle
              });
            } else {
              // Update existing payment record
              payment.status = 'succeeded';
              payment.paidAt = new Date();
              payment.paymentMethod = checkoutSession.payment_method_types?.[0] || payment.paymentMethod;
            }

            // Get receipt URL from payment intent
            let receiptUrl = null;
            if (checkoutSession.payment_intent) {
              try {
                const paymentIntent = await stripe.paymentIntents.retrieve(checkoutSession.payment_intent, {
                  expand: ['latest_charge']
                });
                if (paymentIntent.latest_charge) {
                  const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
                  receiptUrl = charge.receipt_url;
                  payment.stripeChargeId = paymentIntent.latest_charge;
                }
              } catch (error) {
                console.error('⚠️ Could not retrieve receipt URL:', error.message);
              }
            }

            await payment.save();

            // Update user's registered webinars
            if (!user.registeredWebinars.includes(payment._id)) {
              user.registeredWebinars.push(payment._id);
              await user.save();
            }

            // Send custom branded confirmation email (in addition to Stripe's automatic receipt)
            // Email includes Google form link for verification (no meeting link)
            const emailData = {
              userName: payment.userName,
              userEmail: payment.userEmail,
              amount: payment.amount,
              webinarTitle: payment.webinarTitle,
              receiptUrl: receiptUrl, // Include Stripe receipt URL in custom email
              googleFormUrl: googleFormUrl, // Google form for verification
              paymentId: payment._id.toString(),
              transactionId: checkoutSession.payment_intent || checkoutSession.id,
              paidAt: payment.paidAt
            };

            sendPaymentConfirmationEmail(emailData).catch(err => {
              console.error('⚠️ Failed to send confirmation email:', err.message);
            });

            logPaymentSuccess({
              paymentId: payment._id.toString(),
              userId: payment.user.toString(),
              amount: payment.amount,
              currency: payment.currency,
              paymentMethod: payment.paymentMethod,
              stripePaymentIntentId: checkoutSession.id
            });

            console.log('✅ Payment processed via checkout webhook:', checkoutSession.id);
            // Note: Stripe automatically sends receipt email via customer_email in checkout session
          }
        }
        break;

      case 'checkout.session.async_payment_succeeded':
        {
          const checkoutSession = event.data.object;
          console.log('✅ Async payment succeeded (UPI):', checkoutSession.id);

          // Handle async payment completion (e.g., UPI)
          // Idempotency: Check if already processed
          if (checkoutSession.metadata && checkoutSession.metadata.userId) {
            const payment = await Payment.findOne({
              stripePaymentIntentId: checkoutSession.id
            });

            // If payment already succeeded, skip processing (idempotent)
            if (payment && payment.status === 'succeeded') {
              console.log('ℹ️ Async payment already processed (idempotent):', checkoutSession.id);
              break;
            }

            if (payment && payment.status !== 'succeeded') {
              payment.status = 'succeeded';
              payment.paidAt = new Date();
              await payment.save();

              // Get receipt URL
              let receiptUrl = null;
              if (checkoutSession.payment_intent) {
                try {
                  const paymentIntent = await stripe.paymentIntents.retrieve(checkoutSession.payment_intent, {
                    expand: ['latest_charge']
                  });
                  if (paymentIntent.latest_charge) {
                    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
                    receiptUrl = charge.receipt_url;
                    payment.stripeChargeId = paymentIntent.latest_charge;
                  }
                } catch (error) {
                  console.error('⚠️ Could not retrieve receipt URL:', error.message);
                }
              }

              await payment.save();

              // Update user's registered webinars
              const user = await User.findById(payment.user);
              if (user && !user.registeredWebinars.includes(payment._id)) {
                user.registeredWebinars.push(payment._id);
                await user.save();
              }

              // Get Google form URL from metadata
              const googleFormUrl = checkoutSession.metadata?.googleFormUrl || 'https://docs.google.com/forms/d/e/1FAIpQLScxS_5gOlOif-wuXM8JFgnac1gQC9hqLBb9EWLAKmszFKNDxg/viewform?usp=publish-editor';

              // Send confirmation email
              const emailData = {
                userName: payment.userName,
                userEmail: payment.userEmail,
                amount: payment.amount,
                webinarTitle: payment.webinarTitle,
                receiptUrl: receiptUrl,
                googleFormUrl: googleFormUrl,
                paymentId: payment._id.toString(),
                transactionId: checkoutSession.payment_intent || checkoutSession.id,
                paidAt: payment.paidAt
              };

              sendPaymentConfirmationEmail(emailData).catch(err => {
                console.error('⚠️ Failed to send confirmation email:', err.message);
              });

              logPaymentSuccess({
                paymentId: payment._id.toString(),
                userId: payment.user.toString(),
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.paymentMethod || 'upi',
                stripePaymentIntentId: checkoutSession.id
              });
            }
          }
        }
        break;

      case 'checkout.session.async_payment_failed':
        {
          const checkoutSession = event.data.object;
          console.log('❌ Async payment failed:', checkoutSession.id);

          const payment = await Payment.findOne({
            stripePaymentIntentId: checkoutSession.id
          });

          // Only update if still pending (idempotent)
          if (payment && payment.status === 'pending') {
            payment.status = 'failed';
            await payment.save();

            logPaymentFailure({
              paymentId: payment._id.toString(),
              userId: payment.user.toString(),
              amount: payment.amount,
              error: 'Async payment failed',
              errorType: 'async_payment_failed',
              stripePaymentIntentId: checkoutSession.id
            });
          }
        }
        break;

      default:
        console.log('ℹ️ Unhandled webhook event type:', event.type);
    }

    // Return success to Stripe
    res.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};
