/**
 * Payment Event Logger
 * Structured logging for payment events
 */

/**
 * Log payment event with structured data
 * @param {string} eventType - Type of event (success, failure, etc.)
 * @param {object} data - Event data
 */
const logPaymentEvent = (eventType, data) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    eventType,
    ...data
  };

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[PAYMENT ${eventType.toUpperCase()}]`, JSON.stringify(logEntry, null, 2));
  } else {
    // In production, you might want to send to logging service
    console.log(JSON.stringify(logEntry));
  }
};

/**
 * Log payment success
 */
const logPaymentSuccess = (paymentData) => {
  logPaymentEvent('success', {
    paymentId: paymentData.paymentId,
    userId: paymentData.userId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    paymentMethod: paymentData.paymentMethod,
    stripePaymentIntentId: paymentData.stripePaymentIntentId
  });
};

/**
 * Log payment failure
 */
const logPaymentFailure = (paymentData) => {
  logPaymentEvent('failure', {
    paymentId: paymentData.paymentId,
    userId: paymentData.userId,
    amount: paymentData.amount,
    error: paymentData.error,
    errorType: paymentData.errorType,
    stripePaymentIntentId: paymentData.stripePaymentIntentId
  });
};

/**
 * Log payment creation
 */
const logPaymentCreation = (paymentData) => {
  logPaymentEvent('creation', {
    userId: paymentData.userId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    paymentMethod: paymentData.paymentMethod,
    stripePaymentIntentId: paymentData.stripePaymentIntentId
  });
};

/**
 * Log webhook event
 */
const logWebhookEvent = (eventType, eventData) => {
  logPaymentEvent('webhook', {
    webhookType: eventType,
    stripeEventId: eventData.id,
    paymentIntentId: eventData.paymentIntentId,
    status: eventData.status
  });
};

/**
 * Log error
 */
const logError = (error, context) => {
  logPaymentEvent('error', {
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    context
  });
};

module.exports = {
  logPaymentEvent,
  logPaymentSuccess,
  logPaymentFailure,
  logPaymentCreation,
  logWebhookEvent,
  logError
};

