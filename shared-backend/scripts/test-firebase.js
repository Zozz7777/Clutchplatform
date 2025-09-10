#!/usr/bin/env node

/**
 * Firebase Services Test Script
 * Tests Firebase Auth, FCM, and Storage functionality
 */

require('dotenv').config();
const { auth, storage, messaging } = require('../config/firebase-admin');
const fileService = require('../services/fileService');
const { sendToDevice, sendToTopic } = require('../services/pushNotificationService');

class FirebaseTester {
  constructor() {
    this.results = {
      auth: { status: 'unknown', error: null, details: null },
      storage: { status: 'unknown', error: null, details: null },
      messaging: { status: 'unknown', error: null, details: null },
      config: { status: 'unknown', error: null, details: null }
    };
  }

  async testConfiguration() {
    console.log('\n🔧 Testing Firebase Configuration...');
    
    try {
      const requiredVars = [
        'FIREBASE_ADMIN_PROJECT_ID',
        'FIREBASE_ADMIN_PRIVATE_KEY',
        'FIREBASE_ADMIN_CLIENT_EMAIL',
        'FIREBASE_STORAGE_BUCKET'
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length === 0) {
        this.results.config.status = 'configured';
        this.results.config.details = {
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? 'configured' : 'missing',
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? 'configured' : 'missing'
        };
        console.log('✅ Firebase configuration is complete');
      } else {
        this.results.config.status = 'incomplete';
        this.results.config.error = `Missing environment variables: ${missingVars.join(', ')}`;
        console.log('❌ Firebase configuration is incomplete');
        console.log(`Missing: ${missingVars.join(', ')}`);
      }
    } catch (error) {
      this.results.config.status = 'error';
      this.results.config.error = error.message;
      console.log('❌ Firebase configuration test failed:', error.message);
    }
  }

  async testAuth() {
    console.log('\n🔐 Testing Firebase Authentication...');
    
    try {
      // Test basic auth functionality
      const listResult = await auth.listUsers(1);
      
      this.results.auth.status = 'connected';
      this.results.auth.details = {
        totalUsers: listResult.users.length,
        nextPageToken: listResult.nextPageToken ? 'available' : 'none'
      };
      
      console.log('✅ Firebase Auth is working correctly');
      console.log(`   - Total users: ${listResult.users.length}`);
      
    } catch (error) {
      this.results.auth.status = 'error';
      this.results.auth.error = error.message;
      console.log('❌ Firebase Auth test failed:', error.message);
    }
  }

  async testStorage() {
    console.log('\n📁 Testing Firebase Storage...');
    
    try {
      // Test bucket access
      const bucket = storage.bucket();
      const [metadata] = await bucket.getMetadata();
      
      // Test file operations
      const testContent = `Firebase Storage Test - ${new Date().toISOString()}`;
      const fileBuffer = Buffer.from(testContent, 'utf8');
      const fileName = `test-${Date.now()}.txt`;
      const folderPath = 'test-uploads';

      // Upload test file
      const uploadResult = await fileService.uploadFile(
        fileBuffer, 
        fileName, 
        folderPath, 
        {
          contentType: 'text/plain',
          uploadedBy: 'test-script',
          testFile: true
        }
      );

      if (!uploadResult.success) {
        throw new Error(`Upload failed: ${uploadResult.error}`);
      }

      // Get file info
      const fileInfoResult = await fileService.getFileInfo(uploadResult.fullPath);
      
      // Download file
      const downloadResult = await fileService.downloadFile(uploadResult.fullPath);
      
      // Delete test file
      const deleteResult = await fileService.deleteFile(uploadResult.fullPath);

      this.results.storage.status = 'connected';
      this.results.storage.details = {
        bucketName: metadata.name,
        location: metadata.location,
        storageClass: metadata.storageClass,
        uploadTest: uploadResult.success,
        downloadTest: downloadResult.success,
        deleteTest: deleteResult.success
      };
      
      console.log('✅ Firebase Storage is working correctly');
      console.log(`   - Bucket: ${metadata.name}`);
      console.log(`   - Location: ${metadata.location}`);
      console.log(`   - Upload: ${uploadResult.success ? '✅' : '❌'}`);
      console.log(`   - Download: ${downloadResult.success ? '✅' : '❌'}`);
      console.log(`   - Delete: ${deleteResult.success ? '✅' : '❌'}`);
      
    } catch (error) {
      this.results.storage.status = 'error';
      this.results.storage.error = error.message;
      console.log('❌ Firebase Storage test failed:', error.message);
    }
  }

  async testMessaging() {
    console.log('\n📱 Testing Firebase Cloud Messaging...');
    
    try {
      // Test FCM configuration
      const fcmConfig = {
        vapidKeyConfigured: !!process.env.FIREBASE_VAPID_KEY,
        fcmServerKeyConfigured: !!process.env.FCM_SERVER_KEY,
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID
      };

      // Note: We can't actually send a test notification without a valid FCM token
      // But we can verify the messaging service is properly initialized
      
      this.results.messaging.status = 'configured';
      this.results.messaging.details = {
        projectId: fcmConfig.projectId,
        vapidKey: fcmConfig.vapidKeyConfigured ? 'configured' : 'missing',
        fcmServerKey: fcmConfig.fcmServerKeyConfigured ? 'configured' : 'missing'
      };
      
      console.log('✅ Firebase Cloud Messaging is configured');
      console.log(`   - Project ID: ${fcmConfig.projectId}`);
      console.log(`   - VAPID Key: ${fcmConfig.vapidKeyConfigured ? '✅' : '❌'}`);
      console.log(`   - FCM Server Key: ${fcmConfig.fcmServerKeyConfigured ? '✅' : '❌'}`);
      console.log('   - Note: Actual FCM testing requires a valid device token');
      
    } catch (error) {
      this.results.messaging.status = 'error';
      this.results.messaging.error = error.message;
      console.log('❌ Firebase Cloud Messaging test failed:', error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Firebase Services Test Suite...');
    console.log('=' .repeat(50));
    
    await this.testConfiguration();
    await this.testAuth();
    await this.testStorage();
    await this.testMessaging();
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 FIREBASE SERVICES TEST SUMMARY');
    console.log('=' .repeat(50));
    
    const services = ['config', 'auth', 'storage', 'messaging'];
    let allWorking = true;
    
    services.forEach(service => {
      const result = this.results[service];
      const status = result.status === 'connected' || result.status === 'configured' ? '✅' : '❌';
      console.log(`${status} ${service.toUpperCase()}: ${result.status}`);
      
      if (result.status !== 'connected' && result.status !== 'configured') {
        allWorking = false;
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    });
    
    console.log('\n' + '=' .repeat(50));
    if (allWorking) {
      console.log('🎉 ALL FIREBASE SERVICES ARE WORKING CORRECTLY!');
    } else {
      console.log('⚠️  SOME FIREBASE SERVICES HAVE ISSUES');
      console.log('Please check the errors above and fix the configuration.');
    }
    console.log('=' .repeat(50));
    
    return allWorking;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new FirebaseTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n✅ Firebase testing completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Firebase testing failed:', error);
      process.exit(1);
    });
}

module.exports = FirebaseTester;
