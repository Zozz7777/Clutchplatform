const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

/**
 * Car Model
 * Manages car models in the system
 * Uses native MongoDB driver as per CTO mandate
 */

class CarModel {
  constructor(data) {
    this.modelId = data.modelId;
    this.brandId = data.brandId;
    this.name = data.name;
    this.nameAr = data.nameAr || data.name_ar;
    this.year = data.year;
    this.category = data.category;
    this.bodyType = data.bodyType || data.body_type;
    this.fuelType = data.fuelType || data.fuel_type;
    this.transmissionType = data.transmissionType || data.transmission_type;
    this.engineSize = data.engineSize || data.engine_size;
    this.power = data.power;
    this.torque = data.torque;
    this.seats = data.seats;
    this.doors = data.doors;
    this.length = data.length;
    this.width = data.width;
    this.height = data.height;
    this.wheelbase = data.wheelbase;
    this.weight = data.weight;
    this.fuelCapacity = data.fuelCapacity || data.fuel_capacity;
    this.description = data.description;
    this.descriptionAr = data.descriptionAr || data.description_ar;
    this.image = data.image;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Specifications
    this.specifications = {
      engine: data.specifications?.engine || {},
      transmission: data.specifications?.transmission || {},
      performance: data.specifications?.performance || {},
      dimensions: data.specifications?.dimensions || {},
      features: data.specifications?.features || []
    };
    
    // Statistics
    this.stats = {
      totalVehicles: data.stats?.totalVehicles || 0,
      totalParts: data.stats?.totalParts || 0,
      lastUpdated: data.stats?.lastUpdated || new Date()
    };
  }

  /**
   * Find car model by ID
   */
  static async findById(id) {
    try {
      const db = await getDb();
      const model = await db.collection('car_models').findOne({ _id: new ObjectId(id) });
      return model ? new CarModel(model) : null;
    } catch (error) {
      console.error('Error finding car model by ID:', error);
      throw error;
    }
  }

  /**
   * Find car model by modelId
   */
  static async findByModelId(modelId) {
    try {
      const db = await getDb();
      const model = await db.collection('car_models').findOne({ modelId });
      return model ? new CarModel(model) : null;
    } catch (error) {
      console.error('Error finding car model by modelId:', error);
      throw error;
    }
  }

  /**
   * Find car models by brand
   */
  static async findByBrand(brandId, options = {}) {
    try {
      const db = await getDb();
      const { year = null, category = null, bodyType = null } = options;
      
      let query = { brandId, isActive: true };
      
      if (year) query.year = year;
      if (category) query.category = category;
      if (bodyType) query.bodyType = bodyType;
      
      const models = await db.collection('car_models')
        .find(query)
        .sort({ name: 1 })
        .toArray();
      
      return models.map(model => new CarModel(model));
    } catch (error) {
      console.error('Error finding car models by brand:', error);
      throw error;
    }
  }

  /**
   * Find car model by name and brand
   */
  static async findByNameAndBrand(name, brandId) {
    try {
      const db = await getDb();
      const model = await db.collection('car_models').findOne({ 
        brandId,
        $or: [
          { name: { $regex: name, $options: 'i' } },
          { nameAr: { $regex: name, $options: 'i' } }
        ]
      });
      return model ? new CarModel(model) : null;
    } catch (error) {
      console.error('Error finding car model by name and brand:', error);
      throw error;
    }
  }

  /**
   * Find all active car models
   */
  static async findActive(options = {}) {
    try {
      const db = await getDb();
      const { brandId = null, year = null, category = null } = options;
      
      let query = { isActive: true };
      if (brandId) query.brandId = brandId;
      if (year) query.year = year;
      if (category) query.category = category;
      
      const models = await db.collection('car_models')
        .find(query)
        .sort({ name: 1 })
        .toArray();
      
      return models.map(model => new CarModel(model));
    } catch (error) {
      console.error('Error finding active car models:', error);
      throw error;
    }
  }

