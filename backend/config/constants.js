/**
 * Application Constants
 * Centralized configuration values
 */

module.exports = {
  // Checkout Session Configuration
  CHECKOUT_SESSION_EXPIRY_HOURS: 24,
  
  // Rate Limiting (Optimized for 10k+ concurrent users)
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 500, // Increased from 100 to handle high traffic (5x)
  PAYMENT_RATE_LIMIT_MAX: 100, // Increased from 20 to handle payment spikes (5x)
  
  // Request Timeouts (Optimized for high load)
  REQUEST_TIMEOUT_MS: 15000, // Increased from 10s to 15s for high traffic scenarios
  STRIPE_API_TIMEOUT_MS: 10000, // Keep Stripe timeout at 10s (optimal)
  
  // Database (Optimized for concurrent operations)
  MONGODB_MAX_POOL_SIZE: 50, // Increased from 10 to handle concurrent database operations (5x)
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: 5000,
  MONGODB_SOCKET_TIMEOUT_MS: 45000,
  
  // Email (Optimized for high-volume email sending)
  EMAIL_MAX_CONNECTIONS: 20, // Increased from 5 to send emails without delay (4x)
  EMAIL_MAX_MESSAGES: 100,
  EMAIL_RATE_DELTA: 1000,
  EMAIL_RATE_LIMIT: 5,
  
  // Exchange Rate Cache
  EXCHANGE_RATE_CACHE_TTL_MS: 60 * 60 * 1000, // 1 hour
  
  // Input Limits
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  MAX_REQUEST_SIZE: '10mb',
  
  // Stripe
  STRIPE_SESSION_ID_PREFIX: 'cs_',
  STRIPE_PAYMENT_INTENT_PREFIX: 'pi_',
  
  // Google Form URL
  GOOGLE_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLScxS_5gOlOif-wuXM8JFgnac1gQC9hqLBb9EWLAKmszFKNDxg/viewform?usp=publish-editor',
};

