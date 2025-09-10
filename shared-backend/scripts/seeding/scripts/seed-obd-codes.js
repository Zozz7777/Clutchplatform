const databaseConfig = require('../config/database-config');
const seedingConfig = require('../config/seeding-config');
const { generateAllOBDCodes } = require('../data/obd-codes-data');
const OBDElement = require('../models/OBDElement');

class OBDCodesSeeder {
  constructor() {
    this.stats = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      console.log('🔧 Initializing OBD Codes Seeder...');
      
      // Connect to database
      await databaseConfig.connect();
      
      console.log('✅ OBD Codes Seeder initialized');
    } catch (error) {
      console.error('❌ Error initializing OBD Codes Seeder:', error);
      throw error;
    }
  }

  async seedOBDCodes() {
    try {
      console.log('\n🔧 Starting OBD Codes Seeding...');
      
      // Generate comprehensive OBD codes data
      const obdCodes = generateAllOBDCodes();
      this.stats.total = obdCodes.length;
      
      console.log(`📊 Total OBD codes to process: ${this.stats.total}`);
      
      // Process codes in batches
      const batchSize = seedingConfig.getBatchSize();
      const batches = this.chunkArray(obdCodes, batchSize);
      
      console.log(`🔄 Processing ${batches.length} batches of ${batchSize} codes each...`);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\n📦 Processing batch ${i + 1}/${batches.length} (${batch.length} codes)...`);
        
        await this.processBatch(batch);
        
        // Progress update
        const progress = Math.round(((i + 1) / batches.length) * 100);
        console.log(`📈 Progress: ${progress}% complete`);
      }
      
      await this.printStats();
      await this.validateSeeding();
      
    } catch (error) {
      console.error('❌ Error seeding OBD codes:', error);
      throw error;
    }
  }

  async processBatch(codes) {
    try {
      for (const codeData of codes) {
        try {
          // Map OBD code type to correct category
          const categoryMap = {
            'P': 'Engine',
            'C': 'Chassis', 
            'B': 'Body',
            'U': 'Network'
          };
          
          // Update category based on code type
          const codeType = codeData.code.charAt(0);
          codeData.category = categoryMap[codeType] || 'Engine';
          
          // Check if code already exists
          const existingCode = await OBDElement.findOne({ code: codeData.code });
          
          if (existingCode) {
            // Update existing code
            await OBDElement.updateOne(
              { code: codeData.code },
              { 
                $set: {
                  ...codeData,
                  updatedAt: new Date()
                }
              }
            );
            this.stats.updated++;
          } else {
            // Create new code
            const obdElement = new OBDElement(codeData);
            await obdElement.save();
            this.stats.created++;
          }
          
        } catch (error) {
          this.stats.failed++;
          this.stats.errors.push({
            code: codeData.code,
            error: error.message
          });
          
          console.warn(`⚠️  Failed to process OBD code ${codeData.code}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing batch:', error);
      throw error;
    }
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async printStats() {
    console.log('\n📊 OBD Codes Seeding Statistics:');
    console.log(`   Total codes processed: ${this.stats.total}`);
    console.log(`   Codes created: ${this.stats.created}`);
    console.log(`   Codes updated: ${this.stats.updated}`);
    console.log(`   Codes failed: ${this.stats.failed}`);
    
    // Category breakdown
    const categoryStats = await this.getCategoryStats();
    console.log('\n📋 Category Breakdown:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} codes`);
    });
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.stats.errors.slice(0, 10).forEach(error => {
        console.log(`   ${error.code}: ${error.error}`);
      });
      if (this.stats.errors.length > 10) {
        console.log(`   ... and ${this.stats.errors.length - 10} more errors`);
      }
    }
  }

  async getCategoryStats() {
    try {
      const stats = await OBDElement.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
      
      const categoryStats = {};
      stats.forEach(stat => {
        categoryStats[stat._id] = stat.count;
      });
      
      return categoryStats;
    } catch (error) {
      console.warn('⚠️  Could not get category stats:', error.message);
      return {};
    }
  }

  async validateSeeding() {
    try {
      console.log('\n🔍 Validating OBD codes seeding...');
      
      // Check total count
      const totalCount = await OBDElement.countDocuments();
      console.log(`   Total OBD codes in database: ${totalCount}`);
      
      // Check category distribution
      const categoryStats = await this.getCategoryStats();
      console.log('   Category distribution:');
      Object.entries(categoryStats).forEach(([category, count]) => {
        const percentage = Math.round((count / totalCount) * 100);
        console.log(`     ${category}: ${count} codes (${percentage}%)`);
      });
      
      // Check for critical codes
      const criticalCodes = await OBDElement.countDocuments({ severity: 'CRITICAL' });
      console.log(`   Critical severity codes: ${criticalCodes}`);
      
      // Check for high severity codes
      const highSeverityCodes = await OBDElement.countDocuments({ severity: 'HIGH' });
      console.log(`   High severity codes: ${highSeverityCodes}`);
      
      // Validate data quality
      const codesWithMissingData = await OBDElement.countDocuments({
        $or: [
          { description: { $exists: false } },
          { possibleCauses: { $exists: false } },
          { symptoms: { $exists: false } }
        ]
      });
      
      if (codesWithMissingData > 0) {
        console.warn(`   ⚠️  ${codesWithMissingData} codes with missing critical data`);
      } else {
        console.log('   ✅ All codes have complete data');
      }
      
      console.log('✅ OBD codes seeding validation completed');
      
    } catch (error) {
      console.error('❌ Error validating OBD codes seeding:', error);
    }
  }

  async disconnect() {
    try {
      await databaseConfig.disconnect();
      console.log('🔌 OBD Codes Seeder disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting OBD Codes Seeder:', error);
    }
  }
}

// Main execution function
async function main() {
  const seeder = new OBDCodesSeeder();
  
  try {
    await seeder.initialize();
    await seeder.seedOBDCodes();
  } catch (error) {
    console.error('❌ OBD codes seeding failed:', error);
    process.exit(1);
  } finally {
    await seeder.disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = OBDCodesSeeder;
