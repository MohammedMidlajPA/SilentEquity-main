/**
 * Webhook Middleware
 * Verifies Stripe webhook signatures for security
 */

const { stripe } = require('../config/stripe');
const { logger } = require('../utils/logger');

/**
 * Verify Stripe webhook signature
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyWebhookSignature = (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).json({
      success: false,
      message: 'Webhook secret not configured'
    });
  }

  if (!sig) {
    return res.status(400).json({
      success: false,
      message: 'Missing stripe-signature header'
    });
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
    
    // Attach verified event to request
    req.stripeEvent = event;
    next();
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${err.message}`
    });
  }
};

module.exports = { verifyWebhookSignature };

