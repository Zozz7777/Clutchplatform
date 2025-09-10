const { MongoClient } = require('mongodb');
const EmailMarketingService = require('../services/email-marketing-service');
const { initializeTransporter } = require('../config/email-config');

// Sample data for email marketing setup
const SAMPLE_SUBSCRIBERS = [
  {
    email: 'YourClutchauto@gmail.com',
    firstName: 'Clutch',
    lastName: 'Admin',
    phone: '+1234567890',
    preferences: {
      newsletter: true,
      promotions: true,
      serviceReminders: true,
      maintenanceAlerts: true
    },
    tags: ['admin', 'premium', 'active'],
    metadata: {
      signupSource: 'admin-setup',
      lastActivity: new Date(),
      totalOrders: 0,
      loyaltyPoints: 0
    }
  },
  {
    email: 'test1@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567891',
    preferences: {
      newsletter: true,
      promotions: true,
      serviceReminders: true,
      maintenanceAlerts: false
    },
    tags: ['new-customer', 'active'],
    metadata: {
      signupSource: 'website',
      lastActivity: new Date(),
      totalOrders: 2,
      loyaltyPoints: 150
    }
  },
  {
    email: 'test2@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1234567892',
    preferences: {
      newsletter: true,
      promotions: false,
      serviceReminders: true,
      maintenanceAlerts: true
    },
    tags: ['returning-customer', 'premium'],
    metadata: {
      signupSource: 'mobile-app',
      lastActivity: new Date(),
      totalOrders: 5,
      loyaltyPoints: 450
    }
  }
];

const SAMPLE_CAMPAIGNS = [
  {
    name: 'Welcome to Clutch',
    subject: 'Welcome to Clutch - Your Automotive Service Companion',
    templateType: 'welcome',
    status: 'draft',
    targetAudience: {
      segments: ['new-customer'],
      tags: ['active'],
      preferences: {
        newsletter: true
      }
    },
    content: {
      personalization: {
        firstName: true,
        loyaltyPoints: true
      },
      cta: {
        text: 'Explore Our Services',
        url: 'https://clutch.com/services'
      }
    },
    schedule: {
      type: 'immediate',
      timezone: 'UTC'
    },
    settings: {
      trackOpens: true,
      trackClicks: true,
      enableUnsubscribe: true
    }
  },
  {
    name: 'Monthly Newsletter',
    subject: 'Clutch Newsletter - Latest Updates & Tips',
    templateType: 'newsletter',
    status: 'draft',
    targetAudience: {
      segments: ['active'],
      tags: ['newsletter'],
      preferences: {
        newsletter: true
      }
    },
    content: {
      personalization: {
        firstName: true,
        totalOrders: true
      },
      cta: {
        text: 'Read More',
        url: 'https://clutch.com/blog'
      }
    },
    schedule: {
      type: 'recurring',
      frequency: 'monthly',
      dayOfMonth: 1,
      timezone: 'UTC'
    },
    settings: {
      trackOpens: true,
      trackClicks: true,
      enableUnsubscribe: true
    }
  },
  {
    name: 'Service Reminder',
    subject: 'Vehicle Maintenance Reminder - Clutch',
    templateType: 'maintenanceReminder',
    status: 'draft',
    targetAudience: {
      segments: ['active'],
      tags: ['service-reminder'],
      preferences: {
        serviceReminders: true
      }
    },
    content: {
      personalization: {
        firstName: true,
        vehicleInfo: true
      },
      cta: {
        text: 'Schedule Service',
        url: 'https://clutch.com/schedule'
      }
    },
    schedule: {
      type: 'triggered',
      trigger: 'maintenance-due',
      timezone: 'UTC'
    },
    settings: {
      trackOpens: true,
      trackClicks: true,
      enableUnsubscribe: true
    }
  }
];

const SAMPLE_AUTOMATIONS = [
  {
    name: 'Welcome Series',
    description: 'Automated welcome emails for new subscribers',
    triggers: [
      {
        type: 'subscriber_created',
        conditions: {
          tags: ['new-customer']
        }
      }
    ],
    steps: [
      {
        order: 1,
        type: 'email',
        delay: 0,
        templateType: 'welcome',
        subject: 'Welcome to Clutch!'
      },
      {
        order: 2,
        type: 'email',
        delay: 86400000, // 24 hours
        templateType: 'newsletter',
        subject: 'Getting Started with Clutch'
      },
      {
        order: 3,
        type: 'email',
        delay: 604800000, // 7 days
        templateType: 'promotional',
        subject: 'Special Offer for New Customers'
      }
    ],
    status: 'active',
    settings: {
      maxExecutions: 1,
      stopOnUnsubscribe: true
    }
  },
  {
    name: 'Abandoned Cart Recovery',
    description: 'Recover abandoned shopping carts',
    triggers: [
      {
        type: 'cart_abandoned',
        conditions: {
          cartValue: { $gte: 50 }
        }
      }
    ],
    steps: [
      {
        order: 1,
        type: 'email',
        delay: 3600000, // 1 hour
        templateType: 'abandonedCart',
        subject: 'Complete Your Purchase - Clutch'
      },
      {
        order: 2,
        type: 'email',
        delay: 86400000, // 24 hours
        templateType: 'abandonedCart',
        subject: 'Your Cart is Waiting - 10% Off!'
      }
    ],
    status: 'active',
    settings: {
      maxExecutions: 2,
      stopOnPurchase: true
    }
  },
  {
    name: 'Birthday Campaign',
    description: 'Send birthday wishes to customers',
    triggers: [
      {
        type: 'birthday',
        conditions: {
          preferences: {
            promotions: true
          }
        }
      }
    ],
    steps: [
      {
        order: 1,
        type: 'email',
        delay: 0,
        templateType: 'birthday',
        subject: 'Happy Birthday from Clutch!'
      }
    ],
    status: 'active',
    settings: {
      maxExecutions: 1,
      stopOnUnsubscribe: true
    }
  }
];

