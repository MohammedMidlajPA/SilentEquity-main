const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
const constants = require('./constants');

/**
 * Connect to MongoDB Database
 * Creates connection using URI from environment variables
 * Note: MongoDB is optional - course enrollment uses Supabase, MongoDB is only for webinar payments
 * @param {boolean} exitOnError - Whether to exit process on error (default: false, MongoDB is optional)
 * @returns {Promise<mongoose.Connection|void>} MongoDB connection or void if not configured
 */
const connectDB = async (exitOnError = false) => {
  try {
    if (!process.env.MONGODB_URI) {
      logger.warn('MONGODB_URI not configured - MongoDB features disabled (webinar payments will not work)');
      return null;
    }

    // Remove deprecated options (not needed in Mongoose 6+)
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: constants.MONGODB_MAX_POOL_SIZE,
      serverSelectionTimeoutMS: constants.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      socketTimeoutMS: constants.MONGODB_SOCKET_TIMEOUT_MS,
    });

    logger.info('MongoDB connected', {
      host: conn.connection.host,
      database: conn.connection.name,
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error('MongoDB connection error', { error: error.message });
    if (exitOnError && process.env.NODE_ENV !== 'test') {
      logger.error('Exiting due to MongoDB connection failure');
      process.exit(1);
    }
    // Don't throw error - MongoDB is optional for course enrollment
    logger.warn('MongoDB connection failed - continuing without MongoDB (webinar payments disabled)');
    return null;
  }
};

module.exports = connectDB;