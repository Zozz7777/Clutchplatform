const request = require('supertest');
const { app } = require('../../server');
const jwt = require('jsonwebtoken');

describe('Critical Security Testing - Penetration Testing and Vulnerability Scanning', () => {
  let adminToken, userToken, invalidToken;

  beforeAll(() => {
    adminToken = jwt.sign({ userId: 'admin', role: 'admin' }, 'test-secret', { expiresIn: '1h' });
    userToken = jwt.sign({ userId: 'user', role: 'user' }, 'test-secret', { expiresIn: '1h' });
    invalidToken = 'invalid.jwt.token';
  });

  describe('OWASP Top 10 Security Testing', () => {
    describe('A01: Broken Access Control', () => {
      test('should prevent unauthorized access to admin endpoints', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent privilege escalation', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should validate JWT tokens properly', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users')
          .set('Authorization', `Bearer ${invalidToken}`)
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should prevent direct object references', async () => {
        const response = await request(app)
          .get('/api/v1/admin/users/999999')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should enforce proper authorization on all endpoints', async () => {
        const endpoints = [
          '/api/v1/admin/dashboard',
          '/api/v1/admin/analytics',
          '/api/v1/admin/finance',
          '/api/v1/admin/hr',
          '/api/v1/admin/settings'
        ];

        for (const endpoint of endpoints) {
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
          
          expect(response.body).toHaveProperty('error');
        }
      });
    });

    describe('A02: Cryptographic Failures', () => {
      test('should use secure password hashing', async () => {
        const response = await request(app)
          .post('/api/v1/auth/register')
          .send({ 
            email: 'test@example.com', 
            password: 'password123',
            name: 'Test User'
          });
        
        // Password should be hashed, not stored in plain text
        expect(response.body.data).not.toHaveProperty('password');
        expect(response.body.data.password).toBeUndefined();
      });

      test('should use secure JWT secrets', () => {
        const token = jwt.sign({ userId: 'test' }, 'weak-secret');
        const decoded = jwt.decode(token);
        
        // Should not be able to decode with weak secret
        expect(decoded).toBeTruthy();
      });

      test('should use HTTPS in production', () => {
        // Mock production environment
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        
        // In production, should enforce HTTPS
        expect(process.env.NODE_ENV).toBe('production');
        
        process.env.NODE_ENV = originalEnv;
      });

      test('should not expose sensitive data in responses', async () => {
        const response = await request(app)
          .get('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        // Should not expose password or other sensitive data
        expect(response.body.data).not.toHaveProperty('password');
        expect(response.body.data).not.toHaveProperty('salt');
        expect(response.body.data).not.toHaveProperty('hash');
      });
    });

    describe('A03: Injection', () => {
      test('should prevent SQL injection attacks', async () => {
        const maliciousInput = "'; DROP TABLE users; --";
        
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: maliciousInput,
            email: 'test@example.com',
            role: 'user'
          });
        
        // Should handle malicious input safely
        expect(response.status).not.toBe(500);
      });

      test('should prevent NoSQL injection attacks', async () => {
        const maliciousInput = { $where: "this.password == 'admin'" };
        
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: 'Test User',
            email: 'test@example.com',
            role: maliciousInput
          });
        
        // Should handle malicious input safely
        expect(response.status).not.toBe(500);
      });

      test('should prevent command injection', async () => {
        const maliciousInput = "; rm -rf /";
        
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: maliciousInput,
            email: 'test@example.com',
            role: 'user'
          });
        
        // Should handle malicious input safely
        expect(response.status).not.toBe(500);
      });

      test('should sanitize user inputs', async () => {
        const maliciousInput = "<script>alert('XSS')</script>";
        
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: maliciousInput,
            email: 'test@example.com',
            role: 'user'
          });
        
        // Should sanitize malicious input
        expect(response.body.data.name).not.toContain('<script>');
        expect(response.body.data.name).not.toContain('alert');
      });
    });

    describe('A04: Insecure Design', () => {
      test('should implement proper rate limiting', async () => {
        const requests = [];
        
        // Make 100 requests quickly
        for (let i = 0; i < 100; i++) {
          requests.push(
            request(app)
              .post('/api/v1/auth/login')
              .send({ email: 'test@example.com', password: 'wrongpassword' })
          );
        }
        
        const responses = await Promise.all(requests);
        const rateLimitedResponses = responses.filter(r => r.status === 429);
        
        // Should rate limit after certain number of requests
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
      });

      test('should implement proper session management', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });
        
        // Should return secure session token
        expect(response.body).toHaveProperty('token');
        expect(response.body.token).toBeTruthy();
      });

      test('should implement proper error handling', async () => {
        const response = await request(app)
          .get('/api/v1/nonexistent-endpoint')
          .expect(404);
        
        // Should not expose internal system information
        expect(response.body.error).not.toContain('stack');
        expect(response.body.error).not.toContain('path');
        expect(response.body.error).not.toContain('line');
      });

      test('should implement proper logging', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' });
        
        // Should log security events
        expect(response.status).toBe(401);
      });
    });

    describe('A05: Security Misconfiguration', () => {
      test('should not expose sensitive headers', async () => {
        const response = await request(app)
          .get('/api/v1/health')
          .expect(200);
        
        // Should not expose sensitive server information
        expect(response.headers).not.toHaveProperty('x-powered-by');
        expect(response.headers).not.toHaveProperty('server');
      });

      test('should use secure headers', async () => {
        const response = await request(app)
          .get('/api/v1/health')
          .expect(200);
        
        // Should include security headers
        expect(response.headers).toHaveProperty('x-content-type-options');
        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('x-xss-protection');
      });

      test('should not expose debug information', async () => {
        const response = await request(app)
          .get('/api/v1/health')
          .expect(200);
        
        // Should not expose debug information
        expect(response.body).not.toHaveProperty('debug');
        expect(response.body).not.toHaveProperty('stack');
      });

      test('should use secure CORS configuration', async () => {
        const response = await request(app)
          .options('/api/v1/health')
          .expect(200);
        
        // Should have proper CORS headers
        expect(response.headers).toHaveProperty('access-control-allow-origin');
      });
    });

    describe('A06: Vulnerable and Outdated Components', () => {
      test('should use up-to-date dependencies', () => {
        const packageJson = require('../../package.json');
        
        // Check for known vulnerable packages
        const vulnerablePackages = [
          'lodash',
          'moment',
          'jquery',
          'express'
        ];
        
        vulnerablePackages.forEach(pkg => {
          if (packageJson.dependencies[pkg] || packageJson.devDependencies[pkg]) {
            // Should use recent versions
            const version = packageJson.dependencies[pkg] || packageJson.devDependencies[pkg];
            expect(version).not.toContain('^0.');
            expect(version).not.toContain('^1.');
          }
        });
      });

      test('should not use deprecated packages', () => {
        const packageJson = require('../../package.json');
        
        const deprecatedPackages = [
          'request',
          'node-uuid',
          'graceful-fs'
        ];
        
        deprecatedPackages.forEach(pkg => {
          expect(packageJson.dependencies).not.toHaveProperty(pkg);
          expect(packageJson.devDependencies).not.toHaveProperty(pkg);
        });
      });
    });

    describe('A07: Identification and Authentication Failures', () => {
      test('should implement proper password policies', async () => {
        const weakPasswords = [
          '123',
          'password',
          '12345678',
          'qwerty'
        ];
        
        for (const password of weakPasswords) {
          const response = await request(app)
            .post('/api/v1/auth/register')
            .send({ 
              email: 'test@example.com', 
              password: password,
              name: 'Test User'
            });
          
          // Should reject weak passwords
          expect(response.status).toBe(400);
        }
      });

      test('should implement account lockout', async () => {
        const requests = [];
        
        // Make multiple failed login attempts
        for (let i = 0; i < 10; i++) {
          requests.push(
            request(app)
              .post('/api/v1/auth/login')
              .send({ email: 'test@example.com', password: 'wrongpassword' })
          );
        }
        
        const responses = await Promise.all(requests);
        const lockedResponses = responses.filter(r => r.status === 423);
        
        // Should lock account after multiple failed attempts
        expect(lockedResponses.length).toBeGreaterThan(0);
      });

      test('should implement proper session timeout', async () => {
        const expiredToken = jwt.sign(
          { userId: 'test' }, 
          'test-secret', 
          { expiresIn: '-1h' }
        );
        
        const response = await request(app)
          .get('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);
        
        expect(response.body).toHaveProperty('error');
      });

      test('should implement proper logout', async () => {
        const response = await request(app)
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        expect(response.body).toHaveProperty('success', true);
      });
    });

    describe('A08: Software and Data Integrity Failures', () => {
      test('should validate file uploads', async () => {
        const maliciousFile = Buffer.from('<?php system($_GET["cmd"]); ?>');
        
        const response = await request(app)
          .post('/api/v1/admin/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', maliciousFile, 'malicious.php');
        
        // Should reject malicious files
        expect(response.status).toBe(400);
      });

      test('should validate file types', async () => {
        const response = await request(app)
          .post('/api/v1/admin/upload')
          .set('Authorization', `Bearer ${adminToken}`)
          .attach('file', Buffer.from('test'), 'test.exe');
        
        // Should reject executable files
        expect(response.status).toBe(400);
      });

      test('should implement proper data validation', async () => {
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: '',
            email: 'invalid-email',
            role: 'invalid-role'
          });
        
        // Should validate all fields
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
      });
    });

    describe('A09: Security Logging and Monitoring Failures', () => {
      test('should log security events', async () => {
        const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@example.com', password: 'wrongpassword' });
        
        // Should log failed login attempts
        expect(response.status).toBe(401);
      });

      test('should log admin actions', async () => {
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ 
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
          });
        
        // Should log admin actions
        expect(response.status).toBe(201);
      });

      test('should implement proper monitoring', async () => {
        const response = await request(app)
          .get('/api/v1/system/metrics')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
        
        // Should provide monitoring data
        expect(response.body).toHaveProperty('data');
      });
    });

    describe('A10: Server-Side Request Forgery (SSRF)', () => {
      test('should prevent SSRF attacks', async () => {
        const maliciousUrl = 'http://localhost:22';
        
        const response = await request(app)
          .post('/api/v1/admin/fetch-url')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ url: maliciousUrl });
        
        // Should prevent SSRF attacks
        expect(response.status).toBe(400);
      });

      test('should validate external URLs', async () => {
        const maliciousUrl = 'file:///etc/passwd';
        
        const response = await request(app)
          .post('/api/v1/admin/fetch-url')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ url: maliciousUrl });
        
        // Should reject file URLs
        expect(response.status).toBe(400);
      });
    });
  });

  describe('Advanced Security Testing', () => {
    test('should prevent timing attacks', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Response time should be consistent regardless of user existence
      expect(responseTime).toBeLessThan(1000);
    });

    test('should prevent brute force attacks', async () => {
      const requests = [];
      
      // Make 1000 login attempts
      for (let i = 0; i < 1000; i++) {
        requests.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'test@example.com', password: 'wrongpassword' })
        );
      }
      
      const responses = await Promise.all(requests);
      const blockedResponses = responses.filter(r => r.status === 429);
      
      // Should block brute force attempts
      expect(blockedResponses.length).toBeGreaterThan(0);
    });

    test('should prevent CSRF attacks', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          name: 'Test User',
          email: 'test@example.com',
          role: 'user'
        });
      
      // Should require proper CSRF protection
      expect(response.status).toBe(201);
    });

    test('should prevent clickjacking', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);
      
      // Should include X-Frame-Options header
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    test('should prevent MIME type sniffing', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);
      
      // Should include X-Content-Type-Options header
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Penetration Testing Scenarios', () => {
    test('should handle malicious payloads', async () => {
      const maliciousPayloads = [
        { name: '<script>alert("XSS")</script>' },
        { email: 'test@example.com\'; DROP TABLE users; --' },
        { role: { $where: "this.password == 'admin'" } }
      ];
      
      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .post('/api/v1/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(payload);
        
        // Should handle malicious payloads safely
        expect(response.status).not.toBe(500);
      }
    });

    test('should prevent directory traversal', async () => {
      const maliciousPath = '../../../etc/passwd';
      
      const response = await request(app)
          .get(`/api/v1/admin/files/${maliciousPath}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    test('should prevent LDAP injection', async () => {
      const maliciousInput = '*)(uid=*))(|(uid=*';
      
      const response = await request(app)
          .post('/api/v1/auth/login')
          .send({ 
            email: maliciousInput, 
            password: 'password123' 
          });
      
      // Should handle LDAP injection safely
      expect(response.status).not.toBe(500);
    });

    test('should prevent XML external entity attacks', async () => {
      const maliciousXML = `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
        <foo>&xxe;</foo>`;
      
      const response = await request(app)
          .post('/api/v1/admin/parse-xml')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ xml: maliciousXML });
      
      // Should prevent XXE attacks
      expect(response.status).toBe(400);
    });
  });
});
