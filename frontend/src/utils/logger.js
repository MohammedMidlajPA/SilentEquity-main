/**
 * Frontend Logger Utility
 * Provides structured logging for frontend
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Log levels
 */
const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

/**
 * Create log entry
 */
const createLogEntry = (level, message, data = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };
};

/**
 * Logger object
 */
const logger = {
  debug: (message, data) => {
    if (isDevelopment) {
      const entry = createLogEntry(LogLevel.DEBUG, message, data);
      console.debug('[DEBUG]', entry);
    }
  },

  info: (message, data) => {
    if (isDevelopment) {
      const entry = createLogEntry(LogLevel.INFO, message, data);
      console.log('[INFO]', entry);
    }
  },

  warn: (message, data) => {
    const entry = createLogEntry(LogLevel.WARN, message, data);
    if (isDevelopment) {
      console.warn('[WARN]', entry);
    }
    // In production, could send to error tracking service
  },

  error: (message, error, data = {}) => {
    const entry = createLogEntry(LogLevel.ERROR, message, {
      ...data,
      error: error?.message || error,
      stack: isDevelopment && error?.stack ? error.stack : undefined,
    });
    
    if (isDevelopment) {
      console.error('[ERROR]', entry);
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      console.error('[ERROR]', message, data);
    }
  },
};

export default logger;

