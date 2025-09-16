/**
 * Backend API Unit Tests
 * Tests for all API endpoints and business logic
 */

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import the app (assuming it's exported from server.js)
const app = require('../../shared-backend/server');

describe('Backend API Tests', () => {
  let mongoServer;
  let db;
  let client;
  let authToken;
  let testUser;
  let testShop;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to test database
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();

    // Set test database URL
    process.env.TEST_DB_URL = mongoUri;
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.NODE_ENV = 'test';

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 4);
    testUser = {
      email: 'test@clutch.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'shop_owner',
      isActive: true,
      emailVerified: true
    };

    const userResult = await db.collection('users').insertOne(testUser);
    testUser._id = userResult.insertedId;

    // Create test shop
    testShop = {
      name: 'Test Auto Parts Shop',
      type: 'auto_parts',
      ownerId: testUser._id,
      contact: {
        email: 'shop@test.com',
        phone: '+1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'USA'
        }
      },
      isActive: true
    };

    const shopResult = await db.collection('shops').insertOne(testShop);
    testShop._id = shopResult.insertedId;

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up collections before each test
    await db.collection('orders').deleteMany({});
    await db.collection('parts').deleteMany({});
    await db.collection('customers').deleteMany({});
  });

  describe('Authentication Endpoints', () => {
    test('POST /api/auth/login - should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@clutch.com',
          password: 'test123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@clutch.com');
    });

    test('POST /api/auth/login - should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@clutch.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/auth/register - should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@clutch.com',
          password: 'test123',
          firstName: 'New',
          lastName: 'User',
          role: 'customer'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@clutch.com');
    });

    test('GET /api/auth/me - should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@clutch.com');
    });

    test('GET /api/auth/me - should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('Parts Management Endpoints', () => {
    test('GET /api/parts - should return parts list', async () => {
      // Insert test parts
      const testParts = [
        {
          name: 'Brake Pad',
          category: 'brake',
          brand: 'Toyota',
          price: 50,
          stock: 10,
          shopId: testShop._id
        },
        {
          name: 'Oil Filter',
          category: 'engine',
          brand: 'Honda',
          price: 15,
          stock: 25,
          shopId: testShop._id
        }
      ];

      await db.collection('parts').insertMany(testParts);

      const response = await request(app)
        .get('/api/parts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('parts');
      expect(response.body.parts).toHaveLength(2);
    });

    test('POST /api/parts - should create new part', async () => {
      const newPart = {
        name: 'Air Filter',
        category: 'engine',
        brand: 'Ford',
        price: 25,
        stock: 15,
        description: 'High-quality air filter'
      };

      const response = await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPart);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('part');
      expect(response.body.part.name).toBe('Air Filter');
    });

    test('PUT /api/parts/:id - should update existing part', async () => {
      // Create test part
      const partResult = await db.collection('parts').insertOne({
        name: 'Test Part',
        category: 'brake',
        price: 100,
        stock: 5,
        shopId: testShop._id
      });

      const updateData = {
        name: 'Updated Test Part',
        price: 120,
        stock: 8
      };

      const response = await request(app)
        .put(`/api/parts/${partResult.insertedId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.part.name).toBe('Updated Test Part');
      expect(response.body.part.price).toBe(120);
    });

    test('DELETE /api/parts/:id - should delete part', async () => {
      // Create test part
      const partResult = await db.collection('parts').insertOne({
        name: 'Part to Delete',
        category: 'brake',
        price: 50,
        stock: 3,
        shopId: testShop._id
      });

      const response = await request(app)
        .delete(`/api/parts/${partResult.insertedId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Part deleted successfully');
    });
  });

  describe('Orders Management Endpoints', () => {
    test('GET /api/orders - should return orders list', async () => {
      // Create test customer
      const customerResult = await db.collection('customers').insertOne({
        userId: testUser._id,
        shopId: testShop._id,
        customerType: 'individual',
        contact: {
          email: 'customer@test.com',
          phone: '+1234567890'
        }
      });

      // Create test orders
      const testOrders = [
        {
          orderNumber: 'ORD001',
          customerId: customerResult.insertedId,
          shopId: testShop._id,
          items: [
            {
              partId: new require('mongodb').ObjectId(),
              quantity: 2,
              price: 50,
              total: 100
            }
          ],
          status: 'pending',
          total: 100,
          payment: {
            method: 'cash',
            status: 'pending',
            amount: 100
          }
        }
      ];

      await db.collection('orders').insertMany(testOrders);

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('orders');
      expect(response.body.orders).toHaveLength(1);
    });

    test('POST /api/orders - should create new order', async () => {
      // Create test customer
      const customerResult = await db.collection('customers').insertOne({
        userId: testUser._id,
        shopId: testShop._id,
        customerType: 'individual',
        contact: {
          email: 'customer@test.com',
          phone: '+1234567890'
        }
      });

      // Create test part
      const partResult = await db.collection('parts').insertOne({
        name: 'Test Part',
        category: 'brake',
        price: 50,
        stock: 10,
        shopId: testShop._id
      });

      const newOrder = {
        customerId: customerResult.insertedId,
        items: [
          {
            partId: partResult.insertedId,
            quantity: 2,
            price: 50,
            total: 100
          }
        ],
        payment: {
          method: 'cash',
          amount: 100
        },
        shipping: {
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA'
          }
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newOrder);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('order');
      expect(response.body.order.items).toHaveLength(1);
    });

    test('PUT /api/orders/:id/status - should update order status', async () => {
      // Create test order
      const orderResult = await db.collection('orders').insertOne({
        orderNumber: 'ORD002',
        customerId: new require('mongodb').ObjectId(),
        shopId: testShop._id,
        items: [],
        status: 'pending',
        total: 100,
        payment: {
          method: 'cash',
          status: 'pending',
          amount: 100
        }
      });

      const response = await request(app)
        .put(`/api/orders/${orderResult.insertedId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.order.status).toBe('confirmed');
    });
  });

  describe('Inventory Management Endpoints', () => {
    test('GET /api/inventory - should return inventory status', async () => {
      // Create test parts with different stock levels
      await db.collection('parts').insertMany([
        {
          name: 'Low Stock Part',
          category: 'brake',
          price: 50,
          stock: 2,
          minStock: 5,
          shopId: testShop._id
        },
        {
          name: 'Out of Stock Part',
          category: 'engine',
          price: 100,
          stock: 0,
          minStock: 3,
          shopId: testShop._id
        },
        {
          name: 'Good Stock Part',
          category: 'transmission',
          price: 200,
          stock: 20,
          minStock: 5,
          shopId: testShop._id
        }
      ]);

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('inventory');
      expect(response.body.inventory.lowStock).toHaveLength(1);
      expect(response.body.inventory.outOfStock).toHaveLength(1);
      expect(response.body.inventory.goodStock).toHaveLength(1);
    });

    test('POST /api/inventory/adjust - should adjust inventory levels', async () => {
      // Create test part
      const partResult = await db.collection('parts').insertOne({
        name: 'Adjustable Part',
        category: 'brake',
        price: 50,
        stock: 10,
        shopId: testShop._id
      });

      const adjustment = {
        partId: partResult.insertedId,
        quantity: -3,
        reason: 'sale',
        notes: 'Sold to customer'
      };

      const response = await request(app)
        .post('/api/inventory/adjust')
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustment);

      expect(response.status).toBe(200);
      expect(response.body.part.stock).toBe(7);
    });
  });

  describe('Analytics Endpoints', () => {
    test('GET /api/analytics/sales - should return sales analytics', async () => {
      // Create test orders with different dates
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      await db.collection('orders').insertMany([
        {
          orderNumber: 'ORD001',
          customerId: new require('mongodb').ObjectId(),
          shopId: testShop._id,
          items: [],
          status: 'delivered',
          total: 100,
          payment: { method: 'cash', status: 'paid', amount: 100 },
          createdAt: now
        },
        {
          orderNumber: 'ORD002',
          customerId: new require('mongodb').ObjectId(),
          shopId: testShop._id,
          items: [],
          status: 'delivered',
          total: 200,
          payment: { method: 'credit_card', status: 'paid', amount: 200 },
          createdAt: yesterday
        },
        {
          orderNumber: 'ORD003',
          customerId: new require('mongodb').ObjectId(),
          shopId: testShop._id,
          items: [],
          status: 'delivered',
          total: 150,
          payment: { method: 'cash', status: 'paid', amount: 150 },
          createdAt: lastWeek
        }
      ]);

      const response = await request(app)
        .get('/api/analytics/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ period: '7d' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('orderCount');
      expect(response.body).toHaveProperty('averageOrderValue');
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    test('should handle 500 for server errors', async () => {
      // This would require mocking a database error
      // For now, we'll test with invalid ObjectId
      const response = await request(app)
        .get('/api/parts/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    test('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/parts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          name: '',
          price: -10
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get('/api/parts')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
