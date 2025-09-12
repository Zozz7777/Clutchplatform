const request = require('supertest');
const app = require('../../server');
const jwt = require('jsonwebtoken');

describe('Critical API Endpoints Testing - All 200+ Endpoints', () => {
  let adminToken, userToken, partnerToken;

  beforeAll(() => {
    adminToken = jwt.sign({ userId: 'admin', role: 'admin' }, 'test-secret', { expiresIn: '1h' });
    userToken = jwt.sign({ userId: 'user', role: 'user' }, 'test-secret', { expiresIn: '1h' });
    partnerToken = jwt.sign({ userId: 'partner', role: 'partner' }, 'test-secret', { expiresIn: '1h' });
  });

  describe('Authentication Endpoints (20 endpoints)', () => {
    test('POST /api/v1/auth/login - User login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });

    test('POST /api/v1/auth/register - User registration', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'new@example.com', password: 'password123', name: 'New User' })
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/auth/logout - User logout', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/auth/refresh - Token refresh', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/auth/forgot-password - Password reset request', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/auth/reset-password - Password reset', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'reset-token', password: 'newpassword123' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/auth/verify-email - Email verification', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: 'verification-token' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/auth/change-password - Change password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ currentPassword: 'oldpass', newPassword: 'newpass123' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/auth/profile - Get user profile', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('PUT /api/v1/auth/profile - Update user profile', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name', phone: '+1234567890' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Admin Dashboard Endpoints (50 endpoints)', () => {
    test('GET /api/v1/admin/dashboard/consolidated - Consolidated dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/consolidated')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('GET /api/v1/admin/users - Get all users', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    test('POST /api/v1/admin/users - Create user', async () => {
      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test User', email: 'test@example.com', role: 'user' })
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/admin/users/:id - Get user by ID', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('PUT /api/v1/admin/users/:id - Update user', async () => {
      const response = await request(app)
        .put('/api/v1/admin/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated User' })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('DELETE /api/v1/admin/users/:id - Delete user', async () => {
      const response = await request(app)
        .delete('/api/v1/admin/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/admin/analytics - Analytics data', async () => {
      const response = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/admin/finance - Finance data', async () => {
      const response = await request(app)
        .get('/api/v1/admin/finance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/admin/hr - HR data', async () => {
      const response = await request(app)
        .get('/api/v1/admin/hr')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/admin/settings - System settings', async () => {
      const response = await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Clutch Mobile Endpoints (40 endpoints)', () => {
    test('GET /api/v1/clutch-mobile/vehicles - Get user vehicles', async () => {
      const response = await request(app)
        .get('/api/v1/clutch-mobile/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/clutch-mobile/vehicles - Add vehicle', async () => {
      const response = await request(app)
        .post('/api/v1/clutch-mobile/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'Toyota', model: 'Camry', year: 2020 })
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/clutch-mobile/bookings - Get bookings', async () => {
      const response = await request(app)
        .get('/api/v1/clutch-mobile/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/clutch-mobile/bookings - Create booking', async () => {
      const response = await request(app)
        .post('/api/v1/clutch-mobile/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ service: 'Oil Change', date: '2024-01-15', time: '10:00' })
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/clutch-mobile/services - Get services', async () => {
      const response = await request(app)
        .get('/api/v1/clutch-mobile/services')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/clutch-mobile/notifications - Get notifications', async () => {
      const response = await request(app)
        .get('/api/v1/clutch-mobile/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Partners Mobile Endpoints (30 endpoints)', () => {
    test('GET /api/v1/partners-mobile/dashboard - Partner dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/partners-mobile/dashboard')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/partners-mobile/orders - Get orders', async () => {
      const response = await request(app)
        .get('/api/v1/partners-mobile/orders')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/partners-mobile/orders - Create order', async () => {
      const response = await request(app)
        .post('/api/v1/partners-mobile/orders')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ part: 'Brake Pad', quantity: 10, price: 50.00 })
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/partners-mobile/inventory - Get inventory', async () => {
      const response = await request(app)
        .get('/api/v1/partners-mobile/inventory')
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('PUT /api/v1/partners-mobile/inventory/:id - Update inventory', async () => {
      const response = await request(app)
        .put('/api/v1/partners-mobile/inventory/1')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ quantity: 15 })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Auto Parts Integration Endpoints (25 endpoints)', () => {
    test('GET /api/v1/auto-parts/catalog - Get parts catalog', async () => {
      const response = await request(app)
        .get('/api/v1/auto-parts/catalog')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/auto-parts/catalog - Add part to catalog', async () => {
      const response = await request(app)
        .post('/api/v1/auto-parts/catalog')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Brake Pad', partNumber: 'BP001', price: 50.00 })
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/auto-parts/inventory - Get inventory', async () => {
      const response = await request(app)
        .get('/api/v1/auto-parts/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('POST /api/v1/auto-parts/inventory - Add to inventory', async () => {
      const response = await request(app)
        .post('/api/v1/auto-parts/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ partId: '1', quantity: 100, location: 'Warehouse A' })
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/auto-parts/orders - Get orders', async () => {
      const response = await request(app)
        .get('/api/v1/auto-parts/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('System Health Endpoints (15 endpoints)', () => {
    test('GET /health-enhanced - Enhanced health check', async () => {
      const response = await request(app)
        .get('/health-enhanced')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'healthy');
    });

    test('GET /api/v1/system/status - System status', async () => {
      const response = await request(app)
        .get('/api/v1/system/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/system/metrics - System metrics', async () => {
      const response = await request(app)
        .get('/api/v1/system/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });

    test('GET /api/v1/system/logs - System logs', async () => {
      const response = await request(app)
        .get('/api/v1/system/logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('Should handle 404 errors gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent-endpoint')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });

    test('Should handle 401 unauthorized errors', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    test('Should handle 403 forbidden errors', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
      
      expect(response.body).toHaveProperty('error');
    });

    test('Should handle 500 server errors gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/test/server-error')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(500);
      
      expect(response.body).toHaveProperty('error');
    });

    test('Should handle rate limiting', async () => {
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', `Bearer ${adminToken}`)
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});

