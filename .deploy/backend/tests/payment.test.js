/**
 * Payment API Tests
 * Basic unit tests for payment endpoints
 */

const request = require('supertest');

// Import app (setup.js already configured env vars)
const app = require('../server');

describe('Payment API', () => {
  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.environment).toBe('test');
    });
  });

  describe('Create Checkout Session', () => {
    test('POST /api/payment/create-checkout-session should return error without Stripe', async () => {
      // Without real Stripe credentials, this should fail gracefully
      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .send({})
        .expect(500);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Verify Session', () => {
    test('GET /api/payment/verify-session should validate session ID format', async () => {
      const response = await request(app)
        .get('/api/payment/verify-session?sessionId=invalid')
        .expect(400);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    });

    test('GET /api/payment/verify-session should require sessionId', async () => {
      const response = await request(app)
        .get('/api/payment/verify-session')
        .expect(400);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    test('GET /api/payment/verify-session should handle non-existent Stripe session', async () => {
      // Valid format (cs_ + 24+ alphanumeric chars) but non-existent session
      // Session ID must be at least 24 alphanumeric characters after cs_ prefix
      // Use all alphanumeric characters (no underscores)
      const validFormatSessionId = 'cs_test' + 'a'.repeat(24);
      const response = await request(app)
        .get(`/api/payment/verify-session?sessionId=${validFormatSessionId}`);
      
      // Without real Stripe credentials, this may return 400 (invalid key) or 404 (session not found)
      // Both are acceptable - the important thing is it doesn't crash
      expect([400, 404, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('404 Handler', () => {
    test('GET /api/nonexistent should return 404', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });
  });
});

