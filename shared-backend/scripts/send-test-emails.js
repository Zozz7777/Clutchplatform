const EmailMarketingService = require('../services/email-marketing-service');
const { initializeTransporter, getTransporter } = require('../config/email-config');

// Test email configurations
const TEST_EMAILS = [
  {
    name: 'Welcome Email',
    templateType: 'welcome',
    subject: 'Welcome to Clutch - Your Automotive Service Companion',
    data: {
      firstName: 'Ziad',
      lastName: 'Clutch',
      loyaltyPoints: 100,
      ctaText: 'Explore Our Services',
      ctaUrl: 'https://clutch.com/services'
    }
  },
  {
    name: 'Service Reminder',
    templateType: 'maintenanceReminder',
    subject: 'Vehicle Maintenance Reminder - Clutch',
    data: {
      firstName: 'Ziad',
      vehicleInfo: {
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        mileage: '45,000'
      },
      nextService: 'Oil Change',
      dueDate: '2024-02-15',
      ctaText: 'Schedule Service',
      ctaUrl: 'https://clutch.com/schedule'
    }
  },
  {
    name: 'Newsletter',
    templateType: 'newsletter',
    subject: 'Clutch Newsletter - Latest Updates & Tips',
    data: {
      firstName: 'Ziad',
      totalOrders: 5,
      featuredContent: [
        {
          title: 'Winter Car Care Tips',
          description: 'Keep your vehicle running smoothly in cold weather',
          image: 'https://clutch.com/images/winter-care.jpg'
        },
        {
          title: 'New Service Packages',
          description: 'Exclusive deals on maintenance packages',
          image: 'https://clutch.com/images/service-packages.jpg'
        }
      ],
      ctaText: 'Read More',
      ctaUrl: 'https://clutch.com/blog'
    }
  },
  {
    name: 'Promotional Offer',
    templateType: 'promotional',
    subject: 'Special Offer - 20% Off Your Next Service',
    data: {
      firstName: 'Ziad',
      offerTitle: 'Winter Service Special',
      discount: '20%',
      validUntil: '2024-02-28',
      services: ['Oil Change', 'Brake Inspection', 'Tire Rotation'],
      ctaText: 'Claim Offer',
      ctaUrl: 'https://clutch.com/offers/winter-special'
    }
  },
  {
    name: 'Order Confirmation',
    templateType: 'orderConfirmation',
    subject: 'Order Confirmation - Clutch',
    data: {
      firstName: 'Ziad',
      orderNumber: 'CL-2024-001',
      orderDate: '2024-01-15',
      items: [
        {
          name: 'Premium Oil Change',
          price: 89.99,
          quantity: 1
        },
        {
          name: 'Brake Inspection',
          price: 49.99,
          quantity: 1
        }
      ],
      total: 139.98,
      ctaText: 'Track Order',
      ctaUrl: 'https://clutch.com/orders/CL-2024-001'
    }
  },
  {
    name: 'Birthday Wish',
    templateType: 'birthday',
    subject: 'Happy Birthday from Clutch!',
    data: {
      firstName: 'Ziad',
      specialOffer: '15% off any service',
      validUntil: '2024-02-15',
      ctaText: 'Claim Birthday Offer',
      ctaUrl: 'https://clutch.com/offers/birthday'
    }
  },
  {
    name: 'Abandoned Cart Recovery',
    templateType: 'abandonedCart',
    subject: 'Complete Your Purchase - Clutch',
    data: {
      firstName: 'Ziad',
      cartItems: [
        {
          name: 'Premium Oil Change',
          price: 89.99
        },
        {
          name: 'Air Filter Replacement',
          price: 29.99
        }
      ],
      cartTotal: 119.98,
      discount: '10%',
      ctaText: 'Complete Purchase',
      ctaUrl: 'https://clutch.com/cart'
    }
  },
  {
    name: 'Password Reset',
    templateType: 'passwordReset',
    subject: 'Password Reset Request - Clutch',
    data: {
      firstName: 'Ziad',
      resetLink: 'https://clutch.com/reset-password?token=abc123',
      expiresIn: '24 hours',
      ctaText: 'Reset Password',
      ctaUrl: 'https://clutch.com/reset-password?token=abc123'
    }
  }
];

async function sendTestEmails() {
  console.log('🚀 Starting Email Marketing Test Suite...');
  
  try {
    // Initialize email marketing service
    const emailMarketingService = new EmailMarketingService();
    await emailMarketingService.initialize();
    console.log('✅ Email Marketing Service initialized');
    
    // Initialize email transporter
    await initializeTransporter();
    console.log('✅ Email transporter initialized');
    
    const targetEmail = 'ziad@yourclutch.com';
    console.log(`📧 Sending test emails to: ${targetEmail}`);
    
    // Send each test email
    for (const testEmail of TEST_EMAILS) {
      try {
        console.log(`\n📤 Sending: ${testEmail.name}`);
        
        // Generate email content using the template
        const htmlContent = emailMarketingService.templateGenerator.generateTemplate(
          testEmail.templateType,
          testEmail.data
        );
        
        // Send the email
        const transporter = getTransporter();
        const mailOptions = {
          from: '"Clutch Automotive" <YourClutchauto@gmail.com>',
          to: targetEmail,
          subject: testEmail.subject,
          html: htmlContent
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ ${testEmail.name} sent successfully!`);
        console.log(`   Message ID: ${result.messageId}`);
        
        // Wait 2 seconds between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to send ${testEmail.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Email Marketing Test Suite Complete!');
    console.log('\n📋 Test Summary:');
    console.log(`- Target Email: ${targetEmail}`);
    console.log(`- Templates Tested: ${TEST_EMAILS.length}`);
    console.log('- Email Types: Welcome, Service Reminder, Newsletter, Promotional, Order Confirmation, Birthday, Abandoned Cart, Password Reset');
    console.log('\n📧 Check your email inbox for the test emails!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  sendTestEmails();
}

module.exports = { sendTestEmails, TEST_EMAILS };
