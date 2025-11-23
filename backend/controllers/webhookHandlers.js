/**
 * Webhook Event Handlers
 * Extracted handlers for Stripe webhook events
 */

const User = require('../models/User');
const Payment = require('../models/Payment');
const { sendPaymentConfirmationEmail } = require('../utils/email');
const { sendCoursePaymentReceipt } = require('../utils/courseEmail');
const { logger, logPaymentSuccess, logPaymentFailure } = require('../utils/logger');
const { stripe } = require('../config/stripe');
const { getSupabaseClient, isSupabaseConfigured } = require('../config/supabase');
const constants = require('../config/constants');

/**
 * Handle payment intent succeeded event
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  logger.info('Payment succeeded via webhook', { paymentIntentId: paymentIntent.id });

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
      logger.error('Failed to send confirmation email', { error: err.message });
    });

    logPaymentSuccess({
      paymentId: payment._id.toString(),
      userId: payment.user.toString(),
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      stripePaymentIntentId: paymentIntent.id
    });

    logger.info('Payment updated via webhook', { paymentIntentId: paymentIntent.id });
  }
};

/**
 * Handle payment intent failed event
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  logger.error('Payment failed via webhook', { paymentIntentId: paymentIntent.id });

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

    logger.info('Payment status updated to failed', { paymentIntentId: paymentIntent.id });
  }
};

/**
 * Retry wrapper for operations with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 */
async function retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isTransientError = error.code === 'ECONNRESET' || 
                               error.code === 'ETIMEDOUT' || 
                               error.message?.includes('timeout') ||
                               error.message?.includes('network') ||
                               error.message?.includes('PGRST');
      
      if (isLastAttempt || !isTransientError) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn('Operation failed, retrying', { 
        attempt: attempt + 1, 
        maxRetries,
        delay,
        error: error.message 
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Handle course enrollment payment completion
 */
const handleCourseEnrollmentPayment = async (checkoutSession) => {
  const startTime = Date.now();
  logger.info('Course enrollment payment completed', { sessionId: checkoutSession.id });

  const courseLeadId = checkoutSession.metadata?.course_lead_id;
  const customerEmail = checkoutSession.customer_details?.email || checkoutSession.customer_email;
  const customerName = checkoutSession.customer_details?.name || checkoutSession.metadata?.lead_email || 'Customer';
  const customerPhone = checkoutSession.customer_details?.phone || checkoutSession.metadata?.lead_phone || '';

  if (!customerEmail) {
    logger.error('No customer email in checkout session', { sessionId: checkoutSession.id });
    return;
  }

  // Idempotency check - verify if already processed
  if (courseLeadId && isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data: existingLead } = await supabase
        .from('course_leads')
        .select('paid')
        .eq('id', courseLeadId)
        .single();
      
      if (existingLead && existingLead.paid === true) {
        logger.info('Course enrollment payment already processed (idempotent)', { 
          sessionId: checkoutSession.id,
          courseLeadId 
        });
        return; // Already processed, skip
      }
    } catch (error) {
      logger.warn('Could not check idempotency, proceeding', { 
        error: error.message,
        courseLeadId 
      });
    }
  }

  // Update course lead in Supabase to mark as paid (with retry logic)
  if (courseLeadId && isSupabaseConfigured()) {
    try {
      await retryOperation(async () => {
        const supabase = getSupabaseClient();
        const { error: updateError } = await supabase
          .from('course_leads')
          .update({ paid: true })
          .eq('id', courseLeadId);

        if (updateError) {
          throw new Error(updateError.message);
        }
        
        logger.info('Course lead marked as paid in Supabase', { courseLeadId });
      });
    } catch (error) {
      logger.error('Failed to update course lead payment status after retries', { 
        error: error.message,
        courseLeadId 
      });
      // Don't throw - continue with email sending even if DB update fails
    }
  }

  // Get receipt URL from payment intent
  let receiptUrl = null;
  let transactionId = checkoutSession.id;
  
  if (checkoutSession.payment_intent) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(checkoutSession.payment_intent, {
        expand: ['latest_charge']
      });
      transactionId = paymentIntent.latest_charge || checkoutSession.payment_intent;
      
      if (paymentIntent.latest_charge) {
        const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
        receiptUrl = charge.receipt_url;
      }
    } catch (error) {
      logger.warn('Could not retrieve receipt URL', { error: error.message });
    }
  }

  // Send payment receipt email (non-blocking, with retry)
  const emailData = {
    userName: customerName,
    userEmail: customerEmail,
    amount: checkoutSession.amount_total || 0,
    currency: checkoutSession.currency || 'usd',
    receiptUrl: receiptUrl,
    transactionId: transactionId,
    sessionId: checkoutSession.id,
    paidAt: new Date(checkoutSession.created * 1000),
    courseName: 'Pro Trader Course - 3-Month Trading Program'
  };

  // Send email asynchronously (don't block webhook processing)
  sendCoursePaymentReceipt(emailData).catch(async (error) => {
    logger.error('Failed to send course payment receipt email, retrying', { 
      error: error.message,
      sessionId: checkoutSession.id 
    });
    
    // Retry email sending once
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await sendCoursePaymentReceipt(emailData);
      logger.info('Course payment receipt email sent after retry', { 
        sessionId: checkoutSession.id,
        email: customerEmail 
      });
    } catch (retryError) {
      logger.error('Failed to send course payment receipt email after retry', { 
        error: retryError.message,
        sessionId: checkoutSession.id 
      });
    }
  });
  
  const processingTime = Date.now() - startTime;
  logger.info('Course enrollment payment processed', { 
    sessionId: checkoutSession.id,
    email: customerEmail,
    processingTimeMs: processingTime
  });
};

