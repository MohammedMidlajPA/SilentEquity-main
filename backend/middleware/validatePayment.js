/**
 * Payment Validation Middleware
 * Validates payment request data with security checks
 */

// Sanitize input to prevent XSS
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 255); // Limit length
};

exports.validatePaymentIntent = (req, res, next) => {
  const { name, email, phone } = req.body;

  // Check required fields
  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and phone are required'
    });
  }

  // Sanitize inputs
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedPhone = sanitizeInput(phone);

  // Validate name (at least 2 characters, max 100)
  if (sanitizedName.length < 2 || sanitizedName.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 100 characters'
    });
  }

  // Validate email format (more strict)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitizedEmail) || sanitizedEmail.length > 255) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Validate phone (more strict - 10-20 characters)
  const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
  if (!phoneRegex.test(sanitizedPhone)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format (10-20 characters)'
    });
  }

  // Replace original values with sanitized ones
  req.body.name = sanitizedName;
  req.body.email = sanitizedEmail;
  req.body.phone = sanitizedPhone;

  next();
};

exports.validateConfirmPayment = (req, res, next) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({
      success: false,
      message: 'Payment Intent ID is required'
    });
  }

  // Validate Stripe Payment Intent ID format (pi_ followed by alphanumeric)
  const stripeIdRegex = /^pi_[a-zA-Z0-9]{24,}$/;
  if (!stripeIdRegex.test(paymentIntentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Payment Intent ID format'
    });
  }

  // Sanitize and replace
  req.body.paymentIntentId = paymentIntentId.trim();

  next();
};  