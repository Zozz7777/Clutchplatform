const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  describe('Health Endpoints', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
    });

    test('GET /health/ping should return 200', async () => {
      const response = await request(app)
        .get('/health/ping')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Auth Endpoints', () => {
    test('POST /api/v1/auth/login should return 200', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'test', password: 'password' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
    });

    test('POST /api/v1/auth/register should return 200', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ 
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Knowledge Base Endpoints', () => {
    test('GET /api/v1/knowledge-base/articles should return 200', async () => {
      const response = await request(app)
        .get('/api/v1/knowledge-base/articles')
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Incidents Endpoints', () => {
    test('GET /api/v1/incidents/ should return 200', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/')
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
    });
  });
});
