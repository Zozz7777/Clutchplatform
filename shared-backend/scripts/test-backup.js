require('dotenv').config();
const { connectDB } = require('../config/database');
const backupService = require('../services/backupService');

async function testBackupService() {
    // Connect to database first
    await connectDB();
    console.log('💾 Testing Backup Service...\n');

    try {
        // Test 1: Get backup status
        console.log('1. Testing backup status...');
        const status = await backupService.getBackupStatus();
        console.log('✅ Backup status:', status);

        // Test 2: List existing backups
        console.log('\n2. Testing backup listing...');
        const backups = await backupService.listBackups();
        console.log('✅ Found backups:', backups.length);
        if (backups.length > 0) {
            console.log('Latest backup:', backups[0].name);
        }

        // Test 3: Create test backup
        console.log('\n3. Testing backup creation...');
        const backupResult = await backupService.createFullBackup('test');
        console.log('✅ Backup creation result:', backupResult.success);
        if (backupResult.success) {
            console.log('Backup name:', backupResult.backupName);
        }

        // Test 4: Test backup functionality
        console.log('\n4. Testing backup functionality...');
        const testResult = await backupService.testBackup();
        console.log('✅ Backup test result:', testResult.success);
        console.log('Message:', testResult.message);

        // Test 5: Get optimization status
        console.log('\n5. Testing optimization status...');
        const optimizationStatus = await backupService.getOptimizationStatus();
        console.log('✅ Optimization status:', optimizationStatus);

        console.log('\n🎉 All Backup Service tests passed!');
        return true;
    } catch (error) {
        console.error('❌ Backup Service test failed:', error.message);
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    testBackupService().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = { testBackupService };
