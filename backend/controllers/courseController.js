const { stripe } = require('../config/stripe');
const { getSupabaseClient, isSupabaseConfigured, retryOperation } = require('../config/supabase');
const { 
  isGoogleSheetsConfigured, 
  saveLeadToSheets, 
  findExistingLeadInSheets,
  initializeGoogleSheets 
} = require('../config/googleSheets');
const { logger } = require('../utils/logger');
const { validateName, validateEmail, validatePhone } = require('../utils/validation');

/**
 * Test email patterns to block
 * @type {RegExp[]}
 */
const TEST_EMAIL_PATTERNS = [
  /^test\d+@example\.com$/i,
  /^test\d+@test\.com$/i,
  /^loadtest\d+.*@test\.com$/i,
  /^dbtest\d+@verification\.com$/i,
  /^realuser\d+@test\.com$/i,
  /^final\d+@test\.com$/i,
  /^.*test.*@.*test\.com$/i,
  /^.*test.*@example\.com$/i,
  /^test.*@test\.com$/i,
  /^.*@test\.com$/i,
  // Only block example.com if it's clearly test data (not all example.com emails)
  /^test.*@example\.com$/i
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
  const emailLower = email.toLowerCase().trim();
  const nameLower = name.toLowerCase().trim();
  
  // Only block if email clearly matches test patterns (more specific)
  const isTestEmail = TEST_EMAIL_PATTERNS.some(pattern => pattern.test(emailLower));
  
  // Only block exact test name matches
  const isTestName = TEST_NAME_PATTERNS.some(pattern => nameLower === pattern.trim());
  
  // Only block if BOTH email and name are test patterns (less aggressive)
  // This prevents false positives from legitimate users
  if (isTestEmail && isTestName) {
    return true;
  }
  
  // Block if email is clearly test pattern
  if (isTestEmail) {
    return true;
  }
  
  // Block if name is clearly test pattern AND email looks suspicious
  if (isTestName && (emailLower.includes('test') || emailLower.includes('example'))) {
    return true;
  }
  
  return false;
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
 * Returns lead ID only if they haven't paid yet (allows retry for failed payments)
 * @param {Object} supabase - Supabase client instance
 * @param {string} email - Email to check
 * @returns {Promise<{id: string|null, hasPaid: boolean}>} Lead info if found
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
      return { id: null, hasPaid: false };
    }

    if (existingLead) {
      const hasPaid = existingLead.paid === true;
      logger.info('Existing lead found', { 
        email, 
        leadId: existingLead.id,
        paid: existingLead.paid,
        allowRetry: !hasPaid
      });
      // Return ID only if they haven't paid (allows retry for failed payments)
      return { 
        id: hasPaid ? null : existingLead.id, 
        hasPaid 
      };
    }

    return { id: null, hasPaid: false };
  } catch (error) {
    logger.warn('Failed to check for duplicate', { error: error.message });
    return { id: null, hasPaid: false };
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
      // Handle duplicate email error - always allow retry if payment hasn't been completed
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
        logger.info('Duplicate email detected during insert - checking payment status', { email: lead.email });
        const existingLead = await findExistingLead(supabase, lead.email);
        
        // Always allow retry if they haven't paid (payment may have failed)
        if (existingLead.id && !existingLead.hasPaid) {
          logger.info('Reusing existing unpaid lead for payment retry', { 
            email: lead.email, 
            leadId: existingLead.id 
          });
          return existingLead.id;
        }
        
        // If they've already paid, still return the existing ID to allow them to proceed
        // This handles edge cases where payment status might not be updated correctly
        if (existingLead.id) {
          logger.info('Existing lead found (paid status: ' + existingLead.hasPaid + ') - allowing checkout', { 
            email: lead.email, 
            leadId: existingLead.id,
            hasPaid: existingLead.hasPaid
          });
          return existingLead.id;
        }
        
        // If no existing lead found but duplicate error occurred, log and return null
        logger.warn('Duplicate error but no existing lead found', { email: lead.email });
        return null;
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
 * Retry wrapper for Stripe API calls with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} Result of the operation
 */
