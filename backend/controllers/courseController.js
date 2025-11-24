const { stripe } = require('../config/stripe');
const { getSupabaseClient, isSupabaseConfigured, retryOperation } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { validateName, validateEmail, validatePhone } = require('../utils/validation');

/**
 * Test email patterns to block
 * @type {RegExp[]}
 */
const TEST_EMAIL_PATTERNS = [
  /test\d+@example\.com/i,
  /test\d+@test\.com/i,
  /loadtest\d+.*@test\.com/i,
  /dbtest\d+@verification\.com/i,
  /realuser\d+@test\.com/i,
  /final\d+@test\.com/i,
  /.*test.*@.*test\.com/i,
  /.*test.*@example\.com/i,
  /test.*@.*\.com/i,
  /.*@test\.com/i,
  /.*@example\.com/i
];

/**
 * Test name patterns to block (exact matches only)
 * @type {string[]}
 */
const TEST_NAME_PATTERNS = [
  'test user',
  'load test',
  'database test',
  'test payment',
  'test customer',
  'fake user',
  'dummy user',
  'sample user'
];

/**
 * Validates if the submitted data is test data
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {boolean} True if test data should be blocked
 */
function isTestData(email, name) {
  const emailLower = email.toLowerCase();
  const nameLower = name.toLowerCase().trim();
  
  const isTestEmail = TEST_EMAIL_PATTERNS.some(pattern => pattern.test(emailLower));
  const isTestName = TEST_NAME_PATTERNS.some(pattern => nameLower === pattern.trim());
  const isCommonTestName = nameLower === 'john smith' || nameLower === 'jane doe';
  
  return isTestEmail || isTestName || isCommonTestName;
}

/**
 * Formats phone number to international format
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone number with country code
 */
function formatPhoneNumber(phone) {
  let formattedPhone = phone.trim();
  
  if (!formattedPhone.startsWith('+')) {
    // If it's a 10-digit number, assume it's US/Canada and add +1
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = '+1' + formattedPhone;
    } else {
      // Otherwise, just add +
      formattedPhone = '+' + formattedPhone;
    }
  }
  
  return formattedPhone;
}

/**
 * Checks for existing lead in Supabase by email
 * @param {Object} supabase - Supabase client instance
 * @param {string} email - Email to check
 * @returns {Promise<string|null>} Lead ID if found, null otherwise
 */
async function findExistingLead(supabase, email) {
  try {
    const { data: existingLead, error: checkError } = await retryOperation(async () => {
      return await supabase
        .from('course_leads')
        .select('id, paid')
        .eq('email', email.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    }, 3, 1000);

    if (checkError) {
      logger.warn('Error checking for existing lead', { error: checkError.message });
      return null;
    }

    if (existingLead) {
      logger.info('Existing lead found', { 
        email, 
        leadId: existingLead.id,
        paid: existingLead.paid 
      });
      return existingLead.id;
    }

    return null;
  } catch (error) {
    logger.warn('Failed to check for duplicate', { error: error.message });
    return null;
  }
}

/**
 * Inserts a new lead into Supabase
 * @param {Object} supabase - Supabase client instance
 * @param {Object} lead - Lead data to insert
 * @returns {Promise<string|null>} Lead ID if successful, null otherwise
 */
async function insertLead(supabase, lead) {
  const formattedPhone = formatPhoneNumber(lead.phone);
  
  const insertData = {
    name: lead.name.trim(),
    email: lead.email.toLowerCase().trim(),
    phone: formattedPhone,
    paid: lead.paid
  };
  
  logger.debug('Attempting to insert lead into Supabase', { 
    name: insertData.name, 
    email: insertData.email,
    phone: insertData.phone 
  });
  
  try {
    const { data, error } = await retryOperation(async () => {
      return await supabase
        .from('course_leads')
        .insert([insertData])
        .select('id')
        .single();
    }, 3, 1000);

    if (error) {
      // Handle duplicate email error
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        logger.warn('Duplicate email detected during insert', { email: lead.email });
        const existingId = await findExistingLead(supabase, lead.email);
        if (existingId) {
          return existingId;
        }
        throw new Error('Duplicate email detected but could not retrieve existing record');
      }
      throw error;
    }

    logger.info('New lead created successfully', { leadId: data?.id || null });
    return data?.id || null;
  } catch (error) {
    logger.error('Failed to insert lead into Supabase', { 
      error: error.message,
      errorCode: error.code,
      errorDetails: error.details || error.hint,
      email: lead.email
    });
    
    // Final retry attempt
    try {
      const { data: retryData, error: retryError } = await retryOperation(async () => {
        return await supabase
          .from('course_leads')
          .insert([insertData])
          .select('id')
          .single();
      }, 2, 2000);
      
      if (retryError) {
        logger.error('Supabase retry also failed', { 
          error: retryError.message,
          email: lead.email 
        });
        return null;
      }
      
      logger.info('Supabase insert succeeded on retry', { leadId: retryData?.id || null });
      return retryData?.id || null;
    } catch (retryError) {
      logger.error('Supabase retry exception', { 
        error: retryError.message,
        email: lead.email 
      });
      return null;
    }
  }
}

