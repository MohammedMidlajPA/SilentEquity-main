const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

let supabaseClient = null;
let currentUrl = null;
let currentServiceKey = null;

function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

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
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isTransientError = error.code === 'ECONNRESET' || 
                               error.code === 'ETIMEDOUT' || 
                               error.message?.includes('timeout') ||
                               error.message?.includes('network');
      
      if (isLastAttempt || !isTransientError) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn('Supabase operation failed, retrying', { 
        attempt: attempt + 1, 
        maxRetries,
        delay,
        error: error.message 
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

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