const SAMPLE_SEGMENTS = [
  {
    name: 'New Customers',
    description: 'Customers who joined in the last 30 days',
    criteria: {
      signupDate: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    tags: ['new-customer'],
    status: 'active'
  },
  {
    name: 'Premium Customers',
    description: 'Customers with high loyalty points or multiple orders',
    criteria: {
      $or: [
        { 'metadata.loyaltyPoints': { $gte: 500 } },
        { 'metadata.totalOrders': { $gte: 5 } }
      ]
    },
    tags: ['premium'],
    status: 'active'
  },
  {
    name: 'Inactive Customers',
    description: 'Customers who haven\'t been active in 90 days',
    criteria: {
      'metadata.lastActivity': {
        $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }
    },
    tags: ['inactive'],
    status: 'active'
  },
  {
    name: 'Service Reminder Subscribers',
    description: 'Customers who opted in for service reminders',
    criteria: {
      'preferences.serviceReminders': true
    },
    tags: ['service-reminder'],
    status: 'active'
  }
];

async function setupEmailMarketing() {
  console.log('🚀 Starting Email Marketing Service Setup...');
  
  try {
    // Initialize email marketing service
    const emailMarketingService = new EmailMarketingService();
    await emailMarketingService.initialize();
    console.log('✅ Email Marketing Service initialized');
    
    // Initialize email transporter
    await initializeTransporter();
    console.log('✅ Email transporter initialized');
    
    // Add sample subscribers
    console.log('\n📧 Adding sample subscribers...');
    for (const subscriber of SAMPLE_SUBSCRIBERS) {
      const result = await emailMarketingService.addSubscriber(subscriber);
      if (result.success) {
        console.log(`✅ Added subscriber: ${subscriber.email}`);
      } else {
        console.log(`❌ Failed to add subscriber ${subscriber.email}: ${result.error}`);
      }
    }
    
    // Create sample segments
    console.log('\n🏷️ Creating sample segments...');
    for (const segment of SAMPLE_SEGMENTS) {
      const result = await emailMarketingService.createSegment(segment);
      if (result.success) {
        console.log(`✅ Created segment: ${segment.name}`);
      } else {
        console.log(`❌ Failed to create segment ${segment.name}: ${result.error}`);
      }
    }
    
    // Create sample campaigns
    console.log('\n📢 Creating sample campaigns...');
    for (const campaign of SAMPLE_CAMPAIGNS) {
      const result = await emailMarketingService.createCampaign(campaign);
      if (result.success) {
        console.log(`✅ Created campaign: ${campaign.name}`);
      } else {
        console.log(`❌ Failed to create campaign ${campaign.name}: ${result.error}`);
      }
    }
    
    // Create sample automations
    console.log('\n🤖 Creating sample automations...');
    for (const automation of SAMPLE_AUTOMATIONS) {
      const result = await emailMarketingService.createAutomation(automation);
      if (result.success) {
        console.log(`✅ Created automation: ${automation.name}`);
      } else {
        console.log(`❌ Failed to create automation ${automation.name}: ${result.error}`);
      }
    }
    
    // Test email sending
    console.log('\n🧪 Testing email sending...');
    const testResult = await emailMarketingService.sendTestEmail('YourClutchauto@gmail.com');
    if (testResult.success) {
      console.log('✅ Test email sent successfully');
    } else {
      console.log(`❌ Test email failed: ${testResult.error}`);
    }
    
    // Generate analytics report
    console.log('\n📊 Generating analytics report...');
    const analytics = await emailMarketingService.getAnalytics();
    console.log('📈 Analytics Summary:');
    console.log(`- Total Subscribers: ${analytics.subscribers.total}`);
    console.log(`- Active Subscribers: ${analytics.subscribers.active}`);
    console.log(`- Total Campaigns: ${analytics.campaigns.total}`);
    console.log(`- Total Automations: ${analytics.automations.total}`);
    console.log(`- Total Segments: ${analytics.segments.total}`);
    
    console.log('\n🎉 Email Marketing Service Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email (YourClutchauto@gmail.com) for the test email');
    console.log('2. Review the created campaigns in the admin panel');
    console.log('3. Test automation workflows');
    console.log('4. Monitor analytics and engagement metrics');
    console.log('5. Customize templates and content as needed');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupEmailMarketing();
}

module.exports = {
  setupEmailMarketing,
  SAMPLE_SUBSCRIBERS,
  SAMPLE_CAMPAIGNS,
  SAMPLE_AUTOMATIONS,
  SAMPLE_SEGMENTS
};
