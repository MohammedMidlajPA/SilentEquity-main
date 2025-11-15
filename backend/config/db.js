const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
const constants = require('./constants');

/**
 * Connect to MongoDB Database
 * Creates connection using URI from environment variables
 * @param {boolean} exitOnError - Whether to exit process on error (default: true, false in tests)
 */
const connectDB = async (exitOnError = true) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
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
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;