/**
 * Creates Stripe checkout session for course enrollment
 * @param {Object} lead - Lead data
 * @param {string|null} leadRecordId - Supabase lead ID (optional)
 * @returns {Promise<Object>} Stripe checkout session
 */
async function createCheckoutSession(lead, leadRecordId) {
  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error('STRIPE_PRICE_ID missing');
  }

  if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL missing');
  }

  const checkoutPayload = {
    mode: 'payment',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    customer_email: lead.email,
    phone_number_collection: {
      enabled: true, // Required for 3D Secure OTP verification
    },
    payment_method_types: ['card', 'amazon_pay'],
    payment_method_options: {
      card: {
        request_three_d_secure: 'automatic', // Smart OTP - required when mandatory
      },
    },
    allow_promotion_codes: true,
    invoice_creation: {
      enabled: true, // Stripe will automatically create and email invoices
    },
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/join-course`,
    metadata: {
      course_lead_id: leadRecordId || '',
      lead_email: lead.email,
      lead_phone: lead.phone,
      lead_name: lead.name,
      storage_backend: leadRecordId ? 'supabase' : 'none',
      form_data: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone
      })
    },
  };

  if (process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID) {
    checkoutPayload.payment_method_configuration = process.env.STRIPE_PAYMENT_METHOD_CONFIGURATION_ID;
  }

  return await stripe.checkout.sessions.create(checkoutPayload);
}

/**
 * Join course endpoint handler
 * Validates input, saves lead to Supabase, and creates Stripe checkout session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

    // Prevent test data from being saved
    if (isTestData(lead.email, lead.name)) {
      logger.warn('Test data submission blocked', { email: lead.email, name: lead.name });
      return res.status(400).json({
        success: false,
        message: 'Invalid submission. Please use a valid email address.',
      });
    }

    if (!isSupabaseConfigured()) {
      logger.error('Supabase not configured for course enrollment storage');
      return res.status(500).json({
        success: false,
        message: 'Enrollment storage is not configured yet. Please contact support.',
      });
    }

    const supabase = getSupabaseClient();
    
    // Check for existing lead or create new one
    // If Supabase fails, we'll continue without leadRecordId and create checkout anyway
    let leadRecordId = await findExistingLead(supabase, lead.email);
    
    if (!leadRecordId) {
      leadRecordId = await insertLead(supabase, lead);
    }
    
    // Create Stripe checkout session
    // leadRecordId may be null, but we'll store all data in Stripe metadata as backup
    const startTime = Date.now();
    
    let session;
    try {
      session = await createCheckoutSession(lead, leadRecordId);
    } catch (error) {
      if (error.message === 'STRIPE_PRICE_ID missing' || error.message === 'FRONTEND_URL missing') {
        logger.error('Configuration error', { error: error.message });
        return res.status(500).json({
          success: false,
          message: error.message === 'STRIPE_PRICE_ID missing' 
            ? 'Stripe price is not configured on the server.'
            : 'Frontend URL not configured',
        });
      }
      
      logger.error('Stripe checkout session creation failed', {
        error: error.message,
        errorType: error.type,
        leadId: leadRecordId,
        email: lead.email
      });
      
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

