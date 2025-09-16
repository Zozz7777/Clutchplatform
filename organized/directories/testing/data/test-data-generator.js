/**
 * Test Data Generator for Clutch Platform
 * Generates comprehensive test data for all testing scenarios
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

class TestDataGenerator {
  constructor() {
    this.db = null;
    this.client = null;
    this.testData = {
      users: [],
      shops: [],
      parts: [],
      orders: [],
      customers: [],
      suppliers: [],
      services: [],
      notifications: [],
      analytics: []
    };
  }

  async connect() {
    const mongoUrl = process.env.TEST_DB_URL || 'mongodb://localhost:27017/clutch_test';
    this.client = new MongoClient(mongoUrl);
    await this.client.connect();
    this.db = this.client.db();
    console.log('✅ Connected to test database');
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from test database');
    }
  }

  async clearDatabase() {
    const collections = await this.db.listCollections().toArray();
    for (const collection of collections) {
      await this.db.collection(collection.name).deleteMany({});
    }
    console.log('✅ Cleared test database');
  }

  // User Data Generation
  async generateUsers(count = 50) {
    const users = [];
    const roles = ['admin', 'shop_owner', 'employee', 'customer', 'supplier'];
    
    for (let i = 0; i < count; i++) {
      const user = {
        _id: faker.database.mongodbObjectId(),
        email: faker.internet.email(),
        password: await bcrypt.hash('test123', 4),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        role: faker.helpers.arrayElement(roles),
        isActive: faker.datatype.boolean(0.9),
        emailVerified: faker.datatype.boolean(0.8),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        preferences: {
          language: faker.helpers.arrayElement(['en', 'ar']),
          theme: faker.helpers.arrayElement(['light', 'dark']),
          notifications: {
            email: faker.datatype.boolean(),
            push: faker.datatype.boolean(),
            sms: faker.datatype.boolean()
          }
        },
        profile: {
          avatar: faker.image.avatar(),
          bio: faker.person.bio(),
          location: {
            city: faker.location.city(),
            country: faker.location.country(),
            coordinates: [faker.location.longitude(), faker.location.latitude()]
          }
        }
      };
      users.push(user);
    }

    await this.db.collection('users').insertMany(users);
    this.testData.users = users;
    console.log(`✅ Generated ${count} users`);
    return users;
  }

  // Shop Data Generation
  async generateShops(count = 20) {
    const shops = [];
    const shopTypes = ['auto_parts', 'garage', 'dealership', 'service_center'];
    
    for (let i = 0; i < count; i++) {
      const shop = {
        _id: faker.database.mongodbObjectId(),
        name: faker.company.name() + ' Auto Parts',
        type: faker.helpers.arrayElement(shopTypes),
        ownerId: faker.helpers.arrayElement(this.testData.users.filter(u => u.role === 'shop_owner'))._id,
        contact: {
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country()
          }
        },
        business: {
          license: faker.string.alphanumeric(10),
          taxId: faker.string.alphanumeric(12),
          establishedDate: faker.date.past({ years: 10 }),
          employees: faker.number.int({ min: 1, max: 50 })
        },
        settings: {
          currency: faker.helpers.arrayElement(['USD', 'EGP', 'SAR']),
          timezone: faker.location.timeZone(),
          workingHours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '10:00', close: '16:00' },
            sunday: { open: '10:00', close: '16:00' }
          }
        },
        isActive: faker.datatype.boolean(0.9),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };
      shops.push(shop);
    }

    await this.db.collection('shops').insertMany(shops);
    this.testData.shops = shops;
    console.log(`✅ Generated ${count} shops`);
    return shops;
  }

  // Auto Parts Data Generation
  async generateParts(count = 500) {
    const parts = [];
    const categories = ['engine', 'brake', 'transmission', 'electrical', 'body', 'interior'];
    const brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Hyundai'];
    const conditions = ['new', 'used', 'refurbished'];
    
    for (let i = 0; i < count; i++) {
      const part = {
        _id: faker.database.mongodbObjectId(),
        name: faker.vehicle.part(),
        description: faker.commerce.productDescription(),
        category: faker.helpers.arrayElement(categories),
        brand: faker.helpers.arrayElement(brands),
        partNumber: faker.string.alphanumeric(10),
        oemNumber: faker.string.alphanumeric(12),
        condition: faker.helpers.arrayElement(conditions),
        price: faker.commerce.price({ min: 10, max: 1000 }),
        cost: faker.commerce.price({ min: 5, max: 800 }),
        stock: faker.number.int({ min: 0, max: 100 }),
        minStock: faker.number.int({ min: 1, max: 10 }),
        maxStock: faker.number.int({ min: 50, max: 200 }),
        shopId: faker.helpers.arrayElement(this.testData.shops)._id,
        supplierId: faker.helpers.arrayElement(this.testData.suppliers)._id,
        images: [
          faker.image.url(),
          faker.image.url(),
          faker.image.url()
        ],
        specifications: {
          weight: faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }),
          dimensions: {
            length: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
            width: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
            height: faker.number.float({ min: 1, max: 100, fractionDigits: 2 })
          },
          material: faker.helpers.arrayElement(['steel', 'aluminum', 'plastic', 'rubber', 'carbon_fiber']),
          color: faker.color.human()
        },
        compatibility: {
          makes: faker.helpers.arrayElements(brands, { min: 1, max: 3 }),
          models: faker.helpers.arrayElements(['Camry', 'Civic', 'F-150', 'X3', 'C-Class'], { min: 1, max: 5 }),
          years: {
            from: faker.number.int({ min: 2010, max: 2020 }),
            to: faker.number.int({ min: 2020, max: 2024 })
          }
        },
        isActive: faker.datatype.boolean(0.95),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };
      parts.push(part);
    }

    await this.db.collection('parts').insertMany(parts);
    this.testData.parts = parts;
    console.log(`✅ Generated ${count} parts`);
    return parts;
  }

  // Orders Data Generation
  async generateOrders(count = 200) {
    const orders = [];
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['cash', 'credit_card', 'bank_transfer', 'mobile_payment'];
    
    for (let i = 0; i < count; i++) {
      const order = {
        _id: faker.database.mongodbObjectId(),
        orderNumber: faker.string.alphanumeric(8).toUpperCase(),
        customerId: faker.helpers.arrayElement(this.testData.customers)._id,
        shopId: faker.helpers.arrayElement(this.testData.shops)._id,
        items: faker.helpers.arrayElements(this.testData.parts, { min: 1, max: 5 }).map(part => ({
          partId: part._id,
          quantity: faker.number.int({ min: 1, max: 10 }),
          price: part.price,
          total: part.price * faker.number.int({ min: 1, max: 10 })
        })),
        status: faker.helpers.arrayElement(statuses),
        payment: {
          method: faker.helpers.arrayElement(paymentMethods),
          status: faker.helpers.arrayElement(['pending', 'paid', 'failed', 'refunded']),
          amount: faker.commerce.price({ min: 50, max: 5000 }),
          currency: 'USD',
          transactionId: faker.string.alphanumeric(20)
        },
        shipping: {
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country()
          },
          method: faker.helpers.arrayElement(['standard', 'express', 'overnight']),
          cost: faker.commerce.price({ min: 5, max: 50 }),
          trackingNumber: faker.string.alphanumeric(15)
        },
        total: faker.commerce.price({ min: 50, max: 5000 }),
        notes: faker.lorem.sentence(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deliveredAt: faker.datatype.boolean(0.7) ? faker.date.recent() : null
      };
      orders.push(order);
    }

    await this.db.collection('orders').insertMany(orders);
    this.testData.orders = orders;
    console.log(`✅ Generated ${count} orders`);
    return orders;
  }

  // Customers Data Generation
  async generateCustomers(count = 100) {
    const customers = [];
    
    for (let i = 0; i < count; i++) {
      const customer = {
        _id: faker.database.mongodbObjectId(),
        userId: faker.helpers.arrayElement(this.testData.users.filter(u => u.role === 'customer'))._id,
        shopId: faker.helpers.arrayElement(this.testData.shops)._id,
        customerType: faker.helpers.arrayElement(['individual', 'business']),
        contact: {
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country()
          }
        },
        preferences: {
          communication: faker.helpers.arrayElement(['email', 'phone', 'sms']),
          language: faker.helpers.arrayElement(['en', 'ar']),
          notifications: faker.datatype.boolean()
        },
        loyalty: {
          points: faker.number.int({ min: 0, max: 10000 }),
          tier: faker.helpers.arrayElement(['bronze', 'silver', 'gold', 'platinum']),
          joinDate: faker.date.past()
        },
        isActive: faker.datatype.boolean(0.9),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };
      customers.push(customer);
    }

    await this.db.collection('customers').insertMany(customers);
    this.testData.customers = customers;
    console.log(`✅ Generated ${count} customers`);
    return customers;
  }

  // Suppliers Data Generation
  async generateSuppliers(count = 30) {
    const suppliers = [];
    
    for (let i = 0; i < count; i++) {
      const supplier = {
        _id: faker.database.mongodbObjectId(),
        name: faker.company.name(),
        contact: {
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: {
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            country: faker.location.country()
          }
        },
        business: {
          license: faker.string.alphanumeric(10),
          taxId: faker.string.alphanumeric(12),
          website: faker.internet.url()
        },
        terms: {
          paymentTerms: faker.helpers.arrayElement(['net_30', 'net_60', 'cash_on_delivery']),
          minimumOrder: faker.commerce.price({ min: 100, max: 1000 }),
          discount: faker.number.float({ min: 0, max: 0.2, fractionDigits: 2 })
        },
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        isActive: faker.datatype.boolean(0.9),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };
      suppliers.push(supplier);
    }

    await this.db.collection('suppliers').insertMany(suppliers);
    this.testData.suppliers = suppliers;
    console.log(`✅ Generated ${count} suppliers`);
    return suppliers;
  }

  // Services Data Generation
  async generateServices(count = 50) {
    const services = [];
    const serviceTypes = ['repair', 'maintenance', 'inspection', 'installation', 'consultation'];
    
    for (let i = 0; i < count; i++) {
      const service = {
        _id: faker.database.mongodbObjectId(),
        name: faker.vehicle.service(),
        description: faker.commerce.productDescription(),
        type: faker.helpers.arrayElement(serviceTypes),
        shopId: faker.helpers.arrayElement(this.testData.shops)._id,
        price: faker.commerce.price({ min: 20, max: 500 }),
        duration: faker.number.int({ min: 30, max: 480 }), // minutes
        category: faker.helpers.arrayElement(['engine', 'brake', 'transmission', 'electrical', 'body']),
        requirements: faker.helpers.arrayElements(['appointment', 'vehicle_inspection', 'parts_available'], { min: 0, max: 3 }),
        isActive: faker.datatype.boolean(0.9),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      };
      services.push(service);
    }

    await this.db.collection('services').insertMany(services);
    this.testData.services = services;
    console.log(`✅ Generated ${count} services`);
    return services;
  }

  // Notifications Data Generation
  async generateNotifications(count = 100) {
    const notifications = [];
    const types = ['order_update', 'inventory_alert', 'payment_confirmation', 'service_reminder', 'promotion'];
    
    for (let i = 0; i < count; i++) {
      const notification = {
        _id: faker.database.mongodbObjectId(),
        userId: faker.helpers.arrayElement(this.testData.users)._id,
        type: faker.helpers.arrayElement(types),
        title: faker.lorem.sentence(5),
        message: faker.lorem.paragraph(),
        data: {
          orderId: faker.helpers.arrayElement(this.testData.orders)._id,
          shopId: faker.helpers.arrayElement(this.testData.shops)._id
        },
        isRead: faker.datatype.boolean(0.3),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent']),
        createdAt: faker.date.past(),
        readAt: faker.datatype.boolean(0.3) ? faker.date.recent() : null
      };
      notifications.push(notification);
    }

    await this.db.collection('notifications').insertMany(notifications);
    this.testData.notifications = notifications;
    console.log(`✅ Generated ${count} notifications`);
    return notifications;
  }

  // Analytics Data Generation
  async generateAnalytics(count = 1000) {
    const analytics = [];
    const eventTypes = ['page_view', 'part_search', 'order_created', 'user_login', 'cart_added'];
    
    for (let i = 0; i < count; i++) {
      const analytic = {
        _id: faker.database.mongodbObjectId(),
        userId: faker.helpers.arrayElement(this.testData.users)._id,
        shopId: faker.helpers.arrayElement(this.testData.shops)._id,
        eventType: faker.helpers.arrayElement(eventTypes),
        eventData: {
          page: faker.helpers.arrayElement(['home', 'parts', 'orders', 'profile']),
          partId: faker.helpers.arrayElement(this.testData.parts)._id,
          orderId: faker.helpers.arrayElement(this.testData.orders)._id,
          searchQuery: faker.vehicle.part(),
          value: faker.commerce.price({ min: 10, max: 1000 })
        },
        sessionId: faker.string.uuid(),
        userAgent: faker.internet.userAgent(),
        ip: faker.internet.ip(),
        location: {
          country: faker.location.country(),
          city: faker.location.city(),
          coordinates: [faker.location.longitude(), faker.location.latitude()]
        },
        timestamp: faker.date.past()
      };
      analytics.push(analytic);
    }

    await this.db.collection('analytics').insertMany(analytics);
    this.testData.analytics = analytics;
    console.log(`✅ Generated ${count} analytics events`);
    return analytics;
  }

  // Generate all test data
  async generateAllData() {
    console.log('🚀 Starting test data generation...');
    
    try {
      await this.connect();
      await this.clearDatabase();
      
      // Generate data in order (dependencies matter)
      await this.generateUsers(50);
      await this.generateShops(20);
      await this.generateSuppliers(30);
      await this.generateCustomers(100);
      await this.generateParts(500);
      await this.generateServices(50);
      await this.generateOrders(200);
      await this.generateNotifications(100);
      await this.generateAnalytics(1000);
      
      console.log('✅ All test data generated successfully!');
      console.log(`📊 Generated:`);
      console.log(`   - ${this.testData.users.length} users`);
      console.log(`   - ${this.testData.shops.length} shops`);
      console.log(`   - ${this.testData.suppliers.length} suppliers`);
      console.log(`   - ${this.testData.customers.length} customers`);
      console.log(`   - ${this.testData.parts.length} parts`);
      console.log(`   - ${this.testData.services.length} services`);
      console.log(`   - ${this.testData.orders.length} orders`);
      console.log(`   - ${this.testData.notifications.length} notifications`);
      console.log(`   - ${this.testData.analytics.length} analytics events`);
      
    } catch (error) {
      console.error('❌ Error generating test data:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI usage
if (require.main === module) {
  const generator = new TestDataGenerator();
  generator.generateAllData()
    .then(() => {
      console.log('🎉 Test data generation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test data generation failed:', error);
      process.exit(1);
    });
}

module.exports = TestDataGenerator;
