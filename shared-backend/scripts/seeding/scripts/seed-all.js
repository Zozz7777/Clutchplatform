const databaseConfig = require('../config/database-config');
const seedingConfig = require('../config/seeding-config');
const logoManager = require('../utils/logo-manager');

// Import all seeding modules
const OBDCodesSeeder = require('./seed-obd-codes');
const VehicleSeeder = require('./seed-vehicles');
const ServicesSeeder = require('./seed-services');
const LocationsSeeder = require('./seed-locations');
const PaymentsSeeder = require('./seed-payments');
const BusinessesSeeder = require('./seed-businesses');
const FeaturesSeeder = require('./seed-features');
const NotificationsSeeder = require('./seed-notifications');

class MasterSeeder {
  constructor() {
    this.stats = {
      startTime: null,
      endTime: null,
      totalDuration: 0,
      modules: {},
      errors: [],
      warnings: []
    };
    
    this.seeders = {
      obdCodes: new OBDCodesSeeder(),
      vehicles: new VehicleSeeder(),
      services: new ServicesSeeder(),
      locations: new LocationsSeeder(),
      payments: new PaymentsSeeder(),
      businesses: new BusinessesSeeder(),
      features: new FeaturesSeeder(),
      notifications: new NotificationsSeeder()
    };
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Clutch Platform Master Seeder...');
      console.log(`📅 Date: ${new Date().toISOString()}`);
      console.log(`🌍 Environment: ${seedingConfig.environment}`);
      console.log(`⚙️  Production Mode: ${seedingConfig.isProduction()}`);
      
      // Connect to database
      await databaseConfig.connect();
      
      // Initialize logo manager (optional - will use fallback URLs if Firebase is not available)
      try {
        await logoManager.initialize();
      } catch (error) {
        console.log('⚠️  Logo manager initialization failed, will use fallback URLs:', error.message);
      }
      
      // Create indexes
      await databaseConfig.createIndexes();
      
      // Health checks
      await this.performHealthChecks();
      
      console.log('✅ Master Seeder initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Master Seeder:', error);
      throw error;
    }
  }

  async performHealthChecks() {
    console.log('\n🏥 Performing health checks...');
    
    try {
      // Database health check
      const dbHealth = await databaseConfig.healthCheck();
      console.log(`   Database: ${dbHealth.status} - ${dbHealth.message}`);
      
      if (dbHealth.status !== 'healthy') {
        throw new Error(`Database health check failed: ${dbHealth.message}`);
      }
      
      // Firebase health check
      const firebaseHealth = await logoManager.healthCheck();
      console.log(`   Firebase: ${firebaseHealth.firebase.status} - ${firebaseHealth.firebase.message}`);
      
      // Logo manager health check
      console.log(`   Logo Manager: ${firebaseHealth.tempDir === 'accessible' ? 'OK' : 'NOT ACCESSIBLE'}`);
      
      console.log('✅ All health checks passed');
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }

  async seedAll() {
    try {
      this.stats.startTime = new Date();
      console.log('\n🎯 Starting comprehensive database seeding...');
      console.log(`⏰ Start time: ${this.stats.startTime.toISOString()}`);
      
      // Define seeding order based on dependencies
      const seedingOrder = [
        { name: 'obdCodes', priority: 'critical', description: 'OBD Error Codes' },
        { name: 'locations', priority: 'high', description: 'Cities and Areas' },
        { name: 'payments', priority: 'high', description: 'Payment Methods' },
        { name: 'vehicles', priority: 'high', description: 'Car Brands and Models' },
        { name: 'services', priority: 'medium', description: 'Service Categories and Types' },
        { name: 'businesses', priority: 'medium', description: 'Business Categories' },
        { name: 'features', priority: 'low', description: 'Feature Flags' },
        { name: 'notifications', priority: 'low', description: 'Notification Templates' }
      ];
      
      console.log('\n📋 Seeding Order:');
      seedingOrder.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.description} (${item.priority})`);
      });
      
      // Execute seeding in order
      for (const item of seedingOrder) {
        await this.seedModule(item);
      }
      
      // Final validation and cleanup
      await this.finalizeSeeding();
      
    } catch (error) {
      console.error('❌ Error during seeding process:', error);
      this.stats.errors.push({
        module: 'master',
        error: error.message,
        timestamp: new Date()
      });
      
      if (seedingConfig.isStrictMode()) {
        throw error;
      }
    }
  }

  async seedModule(moduleInfo) {
    const { name, description, priority } = moduleInfo;
    
    try {
      console.log(`\n🔧 Seeding ${description}...`);
      console.log(`   Priority: ${priority.toUpperCase()}`);
      
      const startTime = new Date();
      const seeder = this.seeders[name];
      
      if (!seeder) {
        throw new Error(`Seeder not found for module: ${name}`);
      }
      
      // Check if module is enabled
      if (!seedingConfig.isEnabled(name)) {
        console.log(`   ⏭️  Module disabled, skipping...`);
        this.stats.modules[name] = {
          status: 'skipped',
          reason: 'disabled',
          duration: 0
        };
        return;
      }
      
      // Initialize seeder
      await seeder.initialize();
      
      // Execute seeding
      let result;
      switch (name) {
        case 'obdCodes':
          result = await seeder.seedOBDCodes();
          break;
        case 'vehicles':
          result = await seeder.seedVehicles();
          break;
        case 'services':
          result = await seeder.seedServices();
          break;
        case 'locations':
          result = await seeder.seedLocations();
          break;
        case 'payments':
          result = await seeder.seedPayments();
          break;
        case 'businesses':
          result = await seeder.seedBusinesses();
          break;
        case 'features':
          result = await seeder.seedFeatures();
          break;
        case 'notifications':
          result = await seeder.seedNotifications();
          break;
        default:
          throw new Error(`Unknown seeding module: ${name}`);
      }
      
      const endTime = new Date();
      const duration = endTime - startTime;
      
      this.stats.modules[name] = {
        status: 'completed',
        result: result,
        duration: duration,
        startTime: startTime,
        endTime: endTime
      };
      
      console.log(`   ✅ ${description} completed in ${this.formatDuration(duration)}`);
      
    } catch (error) {
      console.error(`   ❌ Error seeding ${description}:`, error.message);
      
      this.stats.modules[name] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date()
      };
      
      this.stats.errors.push({
        module: name,
        error: error.message,
        timestamp: new Date()
      });
      
      if (seedingConfig.isStrictMode()) {
        throw error;
      }
    }
  }

  async finalizeSeeding() {
    try {
      console.log('\n🎉 Finalizing seeding process...');
      
      // Update end time
      this.stats.endTime = new Date();
      this.stats.totalDuration = this.stats.endTime - this.stats.startTime;
      
      // Perform final validation
      await this.performFinalValidation();
      
      // Generate seeding report
      await this.generateSeedingReport();
      
      // Cleanup
      await this.cleanup();
      
      console.log('\n🎊 Seeding process completed successfully!');
      console.log(`⏱️  Total duration: ${this.formatDuration(this.stats.totalDuration)}`);
      
    } catch (error) {
      console.error('❌ Error during finalization:', error);
      this.stats.errors.push({
        module: 'finalization',
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  async performFinalValidation() {
    console.log('\n🔍 Performing final validation...');
    
    try {
      // Get database statistics
      const dbStats = await databaseConfig.getAllCollectionStats();
      
      console.log('📊 Database Statistics:');
      dbStats.forEach(stat => {
        console.log(`   ${stat.name}: ${stat.count} documents, ${this.formatBytes(stat.size)}`);
      });
      
      // Validate critical collections
      const criticalCollections = ['obdelements', 'cities', 'paymentmethods'];
      for (const collection of criticalCollections) {
        const stat = dbStats.find(s => s.name === collection);
        if (!stat || stat.count === 0) {
          this.stats.warnings.push({
            collection: collection,
            message: 'Collection is empty or missing',
            timestamp: new Date()
          });
          console.log(`   ⚠️  Warning: ${collection} collection is empty or missing`);
        }
      }
      
      console.log('✅ Final validation completed');
      
    } catch (error) {
      console.error('❌ Error during final validation:', error);
      throw error;
    }
  }

  async generateSeedingReport() {
    console.log('\n📋 Generating seeding report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: seedingConfig.environment,
      duration: this.stats.totalDuration,
      modules: this.stats.modules,
      errors: this.stats.errors,
      warnings: this.stats.warnings,
      summary: this.generateSummary()
    };
    
    // Save report to file
    const fs = require('fs').promises;
    const path = require('path');
    const reportDir = path.join(__dirname, '../logs/seeding-logs');
    const reportFile = path.join(reportDir, `seeding-report-${Date.now()}.json`);
    
    try {
      await fs.mkdir(reportDir, { recursive: true });
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
      console.log(`   📄 Report saved to: ${reportFile}`);
    } catch (error) {
      console.warn(`   ⚠️  Could not save report: ${error.message}`);
    }
    
    // Print summary to console
    this.printSummary();
  }

  generateSummary() {
    const summary = {
      totalModules: Object.keys(this.stats.modules).length,
      completedModules: Object.values(this.stats.modules).filter(m => m.status === 'completed').length,
      failedModules: Object.values(this.stats.modules).filter(m => m.status === 'failed').length,
      skippedModules: Object.values(this.stats.modules).filter(m => m.status === 'skipped').length,
      totalErrors: this.stats.errors.length,
      totalWarnings: this.stats.warnings.length,
      successRate: 0
    };
    
    if (summary.totalModules > 0) {
      summary.successRate = Math.round((summary.completedModules / summary.totalModules) * 100);
    }
    
    return summary;
  }

  printSummary() {
    const summary = this.generateSummary();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`   Total modules: ${summary.totalModules}`);
    console.log(`   Completed: ${summary.completedModules}`);
    console.log(`   Failed: ${summary.failedModules}`);
    console.log(`   Skipped: ${summary.skippedModules}`);
    console.log(`   Success rate: ${summary.successRate}%`);
    console.log(`   Errors: ${summary.totalErrors}`);
    console.log(`   Warnings: ${summary.totalWarnings}`);
    
    if (summary.totalErrors > 0) {
      console.log('\n❌ Errors encountered:');
      this.stats.errors.slice(0, 5).forEach(error => {
        console.log(`   ${error.module}: ${error.error}`);
      });
      if (this.stats.errors.length > 5) {
        console.log(`   ... and ${this.stats.errors.length - 5} more errors`);
      }
    }
    
    if (summary.totalWarnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.stats.warnings.slice(0, 5).forEach(warning => {
        console.log(`   ${warning.collection}: ${warning.message}`);
      });
      if (this.stats.warnings.length > 5) {
        console.log(`   ... and ${this.stats.warnings.length - 5} more warnings`);
      }
    }
  }

  async cleanup() {
    console.log('\n🧹 Performing cleanup...');
    
    try {
      // Cleanup logo manager
      await logoManager.disconnect();
      
      // Disconnect from database
      await databaseConfig.disconnect();
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async disconnect() {
    try {
      await this.cleanup();
      console.log('🔌 Master Seeder disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Master Seeder:', error);
    }
  }
}

// Main execution function
async function main() {
  const masterSeeder = new MasterSeeder();
  
  try {
    await masterSeeder.initialize();
    await masterSeeder.seedAll();
  } catch (error) {
    console.error('❌ Master seeding failed:', error);
    process.exit(1);
  } finally {
    await masterSeeder.disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = MasterSeeder;
