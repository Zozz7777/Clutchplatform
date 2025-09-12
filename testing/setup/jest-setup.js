/**
 * Jest Setup Configuration
 * Global setup for all Jest tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.TEST_DB_URL = process.env.TEST_DB_URL || 'mongodb://localhost:27017/clutch_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.API_URL = process.env.API_URL || 'http://localhost:5000';

// Global test timeout
jest.setTimeout(30000);

// Global test utilities
global.testUtils = {
  // Generate test data
  generateTestUser: () => ({
    email: 'test@clutch.com',
    password: 'test123',
    firstName: 'Test',
    lastName: 'User',
    role: 'shop_owner',
    isActive: true,
    emailVerified: true
  }),

  generateTestShop: (ownerId) => ({
    name: 'Test Auto Parts Shop',
    type: 'auto_parts',
    ownerId: ownerId,
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
  }),

  generateTestPart: (shopId) => ({
    name: 'Test Brake Pad',
    category: 'brake',
    brand: 'Toyota',
    partNumber: 'BP001',
    price: 75.00,
    cost: 50.00,
    stock: 25,
    minStock: 5,
    shopId: shopId,
    description: 'High-quality brake pad for testing'
  }),

  generateTestOrder: (customerId, shopId, partId) => ({
    orderNumber: 'TEST001',
    customerId: customerId,
    shopId: shopId,
    items: [
      {
        partId: partId,
        quantity: 2,
        price: 75.00,
        total: 150.00
      }
    ],
    status: 'pending',
    payment: {
      method: 'cash',
      status: 'pending',
      amount: 150.00
    },
    total: 150.00
  }),

  // Database helpers
  async clearDatabase(db) {
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
    }
  },

  async seedTestData(db) {
    const testUser = global.testUtils.generateTestUser();
    const userResult = await db.collection('users').insertOne(testUser);
    testUser._id = userResult.insertedId;

    const testShop = global.testUtils.generateTestShop(testUser._id);
    const shopResult = await db.collection('shops').insertOne(testShop);
    testShop._id = shopResult.insertedId;

    const testPart = global.testUtils.generateTestPart(testShop._id);
    const partResult = await db.collection('parts').insertOne(testPart);
    testPart._id = partResult.insertedId;

    return {
      user: testUser,
      shop: testShop,
      part: testPart
    };
  },

  // API helpers
  async makeAuthenticatedRequest(app, method, url, data = null, token = null) {
    const request = require('supertest')(app)[method.toLowerCase()](url);
    
    if (token) {
      request.set('Authorization', `Bearer ${token}`);
    }
    
    if (data) {
      request.send(data);
    }
    
    return request;
  },

  // Wait helper
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Mock helpers
  mockDate: (date) => {
    const mockDate = new Date(date);
    global.Date = jest.fn(() => mockDate);
    global.Date.UTC = Date.UTC;
    global.Date.parse = Date.parse;
    global.Date.now = jest.fn(() => mockDate.getTime());
  },

  restoreDate: () => {
    global.Date = Date;
  }
};

// Global beforeAll hook
beforeAll(async () => {
  console.log('🚀 Setting up test environment...');
  
  // Set up test database connection
  if (process.env.TEST_DB_URL) {
    const { MongoClient } = require('mongodb');
    global.testDbClient = new MongoClient(process.env.TEST_DB_URL);
    await global.testDbClient.connect();
    global.testDb = global.testDbClient.db();
    console.log('✅ Test database connected');
  }
});

// Global afterAll hook
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Close database connection
  if (global.testDbClient) {
    await global.testDbClient.close();
    console.log('✅ Test database disconnected');
  }
});

// Global beforeEach hook
beforeEach(async () => {
  // Clear database before each test
  if (global.testDb) {
    await global.testUtils.clearDatabase(global.testDb);
  }
});

// Global afterEach hook
afterEach(async () => {
  // Restore any mocked functions
  jest.restoreAllMocks();
  global.testUtils.restoreDate();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Suppress console.log in tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}
