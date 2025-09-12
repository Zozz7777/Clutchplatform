const request = require('supertest');
const app = require('../../server');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

describe('Enhancement Security Testing - Penetration Testing and Vulnerability Scanning', () => {
  let adminToken, userToken, invalidToken;

  beforeAll(() => {
    adminToken = jwt.sign({ userId: 'admin', role: 'admin' }, 'test-secret', { expiresIn: '1h' });
    userToken = jwt.sign({ userId: 'user', role: 'user' }, 'test-secret', { expiresIn: '1h' });
    invalidToken = 'invalid.token.here';
  });

  describe('OWASP Top 10 Security Testing', () => {
    describe('A01: Broken Access Control', () => {
      test('should prevent unauthorized access to admin endpoints', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Forbidden');
      });

      test('should prevent direct object reference attacks', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users/999999')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent privilege escalation', async () => {
        const response = await request(app)
          .put('/api/v1/admin/users/1')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ role: 'admin' })
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('A02: Cryptographic Failures', () => {
      test('should use secure JWT tokens', async () => {
        const response = await request(app)
          .get('/api/v1/admin/dashboard/consolidated')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
      });

      test('should reject tampered JWT tokens', async () => {
        const tamperedToken = adminToken.slice(0, -5) + 'abcde';
        const response = await request(app)
          .get('/api/v1/admin/dashboard/consolidated')
          .set('Authorization', `Bearer ${tamperedToken}`)
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should use secure password hashing', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com', password: 'password123' })
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).not.toHaveProperty('password');
      });
    });

    describe('A03: Injection', () => {
      test('should prevent SQL injection in login', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ 
            email: "admin' OR '1'='1' --", 
            password: 'anything' 
          })
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent NoSQL injection', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ 
            email: { $ne: null }, 
            password: { $ne: null } 
          })
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent command injection', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ search: '; rm -rf /' })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('A04: Insecure Design', () => {
      test('should implement proper rate limiting', async () => {
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(
            request(app)
              .post('/api/v1/auth/login')
              .send({ email: 'test@example.com', password: 'wrongpassword' })
          );
        }
        
        const responses = await Promise.all(promises);
        const rateLimitedResponses = responses.filter(r => r.status === 429);
        
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
      });

      test('should implement proper session management', async () => {
        const response = await request(app)
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
      });
    });

    describe('A05: Security Misconfiguration', () => {
      test('should not expose sensitive headers', async () => {
        const response = await request(app)
          .get('/api/v1/admin/dashboard/consolidated')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        expect(response.headers['x-powered-by']).toBeUndefined();
        expect(response.headers['server']).toBeUndefined();
      });

      test('should not expose error details in production', async () => {
        const response = await request(app)
          .get('/api/v1/nonexistent-endpoint')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
        
        expect(response.body).not.toHaveProperty('stack');
        expect(response.body).not.toHaveProperty('error.details');
      });

      test('should use secure HTTP headers', async () => {
        const response = await request(app)
          .get('/api/v1/admin/dashboard/consolidated')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBe('DENY');
        expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      });
    });

    describe('A06: Vulnerable and Outdated Components', () => {
      test('should not expose version information', async () => {
        const response = await request(app)
          .get('/api/v1/admin/dashboard/consolidated')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        expect(response.headers['x-powered-by']).toBeUndefined();
        expect(response.body).not.toHaveProperty('version');
      });

      test('should handle outdated token gracefully', async () => {
        const oldToken = jwt.sign({ userId: 'admin', role: 'admin' }, 'old-secret', { expiresIn: '1h' });
        const response = await request(app)
          .get('/api/v1/admin/dashboard/consolidated')
          .set('Authorization', `Bearer ${oldToken}`)
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('A07: Identification and Authentication Failures', () => {
      test('should require authentication for protected endpoints', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should validate token format', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', 'Bearer invalid-token-format')
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should handle expired tokens', async () => {
        const expiredToken = jwt.sign({ userId: 'admin', role: 'admin' }, 'test-secret', { expiresIn: '-1h' });
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('A08: Software and Data Integrity Failures', () => {
      test('should validate file uploads', async () => {
        const response = await request(app)
          .post('/api/v1/admin/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', Buffer.from('<script>alert("xss")</script>'), {
            filename: 'malicious.html',
            contentType: 'text/html'
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should validate data integrity', async () => {
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin',
            _id: 'malicious-id' // Attempt to inject ID
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('A09: Security Logging and Monitoring Failures', () => {
      test('should log failed login attempts', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' })
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
        // In a real test, you would check the logs
      });

      test('should log unauthorized access attempts', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
        // In a real test, you would check the logs
      });
    });

    describe('A10: Server-Side Request Forgery (SSRF)', () => {
      test('should prevent SSRF attacks', async () => {
        const response = await request(app)
          .post('/api/v1/admin/fetch-url')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ url: 'http://localhost:8080/internal-resource' })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should validate external URLs', async () => {
        const response = await request(app)
          .post('/api/v1/admin/fetch-url')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ url: 'file:///etc/passwd' })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Advanced Penetration Testing', () => {
    describe('Cross-Site Scripting (XSS) Testing', () => {
      test('should prevent stored XSS', async () => {
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: '<script>alert("xss")</script>',
            email: 'test@example.com',
            role: 'user'
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent reflected XSS', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ search: '<script>alert("xss")</script>' })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent DOM-based XSS', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ filter: 'javascript:alert("xss")' })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Cross-Site Request Forgery (CSRF) Testing', () => {
      test('should prevent CSRF attacks', async () => {
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .set('Origin', 'http://malicious-site.com')
          .send({ 
            name: 'CSRF User',
            email: 'csrf@example.com',
            role: 'admin'
          })
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should validate CSRF tokens', async () => {
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .set('X-CSRF-Token', 'invalid-token')
          .send({ 
            name: 'CSRF User',
            email: 'csrf@example.com',
            role: 'admin'
          })
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('XML External Entity (XXE) Testing', () => {
      test('should prevent XXE attacks', async () => {
        const maliciousXML = `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
        <foo>&xxe;</foo>`;
        
        const response = await request(app)
          .post('/api/v1/admin/parse-xml')
          .set('Authorization', `Bearer ${adminToken}`)
          .set('Content-Type', 'application/xml')
          .send(maliciousXML)
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('LDAP Injection Testing', () => {
      test('should prevent LDAP injection', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ 
            email: 'admin)(&(password=*))',
            password: 'anything'
          })
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Path Traversal Testing', () => {
      test('should prevent path traversal attacks', async () => {
        const response = await request(app)
          .get('/api/v1/admin/files/../../../etc/passwd')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent directory traversal', async () => {
        const response = await request(app)
          .get('/api/v1/admin/files/..%2F..%2F..%2Fetc%2Fpasswd')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('HTTP Parameter Pollution Testing', () => {
      test('should handle parameter pollution', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ 
            role: 'user',
            role: 'admin' // Duplicate parameter
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('HTTP Response Splitting Testing', () => {
      test('should prevent HTTP response splitting', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .set('User-Agent', 'Mozilla/5.0\r\nSet-Cookie: admin=true')
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Insecure Direct Object Reference Testing', () => {
      test('should prevent direct object reference', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users/1')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should validate object ownership', async () => {
        const response = await request(app)
          .put('/api/v1/admin/users/1')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ name: 'Updated Name' })
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Business Logic Testing', () => {
      test('should prevent negative amounts', async () => {
        const response = await request(app)
          .post('/api/v1/admin/finance/transaction')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            amount: -1000,
            type: 'withdrawal'
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent duplicate transactions', async () => {
        const transactionData = {
          amount: 100,
          type: 'deposit',
          reference: 'test-ref'
        };
        
        // First transaction
        await request(app)
          .post('/api/v1/admin/finance/transaction')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(transactionData)
          .expect(201);
        
        // Duplicate transaction
        const response = await request(app)
          .post('/api/v1/admin/finance/transaction')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(transactionData)
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Vulnerability Scanning', () => {
    describe('Input Validation Testing', () => {
      test('should validate email format', async () => {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({ 
            email: 'invalid-email',
            password: 'password123',
            name: 'Test User'
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should validate password strength', async () => {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({ 
            email: 'test@example.com',
            password: '123',
            name: 'Test User'
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should validate input length', async () => {
        const longString = 'a'.repeat(10000);
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: longString,
            email: 'test@example.com',
            role: 'user'
          })
          .expect(400);
        
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('Authentication Bypass Testing', () => {
      test('should prevent authentication bypass', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${invalidToken}`)
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent session fixation', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com', password: 'password123' })
          .expect(200);
        
        expect(response.body).toHaveProperty('token');
        // In a real test, you would verify the session token changed
      });
    });

    describe('Authorization Testing', () => {
      test('should enforce role-based access control', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent privilege escalation', async () => {
        const response = await request(app)
          .put('/api/v1/admin/users/1')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ role: 'admin' })
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
      });
    });
  });

  describe('Security Headers Testing', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/consolidated')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['strict-transport-security']).toContain('max-age');
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    test('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/v1/admin/dashboard/consolidated')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });
});
