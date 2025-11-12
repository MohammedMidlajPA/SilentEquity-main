require('dotenv').config(); // Load env vars at the top of this file

const Stripe = require('stripe');

// Validate that the key exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY is not defined in .env file');
  process.exit(1);
}

// Initialize Stripe with API version
// Use test or live keys based on environment
const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia', // Use latest stable API version
  maxNetworkRetries: 2, // Retry failed requests up to 2 times
  timeout: 20000, // 20 second timeout
});

// Log Stripe mode
if (isTestMode) {
  console.log('⚠️ Stripe is in TEST mode');
} else {
  console.log('✅ Stripe is in LIVE mode');
}

/**
 * Stripe Configuration
 * Exports configured Stripe instance
 */

// Test connection (non-blocking)
const testStripeConnection = async () => {
  try {
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe Connected: Account Active');
    return true;
  } catch (error) {
    console.error('❌ Stripe Connection Error:', error.message);
    return false;
  }
};

module.exports = { stripe, testStripeConnection };