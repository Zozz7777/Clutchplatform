const mongoose = require('mongoose');
const CarBrand = require('../../../models/CarBrand');
const CarModel = require('../../../models/CarModel');
const CarTrim = require('../../../models/CarTrim');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clutch', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Verify car data
const verifyCarData = async () => {
  try {
    console.log('Verifying car data in database...\n');
    
    // Get counts
    const brandCount = await CarBrand.countDocuments();
    const modelCount = await CarModel.countDocuments();
    const trimCount = await CarTrim.countDocuments();
    
    console.log('📊 Database Statistics:');
    console.log(`- Total Brands: ${brandCount}`);
    console.log(`- Total Models: ${modelCount}`);
    console.log(`- Total Trims: ${trimCount}\n`);
    
    // Get sample brands
    const sampleBrands = await CarBrand.find().limit(10);
    console.log('🚗 Sample Brands:');
    sampleBrands.forEach(brand => {
      console.log(`  - ${brand.name} (Logo: ${brand.logo ? 'Yes' : 'No'})`);
    });
    
    // Get models for first brand
    if (sampleBrands.length > 0) {
      const firstBrand = sampleBrands[0];
      const brandModels = await CarModel.find({ brandName: firstBrand.name }).limit(5);
      console.log(`\n🔧 Sample Models for ${firstBrand.name}:`);
      brandModels.forEach(model => {
        console.log(`  - ${model.name} (${model.yearStart}${model.yearEnd ? `-${model.yearEnd}` : '+'})`);
      });
      
      // Get trims for first model
      if (brandModels.length > 0) {
        const firstModel = brandModels[0];
        const modelTrims = await CarTrim.find({ 
          brandName: firstBrand.name, 
          modelName: firstModel.name 
        }).limit(5);
        console.log(`\n⚙️ Sample Trims for ${firstBrand.name} ${firstModel.name}:`);
        modelTrims.forEach(trim => {
          console.log(`  - ${trim.name}`);
        });
      }
    }
    
    // Get brands with most models
    const brandsWithModelCounts = await CarModel.aggregate([
      { $group: { _id: '$brandName', modelCount: { $sum: 1 } } },
      { $sort: { modelCount: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('\n🏆 Top 10 Brands by Model Count:');
    brandsWithModelCounts.forEach((brand, index) => {
      console.log(`  ${index + 1}. ${brand._id}: ${brand.modelCount} models`);
    });
    
    // Get models with most trims
    const modelsWithTrimCounts = await CarTrim.aggregate([
      { $group: { _id: { brandName: '$brandName', modelName: '$modelName' }, trimCount: { $sum: 1 } } },
      { $sort: { trimCount: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('\n🎯 Top 10 Models by Trim Count:');
    modelsWithTrimCounts.forEach((model, index) => {
      console.log(`  ${index + 1}. ${model._id.brandName} ${model._id.modelName}: ${model.trimCount} trims`);
    });
    
    // Check for brands with logos
    const brandsWithLogos = await CarBrand.countDocuments({ logo: { $exists: true, $ne: null } });
    const brandsWithoutLogos = brandCount - brandsWithLogos;
    
    console.log('\n🖼️ Logo Statistics:');
    console.log(`  - Brands with logos: ${brandsWithLogos}`);
    console.log(`  - Brands without logos: ${brandsWithoutLogos}`);
    
    // Check for active vs inactive
    const activeBrands = await CarBrand.countDocuments({ isActive: true });
    const activeModels = await CarModel.countDocuments({ isActive: true });
    const activeTrims = await CarTrim.countDocuments({ isActive: true });
    
    console.log('\n✅ Active Records:');
    console.log(`  - Active Brands: ${activeBrands}/${brandCount}`);
    console.log(`  - Active Models: ${activeModels}/${modelCount}`);
    console.log(`  - Active Trims: ${activeTrims}/${trimCount}`);
    
    console.log('\n🎉 Car data verification completed successfully!');
    
  } catch (error) {
    console.error('Error during verification:', error);
    throw error;
  }
};

// Main verification function
const main = async () => {
  try {
    await connectDB();
    await verifyCarData();
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
};

// Run verification if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { verifyCarData, connectDB };
