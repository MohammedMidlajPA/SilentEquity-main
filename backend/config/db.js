const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
const constants = require('./constants');

/**
 * Connect to MongoDB Database
 * Creates connection using URI from environment variables
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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

  } catch (error) {
    logger.error('MongoDB connection error', { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;