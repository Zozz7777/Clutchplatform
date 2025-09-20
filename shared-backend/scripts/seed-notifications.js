#!/usr/bin/env node

/**
 * Seed Notifications Script
 * Adds sample notifications to the database for testing
 */

const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ziadabdelmageed1:I174HSKpqf6iNBKd@clutch.qkgvstq.mongodb.net/clutch?retryWrites=true&w=majority&appName=Clutch';
const DB_NAME = 'clutch';

const sampleNotifications = [
  {
    _id: new ObjectId(),
    title: 'Welcome to Clutch Platform',
    message: 'Your account has been successfully created. You can now access all features of the platform.',
    type: 'success',
    priority: 'normal',
    userId: 'admin-001',
    status: 'read',
    data: {
      action: 'account_created',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    title: 'New Employee Invitation',
    message: 'You have been invited to join the team as a Software Developer in the Engineering department.',
    type: 'info',
    priority: 'high',
    userId: 'admin-001',
    status: 'unread',
    data: {
      action: 'employee_invitation',
      invitationId: '68cde2331c71da90114a0f4a',
      role: 'Software Developer',
      department: 'Engineering'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    title: 'System Maintenance Scheduled',
    message: 'Scheduled maintenance will occur on Sunday, January 26th from 2:00 AM to 4:00 AM EST. Some features may be temporarily unavailable.',
    type: 'warning',
    priority: 'normal',
    userId: 'admin-001',
    status: 'unread',
    data: {
      action: 'maintenance_scheduled',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      duration: '2 hours'
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    title: 'Email Service Updated',
    message: 'The email service has been successfully updated with new templates and improved delivery rates.',
    type: 'success',
    priority: 'normal',
    userId: 'admin-001',
    status: 'read',
    data: {
      action: 'service_updated',
      service: 'email_service',
      version: '2.1.0'
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    readAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    title: 'Security Alert',
    message: 'Unusual login activity detected from a new device. If this was not you, please secure your account immediately.',
    type: 'warning',
    priority: 'high',
    userId: 'admin-001',
    status: 'unread',
    data: {
      action: 'security_alert',
      alertType: 'unusual_login',
      deviceInfo: 'Chrome on Windows 11',
      location: 'New York, NY'
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    title: 'Integration Templates Available',
    message: 'New integration templates have been added to the platform. You can now connect with Stripe, Twilio, and other services.',
    type: 'info',
    priority: 'normal',
    userId: 'admin-001',
    status: 'unread',
    data: {
      action: 'new_integrations',
      integrations: ['Stripe', 'Twilio', 'Google Analytics', 'Slack', 'AWS S3', 'SendGrid']
    },
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    updatedAt: new Date(Date.now() - 15 * 60 * 1000)
  }
];

async function seedNotifications() {
  let client;
  
  try {
    console.log('🌱 Starting notifications seeding...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const notificationsCollection = db.collection('notifications');
    
    // Clear existing notifications (optional - remove if you want to keep existing data)
    console.log('🗑️  Clearing existing notifications...');
    await notificationsCollection.deleteMany({});
    
    // Insert sample notifications
    console.log('📝 Inserting sample notifications...');
    const result = await notificationsCollection.insertMany(sampleNotifications);
    
    console.log(`✅ Successfully inserted ${result.insertedCount} notifications`);
    
    // Verify the data
    const totalNotifications = await notificationsCollection.countDocuments();
    console.log(`📊 Total notifications in database: ${totalNotifications}`);
    
    // Show some stats
    const unreadCount = await notificationsCollection.countDocuments({ status: 'unread' });
    const readCount = await notificationsCollection.countDocuments({ status: 'read' });
    
    console.log(`📈 Statistics:`);
    console.log(`   - Unread notifications: ${unreadCount}`);
    console.log(`   - Read notifications: ${readCount}`);
    
    console.log('🎉 Notifications seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the seeding function
if (require.main === module) {
  seedNotifications()
    .then(() => {
      console.log('✨ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedNotifications, sampleNotifications };
