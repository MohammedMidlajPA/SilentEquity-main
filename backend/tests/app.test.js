/**
 * App Tests
 * Basic app structure tests
 */

const request = require('supertest');
const app = require('../server');

describe('App Structure', () => {
  test('Server should export Express app', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
    expect(typeof app.get).toBe('function');
    expect(typeof app.post).toBe('function');
  });

  test('App should have health endpoint', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });

  test('App should handle CORS', async () => {
    const response = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:5174');
    
    // Should allow CORS for test origin
    expect(response.status).toBeLessThan(500);
  });
});

describe('Course routes', () => {
  test('should validate join payload before processing', async () => {
    const response = await request(app)
      .post('/api/course/join')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});

