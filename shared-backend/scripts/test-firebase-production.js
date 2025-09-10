#!/usr/bin/env node

/**
 * Production Firebase Testing Script
 * Tests Firebase Auth with real tokens and FCM with device tokens
 */

require('dotenv').config();
const { auth, storage, messaging } = require('../config/firebase-admin');
const fileService = require('../services/fileService');
const { sendToDevice, sendToTopic, subscribeToTopic } = require('../services/pushNotificationService');

class ProductionFirebaseTester {
  constructor() {
    this.results = {
      auth: { status: 'unknown', error: null, details: null },
      storage: { status: 'unknown', error: null, details: null },
      messaging: { status: 'unknown', error: null, details: null },
      config: { status: 'unknown', error: null, details: null }
    };
  }

  async testWithRealFirebaseToken(firebaseToken) {
    console.log('\n🔐 Testing with Real Firebase Token...');
    
    if (!firebaseToken) {
      console.log('❌ No Firebase token provided. Skipping real token test.');
      return { success: false, error: 'No Firebase token provided' };
    }

    try {
      console.log('Verifying Firebase token...');
      const decodedToken = await auth.verifyIdToken(firebaseToken);
      
      console.log('✅ Firebase token verification successful!');
      console.log(`   - UID: ${decodedToken.uid}`);
      console.log(`   - Email: ${decodedToken.email || 'Not provided'}`);
      console.log(`   - Email Verified: ${decodedToken.email_verified || false}`);
      console.log(`   - Provider: ${decodedToken.sign_in_provider || 'Unknown'}`);
      console.log(`   - Auth Time: ${new Date(decodedToken.auth_time * 1000).toISOString()}`);
      console.log(`   - Issued At: ${new Date(decodedToken.iat * 1000).toISOString()}`);
      console.log(`   - Expires At: ${new Date(decodedToken.exp * 1000).toISOString()}`);
      
      return {
        success: true,
        data: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          providerId: decodedToken.provider_id,
          signInProvider: decodedToken.sign_in_provider,
          authTime: decodedToken.auth_time,
          issuedAt: decodedToken.iat,
          expiresAt: decodedToken.exp
        }
      };
    } catch (error) {
      console.log('❌ Firebase token verification failed:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async testWithRealFCMToken(fcmToken, topic = 'test_topic') {
    console.log('\n📱 Testing with Real FCM Device Token...');
    
    if (!fcmToken) {
      console.log('❌ No FCM token provided. Skipping real FCM test.');
      return { success: false, error: 'No FCM token provided' };
    }

    try {
      console.log('Sending test notification to device...');
      
      // Test 1: Send notification to device
      const deviceResult = await sendToDevice(fcmToken, 'SYSTEM_UPDATE', {
        title: 'Production Test Notification',
        body: 'This is a test notification from your production backend!',
        data: {
          testId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: 'production_test'
        }
      });

      if (!deviceResult.success) {
        throw new Error(`Device notification failed: ${deviceResult.error}`);
      }

      console.log('✅ Device notification sent successfully!');
      console.log(`   - Message ID: ${deviceResult.messageId}`);
      console.log(`   - FCM Token: ${fcmToken.substring(0, 20)}...`);

      // Test 2: Subscribe to topic
      console.log('Subscribing device to topic...');
      const subscribeResult = await subscribeToTopic([fcmToken], topic);
      
      if (subscribeResult.success) {
        console.log('✅ Topic subscription successful!');
        console.log(`   - Success Count: ${subscribeResult.successCount}`);
        console.log(`   - Failure Count: ${subscribeResult.failureCount}`);
        console.log(`   - Topic: ${topic}`);
      }

      // Test 3: Send notification to topic
      console.log('Sending notification to topic...');
      const topicResult = await sendToTopic(topic, 'SYSTEM_UPDATE', {
        title: 'Topic Test Notification',
        body: 'This is a test notification sent to the topic!',
        data: {
          testId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: 'topic_test'
        }
      });

      if (topicResult.success) {
        console.log('✅ Topic notification sent successfully!');
        console.log(`   - Message ID: ${topicResult.messageId}`);
        console.log(`   - Topic: ${topic}`);
      }

      return {
        success: true,
        data: {
          deviceNotification: deviceResult,
          topicSubscription: subscribeResult,
          topicNotification: topicResult
        }
      };
    } catch (error) {
      console.log('❌ FCM test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testFileUploadWithRealFile(filePath, fileName) {
    console.log('\n📁 Testing File Upload with Real File...');
    
    if (!filePath) {
      console.log('❌ No file path provided. Skipping real file upload test.');
      return { success: false, error: 'No file path provided' };
    }

    try {
      const fs = require('fs');
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      const stats = fs.statSync(filePath);
      
      console.log(`Uploading file: ${fileName || path.basename(filePath)}`);
      console.log(`   - Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   - Type: ${path.extname(filePath)}`);

      // Upload file
      const uploadResult = await fileService.uploadFile(
        fileBuffer,
        fileName || path.basename(filePath),
        'production-test-uploads',
        {
          contentType: this.getContentType(path.extname(filePath)),
          uploadedBy: 'production-test',
          originalPath: filePath,
          fileSize: stats.size
        }
      );

      if (!uploadResult.success) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }

      console.log('✅ File upload successful!');
      console.log(`   - File ID: ${uploadResult.fileId}`);
      console.log(`   - Public URL: ${uploadResult.publicUrl}`);
      console.log(`   - Size: ${uploadResult.size} bytes`);

      // Get file info
      const fileInfoResult = await fileService.getFileInfo(uploadResult.fullPath);
      
      if (fileInfoResult.success) {
        console.log('✅ File info retrieved successfully!');
        console.log(`   - Content Type: ${fileInfoResult.contentType}`);
        console.log(`   - Created At: ${fileInfoResult.createdAt}`);
      }

      // Clean up - delete test file
      console.log('Cleaning up test file...');
      const deleteResult = await fileService.deleteFile(uploadResult.fullPath);
      
      if (deleteResult.success) {
        console.log('✅ Test file cleaned up successfully!');
      }

      return {
        success: true,
        data: {
          upload: uploadResult,
          fileInfo: fileInfoResult,
          delete: deleteResult
        }
      };
    } catch (error) {
      console.log('❌ File upload test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getContentType(extension) {
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg'
    };
    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  async runProductionTests(options = {}) {
    console.log('🚀 Starting Production Firebase Tests...');
    console.log('=' .repeat(60));
    
    const { firebaseToken, fcmToken, filePath, fileName } = options;
    
    // Test 1: Real Firebase Token
    if (firebaseToken) {
      await this.testWithRealFirebaseToken(firebaseToken);
    } else {
      console.log('\n⚠️  No Firebase token provided. Skipping real token tests.');
      console.log('   To test with real tokens, provide: --firebase-token=YOUR_TOKEN');
    }

    // Test 2: Real FCM Token
    if (fcmToken) {
      await this.testWithRealFCMToken(fcmToken);
    } else {
      console.log('\n⚠️  No FCM token provided. Skipping real FCM tests.');
      console.log('   To test with real FCM, provide: --fcm-token=YOUR_FCM_TOKEN');
    }

    // Test 3: Real File Upload
    if (filePath) {
      await this.testFileUploadWithRealFile(filePath, fileName);
    } else {
      console.log('\n⚠️  No file path provided. Skipping real file upload tests.');
      console.log('   To test with real files, provide: --file-path=PATH_TO_FILE');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 PRODUCTION FIREBASE TESTS COMPLETED');
    console.log('=' .repeat(60));
    
    if (!firebaseToken && !fcmToken && !filePath) {
      console.log('💡 Usage Examples:');
      console.log('   node scripts/test-firebase-production.js --firebase-token=YOUR_TOKEN');
      console.log('   node scripts/test-firebase-production.js --fcm-token=YOUR_FCM_TOKEN');
      console.log('   node scripts/test-firebase-production.js --file-path=./test-image.jpg');
      console.log('   node scripts/test-firebase-production.js --firebase-token=YOUR_TOKEN --fcm-token=YOUR_FCM_TOKEN');
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  args.forEach(arg => {
    if (arg.startsWith('--firebase-token=')) {
      options.firebaseToken = arg.split('=')[1];
    } else if (arg.startsWith('--fcm-token=')) {
      options.fcmToken = arg.split('=')[1];
    } else if (arg.startsWith('--file-path=')) {
      options.filePath = arg.split('=')[1];
    } else if (arg.startsWith('--file-name=')) {
      options.fileName = arg.split('=')[1];
    }
  });
  
  return options;
}

// Run tests if this script is executed directly
if (require.main === module) {
  const options = parseArgs();
  const tester = new ProductionFirebaseTester();
  
  tester.runProductionTests(options)
    .then(() => {
      console.log('\n✅ Production Firebase testing completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Production Firebase testing failed:', error);
      process.exit(1);
    });
}

module.exports = ProductionFirebaseTester;