/**
 * Handle checkout session completed event
 */
const handleCheckoutSessionCompleted = async (checkoutSession) => {
  const startTime = Date.now();
  logger.info('Checkout session completed', { sessionId: checkoutSession.id });

  if (checkoutSession.payment_status === 'paid') {
    // Check if this is a course enrollment payment
    const courseLeadId = checkoutSession.metadata?.course_lead_id;
    
    if (courseLeadId) {
      // Handle course enrollment payment
      await handleCourseEnrollmentPayment(checkoutSession);
      return;
    }
    
    // Otherwise handle as webinar payment (existing logic)
    const customerEmail = checkoutSession.customer_details?.email || checkoutSession.customer_email;
    const customerName = checkoutSession.customer_details?.name || 'Customer';
    const customerPhone = checkoutSession.customer_details?.phone || '';
    const webinarTitle = checkoutSession.metadata?.webinarTitle || 'Silent Edge Execution Masterclass';
    const googleFormUrl = checkoutSession.metadata?.googleFormUrl || constants.GOOGLE_FORM_URL;

    if (!customerEmail) {
      logger.error('No customer email in checkout session', { sessionId: checkoutSession.id });
      return;
    }

    // Find existing payment record (idempotency check)
    let payment = await Payment.findOne({
      stripePaymentIntentId: checkoutSession.id
    });

    if (payment && payment.status === 'succeeded') {
      logger.info('Payment already processed (idempotent)', { sessionId: checkoutSession.id });
      return;
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
      logger.info('New user created from checkout', { email: customerEmail });
    } else {
      user.name = customerName;
      if (customerPhone) user.phone = customerPhone;
      await user.save();
    }

    if (!payment) {
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
        logger.warn('Could not retrieve receipt URL', { error: error.message });
      }
    }

    await payment.save();

    // Update user's registered webinars
    if (!user.registeredWebinars.includes(payment._id)) {
      user.registeredWebinars.push(payment._id);
      await user.save();
    }

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

    // Send email asynchronously (non-blocking)
    sendPaymentConfirmationEmail(emailData).catch(async (err) => {
      logger.error('Failed to send confirmation email, retrying', { error: err.message });
      
      // Retry email sending once
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await sendPaymentConfirmationEmail(emailData);
        logger.info('Confirmation email sent after retry', { email: payment.userEmail });
      } catch (retryError) {
        logger.error('Failed to send confirmation email after retry', { error: retryError.message });
      }
    });

    logPaymentSuccess({
      paymentId: payment._id.toString(),
      userId: payment.user.toString(),
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      stripePaymentIntentId: checkoutSession.id
    });

    const processingTime = Date.now() - startTime;
    logger.info('Payment processed via checkout webhook', { 
      sessionId: checkoutSession.id,
      processingTimeMs: processingTime
    });
  }
};

/**
 * Handle async payment succeeded event (UPI)
 */
const handleAsyncPaymentSucceeded = async (checkoutSession) => {
  logger.info('Async payment succeeded (UPI)', { sessionId: checkoutSession.id });

  const payment = await Payment.findOne({
    stripePaymentIntentId: checkoutSession.id
  });

  if (payment && payment.status === 'succeeded') {
    logger.info('Async payment already processed (idempotent)', { sessionId: checkoutSession.id });
    return;
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
        logger.warn('Could not retrieve receipt URL', { error: error.message });
      }
    }

    await payment.save();

    // Update user's registered webinars
    const user = await User.findById(payment.user);
    if (user && !user.registeredWebinars.includes(payment._id)) {
      user.registeredWebinars.push(payment._id);
      await user.save();
    }

    const googleFormUrl = checkoutSession.metadata?.googleFormUrl || constants.GOOGLE_FORM_URL;

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
      logger.error('Failed to send confirmation email', { error: err.message });
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
};

/**
 * Handle async payment failed event
 */
const handleAsyncPaymentFailed = async (checkoutSession) => {
  logger.error('Async payment failed', { sessionId: checkoutSession.id });

  const payment = await Payment.findOne({
    stripePaymentIntentId: checkoutSession.id
  });

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
};

module.exports = {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleCheckoutSessionCompleted,
  handleAsyncPaymentSucceeded,
  handleAsyncPaymentFailed,
};

