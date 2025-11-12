/**
 * Input Validation and Sanitization Utilities
 * Production-ready validation functions
 */

/**
 * Sanitize string input to prevent XSS
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize email
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const sanitized = email.trim().toLowerCase().substring(0, 255);
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (sanitized.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate and sanitize phone number
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const sanitized = phone.trim().replace(/[^\d+()-]/g, '').substring(0, 20);
  
  // Basic phone validation (allows international format)
  if (sanitized.length < 10 || sanitized.length > 20) {
    return { valid: false, error: 'Phone number must be between 10 and 20 digits' };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate and sanitize name
 */
function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const sanitized = sanitizeString(name).substring(0, 100);
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, error: 'Name is too long' };
  }
  
  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  
  return { valid: true, value: sanitized };
}

/**
 * Validate Stripe session ID format
 */
function validateStripeSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') {
    return { valid: false, error: 'Session ID is required' };
  }
  
  // Stripe checkout session IDs start with cs_
  const sessionIdRegex = /^cs_[a-zA-Z0-9]{24,}$/;
  
  if (!sessionIdRegex.test(sessionId.trim())) {
    return { valid: false, error: 'Invalid session ID format' };
  }
  
  return { valid: true, value: sessionId.trim() };
}

/**
 * Validate payment request body
 */
function validatePaymentRequest(body) {
  const errors = [];
  const validated = {};
  
  // Validate name
  const nameValidation = validateName(body.name);
  if (!nameValidation.valid) {
    errors.push(nameValidation.error);
  } else {
    validated.name = nameValidation.value;
  }
  
  // Validate email
  const emailValidation = validateEmail(body.email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error);
  } else {
    validated.email = emailValidation.value;
  }
  
  // Validate phone
  const phoneValidation = validatePhone(body.phone);
  if (!phoneValidation.valid) {
    errors.push(phoneValidation.error);
  } else {
    validated.phone = phoneValidation.value;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    data: validated
  };
}

module.exports = {
  sanitizeString,
  validateEmail,
  validatePhone,
  validateName,
  validateStripeSessionId,
  validatePaymentRequest
};

