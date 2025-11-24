/**
 * Environment Variable Validator
 * Validates all required environment variables at startup
 */

const { logger } = require('./logger');

function validateEnvironment() {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FRONTEND_URL',
    'WEBINAR_PRICE',
    'WEBINAR_MEETING_LINK',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_PRICE_ID'
  ];

  const missing = [];
  const warnings = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Check required variables
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // MongoDB is optional (we're using Supabase)
  if (!process.env.MONGODB_URI) {
    warnings.push('MONGODB_URI missing: MongoDB features disabled (using Supabase)');
  }

  // Google Sheets is optional (alternative to Supabase)
  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) {
    warnings.push('GOOGLE_SHEETS_SPREADSHEET_ID missing: Google Sheets storage disabled');
  } else if (!process.env.GOOGLE_SHEETS_CREDENTIALS && 
             (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY)) {
    warnings.push('Google Sheets credentials missing: Configure GOOGLE_SHEETS_CREDENTIALS or GOOGLE_SHEETS_CLIENT_EMAIL/PRIVATE_KEY');
  }

  // Form storage backend selection
  if (process.env.FORM_STORAGE_BACKEND) {
    const validBackends = ['supabase', 'google_sheets', 'both', 'auto'];
    if (!validBackends.includes(process.env.FORM_STORAGE_BACKEND)) {
      warnings.push(`FORM_STORAGE_BACKEND should be one of: ${validBackends.join(', ')}`);
    }
  }

  // Check Stripe key format
  if (process.env.STRIPE_SECRET_KEY) {
    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') && 
        !process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
      warnings.push('STRIPE_SECRET_KEY format appears invalid');
    }
  }

  // Check webhook secret format
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    if (!process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
      warnings.push('STRIPE_WEBHOOK_SECRET format appears invalid');
    }
  }

  // Check MongoDB URI format
  if (process.env.MONGODB_URI) {
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && 
        !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      warnings.push('MONGODB_URI format appears invalid');
    }
  }

  // Check email configuration
  if (process.env.EMAIL_PORT) {
    const port = parseInt(process.env.EMAIL_PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
      warnings.push('EMAIL_PORT must be a valid port number (1-65535)');
    }
  }

  // Check webinar price
  if (process.env.WEBINAR_PRICE) {
    const price = parseFloat(process.env.WEBINAR_PRICE);
    if (isNaN(price) || price <= 0) {
      warnings.push('WEBINAR_PRICE must be a positive number');
    }
  }

  // Check frontend URL format
  if (process.env.FRONTEND_URL) {
    try {
      new URL(process.env.FRONTEND_URL);
    } catch (e) {
      warnings.push('FRONTEND_URL must be a valid URL');
    }
  }

  // Check Supabase URL format
  if (process.env.SUPABASE_URL) {
    try {
      new URL(process.env.SUPABASE_URL);
    } catch (e) {
      warnings.push('SUPABASE_URL must be a valid URL');
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

function logValidationResults() {
  const result = validateEnvironment();
  
  if (!result.valid) {
    logger.error('Missing required environment variables', { missing: result.missing });
    return false;
  }

  if (result.warnings.length > 0) {
    logger.warn('Environment variable warnings', { warnings: result.warnings });
  } else {
    logger.info('All environment variables validated');
  }

  return true;
}

module.exports = {
  validateEnvironment,
  logValidationResults
};

