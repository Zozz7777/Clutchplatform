/**
 * API Contract Testing
 * Validates API contracts and schema compliance
 */

const { test, expect } = require('@playwright/test');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class APIContractTester {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.schemas = this.loadSchemas();
  }

  loadSchemas() {
    return {
      user: {
        type: 'object',
        required: ['_id', 'email', 'firstName', 'lastName', 'role', 'isActive'],
        properties: {
          _id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string', minLength: 1 },
          lastName: { type: 'string', minLength: 1 },
          role: { 
            type: 'string', 
            enum: ['admin', 'shop_owner', 'employee', 'customer', 'supplier'] 
          },
          isActive: { type: 'boolean' },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      shop: {
        type: 'object',
        required: ['_id', 'name', 'type', 'ownerId', 'contact', 'isActive'],
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', minLength: 1 },
          type: { 
            type: 'string', 
            enum: ['auto_parts', 'garage', 'dealership', 'service_center'] 
          },
          ownerId: { type: 'string' },
          contact: {
            type: 'object',
            required: ['email', 'phone'],
            properties: {
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              address: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zipCode: { type: 'string' },
                  country: { type: 'string' }
                }
              }
            }
          },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      part: {
        type: 'object',
        required: ['_id', 'name', 'category', 'brand', 'price', 'stock', 'shopId'],
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          category: { 
            type: 'string', 
            enum: ['engine', 'brake', 'transmission', 'electrical', 'body', 'interior'] 
          },
          brand: { type: 'string', minLength: 1 },
          partNumber: { type: 'string' },
          oemNumber: { type: 'string' },
          condition: { 
            type: 'string', 
            enum: ['new', 'used', 'refurbished'] 
          },
          price: { type: 'number', minimum: 0 },
          cost: { type: 'number', minimum: 0 },
          stock: { type: 'integer', minimum: 0 },
          minStock: { type: 'integer', minimum: 0 },
          maxStock: { type: 'integer', minimum: 0 },
          shopId: { type: 'string' },
          supplierId: { type: 'string' },
          images: {
            type: 'array',
            items: { type: 'string', format: 'uri' }
          },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      order: {
        type: 'object',
        required: ['_id', 'orderNumber', 'customerId', 'shopId', 'items', 'status', 'total'],
        properties: {
          _id: { type: 'string' },
          orderNumber: { type: 'string', minLength: 1 },
          customerId: { type: 'string' },
          shopId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['partId', 'quantity', 'price', 'total'],
              properties: {
                partId: { type: 'string' },
                quantity: { type: 'integer', minimum: 1 },
                price: { type: 'number', minimum: 0 },
                total: { type: 'number', minimum: 0 }
              }
            }
          },
          status: { 
            type: 'string', 
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] 
          },
          payment: {
            type: 'object',
            required: ['method', 'status', 'amount'],
            properties: {
              method: { 
                type: 'string', 
                enum: ['cash', 'credit_card', 'bank_transfer', 'mobile_payment'] 
              },
              status: { 
                type: 'string', 
                enum: ['pending', 'paid', 'failed', 'refunded'] 
              },
              amount: { type: 'number', minimum: 0 },
              currency: { type: 'string', default: 'USD' },
              transactionId: { type: 'string' }
            }
          },
          shipping: {
            type: 'object',
            properties: {
              address: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zipCode: { type: 'string' },
                  country: { type: 'string' }
                }
              },
              method: { 
                type: 'string', 
                enum: ['standard', 'express', 'overnight'] 
              },
              cost: { type: 'number', minimum: 0 },
              trackingNumber: { type: 'string' }
            }
          },
          total: { type: 'number', minimum: 0 },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deliveredAt: { type: ['string', 'null'], format: 'date-time' }
        }
      },
      error: {
        type: 'object',
        required: ['error', 'message'],
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'object' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    };
  }

  validateSchema(data, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      return {
        valid: false,
        errors: validate.errors
      };
    }

    return { valid: true };
  }
}

