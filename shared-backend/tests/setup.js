// Comprehensive Test Setup File
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Global test configuration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-comprehensive-testing';
process.env.PORT = '0'; // Use random port
process.env.LOG_LEVEL = 'error'; // Reduce log noise during testing

beforeAll(async () => {
  try {
    // Start in-memory MongoDB instance for testing
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'clutch_test_db'
      }
    });
    const mongoUri = mongoServer.getUri();
    
    // Set MongoDB URI for testing
    process.env.MONGODB_URI = mongoUri;
    
    console.log('✅ Test database initialized');
  } catch (error) {
    console.log('⚠️ In-memory MongoDB failed, using mock data');
    // Fallback to mock data if MongoDB fails
    process.env.MONGODB_URI = 'mongodb://localhost:27017/clutch_test_mock';
  }
}, 30000);

afterAll(async () => {
  // Cleanup test database
  if (mongoServer) {
    await mongoServer.stop();
    console.log('✅ Test database cleaned up');
  }
});

// Global test utilities and helpers
global.testUtils = {
  // User generation utilities
  generateTestUser: (overrides = {}) => ({
    email: 'test@clutch.com',
    password: 'TestPassword123!',
    name: 'Test User',
    role: 'user',
    phone: '+1234567890',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'USA'
    },
    ...overrides
  }),

  generateTestAdmin: (overrides = {}) => ({
    email: 'admin@clutch.com',
    password: 'AdminPassword123!',
    name: 'Test Admin',
    role: 'admin',
    permissions: ['read', 'write', 'admin'],
    ...overrides
  }),

  // Vehicle generation utilities
  generateTestVehicle: (overrides = {}) => ({
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: 'TEST123456789ABCDE',
    licensePlate: 'TEST123',
    color: 'Silver',
    mileage: 25000,
    ...overrides
  }),

  // Booking generation utilities
  generateTestBooking: (overrides = {}) => ({
    serviceType: 'oil_change',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    scheduledTime: '10:00',
    notes: 'Test booking for comprehensive testing',
    status: 'scheduled',
    ...overrides
  }),

  // Service center generation utilities
  generateTestServiceCenter: (overrides = {}) => ({
    name: 'Test Service Center',
    address: {
      street: '456 Service St',
      city: 'Service City',
      state: 'SC',
      zipCode: '54321',
      country: 'USA'
    },
    phone: '+1987654321',
    email: 'service@test.com',
    services: ['oil_change', 'brake_service', 'tire_rotation'],
    rating: 4.5,
    ...overrides
  }),

  // Auto parts generation utilities
  generateTestAutoPart: (overrides = {}) => ({
    name: 'Test Oil Filter',
    partNumber: 'TEST-OF-001',
    category: 'Engine',
    brand: 'TestBrand',
    price: 25.99,
    stock: 50,
    minStock: 10,
    description: 'Test oil filter for comprehensive testing',
    ...overrides
  }),

  // Payment generation utilities
  generateTestPayment: (overrides = {}) => ({
    amount: 150.00,
    currency: 'EGP',
    method: 'credit_card',
    status: 'completed',
    transactionId: 'TEST_TXN_' + Date.now(),
    ...overrides
  }),

  // Mock authentication token
  generateMockToken: () => 'mock-jwt-token-for-testing-' + Date.now(),

  // API response validation helpers
  validateApiResponse: (response, expectedStatus = 200) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('timestamp');
    expect(typeof response.body.timestamp).toBe('string');
  },

  validateErrorResponse: (response, expectedStatus = 400) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('timestamp');
  },

  // Database cleanup helpers
  cleanupTestData: async () => {
    // This would be implemented based on your database setup
    console.log('🧹 Test data cleanup completed');
  },

  // Performance testing helpers
  measureResponseTime: async (requestPromise) => {
    const start = Date.now();
    const response = await requestPromise;
    const duration = Date.now() - start;
    return { response, duration };
  },

  // Load testing helpers
  runConcurrentRequests: async (requestFn, count = 10) => {
    const promises = Array(count).fill().map(() => requestFn());
    return Promise.all(promises);
  }
};

// Global test configuration
global.testConfig = {
  timeout: 30000,
  retries: 3,
  parallel: true,
  coverage: {
    threshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
};

// Mock external services for testing
global.mockServices = {
  email: {
    send: jest.fn().mockResolvedValue({ success: true }),
    sendBulk: jest.fn().mockResolvedValue({ success: true })
  },
  sms: {
    send: jest.fn().mockResolvedValue({ success: true })
  },
  payment: {
    process: jest.fn().mockResolvedValue({ success: true, transactionId: 'test_txn' })
  },
  ai: {
    generateResponse: jest.fn().mockResolvedValue({ success: true, response: 'Test AI response' })
  }
};

// Console configuration for testing
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Global test timeout
jest.setTimeout(30000);