  /**
   * Find all car models with pagination
   */
  static async findAll(options = {}) {
    try {
      const db = await getDb();
      const { 
        page = 1, 
        limit = 20, 
        search = '', 
        brandId = null,
        year = null,
        category = null,
        bodyType = null,
        sortBy = 'name', 
        sortOrder = 1 
      } = options;
      
      const skip = (page - 1) * limit;
      
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { nameAr: { $regex: search, $options: 'i' } }
        ];
      }
      if (brandId) query.brandId = brandId;
      if (year) query.year = year;
      if (category) query.category = category;
      if (bodyType) query.bodyType = bodyType;
      
      const models = await db.collection('car_models')
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();
        
      const total = await db.collection('car_models').countDocuments(query);
      
      return {
        models: models.map(model => new CarModel(model)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding all car models:', error);
      throw error;
    }
  }

  /**
   * Create new car model
   */
  static async create(data) {
    try {
      const db = await getDb();
      
      // Generate modelId if not provided
      if (!data.modelId) {
        data.modelId = `MODEL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const modelData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        specifications: {
          engine: data.specifications?.engine || {},
          transmission: data.specifications?.transmission || {},
          performance: data.specifications?.performance || {},
          dimensions: data.specifications?.dimensions || {},
          features: data.specifications?.features || []
        },
        stats: {
          totalVehicles: 0,
          totalParts: 0,
          lastUpdated: new Date()
        }
      };
      
      const result = await db.collection('car_models').insertOne(modelData);
      return new CarModel({ ...modelData, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating car model:', error);
      throw error;
    }
  }

  /**
   * Save car model
   */
  async save() {
    try {
      const db = await getDb();
      this.updatedAt = new Date();
      
      if (this._id) {
        // Update existing
        const result = await db.collection('car_models').updateOne(
          { _id: this._id },
          { $set: this }
        );
        return result.modifiedCount > 0;
      } else {
        // Create new
        const result = await db.collection('car_models').insertOne(this);
        this._id = result.insertedId;
        return true;
      }
    } catch (error) {
      console.error('Error saving car model:', error);
      throw error;
    }
  }

  /**
   * Update car model by ID
   */
  static async findByIdAndUpdate(id, update) {
    try {
      const db = await getDb();
      update.updatedAt = new Date();
      
      const result = await db.collection('car_models').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: 'after' }
      );
      
      return result.value ? new CarModel(result.value) : null;
    } catch (error) {
      console.error('Error updating car model:', error);
      throw error;
    }
  }

  /**
   * Delete car model by ID
   */
  static async findByIdAndDelete(id) {
    try {
      const db = await getDb();
      const result = await db.collection('car_models').findOneAndDelete({ _id: new ObjectId(id) });
      return result.value ? new CarModel(result.value) : null;
    } catch (error) {
      console.error('Error deleting car model:', error);
      throw error;
    }
  }

  /**
   * Update model statistics
   */
  async updateStats() {
    try {
      const db = await getDb();
      
      // Count related vehicles
      const totalVehicles = await db.collection('user_vehicles').countDocuments({ 
        modelId: this.modelId, 
        isActive: true 
      });
      
      // Count related parts
      const totalParts = await db.collection('car_parts').countDocuments({ 
        modelId: this.modelId, 
        isActive: true 
      });
      
      this.stats = {
        totalVehicles,
        totalParts,
        lastUpdated: new Date()
      };
      
      await this.save();
      return this.stats;
    } catch (error) {
      console.error('Error updating model stats:', error);
      throw error;
    }
  }

  /**
   * Get model statistics
   */
  static async getModelStats(modelId) {
    try {
      const db = await getDb();
      
      const totalVehicles = await db.collection('user_vehicles').countDocuments({ 
        modelId, 
        isActive: true 
      });
      
      const totalParts = await db.collection('car_parts').countDocuments({ 
        modelId, 
        isActive: true 
      });
      
      return {
        totalVehicles,
        totalParts,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting model stats:', error);
      throw error;
    }
  }

  /**
   * Get popular models
   */
  static async getPopularModels(limit = 10) {
    try {
      const db = await getDb();
      
      const models = await db.collection('car_models')
        .aggregate([
          { $match: { isActive: true } },
          {
            $lookup: {
              from: 'user_vehicles',
              localField: 'modelId',
              foreignField: 'modelId',
              as: 'vehicles'
            }
          },
          {
            $addFields: {
              vehicleCount: { $size: '$vehicles' }
            }
          },
          { $sort: { vehicleCount: -1 } },
          { $limit: limit },
          {
            $project: {
              vehicles: 0
            }
          }
        ]).toArray();
      
      return models.map(model => new CarModel(model));
    } catch (error) {
      console.error('Error getting popular models:', error);
      throw error;
    }
  }

  /**
   * Search models
   */
  static async searchModels(query, limit = 10) {
    try {
      const db = await getDb();
      
      const models = await db.collection('car_models')
        .find({
          isActive: true,
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { nameAr: { $regex: query, $options: 'i' } }
          ]
        })
        .sort({ name: 1 })
        .limit(limit)
        .toArray();
      
      return models.map(model => new CarModel(model));
    } catch (error) {
      console.error('Error searching models:', error);
      throw error;
    }
  }

  /**
   * Get models by year range
   */
  static async findByYearRange(startYear, endYear) {
    try {
      const db = await getDb();
      
      const models = await db.collection('car_models')
        .find({ 
          year: { $gte: startYear, $lte: endYear },
          isActive: true 
        })
        .sort({ year: -1, name: 1 })
        .toArray();
      
      return models.map(model => new CarModel(model));
    } catch (error) {
      console.error('Error finding models by year range:', error);
      throw error;
    }
  }

  /**
   * Get models by category
   */
  static async findByCategory(category) {
    try {
      const db = await getDb();
      
      const models = await db.collection('car_models')
        .find({ 
          category: { $regex: category, $options: 'i' },
          isActive: true 
        })
        .sort({ name: 1 })
        .toArray();
      
      return models.map(model => new CarModel(model));
    } catch (error) {
      console.error('Error finding models by category:', error);
      throw error;
    }
  }

  /**
   * Get models by body type
   */
  static async findByBodyType(bodyType) {
    try {
      const db = await getDb();
      
      const models = await db.collection('car_models')
        .find({ 
          bodyType: { $regex: bodyType, $options: 'i' },
          isActive: true 
        })
        .sort({ name: 1 })
        .toArray();
      
      return models.map(model => new CarModel(model));
    } catch (error) {
      console.error('Error finding models by body type:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  static async getCategories() {
    try {
      const db = await getDb();
      
      const categories = await db.collection('car_models')
        .distinct('category', { isActive: true });
      
      return categories.sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get all body types
   */
  static async getBodyTypes() {
    try {
      const db = await getDb();
      
      const bodyTypes = await db.collection('car_models')
        .distinct('bodyType', { isActive: true });
      
      return bodyTypes.sort();
    } catch (error) {
      console.error('Error getting body types:', error);
      throw error;
    }
  }

  /**
   * Get all years
   */
  static async getYears() {
    try {
      const db = await getDb();
      
      const years = await db.collection('car_models')
        .distinct('year', { isActive: true });
      
      return years.sort((a, b) => b - a); // Descending order
    } catch (error) {
      console.error('Error getting years:', error);
      throw error;
    }
  }

  /**
   * Get models with brand information
   */
  static async findWithBrand(options = {}) {
    try {
      const db = await getDb();
      const { brandId = null, limit = 20 } = options;
      
      let matchStage = { isActive: true };
      if (brandId) matchStage.brandId = brandId;
      
      const models = await db.collection('car_models')
        .aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: 'car_brands',
              localField: 'brandId',
              foreignField: 'brandId',
              as: 'brand'
            }
          },
          { $unwind: '$brand' },
          { $sort: { 'brand.name': 1, name: 1 } },
          { $limit: limit },
          {
            $project: {
              brand: {
                _id: 1,
                brandId: 1,
                name: 1,
                nameAr: 1,
                logo: 1,
                country: 1
              }
            }
          }
        ]).toArray();
      
      return models.map(model => new CarModel(model));
    } catch (error) {
      console.error('Error finding models with brand:', error);
      throw error;
    }
  }
}

module.exports = CarModel;
