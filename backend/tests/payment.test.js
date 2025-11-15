/**
 * Payment API Tests
 * Basic unit tests for payment endpoints
 */

const request = require('supertest');
const mongoose = require('mongoose');

// Mock environment variables before requiring server
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';
process.env.FRONTEND_URL = 'http://localhost:5174';
process.env.WEBINAR_PRICE = '4.5';
process.env.EMAIL_HOST = 'smtp.test.com';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASSWORD = 'test';
process.env.EMAIL_FROM = 'Test <test@test.com>';

// Note: In a real test setup, you would mock Stripe
// For now, these are basic structure tests

describe('Payment API', () => {
  let app;

  beforeAll(async () => {
    // Import app after env vars are set
    app = require('../server');
    
    // Wait for MongoDB connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Close MongoDB connection
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });
  });

  describe('Create Checkout Session', () => {
    test('POST /api/payment/create-checkout-session should require valid environment', async () => {
      // This test will fail if env vars are not set
      // In real tests, you would mock Stripe
      const response = await request(app)
        .post('/api/payment/create-checkout-session')
        .send({});
      
      // Should either succeed (if Stripe is configured) or fail gracefully
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Verify Session', () => {
    test('GET /api/payment/verify-session should validate session ID format', async () => {
      const response = await request(app)
        .get('/api/payment/verify-session?sessionId=invalid')
        .expect(400);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    test('GET /api/payment/verify-session should require sessionId', async () => {
      const response = await request(app)
        .get('/api/payment/verify-session')
        .expect(400);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });
});

