/**
 * Structured Logging Utility
 * Uses Winston for production-ready logging
 */

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format,
  defaultMeta: { service: 'silent-equity-backend' },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Payment-specific logging functions
 */

/**
 * Log payment creation
 */
const logPaymentCreation = (paymentData) => {
  logger.info('Payment creation', {
    type: 'payment_creation',
    amount: paymentData.amount,
    currency: paymentData.currency || 'inr',
    paymentMethod: paymentData.paymentMethod || 'checkout',
    stripePaymentIntentId: paymentData.stripePaymentIntentId,
    originalAmountUSD: paymentData.originalAmountUSD,
  });
};

/**
 * Log payment success
 */
const logPaymentSuccess = (paymentData) => {
  logger.info('Payment succeeded', {
    type: 'payment_success',
    paymentId: paymentData.paymentId,
    userId: paymentData.userId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    paymentMethod: paymentData.paymentMethod,
    stripePaymentIntentId: paymentData.stripePaymentIntentId,
  });
};

/**
 * Log payment failure
 */
const logPaymentFailure = (paymentData) => {
  logger.error('Payment failed', {
    type: 'payment_failure',
    paymentId: paymentData.paymentId,
    userId: paymentData.userId,
    amount: paymentData.amount,
    error: paymentData.error,
    errorType: paymentData.errorType,
    stripePaymentIntentId: paymentData.stripePaymentIntentId,
    stack: process.env.NODE_ENV === 'development' ? paymentData.stack : undefined,
  });
};

/**
 * Log webhook event
 */
const logWebhookEvent = (eventType, eventData) => {
  logger.info('Webhook event received', {
    type: 'webhook_event',
    webhookType: eventType,
    stripeEventId: eventData.id,
    paymentIntentId: eventData.paymentIntentId,
    status: eventData.status,
  });
};

module.exports = {
  logger,
  logPaymentCreation,
  logPaymentSuccess,
  logPaymentFailure,
  logWebhookEvent,
};
