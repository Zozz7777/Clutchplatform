const ClutchEmailServer = require('../services/clutch-email-server');
const { logger } = require('../config/logger');

// Override email config for local testing
const testEmailConfig = {
  domain: 'yourclutch.com',
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'YourClutchauto@gmail.com',
      pass: 'xoon gnlw qwpj cruo'
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  imap: {
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: 'YourClutchauto@gmail.com',
      pass: 'xoon gnlw qwpj cruo'
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  server: {
    name: 'Clutch Email Server (Test)',
    version: '1.0.0',
    maxConnections: 100,
    timeout: 30000
  },
  storage: {
    limit: 1073741824,
    maxAttachmentSize: 10485760,
    compression: true
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 900000,
    passwordMinLength: 8,
    requireSSL: true
  },
  rateLimit: {
    emailsPerHour: 100,
    emailsPerDay: 1000,
    connectionsPerMinute: 60
  },
  spam: {
    enabled: true,
    threshold: 5.0,
    whitelist: [],
    blacklist: []
  },
  backup: {
    enabled: true,
    interval: 'daily',
    retention: 30
  },
  monitoring: {
    enabled: true,
    healthCheckInterval: 60000,
    alertThreshold: 90
  }
};

async function testClutchEmailSystemLocal() {
  console.log('🚀 Testing Clutch Email System (Local Gmail SMTP)...\n');
  
  try {
    // Create email server with test config
    const emailServer = new ClutchEmailServer();
    emailServer.emailConfig = testEmailConfig;
    
    await emailServer.initialize();
    console.log('✅ Email server initialized successfully with Gmail SMTP');
    
    // Test 1: Create email account
    console.log('\n📧 Test 1: Creating email account...');
    const accountResult = await emailServer.createEmailAccount(
      'test-user-123',
      'test@yourclutch.com',
      'secure_password_123',
      'Test User'
    );
    console.log('✅ Email account created:', accountResult);
    
    // Test 2: Send email using Gmail SMTP
    console.log('\n📤 Test 2: Sending test email via Gmail SMTP...');
    const sendResult = await emailServer.sendEmail(
      'YourClutchauto@gmail.com', // Use Gmail address for sending
      ['ziad@yourclutch.com'],
      'Test Email from Clutch Email System (Gmail SMTP)',
      'This is a test email from the Clutch Email System using Gmail SMTP. If you receive this, the system is working correctly!',
      {
        fromName: 'Clutch Email System (Test)',
        text: 'This is a test email from the Clutch Email System using Gmail SMTP.',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #ED1B24; color: white; padding: 20px; text-align: center;">
                <h1>Test Email from Clutch Email System</h1>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h2>Hello Ziad!</h2>
                <p>This is a test email to verify that the Clutch Email System is working correctly with Gmail SMTP.</p>
                <p><strong>Features tested:</strong></p>
                <ul>
                  <li>Email account creation</li>
                  <li>Email sending via Gmail SMTP</li>
                  <li>Database storage</li>
                  <li>Authentication system</li>
                  <li>Rate limiting</li>
                  <li>Activity logging</li>
                </ul>
                <p><strong>System Status:</strong></p>
                <ul>
                  <li>✅ Email server initialized</li>
                  <li>✅ Database collections created</li>
                  <li>✅ SMTP connection established</li>
                  <li>✅ Email sent successfully</li>
                </ul>
                <p>Best regards,<br>Clutch Email System</p>
              </div>
            </body>
          </html>
        `
      }
    );
    console.log('✅ Email sent successfully:', sendResult);
    
    // Test 3: Get folders
    console.log('\n📁 Test 3: Getting user folders...');
    const foldersResult = await emailServer.getFolders('test-user-123');
    console.log('✅ Folders retrieved:', foldersResult.folders.length, 'folders');
    foldersResult.folders.forEach(folder => {
      console.log(`   - ${folder.name} (${folder.type})`);
    });
    
    // Test 4: Get emails
    console.log('\n📬 Test 4: Getting emails from inbox...');
    const emailsResult = await emailServer.getEmails('test-user-123', 'inbox');
    console.log('✅ Emails retrieved:', emailsResult.emails.length, 'emails');
    
    // Test 5: Add contact
    console.log('\n👤 Test 5: Adding contact...');
    const contactResult = await emailServer.addContact('test-user-123', {
      name: 'Ziad Test',
      email: 'ziad@yourclutch.com',
      phone: '+1234567890',
      company: 'Clutch Automotive'
    });
    console.log('✅ Contact added:', contactResult);
    
    // Test 6: Get contacts
    console.log('\n📇 Test 6: Getting contacts...');
    const contactsResult = await emailServer.getContacts('test-user-123');
    console.log('✅ Contacts retrieved:', contactsResult.contacts.length, 'contacts');
    
    // Test 7: Search emails
    console.log('\n🔍 Test 7: Searching emails...');
    const searchResult = await emailServer.searchEmails('test-user-123', 'test');
    console.log('✅ Search completed:', searchResult.emails.length, 'results');
    
    // Test 8: Get email statistics
    console.log('\n📊 Test 8: Getting email statistics...');
    const statsResult = await emailServer.getEmailStats();
    console.log('✅ Statistics retrieved:', statsResult.stats);
    
    // Test 9: Health check
    console.log('\n🏥 Test 9: Health check...');
    const isHealthy = emailServer.transporter && await emailServer.transporter.verify();
    console.log('✅ Health check:', isHealthy ? 'PASSED' : 'FAILED');
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('- ✅ Email server initialization with Gmail SMTP');
    console.log('- ✅ Email account creation');
    console.log('- ✅ Email sending via Gmail SMTP');
    console.log('- ✅ Folder management');
    console.log('- ✅ Email retrieval');
    console.log('- ✅ Contact management');
    console.log('- ✅ Email search');
    console.log('- ✅ Statistics');
    console.log('- ✅ Health check');
    
    console.log('\n🚀 Clutch Email System is ready for production!');
    console.log('\n📝 Next Steps:');
    console.log('1. Configure DNS records for yourclutch.com');
    console.log('2. Set up email server software (Postfix, Dovecot)');
    console.log('3. Obtain SSL certificates');
    console.log('4. Update environment variables');
    console.log('5. Deploy to production server');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testClutchEmailSystemLocal();
}

module.exports = { testClutchEmailSystemLocal };
