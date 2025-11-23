require('dotenv').config(); // Load env vars at the top of this file

const Stripe = require('stripe');
const { logger } = require('../utils/logger');
const constants = require('./constants');

// Validate that the key exists
if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('STRIPE_SECRET_KEY is not defined in .env file');
  process.exit(1);
}

const rawStripeKey = process.env.STRIPE_SECRET_KEY;
const isProduction = process.env.NODE_ENV === 'production';
const isTestMode = rawStripeKey?.startsWith('sk_test_');

if (isProduction && isTestMode) {
  logger.error('Production server attempted to start with a Stripe TEST key. Please supply sk_live_ credentials.');
  process.exit(1);
}

// Initialize Stripe with API version
const stripe = new Stripe(rawStripeKey, {
  apiVersion: '2024-12-18.acacia', // Use latest stable API version
  maxNetworkRetries: 2, // Retry failed requests up to 2 times
  timeout: constants.STRIPE_API_TIMEOUT_MS,
});

// Log Stripe mode
logger.info(`Stripe initialized in ${isTestMode ? 'TEST' : 'LIVE'} mode`);

/**
 * Stripe Configuration
 * Exports configured Stripe instance
 */

// Test connection (non-blocking)
const testStripeConnection = async () => {
  try {
    const account = await stripe.accounts.retrieve();
    logger.info('Stripe connected', { accountId: account.id, mode: isTestMode ? 'test' : 'live' });
    return true;
  } catch (error) {
    logger.error('Stripe connection error', { error: error.message });
    return false;
  }
};

module.exports = { stripe, testStripeConnection };