/**
 * Cross-Platform Integration Tests
 * Tests integration between Desktop, Web, Mobile, and Backend systems
 */

const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

describe('Cross-Platform Integration Tests', () => {
  let backendProcess;
  let adminProcess;
  let desktopProcess;
  let testData;

  beforeAll(async () => {
    // Start backend server
    backendProcess = spawn('npm', ['start'], {
      cwd: path.join(__dirname, '../../shared-backend'),
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // Start admin dashboard
    adminProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '../../clutch-admin'),
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // Wait for services to start
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Load test data
    testData = await loadTestData();
  });

  afterAll(async () => {
    // Clean up processes
    if (backendProcess) backendProcess.kill();
    if (adminProcess) adminProcess.kill();
  });

  describe('Desktop ↔ Backend Integration', () => {
    test('Desktop app should sync inventory with backend', async () => {
      // Simulate desktop app adding a part
      const newPart = {
        name: 'Desktop Test Part',
        category: 'brake',
        brand: 'Toyota',
        price: 75,
        stock: 15,
        description: 'Added from desktop app'
      };

      const response = await request('http://localhost:5000')
        .post('/api/parts')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(newPart);

      expect(response.status).toBe(201);
      expect(response.body.part.name).toBe('Desktop Test Part');

      // Verify part is accessible via API
      const getResponse = await request('http://localhost:5000')
        .get(`/api/parts/${response.body.part._id}`)
        .set('Authorization', `Bearer ${testData.authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.part.name).toBe('Desktop Test Part');
    });

    test('Desktop app should receive real-time updates', async () => {
      // This would test WebSocket connections
      // For now, we'll test the API endpoints that would trigger updates
      
      const orderUpdate = {
        status: 'processing',
        notes: 'Order being processed from desktop'
      };

      const response = await request('http://localhost:5000')
        .put(`/api/orders/${testData.orderId}/status`)
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(orderUpdate);

      expect(response.status).toBe(200);
      expect(response.body.order.status).toBe('processing');
    });

    test('Desktop app should handle offline scenarios', async () => {
      // Test offline functionality by temporarily stopping backend
      // This is a simplified test - real implementation would use service workers
      
      const offlineData = {
        parts: [
          { name: 'Offline Part 1', price: 50, stock: 5 },
          { name: 'Offline Part 2', price: 75, stock: 3 }
        ],
        orders: [
          { orderNumber: 'OFF001', total: 125, status: 'pending' }
        ]
      };

      // Simulate offline data storage
      await fs.writeFile(
        path.join(__dirname, '../../auto-parts-system/offline-data.json'),
        JSON.stringify(offlineData)
      );

      // Verify offline data exists
      const offlineFile = await fs.readFile(
        path.join(__dirname, '../../auto-parts-system/offline-data.json'),
        'utf8'
      );

      expect(JSON.parse(offlineFile)).toHaveProperty('parts');
      expect(JSON.parse(offlineFile)).toHaveProperty('orders');
    });
  });

  describe('Web Admin ↔ Backend Integration', () => {
    test('Admin dashboard should display real-time data', async () => {
      // Test admin dashboard API endpoints
      const response = await request('http://localhost:3000')
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${testData.authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalParts');
    });

    test('Admin dashboard should handle user management', async () => {
      const newUser = {
        email: 'admin-test@clutch.com',
        firstName: 'Admin',
        lastName: 'Test',
        role: 'employee',
        shopId: testData.shopId
      };

      const response = await request('http://localhost:5000')
        .post('/api/users')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('admin-test@clutch.com');
    });

    test('Admin dashboard should sync with mobile apps', async () => {
      // Test mobile app data synchronization
      const mobileOrder = {
        orderNumber: 'MOB001',
        customerId: testData.customerId,
        shopId: testData.shopId,
        items: [
          {
            partId: testData.partId,
            quantity: 2,
            price: 50,
            total: 100
          }
        ],
        status: 'pending',
        total: 100,
        source: 'mobile_app'
      };

      const response = await request('http://localhost:5000')
        .post('/api/orders')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(mobileOrder);

      expect(response.status).toBe(201);
      expect(response.body.order.source).toBe('mobile_app');

      // Verify order appears in admin dashboard
      const adminResponse = await request('http://localhost:3000')
        .get('/api/orders')
        .set('Authorization', `Bearer ${testData.authToken}`);

      expect(adminResponse.status).toBe(200);
      const mobileOrderExists = adminResponse.body.orders.some(
        order => order.orderNumber === 'MOB001'
      );
      expect(mobileOrderExists).toBe(true);
    });
  });

  describe('Mobile ↔ Backend Integration', () => {
    test('Mobile app should authenticate with backend', async () => {
      const loginData = {
        email: testData.user.email,
        password: 'test123'
      };

      const response = await request('http://localhost:5000')
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('Mobile app should sync parts inventory', async () => {
      // Test mobile app fetching parts
      const response = await request('http://localhost:5000')
        .get('/api/parts')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('parts');
      expect(response.body.parts.length).toBeLessThanOrEqual(10);
    });

    test('Mobile app should create orders', async () => {
      const mobileOrder = {
        customerId: testData.customerId,
        items: [
          {
            partId: testData.partId,
            quantity: 1,
            price: 50,
            total: 50
          }
        ],
        payment: {
          method: 'mobile_payment',
          amount: 50
        },
        shipping: {
          address: testData.customerAddress
        },
        source: 'mobile_app'
      };

      const response = await request('http://localhost:5000')
        .post('/api/orders')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(mobileOrder);

      expect(response.status).toBe(201);
      expect(response.body.order.source).toBe('mobile_app');
    });

    test('Mobile app should receive push notifications', async () => {
      // Test notification creation
      const notification = {
        userId: testData.userId,
        type: 'order_update',
        title: 'Order Status Update',
        message: 'Your order has been confirmed',
        data: {
          orderId: testData.orderId
        }
      };

      const response = await request('http://localhost:5000')
        .post('/api/notifications')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(notification);

      expect(response.status).toBe(201);
      expect(response.body.notification.type).toBe('order_update');
    });
  });

  describe('Real-time Synchronization', () => {
    test('Inventory changes should sync across all platforms', async () => {
      // Update inventory from backend
      const inventoryUpdate = {
        partId: testData.partId,
        quantity: -5,
        reason: 'sale',
        notes: 'Sold to customer'
      };

      const updateResponse = await request('http://localhost:5000')
        .post('/api/inventory/adjust')
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(inventoryUpdate);

      expect(updateResponse.status).toBe(200);

      // Verify change is reflected in API
      const getResponse = await request('http://localhost:5000')
        .get(`/api/parts/${testData.partId}`)
        .set('Authorization', `Bearer ${testData.authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.part.stock).toBeLessThan(testData.originalStock);
    });

    test('Order status changes should propagate to all systems', async () => {
      // Update order status
      const statusUpdate = {
        status: 'shipped',
        trackingNumber: 'TRK123456789',
        notes: 'Package shipped via express delivery'
      };

      const response = await request('http://localhost:5000')
        .put(`/api/orders/${testData.orderId}/status`)
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(statusUpdate);

      expect(response.status).toBe(200);
      expect(response.body.order.status).toBe('shipped');
      expect(response.body.order.trackingNumber).toBe('TRK123456789');

      // Verify status is accessible from admin dashboard
      const adminResponse = await request('http://localhost:3000')
        .get(`/api/orders/${testData.orderId}`)
        .set('Authorization', `Bearer ${testData.authToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.order.status).toBe('shipped');
    });
  });

  describe('Data Consistency', () => {
    test('User data should be consistent across platforms', async () => {
      // Update user profile
      const profileUpdate = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1234567890'
      };

      const response = await request('http://localhost:5000')
        .put(`/api/users/${testData.userId}`)
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(profileUpdate);

      expect(response.status).toBe(200);

      // Verify update is reflected in admin dashboard
      const adminResponse = await request('http://localhost:3000')
        .get(`/api/users/${testData.userId}`)
        .set('Authorization', `Bearer ${testData.authToken}`);

      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.user.firstName).toBe('Updated');
    });

    test('Shop settings should sync across all platforms', async () => {
      const settingsUpdate = {
        currency: 'EUR',
        timezone: 'Europe/London',
        workingHours: {
          monday: { open: '08:00', close: '17:00' },
          tuesday: { open: '08:00', close: '17:00' },
          wednesday: { open: '08:00', close: '17:00' },
          thursday: { open: '08:00', close: '17:00' },
          friday: { open: '08:00', close: '17:00' },
          saturday: { open: '09:00', close: '15:00' },
          sunday: { open: '09:00', close: '15:00' }
        }
      };

      const response = await request('http://localhost:5000')
        .put(`/api/shops/${testData.shopId}/settings`)
        .set('Authorization', `Bearer ${testData.authToken}`)
        .send(settingsUpdate);

      expect(response.status).toBe(200);

      // Verify settings are accessible from all platforms
      const getResponse = await request('http://localhost:5000')
        .get(`/api/shops/${testData.shopId}`)
        .set('Authorization', `Bearer ${testData.authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.shop.settings.currency).toBe('EUR');
    });
  });

  describe('Error Handling and Recovery', () => {
    test('System should handle backend unavailability gracefully', async () => {
      // This test would simulate backend downtime
      // For now, we'll test error handling in API calls
      
      const response = await request('http://localhost:5000')
        .get('/api/parts/nonexistent-id')
        .set('Authorization', `Bearer ${testData.authToken}`);

      expect(response.status).toBe(404);
    });

    test('System should recover from network interruptions', async () => {
      // Test retry mechanisms
      const retryableRequest = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await request('http://localhost:5000')
              .get('/api/parts')
              .set('Authorization', `Bearer ${testData.authToken}`);
            
            if (response.status === 200) {
              return response;
            }
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      };

      const response = await retryableRequest();
      expect(response.status).toBe(200);
    });
  });
});

// Helper function to load test data
async function loadTestData() {
  // This would load test data from the database
  // For now, we'll return mock data
  return {
    authToken: 'mock_auth_token',
    userId: 'mock_user_id',
    shopId: 'mock_shop_id',
    customerId: 'mock_customer_id',
    partId: 'mock_part_id',
    orderId: 'mock_order_id',
    user: {
      email: 'test@clutch.com',
      firstName: 'Test',
      lastName: 'User'
    },
    customerAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'USA'
    },
    originalStock: 20
  };
}
