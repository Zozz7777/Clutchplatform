const databaseConfig = require('../config/database-config');
const seedingConfig = require('../config/seeding-config');
const { generateAllCarParts } = require('../data/car-parts-data');

class CarPartsSeeder {
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
      console.log('🔧 Initializing Car Parts Seeder...');
      
      // Connect to database
      await databaseConfig.connect();
      console.log('✅ Car Parts Seeder initialized');
      
    } catch (error) {
      console.error('❌ Error initializing Car Parts Seeder:', error);
      throw error;
    }
  }

  async seedCarParts() {
    try {
      console.log('\n🔧 Starting Car Parts Seeding...');

      // Generate comprehensive car parts data
      const carParts = generateAllCarParts();
      this.stats.total = carParts.length;

      console.log(`📊 Total car parts to process: ${this.stats.total}`);

      // Process parts in batches
      const batchSize = seedingConfig.getBatchSize();
      const batches = this.chunkArray(carParts, batchSize);

      console.log(`🔄 Processing ${batches.length} batches of ${batchSize} parts each...\n`);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} parts)...`);
        
        await this.processBatch(batch);
        
        const progress = Math.round(((i + 1) / batches.length) * 100);
        console.log(`📈 Progress: ${progress}% complete\n`);
      }

      // Print statistics
      this.printStats();

      // Validate seeding
      await this.validateSeeding();

    } catch (error) {
      console.error('❌ Error seeding car parts:', error);
      throw error;
    }
  }

  async processBatch(parts) {
    try {
      const collection = databaseConfig.getCollection('carparts');
      
      for (const partData of parts) {
        try {
          // Add timestamps
          const partWithTimestamps = {
            ...partData,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Check if part already exists
          const existingPart = await collection.findOne({ 
            name: partData.name,
            brand: partData.brand,
            partNumber: partData.partNumber 
          });

          if (existingPart) {
            // Update existing part
            await collection.updateOne(
              { _id: existingPart._id },
              {
                $set: {
                  ...partWithTimestamps,
                  updatedAt: new Date()
                }
              }
            );
            this.stats.updated++;
          } else {
            // Create new part
            await collection.insertOne(partWithTimestamps);
            this.stats.created++;
          }

        } catch (error) {
          this.stats.failed++;
          this.stats.errors.push({
            part: partData.name,
            error: error.message
          });

          console.warn(`⚠️  Failed to process car part ${partData.name}:`, error.message);
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

  printStats() {
    console.log('\n📊 Car Parts Seeding Statistics:');
    console.log(`   Total parts processed: ${this.stats.total}`);
    console.log(`   Parts created: ${this.stats.created}`);
    console.log(`   Parts updated: ${this.stats.updated}`);
    console.log(`   Parts failed: ${this.stats.failed}`);

    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.stats.errors.slice(0, 10).forEach(error => {
        console.log(`   - ${error.part}: ${error.error}`);
      });
      if (this.stats.errors.length > 10) {
        console.log(`   ... and ${this.stats.errors.length - 10} more errors`);
      }
    }
  }

  async validateSeeding() {
    try {
      console.log('\n🔍 Validating car parts seeding...');
      
      const collection = databaseConfig.getCollection('carparts');
      const totalParts = await collection.countDocuments();
      console.log(`   Total car parts in database: ${totalParts}`);

      // Get category distribution
      const categoryStats = await collection.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();

      console.log('   Category distribution:');
      categoryStats.forEach(stat => {
        const percentage = Math.round((stat.count / totalParts) * 100);
        console.log(`     ${stat._id}: ${stat.count} parts (${percentage}%)`);
      });

      // Get brand distribution
      const brandStats = await collection.aggregate([
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();

      console.log('   Top 10 brands:');
      brandStats.forEach(stat => {
        console.log(`     ${stat._id}: ${stat.count} parts`);
      });

      // Check for parts with expiry tracking data
      const partsWithExpiryTracking = await collection.countDocuments({
        'expiryTracking.shelfLife': { $exists: true, $ne: null }
      });

      console.log(`   Parts with expiry tracking: ${partsWithExpiryTracking}/${totalParts}`);

      // Check for parts with pricing data
      const partsWithPricing = await collection.countDocuments({
        'pricing.cost': { $exists: true, $ne: null }
      });

      console.log(`   Parts with pricing data: ${partsWithPricing}/${totalParts}`);

      console.log('✅ Car parts seeding validation completed');

    } catch (error) {
      console.error('❌ Error validating car parts seeding:', error);
    }
  }

  async disconnect() {
    try {
      await databaseConfig.disconnect();
      console.log('🔌 Car Parts Seeder disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Car Parts Seeder:', error);
    }
  }
}

async function main() {
  const seeder = new CarPartsSeeder();
  
  try {
    await seeder.initialize();
    await seeder.seedCarParts();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await seeder.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = CarPartsSeeder;
