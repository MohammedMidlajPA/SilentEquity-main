const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { testStripeConnection } = require('./config/stripe');
const { testEmailConfig } = require('./utils/email');
const { logValidationResults } = require('./utils/envValidator');
const { logger } = require('./utils/logger');
const constants = require('./config/constants');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Only validate and connect in non-test environments
if (process.env.NODE_ENV !== 'test') {
  // Validate environment variables
  if (!logValidationResults()) {
    logger.error('Environment validation failed. Exiting...');
    process.exit(1);
  }

  // Connect to MongoDB
  connectDB().catch(() => {
    // Error already logged in connectDB
  });

  // Test Stripe connection (non-blocking)
  testStripeConnection().catch(err => {
    logger.warn('Stripe connection test failed', { error: err.message });
  });

  // Test email configuration (non-blocking)
  testEmailConfig().catch(err => {
    logger.warn('Email configuration test failed', { error: err.message });
  });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT_WINDOW_MS,
  max: constants.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT_WINDOW_MS,
  max: constants.PAYMENT_RATE_LIMIT_MAX,
  message: 'Too many payment requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

app.use('/api/', generalLimiter);
app.use('/api/payment/create-checkout-session', paymentLimiter);
app.use('/api/payment/verify-session', paymentLimiter);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000'
].filter(Boolean);

// CORS configuration - Always check whitelist
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

// Body parsing middleware
// Note: Webhook route needs raw body, so it's handled in the route itself
app.use(express.json({ limit: constants.MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ extended: true, limit: constants.MAX_REQUEST_SIZE }));

// Routes
app.use('/api/payment', require('./routes/paymentRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server only if not in test mode and not imported as module
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    logger.info('Server started', {
      port: PORT,
      frontendUrl: process.env.FRONTEND_URL,
      email: process.env.EMAIL_USER,
      environment: process.env.NODE_ENV,
    });
  });
}

// Export app for testing
module.exports = app;
