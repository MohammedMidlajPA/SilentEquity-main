/**
 * Test Setup
 * Configures test environment before running tests
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test_silent_equity';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_testing';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock_secret_for_testing';
process.env.FRONTEND_URL = 'http://localhost:5174';
process.env.WEBINAR_PRICE = '4.5';
process.env.EMAIL_HOST = 'smtp.test.com';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASSWORD = 'test_password';
process.env.EMAIL_FROM = 'Test <test@test.com>';
process.env.DEFAULT_USD_TO_INR_RATE = '83';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key';
process.env.STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_test_123';

// Suppress console output during tests (Winston will still log)
if (process.env.SUPPRESS_LOGS !== 'false') {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  
  // Restore on exit
  process.on('exit', () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });
}

