const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  verifyCheckoutSession,
  createPaymentIntent,
  createUPIPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  handleWebhook
} = require('../controllers/paymentController');
const {
  validatePaymentIntent,
  validateConfirmPayment
} = require('../middleware/validatePayment');
const { verifyWebhookSignature } = require('../middleware/webhookMiddleware');

/**
 * Payment Routes
 */

// POST /api/payment/create-checkout-session
// Create Stripe Checkout Session (Card & UPI) - Primary payment method
// No validation needed - Stripe collects user details
router.post('/create-checkout-session', createCheckoutSession);

// GET /api/payment/verify-session?sessionId=cs_xxx
// Verify checkout session status when user returns from Stripe
router.get('/verify-session', verifyCheckoutSession);

// POST /api/payment/create-intent
// Create Stripe Payment Intent (Card) - Deprecated, use create-checkout-session
router.post('/create-intent', 
  (req, res, next) => {
    res.set('X-Deprecated', 'true');
    res.set('X-Deprecated-Since', '2024-01-01');
    res.set('X-Deprecated-Replacement', '/api/payment/create-checkout-session');
    next();
  },
  validatePaymentIntent, 
  createPaymentIntent
);

// POST /api/payment/create-upi-intent
// Create UPI Payment Intent or Payment Link - Deprecated, use create-checkout-session
router.post('/create-upi-intent',
  (req, res, next) => {
    res.set('X-Deprecated', 'true');
    res.set('X-Deprecated-Since', '2024-01-01');
    res.set('X-Deprecated-Replacement', '/api/payment/create-checkout-session');
    next();
  },
  createUPIPaymentIntent
);

// POST /api/payment/confirm
// Confirm payment succeeded - Deprecated for checkout flow
router.post('/confirm',
  (req, res, next) => {
    res.set('X-Deprecated', 'true');
    res.set('X-Deprecated-Since', '2024-01-01');
    res.set('X-Deprecated-Replacement', '/api/payment/verify-session');
    next();
  },
  validateConfirmPayment, 
  confirmPayment
);

// GET /api/payment/status?email=user@example.com&paymentIntentId=pi_xxx
// Check payment status by email or payment intent ID
router.get('/status', getPaymentStatus);

// POST /api/payment/webhook
// Stripe webhook endpoint for payment events
router.post('/webhook', express.raw({ type: 'application/json' }), verifyWebhookSignature, handleWebhook);

module.exports = router;
