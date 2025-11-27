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

  // Connect to MongoDB (optional - only needed for webinar payments)
  // Course enrollment uses Supabase, so MongoDB failure won't block server startup
  connectDB(false).catch(() => {
    // Error already logged in connectDB, MongoDB is optional
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

// Trust proxy - Required when behind Nginx reverse proxy
app.set('trust proxy', true);

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
  // Trust proxy is set, so skip X-Forwarded-For validation
  validate: { trustProxy: false },
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
  // Trust proxy is set, so skip X-Forwarded-For validation
  validate: { trustProxy: false },
});

app.use('/api/', generalLimiter);
app.use('/api/payment/create-checkout-session', paymentLimiter);
app.use('/api/payment/verify-session', paymentLimiter);
app.use('/api/course/join', paymentLimiter);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:3000'
].filter(Boolean);

// Normalize origin for comparison (remove trailing slash, convert to lowercase)
function normalizeOrigin(origin) {
  if (!origin) return null;
  return origin.toLowerCase().replace(/\/$/, '');
}

// CORS configuration - Always check whitelist
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    const normalizedOrigin = normalizeOrigin(origin);
    const normalizedAllowed = allowedOrigins.map(normalizeOrigin);
    
    // Check if origin is in allowed list (exact match)
    if (normalizedAllowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    // In production, allow all variations of thesilentequity.com
    if (process.env.NODE_ENV === 'production') {
      const productionDomains = [
        'thesilentequity.com',
        'www.thesilentequity.com',
        'https://thesilentequity.com',
        'https://www.thesilentequity.com'
      ];
      
      const isProductionDomain = productionDomains.some(domain => 
        normalizedOrigin.includes(domain.toLowerCase())
      );
      
      if (isProductionDomain) {
        logger.info('CORS allowed production domain', { origin, normalizedOrigin });
        return callback(null, true);
      }
    }
    
    // Allow localhost and local IP addresses in development
    if (process.env.NODE_ENV !== 'production') {
      if (normalizedOrigin.includes('localhost') || 
          normalizedOrigin.includes('127.0.0.1') ||
          normalizedOrigin.match(/^https?:\/\/10\.\d+\.\d+\.\d+:\d+$/) ||
          normalizedOrigin.match(/^https?:\/\/192\.168\.\d+\.\d+:\d+$/)) {
        logger.info('CORS allowed local network in development', { origin, normalizedOrigin });
        return callback(null, true);
      }
    }
    
    logger.warn('CORS blocked origin', { 
      origin, 
      normalizedOrigin,
      allowedOrigins,
      environment: process.env.NODE_ENV 
    });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

// Performance monitoring middleware - track response times
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log response time when response finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const isSlowRequest = responseTime > 1000; // Log slow requests (>1s)
    
    if (isSlowRequest) {
      const { analyzeSlowRequest, getPerformanceRecommendations } = require('./utils/performanceAnalyzer');
      
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        responseTimeMs: responseTime,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
      
      // Analyze slow request and provide recommendations
      const analysis = analyzeSlowRequest({
        method: req.method,
        path: req.path,
        responseTimeMs: responseTime,
        statusCode: res.statusCode
      });
      
      const recommendations = getPerformanceRecommendations(responseTime);
      if (recommendations.length > 0) {
        logger.info('Performance recommendations', {
          path: req.path,
          responseTimeMs: responseTime,
          recommendations
        });
      }
    } else {
      logger.debug('Request processed', {
        method: req.method,
        path: req.path,
        responseTimeMs: responseTime,
        statusCode: res.statusCode
      });
    }
  });
  
  next();
});

// Request timeout middleware
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      logger.error('Request timeout', {
        method: req.method,
        path: req.path,
        timeoutMs: constants.REQUEST_TIMEOUT_MS
      });
      res.status(504).json({
        success: false,
        message: 'Request timeout. Please try again.'
      });
    }
  }, constants.REQUEST_TIMEOUT_MS);
  
  res.on('finish', () => clearTimeout(timeout));
  next();
});

// Body parsing middleware
// Note: Webhook route needs raw body, so it's handled in the route itself
app.use(express.json({ limit: constants.MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ extended: true, limit: constants.MAX_REQUEST_SIZE }));

// Routes
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/course', require('./routes/courseRoutes'));

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
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    logger.warn('CORS error', {
      origin: req.headers.origin,
      path: req.path,
      method: req.method,
    });
    return res.status(403).json({
      success: false,
      message: 'Request blocked by CORS policy. Please ensure you are accessing from the correct domain.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // Handle other errors
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
  });
  
  // Provide more specific error messages
  let errorMessage = 'Unable to process your request. Please try again.';
  let statusCode = 500;
  
  if (err.message.includes('timeout')) {
    errorMessage = 'Request timed out. Please try again.';
    statusCode = 504;
  } else if (err.message.includes('validation') || err.message.includes('Invalid')) {
    errorMessage = err.message;
    statusCode = 400;
  } else if (process.env.NODE_ENV === 'development') {
    errorMessage = err.message || errorMessage;
  }
  
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
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
