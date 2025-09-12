const request = require('supertest');
const app = require('../../server');
const jwt = require('jsonwebtoken');

describe('Security Tests', () => {
  let validToken;
  let invalidToken;

  beforeAll(() => {
    // Create valid JWT token for testing
    validToken = jwt.sign(
      { 
        userId: 'test-user-id', 
        email: 'test@example.com',
        role: 'admin' 
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create invalid JWT token
    invalidToken = 'invalid-token';
  });

  describe('Authentication Security', () => {
    test('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Authentication required');
    });

    test('should reject requests with invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid token');
    });

    test('should accept requests with valid authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle expired tokens gracefully', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token expired');
    });
  });

  describe('Authorization Security', () => {
    test('should enforce role-based access control', async () => {
      // Create token with user role (not admin)
      const userToken = jwt.sign(
        { 
          userId: 'test-user-id', 
          email: 'test@example.com',
          role: 'user' 
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Insufficient permissions');
    });

    test('should allow admin access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Input Validation Security', () => {
    test('should prevent SQL injection attacks', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/v1/admin/users/search')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ query: maliciousInput })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid input');
    });

    test('should prevent XSS attacks', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ 
          name: xssPayload,
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid input');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ 
          name: 'Test User',
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid email format');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Required fields missing');
    });
  });

  describe('Rate Limiting Security', () => {
    test('should enforce rate limiting on authentication endpoints', async () => {
      const loginAttempts = [];
      
      // Make multiple login attempts
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        
        loginAttempts.push(response.status);
      }

      // Should eventually get rate limited
      expect(loginAttempts).toContain(429);
    });

    test('should enforce rate limiting on API endpoints', async () => {
      const apiCalls = [];
      
      // Make multiple API calls
      for (let i = 0; i < 100; i++) {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${validToken}`);
        
        apiCalls.push(response.status);
      }

      // Should eventually get rate limited
      expect(apiCalls).toContain(429);
    });
  });

  describe('CORS Security', () => {
    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/v1/admin/users')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Authorization')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });

    test('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Origin', 'https://malicious-site.com')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('CORS policy violation');
    });
  });

  describe('Data Sanitization', () => {
    test('should sanitize user input', async () => {
      const maliciousInput = {
        name: 'Test User<script>alert("XSS")</script>',
        email: 'test@example.com',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(maliciousInput)
        .expect(201);

      // Verify that the script tag was removed
      expect(response.body.data.name).not.toContain('<script>');
      expect(response.body.data.name).toBe('Test User');
    });

    test('should prevent NoSQL injection', async () => {
      const maliciousInput = {
        name: { $ne: null },
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .send(maliciousInput)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid input');
    });
  });

  describe('Session Security', () => {
    test('should handle session timeout', async () => {
      // Create token with very short expiration
      const shortToken = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1s' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${shortToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token expired');
    });

    test('should handle concurrent sessions', async () => {
      // Create multiple tokens for the same user
      const token1 = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const token2 = jwt.sign(
        { userId: 'test-user-id', email: 'test@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Both tokens should work
      const response1 = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const response2 = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose sensitive information in error messages', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .expect(401);

      // Error message should not contain sensitive information
      expect(response.body.error).not.toContain('password');
      expect(response.body.error).not.toContain('secret');
      expect(response.body.error).not.toContain('token');
    });

    test('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid request format');
    });
  });

  describe('File Upload Security', () => {
    test('should validate file types', async () => {
      const response = await request(app)
        .post('/api/v1/admin/upload')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', Buffer.from('malicious content'), 'malicious.exe')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid file type');
    });

    test('should limit file size', async () => {
      // Create a large file buffer
      const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB
      
      const response = await request(app)
        .post('/api/v1/admin/upload')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('file', largeFile, 'large-file.jpg')
        .expect(413);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('File too large');
    });
  });
});
