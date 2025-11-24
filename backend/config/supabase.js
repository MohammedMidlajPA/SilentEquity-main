const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

let supabaseClient = null;
let currentUrl = null;
let currentServiceKey = null;

/**
 * Checks if Supabase is configured with required environment variables
 * @returns {boolean} True if Supabase URL and service role key are configured
 */
function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Resets the Supabase client instance
 * Useful for testing or when credentials change
 */
function resetSupabaseClient() {
  supabaseClient = null;
  currentUrl = null;
  currentServiceKey = null;
  logger.info('Supabase client reset');
}

/**
 * Retry wrapper for Supabase operations with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 */
async function retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add timeout to prevent hanging operations
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase operation timeout')), 10000)
        )
      ]);
      return result;
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === maxRetries - 1;
      
      // Check if it's a Supabase error that should be retried
      const isSupabaseError = error.message?.includes('Internal server error') ||
                              error.message?.includes('timeout') ||
                              error.message?.includes('network') ||
                              error.code === 'ECONNRESET' ||
                              error.code === 'ETIMEDOUT' ||
                              !error.code; // Supabase errors often don't have codes
      
      if (isLastAttempt) {
        logger.error('Supabase operation failed after all retries', {
          attempt: attempt + 1,
          maxRetries,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details || error.hint
        });
        throw error;
      }
      
      if (!isSupabaseError) {
        // Non-transient error, don't retry
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn('Supabase operation failed, retrying', { 
        attempt: attempt + 1, 
        maxRetries,
        delay,
        error: error.message,
        errorCode: error.code
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Supabase operation failed');
}

/**
 * Gets or creates the Supabase client instance
 * Uses singleton pattern to reuse the same client across requests
 * @returns {Object} Supabase client instance
 * @throws {Error} If Supabase credentials are not configured
 */
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Reset client if credentials have changed
  if (supabaseClient && (currentUrl !== url || currentServiceKey !== serviceKey)) {
    logger.info('Supabase credentials changed, resetting client');
    resetSupabaseClient();
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured');
  }

  // Create client with optimized settings for high-volume operations
  supabaseClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
    // Connection pooling and retry configuration
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'silent-equity-backend',
      },
    },
  });

  currentUrl = url;
  currentServiceKey = serviceKey;

  logger.info('Supabase client initialized', { url: url?.replace(/\/\/.*@/, '//***@') });
  return supabaseClient;
}

module.exports = {
  getSupabaseClient,
  isSupabaseConfigured,
  resetSupabaseClient,
  retryOperation,
};

