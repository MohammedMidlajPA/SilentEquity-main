/**
 * Performance Analyzer Utility
 * Helps identify and analyze slow requests
 */

const { logger } = require('./logger');

/**
 * Analyze slow request patterns
 * @param {Object} logEntry - Log entry with request details
 */
function analyzeSlowRequest(logEntry) {
  const { method, path, responseTimeMs, statusCode } = logEntry;
  
  // Common slow endpoints and their typical causes
  const slowEndpointPatterns = {
    '/api/payment/create-checkout-session': {
      commonCauses: [
        'Stripe API call taking time',
        'Exchange rate API call (if not cached)',
        'Database connection pool exhaustion',
        'High concurrent load'
      ],
      recommendations: [
        'Check Stripe API response times',
        'Verify exchange rate cache is working',
        'Monitor database connection pool usage',
        'Check for rate limiting'
      ]
    },
    '/api/course/join': {
      commonCauses: [
        'Supabase insert operation',
        'Stripe checkout session creation',
        'Duplicate email check query',
        'Network latency to Supabase'
      ],
      recommendations: [
        'Check Supabase response times',
        'Verify Supabase connection pool',
        'Monitor database query performance',
        'Check network connectivity'
      ]
    },
    '/api/payment/verify-session': {
      commonCauses: [
        'Stripe API call to retrieve session',
        'Database query for payment record',
        'Webhook processing delay'
      ],
      recommendations: [
        'Check Stripe API latency',
        'Verify database query indexes',
        'Monitor webhook processing times'
      ]
    },
    '/api/webhook': {
      commonCauses: [
        'Webhook signature verification',
        'Database updates',
        'Email sending',
        'Supabase updates'
      ],
      recommendations: [
        'Verify webhook processing is async',
        'Check email sending is non-blocking',
        'Monitor database update performance'
      ]
    }
  };

  // Find matching pattern
  const pattern = Object.keys(slowEndpointPatterns).find(p => path.includes(p));
  
  if (pattern) {
    const analysis = slowEndpointPatterns[pattern];
    logger.info('Slow request analysis', {
      endpoint: path,
      method,
      responseTimeMs,
      statusCode,
      commonCauses: analysis.commonCauses,
      recommendations: analysis.recommendations
    });
    return analysis;
  }

  // Generic analysis for unknown endpoints
  logger.info('Slow request detected (unknown endpoint)', {
    endpoint: path,
    method,
    responseTimeMs,
    statusCode,
    recommendations: [
      'Check endpoint implementation for blocking operations',
      'Verify database queries are optimized',
      'Check for external API calls without timeouts',
      'Monitor connection pool usage'
    ]
  });

  return null;
}

/**
 * Get performance recommendations based on response time
 * @param {number} responseTimeMs - Response time in milliseconds
 */
function getPerformanceRecommendations(responseTimeMs) {
  const recommendations = [];

  if (responseTimeMs > 5000) {
    recommendations.push('CRITICAL: Response time >5s - Check for blocking operations');
    recommendations.push('Verify all external API calls have timeouts');
    recommendations.push('Check database connection pool exhaustion');
  } else if (responseTimeMs > 3000) {
    recommendations.push('HIGH: Response time >3s - Investigate database queries');
    recommendations.push('Check for N+1 query problems');
    recommendations.push('Verify indexes are being used');
  } else if (responseTimeMs > 1000) {
    recommendations.push('MEDIUM: Response time >1s - Monitor and optimize');
    recommendations.push('Check external API response times');
    recommendations.push('Verify caching is working');
  }

  return recommendations;
}

module.exports = {
  analyzeSlowRequest,
  getPerformanceRecommendations
};


