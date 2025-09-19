const request = require('supertest');
const { app } = require('../server');
const { connectToDatabase } = require('../config/database');

describe('🚀 Comprehensive Backend Testing Pipeline', () => {
  let server;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    try {
      await connectToDatabase();
      console.log('✅ Database connected for testing');
    } catch (error) {
      console.log('⚠️ Database connection failed, using mock data');
    }

    // Use the Express app directly for testing
    server = app;
  }, 30000);

  afterAll(async () => {
    // Cleanup - no need to close app in tests
    console.log('✅ Test cleanup completed');
  });

  describe('🔧 System Health & Infrastructure', () => {
    test('Health endpoint should be accessible', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'healthy');
    });

    test('Ping endpoint should respond', async () => {
      const response = await request(server)
        .get('/ping')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('message', 'pong');
    });

    test('API version endpoint should work', async () => {
      const response = await request(server)
        .get('/api/v1/system/version')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('version');
    });
  });

  describe('🔐 Authentication & Security', () => {
    test('Auth endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/auth/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Protected routes should require authentication', async () => {
      const response = await request(server)
        .get('/api/v1/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('Security headers should be present', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('📊 Core API Endpoints', () => {
    test('Users endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/users/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Vehicles endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/vehicles/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Bookings endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/bookings/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Payments endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/payments/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Inventory endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/inventory/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('🤖 AI & Advanced Features', () => {
    test('AI endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/ai/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Auto Parts AI endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/auto-parts-ai/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Service Centers Advanced endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/service-centers-advanced/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Enterprise Features endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/enterprise-features/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Security Compliance endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/security-compliance/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('🏢 Enterprise & Business Features', () => {
    test('Analytics endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/analytics/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Reports endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/reports/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Dashboard endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/dashboard/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('CRM endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/crm/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('📱 Mobile & Communication', () => {
    test('Mobile endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/mobile/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Notifications endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/notifications/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Chat endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/chat/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('🔧 System & Maintenance', () => {
    test('System endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/system/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Settings endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/settings/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('Monitoring endpoints should be accessible', async () => {
      const response = await request(server)
        .get('/api/v1/monitoring/routes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('🚨 Error Handling', () => {
    test('404 handler should work for non-existent endpoints', async () => {
      const response = await request(server)
        .get('/api/v1/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'ENDPOINT_NOT_FOUND');
    });

    test('Invalid JSON should be handled gracefully', async () => {
      const response = await request(server)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('⚡ Performance & Load', () => {
    test('Health endpoint should respond quickly', async () => {
      const start = Date.now();
      await request(server)
        .get('/health')
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    test('Multiple concurrent requests should be handled', async () => {
      const promises = Array(10).fill().map(() => 
        request(server).get('/health')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('🔍 Data Validation', () => {
    test('Request validation should work', async () => {
      const response = await request(server)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('Response format should be consistent', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });
  });

  describe('🌐 CORS & Headers', () => {
    test('CORS headers should be present', async () => {
      const response = await request(server)
        .options('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('Security headers should be present', async () => {
      const response = await request(server)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });
});
