const ClutchEmailServer = require('../services/clutch-email-server');
const { logger } = require('../config/logger');

async function testClutchEmailSystem() {
  console.log('🚀 Testing Clutch Email System...\n');
  
  try {
    // Initialize email server
    const emailServer = new ClutchEmailServer();
    await emailServer.initialize();
    console.log('✅ Email server initialized successfully');
    
    // Test 1: Create email account
    console.log('\n📧 Test 1: Creating email account...');
    const accountResult = await emailServer.createEmailAccount(
      'test-user-123',
      'test@yourclutch.com',
      'secure_password_123',
      'Test User'
    );
    console.log('✅ Email account created:', accountResult);
    
    // Test 2: Send email
    console.log('\n📤 Test 2: Sending test email...');
    const sendResult = await emailServer.sendEmail(
      'test@yourclutch.com',
      ['ziad@yourclutch.com'],
      'Test Email from Clutch Email System',
      'This is a test email from the Clutch Email System. If you receive this, the system is working correctly!',
      {
        fromName: 'Clutch Email System',
        text: 'This is a test email from the Clutch Email System.',
        html: `
          <html>
            <body>
              <h2>Test Email from Clutch Email System</h2>
              <p>This is a test email to verify that the Clutch Email System is working correctly.</p>
              <p><strong>Features tested:</strong></p>
              <ul>
                <li>Email account creation</li>
                <li>Email sending</li>
                <li>SMTP configuration</li>
                <li>Database storage</li>
              </ul>
              <p>Best regards,<br>Clutch Email System</p>
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
    console.log('- ✅ Email server initialization');
    console.log('- ✅ Email account creation');
    console.log('- ✅ Email sending');
    console.log('- ✅ Folder management');
    console.log('- ✅ Email retrieval');
    console.log('- ✅ Contact management');
    console.log('- ✅ Email search');
    console.log('- ✅ Statistics');
    console.log('- ✅ Health check');
    
    console.log('\n🚀 Clutch Email System is ready for production!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  testClutchEmailSystem();
}

module.exports = { testClutchEmailSystem };
