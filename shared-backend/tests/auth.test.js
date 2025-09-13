const request = require('supertest');
const app = require('../server');
const { hashPassword, comparePassword } = require('../utils/password');

describe('Authentication Tests', () => {
  describe('Password Utilities', () => {
    test('should hash password correctly', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50);
    });

    test('should compare password correctly', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);
      
      const isValid = await comparePassword(password, hashed);
      expect(isValid).toBe(true);
      
      const isInvalid = await comparePassword('wrongpassword', hashed);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Auth Endpoints', () => {
    test('POST /api/v1/auth/login should return 200', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'test', password: 'password' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('POST /api/v1/auth/register should return 200', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ 
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
