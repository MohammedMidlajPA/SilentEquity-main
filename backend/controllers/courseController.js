const { stripe } = require('../config/stripe');
const { getSupabaseClient, isSupabaseConfigured, retryOperation } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { validateName, validateEmail, validatePhone } = require('../utils/validation');

exports.joinCourse = async (req, res) => {
  try {
    const payload = req.body || {};

    const validations = [
      { key: 'name', result: validateName(payload.name) },
      { key: 'email', result: validateEmail(payload.email) },
      { key: 'phone', result: validatePhone(payload.phone) }
    ];

    const errors = validations
      .filter((item) => !item.result.valid)
      .map((item) => item.result.error);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const lead = {
      name: validations.find((v) => v.key === 'name').result.value,
      email: validations.find((v) => v.key === 'email').result.value,
      phone: validations.find((v) => v.key === 'phone').result.value,
      paid: false,
    };

    if (!isSupabaseConfigured()) {
      logger.error('Supabase not configured for course enrollment storage');
      return res.status(500).json({
        success: false,
        message: 'Enrollment storage is not configured yet. Please contact support.',
      });
    }

    const supabase = getSupabaseClient();
    
    let leadRecordId = null;
    
    // Check for duplicate email (idempotency check)
    try {
      const { data: existingLead, error: checkError } = await retryOperation(async () => {
        return await supabase
          .from('course_leads')
          .select('id, paid')
          .eq('email', lead.email.toLowerCase())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
      });

      if (checkError) {
        logger.warn('Error checking for existing lead, proceeding with insert', { error: checkError.message });
      } else if (existingLead) {
        logger.info('Existing lead found', { 
          email: lead.email, 
          leadId: existingLead.id,
          paid: existingLead.paid 
        });
        leadRecordId = existingLead.id;
        
        // If already paid, we could return early, but for now allow re-registration
        // The webhook will handle updating the paid status
      }
    } catch (error) {
      logger.warn('Failed to check for duplicate, proceeding with insert', { error: error.message });
    }

    // Insert new lead if not found (or allow re-registration)
    if (!leadRecordId) {
      try {
        const { data, error } = await retryOperation(async () => {
          return await supabase
            .from('course_leads')
            .insert([{
              name: lead.name,
              email: lead.email.toLowerCase(),
              phone: lead.phone,
              paid: lead.paid
            }])
            .select('id')
            .single();
        });

        if (error) {
          // Handle specific Supabase errors
          if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
            logger.warn('Duplicate email detected during insert, fetching existing lead', { email: lead.email });
            // Try to get the existing lead
            const { data: existing } = await supabase
              .from('course_leads')
              .select('id')
              .eq('email', lead.email.toLowerCase())
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (existing) {
              leadRecordId = existing.id;
              logger.info('Using existing lead after duplicate detection', { leadId: leadRecordId });
            } else {
              throw new Error('Duplicate email detected but could not retrieve existing record');
            }
          } else {
            throw error;
          }
        } else {
          leadRecordId = data?.id || null;
          logger.info('New lead created successfully', { leadId: leadRecordId });
        }
      } catch (error) {
        logger.error('Failed to insert lead into Supabase after retries', { 
          error: error.message,
          errorCode: error.code,
          email: lead.email 
        });
        return res.status(502).json({
          success: false,
          message: 'Unable to register at the moment. Please try again in a few seconds.',
        });
      }
    }

    if (!process.env.STRIPE_PRICE_ID) {
      logger.error('STRIPE_PRICE_ID missing');
      return res.status(500).json({
        success: false,
        message: 'Stripe price is not configured on the server.',
      });
    }

    const priceId = process.env.STRIPE_PRICE_ID;

    if (!process.env.FRONTEND_URL) {
      logger.error('FRONTEND_URL missing for course join flow');
      return res.status(500).json({
        success: false,
        message: 'Frontend URL not configured',
      });
    }

    const checkoutPayload = {
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: lead.email,
      phone_number_collection: {
        enabled: true, // Required for 3D Secure OTP verification
      },
      payment_method_types: ['card', 'amazon_pay'], // Card payments + Amazon Pay
      // Google Pay is automatically enabled with cards (no code change needed)
      // Note: Google Pay not available in India, but will work for international customers
      // Smart 3D Secure authentication - OTP when required (mandatory for Indian cards)
      // 'automatic' means Stripe will request 3DS when required by card issuer
      // This ensures OTP is asked for Indian debit/credit cards without forcing it unnecessarily
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic', // Smart OTP - required when mandatory, skipped when not needed
        },
      },
      // Enable promotion codes (coupon codes) for customers to enter at checkout
      allow_promotion_codes: true,
      // Custom text displayed on checkout page with coupon information
      custom_text: {
        submit: {
          message: 'Course fee is 333. Use EARLY36 for 36 dollars for the first 100 students and NEXT70 for 70 dollars for the next 400 students. All payments are final and not refundable.'
        }
      },
      // Enable automatic invoice creation and email sending
      invoice_creation: {
        enabled: true, // Stripe will automatically create and email invoices
      },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/join-course`,
      metadata: {
        course_lead_id: leadRecordId || '',
        lead_email: lead.email,
        lead_phone: lead.phone
      },
    };

    if (process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID) {
      checkoutPayload.payment_method_configuration = process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID;
    }

    const startTime = Date.now();
    
    // Create Stripe checkout session with error handling
    let session;
    try {
      session = await stripe.checkout.sessions.create(checkoutPayload);
    } catch (stripeError) {
      logger.error('Stripe checkout session creation failed', {
        error: stripeError.message,
        errorType: stripeError.type,
        leadId: leadRecordId,
        email: lead.email
      });
      
      // Return specific error message for Stripe failures
      return res.status(502).json({
        success: false,
        message: 'Payment system temporarily unavailable. Please try again in a moment.',
      });
    }
    
    const responseTime = Date.now() - startTime;
    
    logger.info('Course join checkout session created', {
      sessionId: session.id,
      leadId: leadRecordId,
      responseTimeMs: responseTime,
      email: lead.email,
      // Note: 3D Secure (OTP) is automatically handled by Stripe Checkout
      // Indian cards and cards requiring authentication will prompt for OTP
      // Stripe will automatically create and email invoices to customers
    });

    return res.status(201).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    logger.error('Course join flow failed', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
    return res.status(500).json({
      success: false,
      message: 'Unable to process enrollment. Please retry shortly.',
    });
  }
};

