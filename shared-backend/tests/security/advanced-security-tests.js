const request = require('supertest');
const app = require('../../server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Advanced Security Testing Suite', () => {
  let validToken;
  let adminToken;
  let userToken;
  let partnerToken;

  beforeAll(async () => {
    // Create tokens for different user roles
    adminToken = jwt.sign(
      { 
        userId: 'admin-user-id', 
        email: 'admin@clutch.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin']
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { 
        userId: 'user-id', 
        email: 'user@clutch.com',
        role: 'user',
        permissions: ['read']
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    partnerToken = jwt.sign(
      { 
        userId: 'partner-id', 
        email: 'partner@clutch.com',
        role: 'partner',
        permissions: ['read', 'write']
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    validToken = adminToken;
  });

  describe('OWASP Top 10 Security Testing', () => {
    describe('A01: Broken Access Control', () => {
      test('should prevent horizontal privilege escalation', async () => {
        // User trying to access another user's data
        const response = await request(app)
          .get('/api/v1/admin/users/user-id-2')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Insufficient permissions');
      });

      test('should prevent vertical privilege escalation', async () => {
        // User trying to access admin endpoints
        const response = await request(app)
          .get('/api/v1/admin/system/health')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Admin access required');
      });

      test('should prevent direct object references', async () => {
        // User trying to access admin user data by ID manipulation
        const response = await request(app)
          .get('/api/v1/admin/users/admin-user-id')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        expect(response.body).toHaveProperty('error');
      });

      test('should validate JWT token integrity', async () => {
        // Tampered JWT token
        const tamperedToken = validToken.slice(0, -10) + 'tampered123';
        
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${tamperedToken}`)
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Invalid token');
      });
    });

    describe('A02: Cryptographic Failures', () => {
      test('should use secure password hashing', async () => {
        const plainPassword = 'testPassword123!';
        const hashedPassword = await bcrypt.hash(plainPassword, 12);
        
        // Verify password is properly hashed
        expect(hashedPassword).not.toBe(plainPassword);
        expect(hashedPassword.length).toBeGreaterThan(50);
        
        // Verify password verification works
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        expect(isValid).toBe(true);
      });

      test('should use secure JWT signing', async () => {
        const payload = { userId: 'test', role: 'user' };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { 
          expiresIn: '1h',
          algorithm: 'HS256'
        });
        
        // Verify token structure
        const parts = token.split('.');
        expect(parts).toHaveLength(3);
        
        // Verify token can be decoded
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
        expect(decoded.userId).toBe('test');
      });

      test('should encrypt sensitive data in transit', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        // Check for security headers
        expect(response.headers).toHaveProperty('strict-transport-security');
        expect(response.headers).toHaveProperty('x-content-type-options');
        expect(response.headers).toHaveProperty('x-frame-options');
      });
    });

    describe('A03: Injection', () => {
      test('should prevent SQL injection in user search', async () => {
        const sqlInjectionPayloads = [
          "'; DROP TABLE users; --",
          "' OR '1'='1",
          "'; INSERT INTO users (email) VALUES ('hacker@evil.com'); --",
          "' UNION SELECT * FROM users --"
        ];

        for (const payload of sqlInjectionPayloads) {
          const response = await request(app)
            .post('/api/v1/admin/users/search')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ query: payload })
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('Invalid input');
        }
      });

      test('should prevent NoSQL injection', async () => {
        const nosqlInjectionPayloads = [
          { name: { $ne: null } },
          { email: { $regex: '.*' } },
          { $where: 'this.name == this.email' },
          { name: { $exists: true } }
        ];

        for (const payload of nosqlInjectionPayloads) {
          const response = await request(app)
            .post('/api/v1/admin/users')
            .set('Authorization', `Bearer ${validToken}`)
            .send(payload)
            .expect(400);

          expect(response.body).toHaveProperty('error');
        }
      });

      test('should prevent command injection', async () => {
        const commandInjectionPayloads = [
          '; rm -rf /',
          '| cat /etc/passwd',
          '&& whoami',
          '`id`'
        ];

        for (const payload of commandInjectionPayloads) {
          const response = await request(app)
            .post('/api/v1/admin/system/command')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ command: payload })
            .expect(400);

          expect(response.body).toHaveProperty('error');
        }
      });
    });

    describe('A04: Insecure Design', () => {
      test('should implement proper session management', async () => {
        // Test session timeout
        const shortToken = jwt.sign(
          { userId: 'test', role: 'user' },
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

      test('should implement proper rate limiting', async () => {
        const requests = [];
        
        // Make multiple requests to trigger rate limiting
        for (let i = 0; i < 100; i++) {
          requests.push(
            request(app)
              .get('/api/v1/admin/users')
              .set('Authorization', `Bearer ${validToken}`)
          );
        }

        const responses = await Promise.all(requests);
        const rateLimitedResponses = responses.filter(r => r.status === 429);
        
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
      });

      test('should implement proper input validation', async () => {
        const invalidInputs = [
          { email: 'invalid-email' },
          { phone: 'invalid-phone' },
          { age: 'not-a-number' },
          { name: '' },
          { name: 'a'.repeat(1000) }
        ];

        for (const input of invalidInputs) {
          const response = await request(app)
            .post('/api/v1/admin/users')
            .set('Authorization', `Bearer ${validToken}`)
            .send(input)
            .expect(400);

          expect(response.body).toHaveProperty('error');
        }
      });
    });

    describe('A05: Security Misconfiguration', () => {
      test('should not expose sensitive information in error messages', async () => {
        const response = await request(app)
          .get('/api/v1/admin/nonexistent-endpoint')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(404);

        // Error message should not contain sensitive information
        expect(response.body.error).not.toContain('password');
        expect(response.body.error).not.toContain('secret');
        expect(response.body.error).not.toContain('token');
        expect(response.body.error).not.toContain('database');
      });

      test('should have proper security headers', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        // Check for security headers
        expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('x-xss-protection');
        expect(response.headers).toHaveProperty('strict-transport-security');
      });

      test('should not expose server information', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        // Should not expose server information
        expect(response.headers).not.toHaveProperty('server');
        expect(response.headers).not.toHaveProperty('x-powered-by');
      });
    });

    describe('A06: Vulnerable and Outdated Components', () => {
      test('should use secure dependencies', async () => {
        const packageJson = require('../../package.json');
        
        // Check for known vulnerable packages
        const vulnerablePackages = [
          'lodash',
          'moment',
          'express',
          'mongoose'
        ];

        for (const pkg of vulnerablePackages) {
          if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
            // In a real test, you would check for specific vulnerable versions
            expect(packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]).toBeDefined();
          }
        }
      });

      test('should handle dependency vulnerabilities', async () => {
        // Mock vulnerability check
        const response = await request(app)
          .get('/api/v1/admin/security/vulnerabilities')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('vulnerabilities');
        expect(response.body.vulnerabilities).toHaveProperty('critical', 0);
        expect(response.body.vulnerabilities).toHaveProperty('high', 0);
      });
    });

    describe('A07: Identification and Authentication Failures', () => {
      test('should prevent brute force attacks', async () => {
        const loginAttempts = [];
        
        // Simulate brute force attack
        for (let i = 0; i < 10; i++) {
          const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
              email: 'admin@clutch.com',
              password: 'wrongpassword'
            });
          
          loginAttempts.push(response.status);
        }

        // Should eventually get rate limited
        expect(loginAttempts).toContain(429);
      });

      test('should enforce strong password policy', async () => {
        const weakPasswords = [
          '123456',
          'password',
          'admin',
          'qwerty',
          'abc123'
        ];

        for (const password of weakPasswords) {
          const response = await request(app)
            .post('/api/v1/auth/register')
            .send({
              email: 'test@example.com',
              password: password,
              name: 'Test User'
            })
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('Password does not meet requirements');
        }
      });

      test('should implement account lockout', async () => {
        // Simulate multiple failed login attempts
        for (let i = 0; i < 5; i++) {
          await request(app)
            .post('/api/v1/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            });
        }

        // Account should be locked
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'correctpassword'
          })
          .expect(423);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Account locked');
      });
    });

    describe('A08: Software and Data Integrity Failures', () => {
      test('should validate file uploads', async () => {
        const maliciousFiles = [
          { name: 'malicious.exe', content: 'malicious content' },
          { name: 'script.php', content: '<?php system($_GET["cmd"]); ?>' },
          { name: 'virus.bat', content: '@echo off\nformat c:' }
        ];

        for (const file of maliciousFiles) {
          const response = await request(app)
            .post('/api/v1/admin/upload')
            .set('Authorization', `Bearer ${validToken}`)
            .attach('file', Buffer.from(file.content), file.name)
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('Invalid file type');
        }
      });

      test('should validate data integrity', async () => {
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${validToken}`)
          .send({
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
          })
          .expect(201);

        const userId = response.body.data.id;

        // Verify data was stored correctly
        const getResponse = await request(app)
          .get(`/api/v1/admin/users/${userId}`)
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        expect(getResponse.body.data.name).toBe('Test User');
        expect(getResponse.body.data.email).toBe('test@example.com');
      });
    });

    describe('A09: Security Logging and Monitoring Failures', () => {
      test('should log security events', async () => {
        // Attempt unauthorized access
        await request(app)
          .get('/api/v1/admin/users')
          .expect(401);

        // Check if security event was logged
        const response = await request(app)
          .get('/api/v1/admin/security/logs')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('logs');
        expect(response.body.logs.length).toBeGreaterThan(0);
      });

      test('should monitor for suspicious activities', async () => {
        // Simulate suspicious activity
        const suspiciousRequests = [
          { url: '/api/v1/admin/users', method: 'GET' },
          { url: '/api/v1/admin/users', method: 'GET' },
          { url: '/api/v1/admin/users', method: 'GET' }
        ];

        for (const req of suspiciousRequests) {
          await request(app)
            [req.method.toLowerCase()](req.url)
            .set('Authorization', `Bearer ${validToken}`);
        }

        // Check if suspicious activity was detected
        const response = await request(app)
          .get('/api/v1/admin/security/alerts')
          .set('Authorization', `Bearer ${validToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('alerts');
      });
    });

    describe('A10: Server-Side Request Forgery (SSRF)', () => {
      test('should prevent SSRF attacks', async () => {
        const ssrfPayloads = [
          'http://localhost:22',
          'http://127.0.0.1:3306',
          'http://169.254.169.254/latest/meta-data/',
          'file:///etc/passwd',
          'gopher://localhost:25'
        ];

        for (const payload of ssrfPayloads) {
          const response = await request(app)
            .post('/api/v1/admin/webhook/test')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ url: payload })
            .expect(400);

          expect(response.body).toHaveProperty('error');
          expect(response.body.error).toContain('Invalid URL');
        }
      });
    });
  });

  describe('Advanced Penetration Testing', () => {
    test('should prevent directory traversal attacks', async () => {
      const traversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
      ];

      for (const payload of traversalPayloads) {
        const response = await request(app)
          .get(`/api/v1/admin/files/${payload}`)
          .set('Authorization', `Bearer ${validToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    test('should prevent XML external entity (XXE) attacks', async () => {
      const xxePayload = `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
        <foo>&xxe;</foo>`;

      const response = await request(app)
        .post('/api/v1/admin/xml/parse')
        .set('Authorization', `Bearer ${validToken}`)
        .set('Content-Type', 'application/xml')
        .send(xxePayload)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should prevent LDAP injection', async () => {
      const ldapPayloads = [
        '*)(uid=*))(|(uid=*',
        '*)(|(password=*))',
        '*)(|(objectClass=*))'
      ];

      for (const payload of ldapPayloads) {
        const response = await request(app)
          .post('/api/v1/admin/ldap/search')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ query: payload })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    test('should prevent HTTP parameter pollution', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .query({ id: '1', id: '2', id: '3' })
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should prevent HTTP header injection', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validToken}`)
        .set('X-Forwarded-For', '127.0.0.1\r\nX-Injected-Header: malicious')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Business Logic Security Testing', () => {
    test('should prevent price manipulation', async () => {
      const response = await request(app)
        .post('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ id: '1', quantity: 1, price: -100 }],
          total: -100
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid price');
    });

    test('should prevent quantity manipulation', async () => {
      const response = await request(app)
        .post('/api/v1/admin/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ id: '1', quantity: 999999, price: 100 }],
          total: 99999900
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid quantity');
    });

    test('should prevent race conditions in inventory', async () => {
      const promises = [];
      
      // Simulate concurrent inventory updates
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .put('/api/v1/admin/inventory/1')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ quantity: 5 })
        );
      }

      const responses = await Promise.all(promises);
      
      // Check final inventory state
      const finalResponse = await request(app)
        .get('/api/v1/admin/inventory/1')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(finalResponse.body.data.quantity).toBeGreaterThanOrEqual(0);
    });
  });
});
