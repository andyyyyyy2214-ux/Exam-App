const request = require('supertest');
const app = require('../../src/app');

describe('API Integration Test Suite', () => {
  test('TC-INT-01: Health check endpoint returns 200 UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toContain('Auto-Grading');
  });

  test('TC-INT-02: Public FAQs endpoint returns list of exam guides', async () => {
    const res = await request(app).get('/api/v1/common/faqs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('TC-INT-03: Protected route without JWT returns 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/exams/available');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('No authentication token provided');
  });

  test('TC-INT-04: Input validation blocks registration with invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Validation failed');
  });

  test('TC-INT-05: Non-existent route returns standardized 404 JSON', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });
});
