/**
 * Application Constants
 * Centralized configuration values
 */

module.exports = {
  // Checkout Session Configuration
  CHECKOUT_SESSION_EXPIRY_HOURS: 24,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  PAYMENT_RATE_LIMIT_MAX: 20,
  
  // Request Timeouts
  REQUEST_TIMEOUT_MS: 10000, // 10 seconds
  STRIPE_API_TIMEOUT_MS: 10000,
  
  // Database
  MONGODB_MAX_POOL_SIZE: 10,
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: 5000,
  MONGODB_SOCKET_TIMEOUT_MS: 45000,
  
  // Email
  EMAIL_MAX_CONNECTIONS: 5,
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

