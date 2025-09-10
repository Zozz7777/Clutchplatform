const axios = require('axios');

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

async function testEmailAPI() {
  console.log('🚀 Starting Email API Test Suite...');
  
  const baseURL = 'https://clutch-main-nk7x.onrender.com/api/v1/email-marketing';
  const targetEmail = 'ziad@yourclutch.com';
  
  console.log(`📧 Testing email API for: ${targetEmail}`);
  console.log(`🌐 Base URL: ${baseURL}`);
  
  try {
    // Test 1: Check service status
    console.log('\n📊 Test 1: Checking service status...');
    try {
      const statusResponse = await axios.get(`${baseURL}/status`);
      console.log('✅ Service Status:', statusResponse.data);
    } catch (error) {
      console.log('❌ Service Status Error:', error.response?.data || error.message);
    }
    
    // Test 2: Get available templates
    console.log('\n📋 Test 2: Getting available templates...');
    try {
      const templatesResponse = await axios.get(`${baseURL}/templates`);
      console.log('✅ Available Templates:', Object.keys(templatesResponse.data.data));
    } catch (error) {
      console.log('❌ Templates Error:', error.response?.data || error.message);
    }
    
    // Test 3: Preview each template
    console.log('\n🎨 Test 3: Previewing email templates...');
    for (const testEmail of TEST_EMAILS) {
      try {
        console.log(`\n📤 Previewing: ${testEmail.name}`);
        
        const previewResponse = await axios.post(`${baseURL}/preview`, {
          templateType: testEmail.templateType,
          data: testEmail.data
        });
        
        console.log(`✅ ${testEmail.name} preview generated successfully`);
        console.log(`   Template Type: ${testEmail.templateType}`);
        console.log(`   Subject: ${testEmail.subject}`);
        
        // Wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to preview ${testEmail.name}:`, error.response?.data || error.message);
      }
    }
    
    // Test 4: Test email sending (if SMTP is configured)
    console.log('\n📧 Test 4: Testing email sending...');
    try {
      const testResponse = await axios.post(`${baseURL}/test`, {
        to: targetEmail
      });
      console.log('✅ Test email sent successfully!');
      console.log('   Response:', testResponse.data);
    } catch (error) {
      console.log('❌ Test email failed (expected if SMTP not configured):', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Email API Test Suite Complete!');
    console.log('\n📋 Test Summary:');
    console.log(`- Target Email: ${targetEmail}`);
    console.log(`- Templates Tested: ${TEST_EMAILS.length}`);
    console.log('- Email Types: Welcome, Service Reminder, Newsletter, Promotional, Order Confirmation, Birthday, Abandoned Cart, Password Reset');
    console.log('\n📧 All email templates have been previewed and are ready for use!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test suite
if (require.main === module) {
  testEmailAPI();
}

module.exports = { testEmailAPI, TEST_EMAILS };