async function retryStripeOperation(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries - 1;
      
      // Check if it's a retryable Stripe error
      const isRetryableError = 
        error.type === 'StripeAPIError' ||
        error.type === 'StripeConnectionError' ||
        error.type === 'StripeRateLimitError' ||
        error.code === 'rate_limit' ||
        error.statusCode === 429 ||
        error.statusCode === 500 ||
        error.statusCode === 502 ||
        error.statusCode === 503 ||
        (error.message && (
          error.message.includes('timeout') ||
          error.message.includes('network') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT')
        ));
      
      if (isLastAttempt || !isRetryableError) {
        if (!isRetryableError) {
          logger.warn('Non-retryable Stripe error', { 
            error: error.message,
            errorType: error.type,
            attempt: attempt + 1
          });
        }
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn('Stripe operation failed, retrying', { 
        attempt: attempt + 1, 
        maxRetries,
        delay,
        error: error.message,
        errorType: error.type,
        errorCode: error.code
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Stripe operation failed after retries');
}

/**
 * Creates Stripe checkout session for course enrollment
 * @param {Object} lead - Lead data
 * @param {string|null} leadRecordId - Supabase lead ID (optional)
 * @param {string|null} googleSheetsRowId - Google Sheets row ID (optional)
 * @param {Array<string>} storageBackends - Array of storage backends used (optional)
 * @returns {Promise<Object>} Stripe checkout session
 */
async function createCheckoutSession(lead, leadRecordId, googleSheetsRowId = null, storageBackends = []) {
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
    // Collect billing address - helps reduce declines and fraud
    billing_address_collection: 'required',
    // Collect phone number - required for 3D Secure OTP verification
    phone_number_collection: {
      enabled: true,
    },
    // OPTIMIZED: Remove payment method restrictions to maximize acceptance
    // Let Stripe auto-detect all eligible payment methods based on currency and location
    // This enables: Card, UPI (for INR/India), Google Pay (auto-enabled with cards), Amazon Pay, Link, etc.
    // Removing payment_method_types restriction allows Stripe to show all available methods
    // This significantly improves payment acceptance rate
    payment_method_options: {
      card: {
        // Automatic 3DS - only requests when required by issuer
        // This maximizes acceptance while maintaining security
        request_three_d_secure: 'automatic',
      },
    },
    // Enable promotion codes for discounts
    allow_promotion_codes: true,
    // Automatic invoice creation and email sending
    invoice_creation: {
      enabled: true,
    },
    // OPTIMIZED: Enhanced payment intent data for better acceptance
    payment_intent_data: {
      // Capture method - automatic for immediate capture
      capture_method: 'automatic',
      // Clear description for customer and bank recognition
      description: 'Pro Trader Course - 3-Month Trading Program',
      // Statement descriptor - appears on bank statement (max 22 chars)
      // Clear descriptor helps reduce "do not honor" declines
      statement_descriptor: 'SILENT EQUITY COURSE',
      // Enhanced metadata for better risk assessment and fraud detection
      metadata: {
        course_lead_id: leadRecordId || '',
        lead_email: lead.email,
        lead_phone: lead.phone,
        lead_name: lead.name,
        source: 'course_enrollment',
        customer_name: lead.name,
        customer_email: lead.email,
        customer_phone: lead.phone,
        product_type: 'course',
        product_name: 'Pro Trader Course',
      },
    },
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/join-course`,
    metadata: {
      course_lead_id: leadRecordId || '',
      google_sheets_row_id: googleSheetsRowId || '',
      lead_email: lead.email,
      lead_phone: lead.phone,
      lead_name: lead.name,
      storage_backend: storageBackends.join(',') || 'none',
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

  // Wrap Stripe API call with retry logic for better reliability
  return await retryStripeOperation(async () => {
    return await stripe.checkout.sessions.create(checkoutPayload);
  }, 3, 1000);
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

    // Prevent test data from being saved (less aggressive filtering)
    if (isTestData(lead.email, lead.name)) {
      logger.warn('Test data submission blocked', { email: lead.email, name: lead.name });
      return res.status(400).json({
        success: false,
        message: 'Please use a valid email address and name for enrollment.',
        errors: ['Invalid email or name format detected. Please use your real information.']
      });
    }

    // Determine which storage backend to use
    const useSupabase = isSupabaseConfigured();
    const useGoogleSheets = isGoogleSheetsConfigured();
    const storageBackend = process.env.FORM_STORAGE_BACKEND || 'auto'; // 'supabase', 'google_sheets', 'both', or 'auto'

    if (!useSupabase && !useGoogleSheets) {
      logger.error('No storage backend configured for course enrollment');
      return res.status(500).json({
        success: false,
        message: 'Enrollment storage is not configured yet. Please contact support.',
      });
    }

    // Initialize Google Sheets headers if using Google Sheets
    if (useGoogleSheets && (storageBackend === 'google_sheets' || storageBackend === 'both' || storageBackend === 'auto')) {
      await initializeGoogleSheets().catch(err => {
        logger.warn('Failed to initialize Google Sheets headers', { error: err.message });
      });
    }

    let leadRecordId = null;
    let googleSheetsRowId = null;
    const storageBackends = [];

    // OPTIMIZED: Save data in parallel for faster response
    // Run both saves simultaneously, wait max 1 second, then proceed to payment
    const savePromises = [];

    // Save to Supabase if configured and selected
    if (useSupabase && (storageBackend === 'supabase' || storageBackend === 'both' || storageBackend === 'auto')) {
      const supabasePromise = (async () => {
        try {
          const supabase = getSupabaseClient();
          const existingLead = await findExistingLead(supabase, lead.email);
          
          // Only reuse existing ID if they haven't paid (allows retry for failed payments)
          // If they've paid, create a new record to allow re-registration
          // If no existing lead, create new one
          if (existingLead.id && !existingLead.hasPaid) {
            logger.info('Reusing existing lead for payment retry', { 
              email: lead.email, 
              leadId: existingLead.id 
            });
            return { type: 'supabase', id: existingLead.id };
          }
          
          // Create new lead (either no existing lead, or they've already paid)
          const newId = await insertLead(supabase, lead);
          return { type: 'supabase', id: newId };
        } catch (error) {
          logger.warn('Supabase save failed, continuing', { error: error.message });
          return { type: 'supabase', id: null };
        }
      })();
      savePromises.push(supabasePromise);
    }

    // Save to Google Sheets if configured and selected (ALWAYS save when configured, not just as backup)
    // Skip duplicate check to avoid lag - just save directly for faster response
    if (useGoogleSheets && (storageBackend === 'google_sheets' || storageBackend === 'both' || storageBackend === 'auto')) {
      const sheetsPromise = (async () => {
        try {
          // Direct save without duplicate check for faster response
          const rowId = await saveLeadToSheets(lead);
          return { type: 'sheets', id: rowId };
        } catch (error) {
          logger.warn('Google Sheets save failed, continuing', { error: error.message });
          return { type: 'sheets', id: null };
        }
      })();
      savePromises.push(sheetsPromise);
    }

    // Wait for saves with timeout - don't block payment flow too long
    // Give saves 1 second max, then proceed to payment (data will continue saving in background)
    // Reduced from 1.5s to 1s for faster response
    if (savePromises.length > 0) {
      try {
        const results = await Promise.race([
          Promise.allSettled(savePromises),
          new Promise(resolve => setTimeout(() => resolve([]), 1000))
        ]);

        // Process results
        if (Array.isArray(results) && results.length > 0) {
          results.forEach(result => {
            if (result && result.status === 'fulfilled' && result.value) {
              const { type, id } = result.value;
              if (type === 'supabase' && id) {
                leadRecordId = id;
                storageBackends.push('supabase');
              } else if (type === 'sheets' && id) {
                googleSheetsRowId = id;
                storageBackends.push('google_sheets');
              }
            }
          });
        }
      } catch (error) {
        // Ignore errors - data will continue saving in background, payment proceeds
        logger.debug('Data save timeout, proceeding to payment', { error: error.message });
      }
    }

    // Log storage status
    logger.info('Lead storage initiated', {
      email: lead.email,
      supabaseId: leadRecordId || 'pending',
      googleSheetsRowId: googleSheetsRowId || 'pending',
      storageBackends: storageBackends.join(', ') || 'pending',
    });
    
    // Create Stripe checkout session IMMEDIATELY with retry logic
    // Payment flow is priority - data saves continue in background
    const startTime = Date.now();
    
    let session;
    try {
      session = await createCheckoutSession(lead, leadRecordId, googleSheetsRowId, storageBackends);
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
      
      logger.error('Stripe checkout session creation failed after retries', {
        error: error.message,
        errorType: error.type,
        errorCode: error.code,
        errorStatus: error.statusCode,
        leadId: leadRecordId,
        email: lead.email,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      
      // Provide more specific error message based on error type
      let errorMessage = 'Payment system temporarily unavailable. Please try again in a moment.';
      
      if (error.type === 'StripeRateLimitError' || error.code === 'rate_limit' || error.statusCode === 429) {
        errorMessage = 'Payment system is busy. Please try again in a few moments.';
      } else if (error.type === 'StripeInvalidRequestError') {
        errorMessage = 'Invalid payment request. Please check your information and try again.';
      } else if (process.env.NODE_ENV === 'development') {
        errorMessage = `Payment system error: ${error.message} (${error.type || 'Unknown'})`;
      }
      
      return res.status(502).json({
        success: false,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          errorType: error.type,
          errorCode: error.code 
        }),
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