test.describe('API Contract Testing', () => {
  let contractTester;
  let authToken;

  test.beforeAll(async ({ request }) => {
    contractTester = new APIContractTester();
    
    // Get auth token
    const loginResponse = await request.post('http://localhost:5000/api/auth/login', {
      data: {
        email: 'admin@clutch.com',
        password: 'test123'
      }
    });
    
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test.describe('User API Contracts', () => {
    test('GET /api/users - Response Schema Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('users');
      expect(Array.isArray(data.users)).toBe(true);

      // Validate each user against schema
      for (const user of data.users) {
        const validation = contractTester.validateSchema(user, 'user');
        expect(validation.valid).toBe(true);
      }
    });

    test('POST /api/users - Request/Response Schema Validation', async ({ request }) => {
      const newUser = {
        email: 'contract-test@clutch.com',
        firstName: 'Contract',
        lastName: 'Test',
        role: 'employee',
        password: 'test123'
      };

      const response = await request.post('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: newUser
      });

      expect(response.status()).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('user');

      // Validate response against schema
      const validation = contractTester.validateSchema(data.user, 'user');
      expect(validation.valid).toBe(true);
    });

    test('PUT /api/users/:id - Request/Response Schema Validation', async ({ request }) => {
      // First create a user
      const createResponse = await request.post('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          email: 'update-test@clutch.com',
          firstName: 'Update',
          lastName: 'Test',
          role: 'employee',
          password: 'test123'
        }
      });

      const createData = await createResponse.json();
      const userId = createData.user._id;

      // Update the user
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request.put(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: updateData
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('user');

      // Validate response against schema
      const validation = contractTester.validateSchema(data.user, 'user');
      expect(validation.valid).toBe(true);
    });
  });

  test.describe('Shop API Contracts', () => {
    test('GET /api/shops - Response Schema Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/shops', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('shops');
      expect(Array.isArray(data.shops)).toBe(true);

      // Validate each shop against schema
      for (const shop of data.shops) {
        const validation = contractTester.validateSchema(shop, 'shop');
        expect(validation.valid).toBe(true);
      }
    });

    test('POST /api/shops - Request/Response Schema Validation', async ({ request }) => {
      const newShop = {
        name: 'Contract Test Shop',
        type: 'auto_parts',
        contact: {
          email: 'shop@contract-test.com',
          phone: '+1234567890',
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'USA'
          }
        }
      };

      const response = await request.post('http://localhost:5000/api/shops', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: newShop
      });

      expect(response.status()).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('shop');

      // Validate response against schema
      const validation = contractTester.validateSchema(data.shop, 'shop');
      expect(validation.valid).toBe(true);
    });
  });

  test.describe('Parts API Contracts', () => {
    test('GET /api/parts - Response Schema Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/parts', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('parts');
      expect(Array.isArray(data.parts)).toBe(true);

      // Validate each part against schema
      for (const part of data.parts) {
        const validation = contractTester.validateSchema(part, 'part');
        expect(validation.valid).toBe(true);
      }
    });

    test('POST /api/parts - Request/Response Schema Validation', async ({ request }) => {
      const newPart = {
        name: 'Contract Test Part',
        category: 'brake',
        brand: 'Toyota',
        partNumber: 'CT001',
        price: 99.99,
        cost: 75.00,
        stock: 10,
        minStock: 2,
        maxStock: 50,
        description: 'Contract testing part'
      };

      const response = await request.post('http://localhost:5000/api/parts', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: newPart
      });

      expect(response.status()).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('part');

      // Validate response against schema
      const validation = contractTester.validateSchema(data.part, 'part');
      expect(validation.valid).toBe(true);
    });
  });

  test.describe('Orders API Contracts', () => {
    test('GET /api/orders - Response Schema Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('orders');
      expect(Array.isArray(data.orders)).toBe(true);

      // Validate each order against schema
      for (const order of data.orders) {
        const validation = contractTester.validateSchema(order, 'order');
        expect(validation.valid).toBe(true);
      }
    });

    test('POST /api/orders - Request/Response Schema Validation', async ({ request }) => {
      // First get a customer and part ID
      const customersResponse = await request.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const customersData = await customersResponse.json();
      const customerId = customersData.customers[0]._id;

      const partsResponse = await request.get('http://localhost:5000/api/parts', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const partsData = await partsResponse.json();
      const partId = partsData.parts[0]._id;

      const newOrder = {
        customerId: customerId,
        items: [
          {
            partId: partId,
            quantity: 2,
            price: 99.99,
            total: 199.98
          }
        ],
        payment: {
          method: 'credit_card',
          amount: 199.98
        },
        shipping: {
          address: {
            street: '123 Order St',
            city: 'Order City',
            state: 'OS',
            zipCode: '54321',
            country: 'USA'
          },
          method: 'standard'
        }
      };

      const response = await request.post('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: newOrder
      });

      expect(response.status()).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('order');

      // Validate response against schema
      const validation = contractTester.validateSchema(data.order, 'order');
      expect(validation.valid).toBe(true);
    });
  });

  test.describe('Error Response Contracts', () => {
    test('400 Bad Request - Error Schema Validation', async ({ request }) => {
      const response = await request.post('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${authToken}` },
        data: {
          // Invalid data - missing required fields
          email: 'invalid-email'
        }
      });

      expect(response.status()).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');

      // Validate error response against schema
      const validation = contractTester.validateSchema(data, 'error');
      expect(validation.valid).toBe(true);
    });

    test('401 Unauthorized - Error Schema Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: 'Bearer invalid-token' }
      });

      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');

      // Validate error response against schema
      const validation = contractTester.validateSchema(data, 'error');
      expect(validation.valid).toBe(true);
    });

    test('404 Not Found - Error Schema Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users/nonexistent-id', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(404);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');

      // Validate error response against schema
      const validation = contractTester.validateSchema(data, 'error');
      expect(validation.valid).toBe(true);
    });
  });

  test.describe('API Versioning Contracts', () => {
    test('API Version Header Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'API-Version': 'v1'
        }
      });

      expect(response.status()).toBe(200);
      
      // Check if API version is returned in response
      const apiVersion = response.headers()['api-version'];
      expect(apiVersion).toBeTruthy();
    });

    test('Backward Compatibility Validation', async ({ request }) => {
      // Test that old API versions still work
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'API-Version': 'v1'
        }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('users');
      
      // Validate that response structure hasn't changed
      for (const user of data.users) {
        const validation = contractTester.validateSchema(user, 'user');
        expect(validation.valid).toBe(true);
      }
    });
  });

  test.describe('Pagination Contracts', () => {
    test('Pagination Response Schema Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/parts?page=1&limit=10', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      
      // Validate pagination structure
      expect(data).toHaveProperty('parts');
      expect(data).toHaveProperty('pagination');
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('pages');
      
      // Validate pagination types
      expect(typeof data.pagination.page).toBe('number');
      expect(typeof data.pagination.limit).toBe('number');
      expect(typeof data.pagination.total).toBe('number');
      expect(typeof data.pagination.pages).toBe('number');
    });
  });

  test.describe('Content Type Validation', () => {
    test('JSON Content Type Validation', async ({ request }) => {
      const response = await request.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });

    test('Request Content Type Validation', async ({ request }) => {
      const response = await request.post('http://localhost:5000/api/users', {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          email: 'content-type-test@clutch.com',
          firstName: 'Content',
          lastName: 'Type',
          role: 'employee',
          password: 'test123'
        }
      });

      expect(response.status()).toBe(201);
    });
  });
});
