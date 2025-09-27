const mongoose = require('mongoose');
const egyptCarData = require('../data/egypt-car-data');
const CarBrand = require('../../models/CarBrand');
const CarModel = require('../../models/CarModel');
const CarTrim = require('../../models/CarTrim');

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

// Clear existing data
const clearExistingData = async () => {
  try {
    console.log('Clearing existing car data...');
    await CarBrand.deleteMany({});
    await CarModel.deleteMany({});
    await CarTrim.deleteMany({});
    console.log('Existing car data cleared successfully');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  }
};

// Seed car brands
const seedCarBrands = async () => {
  try {
    console.log('Seeding car brands...');
    const brands = egyptCarData.brands.map(brand => ({
      name: brand.name,
      logo: brand.logo,
      isActive: brand.isActive
    }));
    
    const insertedBrands = await CarBrand.insertMany(brands);
    console.log(`Successfully seeded ${insertedBrands.length} car brands`);
    return insertedBrands;
  } catch (error) {
    console.error('Error seeding car brands:', error);
    throw error;
  }
};

// Seed car models
const seedCarModels = async (brands) => {
  try {
    console.log('Seeding car models...');
    const models = [];
    
    for (const brandData of egyptCarData.brands) {
      const brand = brands.find(b => b.name === brandData.name);
      if (!brand) continue;
      
      for (const modelData of brandData.models) {
        models.push({
          brandId: brand._id,
          brandName: brand.name,
          name: modelData.name,
          yearStart: modelData.yearStart,
          yearEnd: modelData.yearEnd,
          isActive: true
        });
      }
    }
    
    const insertedModels = await CarModel.insertMany(models);
    console.log(`Successfully seeded ${insertedModels.length} car models`);
    return insertedModels;
  } catch (error) {
    console.error('Error seeding car models:', error);
    throw error;
  }
};

// Seed car trims
const seedCarTrims = async (models) => {
  try {
    console.log('Seeding car trims...');
    const trims = [];
    
    for (const brandData of egyptCarData.brands) {
      for (const modelData of brandData.models) {
        const model = models.find(m => m.brandName === brandData.name && m.name === modelData.name);
        if (!model) continue;
        
        for (const trimName of modelData.trims) {
          trims.push({
            modelId: model._id,
            brandName: brandData.name,
            modelName: modelData.name,
            name: trimName,
            isActive: true
          });
        }
      }
    }
    
    const insertedTrims = await CarTrim.insertMany(trims);
    console.log(`Successfully seeded ${insertedTrims.length} car trims`);
    return insertedTrims;
  } catch (error) {
    console.error('Error seeding car trims:', error);
    throw error;
  }
};

// Main seeding function
const seedEgyptCars = async () => {
  try {
    console.log('Starting Egypt car data seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    await clearExistingData();
    
    // Seed brands
    const brands = await seedCarBrands();
    
    // Seed models
    const models = await seedCarModels(brands);
    
    // Seed trims
    const trims = await seedCarTrims(models);
    
    console.log('Egypt car data seeding completed successfully!');
    console.log(`Summary:`);
    console.log(`- Brands: ${brands.length}`);
    console.log(`- Models: ${models.length}`);
    console.log(`- Trims: ${trims.length}`);
    
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedEgyptCars();
}

module.exports = {
  seedEgyptCars,
  connectDB,
  clearExistingData,
  seedCarBrands,
  seedCarModels,
  seedCarTrims
};
