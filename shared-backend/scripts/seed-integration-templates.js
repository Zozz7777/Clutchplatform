#!/usr/bin/env node

/**
 * Seed Integration Templates Script
 * Adds sample integration templates to the database
 */

const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = 'clutch';

const sampleTemplates = [
  {
    _id: 'template-1',
    name: 'Stripe Payment Gateway',
    description: 'Accept payments online with Stripe\'s secure payment processing',
    type: 'payment',
    category: 'Financial',
    provider: 'Stripe',
    isPopular: true,
    isVerified: true,
    configuration: {
      apiKey: 'sk_test_...',
      webhookUrl: 'https://your-domain.com/webhooks/stripe',
      endpoints: ['/api/v1/payments/create', '/api/v1/payments/confirm'],
      rateLimit: 1000,
      timeout: 30000
    },
    features: [
      'Credit card processing',
      'Digital wallet support',
      'Subscription billing',
      'Fraud protection',
      'Multi-currency support'
    ],
    pricing: {
      type: 'transaction',
      rate: 2.9,
      fixed: 0.30,
      currency: 'USD'
    },
    documentation: 'https://stripe.com/docs',
    support: {
      email: 'support@stripe.com',
      documentation: 'https://stripe.com/docs',
      status: 'https://status.stripe.com'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'template-2',
    name: 'Twilio SMS Service',
    description: 'Send SMS messages and notifications to customers',
    type: 'communication',
    category: 'Messaging',
    provider: 'Twilio',
    isPopular: true,
    isVerified: true,
    configuration: {
      accountSid: 'AC...',
      authToken: '...',
      phoneNumber: '+1234567890',
      endpoints: ['/api/v1/sms/send', '/api/v1/sms/status'],
      rateLimit: 100,
      timeout: 10000
    },
    features: [
      'SMS messaging',
      'WhatsApp Business API',
      'Voice calls',
      'Email delivery',
      'Global reach'
    ],
    pricing: {
      type: 'per_message',
      rate: 0.0075,
      currency: 'USD'
    },
    documentation: 'https://www.twilio.com/docs',
    support: {
      email: 'help@twilio.com',
      documentation: 'https://www.twilio.com/docs',
      status: 'https://status.twilio.com'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'template-3',
    name: 'Google Analytics 4',
    description: 'Track website and app analytics with Google Analytics 4',
    type: 'analytics',
    category: 'Analytics',
    provider: 'Google',
    isPopular: true,
    isVerified: true,
    configuration: {
      measurementId: 'G-XXXXXXXXXX',
      apiKey: 'AIza...',
      endpoints: ['/api/v1/analytics/events', '/api/v1/analytics/reports'],
      rateLimit: 10000,
      timeout: 60000
    },
    features: [
      'Event tracking',
      'Custom dimensions',
      'Real-time reporting',
      'Audience insights',
      'Conversion tracking'
    ],
    pricing: {
      type: 'free',
      rate: 0,
      currency: 'USD'
    },
    documentation: 'https://developers.google.com/analytics',
    support: {
      email: 'analytics-support@google.com',
      documentation: 'https://developers.google.com/analytics',
      status: 'https://status.google.com'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'template-4',
    name: 'SendGrid Email Service',
    description: 'Reliable email delivery and marketing automation',
    type: 'communication',
    category: 'Email',
    provider: 'SendGrid',
    isPopular: true,
    isVerified: true,
    configuration: {
      apiKey: 'SG...',
      fromEmail: 'noreply@yourdomain.com',
      endpoints: ['/api/v1/email/send', '/api/v1/email/templates'],
      rateLimit: 600,
      timeout: 30000
    },
    features: [
      'Transactional emails',
      'Marketing campaigns',
      'Email templates',
      'Delivery tracking',
      'Bounce management'
    ],
    pricing: {
      type: 'per_email',
      rate: 0.0008,
      currency: 'USD'
    },
    documentation: 'https://docs.sendgrid.com',
    support: {
      email: 'support@sendgrid.com',
      documentation: 'https://docs.sendgrid.com',
      status: 'https://status.sendgrid.com'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'template-5',
    name: 'MongoDB Atlas',
    description: 'Cloud database service with automatic scaling and backup',
    type: 'database',
    category: 'Database',
    provider: 'MongoDB',
    isPopular: true,
    isVerified: true,
    configuration: {
      connectionString: 'mongodb+srv://...',
      database: 'clutch',
      endpoints: ['/api/v1/data/query', '/api/v1/data/insert'],
      rateLimit: 1000,
      timeout: 30000
    },
    features: [
      'Document database',
      'Automatic scaling',
      'Backup and recovery',
      'Real-time analytics',
      'Global clusters'
    ],
    pricing: {
      type: 'tiered',
      rate: 0.25,
      currency: 'USD',
      unit: 'per_hour'
    },
    documentation: 'https://docs.atlas.mongodb.com',
    support: {
      email: 'support@mongodb.com',
      documentation: 'https://docs.atlas.mongodb.com',
      status: 'https://status.cloud.mongodb.com'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: 'template-6',
    name: 'AWS S3 Storage',
    description: 'Scalable object storage for files, images, and documents',
    type: 'storage',
    category: 'Storage',
    provider: 'Amazon Web Services',
    isPopular: true,
    isVerified: true,
    configuration: {
      accessKeyId: 'AKIA...',
      secretAccessKey: '...',
      bucketName: 'clutch-storage',
      region: 'us-east-1',
      endpoints: ['/api/v1/storage/upload', '/api/v1/storage/download'],
      rateLimit: 3500,
      timeout: 60000
    },
    features: [
      'File storage',
      'CDN integration',
      'Version control',
      'Access control',
      'Lifecycle policies'
    ],
    pricing: {
      type: 'per_gb',
      rate: 0.023,
      currency: 'USD'
    },
    documentation: 'https://docs.aws.amazon.com/s3',
    support: {
      email: 'support@amazon.com',
      documentation: 'https://docs.aws.amazon.com/s3',
      status: 'https://status.aws.amazon.com'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedIntegrationTemplates() {
  let client;
  try {
    console.log('🌱 Starting integration templates seeding...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const templatesCollection = db.collection('integration_templates');
    
    // Clear existing templates
    await templatesCollection.deleteMany({});
    console.log('🗑️  Cleared existing integration templates');
    
    // Insert sample templates
    const result = await templatesCollection.insertMany(sampleTemplates);
    console.log(`✅ Successfully inserted ${result.insertedCount} integration templates`);
    
    // Verify insertion
    const count = await templatesCollection.countDocuments();
    console.log(`📊 Total integration templates in database: ${count}`);
    
    console.log('🎉 Integration templates seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding integration templates:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the seeding function
if (require.main === module) {
  seedIntegrationTemplates()
    .then(() => {
      console.log('✨ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedIntegrationTemplates, sampleTemplates };
