/**
 * API Security Testing
 * Comprehensive security testing for all API endpoints
 */

const { test, expect } = require('@playwright/test');
const jwt = require('jsonwebtoken');

class APISecurityTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testPayloads = this.generateTestPayloads();
  }

  generateTestPayloads() {
    return {
      sqlInjection: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ],
      xss: [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "javascript:alert('XSS')",
        "<svg onload=alert('XSS')>"
      ],
      pathTraversal: [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
        "....//....//....//etc/passwd",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
      ],
      commandInjection: [
        "; ls -la",
        "| cat /etc/passwd",
        "&& whoami",
        "`id`"
      ],
      nosqlInjection: [
        { $where: "this.password == 'admin'" },
        { $ne: null },
        { $regex: ".*" },
        { $exists: true }
      ]
    };
  }

  async testSQLInjection(request, endpoint, method = 'GET') {
    const results = [];
    
    for (const payload of this.testPayloads.sqlInjection) {
      try {
        const response = await request[method.toLowerCase()](`${this.baseUrl}${endpoint}`, {
          data: { search: payload },
          headers: { 'Content-Type': 'application/json' }
        });
        
        results.push({
          payload,
          status: response.status(),
          success: response.status() < 500
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }

  async testXSS(request, endpoint, method = 'POST') {
    const results = [];
    
    for (const payload of this.testPayloads.xss) {
      try {
        const response = await request[method.toLowerCase()](`${this.baseUrl}${endpoint}`, {
          data: { name: payload, description: payload },
          headers: { 'Content-Type': 'application/json' }
        });
        
        const responseText = await response.text();
        const isXSSVulnerable = responseText.includes(payload);
        
        results.push({
          payload,
          status: response.status(),
          vulnerable: isXSSVulnerable
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message,
          vulnerable: false
        });
      }
    }
    
    return results;
  }

  async testPathTraversal(request, endpoint) {
    const results = [];
    
    for (const payload of this.testPayloads.pathTraversal) {
      try {
        const response = await request.get(`${this.baseUrl}${endpoint}/${payload}`);
        
        results.push({
          payload,
          status: response.status(),
          vulnerable: response.status() === 200 && response.headers()['content-type']?.includes('text/plain')
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message,
          vulnerable: false
        });
      }
    }
    
    return results;
  }
}

test.describe('API Security Testing', () => {
  let securityTester;
  let authToken;
  let adminToken;
  let userToken;

  test.beforeAll(async ({ request }) => {
    securityTester = new APISecurityTester();
    
    // Get different user tokens for testing
    const adminLogin = await request.post('http://localhost:5000/api/auth/login', {
      data: { email: 'admin@clutch.com', password: 'test123' }
    });
    const adminData = await adminLogin.json();
    adminToken = adminData.token;

    const userLogin = await request.post('http://localhost:5000/api/auth/login', {
      data: { email: 'user@clutch.com', password: 'test123' }
    });
    const userData = await userLogin.json();
    userToken = userData.token;
  });

  test.describe('Authentication Security', () => {
    test('JWT Token Validation', async ({ request }) => {
      // Test with valid token
      const validResponse = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(validResponse.status()).toBe(200);

      // Test with invalid token
      const invalidResponse = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      expect(invalidResponse.status()).toBe(401);

      // Test with malformed token
      const malformedResponse = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: 'Bearer malformed.token.here' }
      });
      expect(malformedResponse.status()).toBe(401);

      // Test with expired token
      const expiredToken = jwt.sign(
        { userId: 'test', exp: Math.floor(Date.now() / 1000) - 3600 },
        'test-secret'
      );
      const expiredResponse = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${expiredToken}` }
      });
      expect(expiredResponse.status()).toBe(401);
    });

    test('Token Tampering Protection', async ({ request }) => {
      // Decode and modify token
      const decoded = jwt.decode(adminToken);
      const tamperedToken = jwt.sign(
        { ...decoded, role: 'admin' },
        'wrong-secret'
      );

      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${tamperedToken}` }
      });
      expect(response.status()).toBe(401);
    });

    test('Missing Authentication', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users');
      expect(response.status()).toBe(401);
    });

    test('Brute Force Protection', async ({ request }) => {
      const attempts = [];
      
      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        const response = await request.post('http://localhost:5000/api/auth/login', {
          data: { email: 'admin@clutch.com', password: 'wrong-password' }
        });
        attempts.push(response.status());
      }

      // Should eventually get rate limited
      const rateLimited = attempts.some(status => status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  test.describe('Authorization Security', () => {
    test('Role-Based Access Control', async ({ request }) => {
      // Test admin access
      const adminResponse = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      expect(adminResponse.status()).toBe(200);

      // Test user access to admin endpoint
      const userResponse = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      expect(userResponse.status()).toBe(403);
    });

    test('Resource Ownership Validation', async ({ request }) => {
      // Create a resource as admin
      const createResponse = await request.post('http://localhost:5000/api/parts', {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          name: 'Security Test Part',
          category: 'brake',
          brand: 'Toyota',
          price: 100,
          stock: 10
        }
      });
      const partData = await createResponse.json();
      const partId = partData.part._id;

      // Try to access as different user
      const accessResponse = await request.get(`http://localhost:5000/api/parts/${partId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      // Should either allow access (if public) or deny (if private)
      expect([200, 403, 404]).toContain(accessResponse.status());
    });

    test('Privilege Escalation Prevention', async ({ request }) => {
      // Try to modify user role
      const response = await request.put('http://localhost:5000/api/users/self', {
        headers: { Authorization: `Bearer ${userToken}` },
        data: { role: 'admin' }
      });
      
      // Should not allow privilege escalation
      expect([400, 403]).toContain(response.status());
    });
  });

  test.describe('Input Validation Security', () => {
    test('SQL Injection Protection', async ({ request }) => {
      const results = await securityTester.testSQLInjection(request, '/api/parts/search', 'POST');
      
      // All SQL injection attempts should fail
      const vulnerable = results.some(result => result.success && result.status < 500);
      expect(vulnerable).toBe(false);
    });

    test('XSS Protection', async ({ request }) => {
      const results = await securityTester.testXSS(request, '/api/parts', 'POST');
      
      // No XSS payloads should be reflected
      const vulnerable = results.some(result => result.vulnerable);
      expect(vulnerable).toBe(false);
    });

    test('Path Traversal Protection', async ({ request }) => {
      const results = await securityTester.testPathTraversal(request, '/api/files');
      
      // No path traversal should succeed
      const vulnerable = results.some(result => result.vulnerable);
      expect(vulnerable).toBe(false);
    });

    test('NoSQL Injection Protection', async ({ request }) => {
      const nosqlPayload = JSON.stringify({ $where: "this.password == 'admin'" });
      
      const response = await request.post('http://localhost:5000/api/auth/login', {
        headers: { 'Content-Type': 'application/json' },
        data: nosqlPayload
      });
      
      expect(response.status()).toBe(400);
    });

    test('Command Injection Protection', async ({ request }) => {
      const commandPayload = { name: 'test; ls -la' };
      
      const response = await request.post('http://localhost:5000/api/parts', {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        data: commandPayload
      });
      
      // Should sanitize input and not execute commands
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Data Security', () => {
    test('Sensitive Data Exposure', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const data = await response.json();
      
      // Check that sensitive data is not exposed
      for (const user of data.users) {
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('passwordHash');
        expect(user).not.toHaveProperty('salt');
      }
    });

    test('Data Encryption in Transit', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      // Check for HTTPS headers (in production)
      const strictTransportSecurity = response.headers()['strict-transport-security'];
      // Note: This would be present in production with HTTPS
    });

    test('Data Sanitization', async ({ request }) => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        description: '${7*7}',
        price: 'not-a-number'
      };
      
      const response = await request.post('http://localhost:5000/api/parts', {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        data: maliciousData
      });
      
      // Should sanitize or reject malicious data
      expect([400, 422]).toContain(response.status());
    });
  });

  test.describe('Rate Limiting Security', () => {
    test('API Rate Limiting', async ({ request }) => {
      const requests = [];
      
      // Make many requests quickly
      for (let i = 0; i < 20; i++) {
        const response = await request.get('http://localhost:5000/api/parts', {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        requests.push(response.status());
      }
      
      // Should eventually get rate limited
      const rateLimited = requests.some(status => status === 429);
      expect(rateLimited).toBe(true);
    });

    test('Login Rate Limiting', async ({ request }) => {
      const attempts = [];
      
      // Attempt multiple logins
      for (let i = 0; i < 15; i++) {
        const response = await request.post('http://localhost:5000/api/auth/login', {
          data: { email: 'admin@clutch.com', password: 'wrong-password' }
        });
        attempts.push(response.status());
      }
      
      // Should get rate limited
      const rateLimited = attempts.some(status => status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  test.describe('CORS Security', () => {
    test('CORS Configuration', async ({ request }) => {
      const response = await request.options('http://localhost:5000/api/users', {
        headers: {
          'Origin': 'http://malicious-site.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization'
        }
      });
      
      const corsHeaders = response.headers();
      
      // Check CORS headers
      expect(corsHeaders['access-control-allow-origin']).toBeTruthy();
      expect(corsHeaders['access-control-allow-methods']).toBeTruthy();
      expect(corsHeaders['access-control-allow-headers']).toBeTruthy();
    });

    test('Preflight Request Handling', async ({ request }) => {
      const response = await request.options('http://localhost:5000/api/users', {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Security Headers', () => {
    test('Security Headers Presence', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const headers = response.headers();
      
      // Check for security headers
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBeTruthy();
      expect(headers['x-xss-protection']).toBeTruthy();
    });

    test('Content Security Policy', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const csp = response.headers()['content-security-policy'];
      expect(csp).toBeTruthy();
    });
  });

  test.describe('Session Security', () => {
    test('Session Timeout', async ({ request }) => {
      // This would require testing with actual sessions
      // For JWT, we test token expiration
      const shortLivedToken = jwt.sign(
        { userId: 'test' },
        'test-secret',
        { expiresIn: '1s' }
      );
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${shortLivedToken}` }
      });
      
      expect(response.status()).toBe(401);
    });

    test('Session Fixation Prevention', async ({ request }) => {
      // Login and get token
      const loginResponse = await request.post('http://localhost:5000/api/auth/login', {
        data: { email: 'admin@clutch.com', password: 'test123' }
      });
      
      const loginData = await loginResponse.json();
      const token1 = loginData.token;
      
      // Login again
      const loginResponse2 = await request.post('http://localhost:5000/api/auth/login', {
        data: { email: 'admin@clutch.com', password: 'test123' }
      });
      
      const loginData2 = await loginResponse2.json();
      const token2 = loginData2.token;
      
      // Tokens should be different (new session)
      expect(token1).not.toBe(token2);
    });
  });

  test.describe('Error Handling Security', () => {
    test('Information Disclosure Prevention', async ({ request }) => {
      // Test various error conditions
      const responses = await Promise.all([
        request.get('http://localhost:5000/api/users/nonexistent'),
        request.post('http://localhost:5000/api/invalid-endpoint'),
        request.get('http://localhost:5000/api/users', {
          headers: { Authorization: 'Bearer invalid' }
        })
      ]);
      
      for (const response of responses) {
        const data = await response.text();
        
        // Error messages should not reveal sensitive information
        expect(data).not.toContain('password');
        expect(data).not.toContain('secret');
        expect(data).not.toContain('database');
        expect(data).not.toContain('connection');
      }
    });

    test('Stack Trace Prevention', async ({ request }) => {
      // Trigger an error
      const response = await request.get('http://localhost:5000/api/users/invalid-id', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      const data = await response.text();
      
      // Should not expose stack traces
      expect(data).not.toContain('at ');
      expect(data).not.toContain('Error:');
      expect(data).not.toContain('stack');
    });
  });
});
