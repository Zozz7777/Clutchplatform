const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');

/**
 * Car Brand Model
 * Manages car brands in the system
 * Uses native MongoDB driver as per CTO mandate
 */

class CarBrand {
  constructor(data) {
    this.brandId = data.brandId;
    this.name = data.name;
    this.nameAr = data.nameAr || data.name_ar;
    this.logo = data.logo;
    this.description = data.description;
    this.descriptionAr = data.descriptionAr || data.description_ar;
    this.country = data.country;
    this.website = data.website;
    this.phone = data.phone;
    this.email = data.email;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Statistics
    this.stats = {
      totalModels: data.stats?.totalModels || 0,
      totalVehicles: data.stats?.totalVehicles || 0,
      totalParts: data.stats?.totalParts || 0,
      lastUpdated: data.stats?.lastUpdated || new Date()
    };
  }

  /**
   * Find car brand by ID
   */
  static async findById(id) {
    try {
      const db = await getDb();
      const brand = await db.collection('car_brands').findOne({ _id: new ObjectId(id) });
      return brand ? new CarBrand(brand) : null;
    } catch (error) {
      console.error('Error finding car brand by ID:', error);
      throw error;
    }
  }

  /**
   * Find car brand by brandId
   */
  static async findByBrandId(brandId) {
    try {
      const db = await getDb();
      const brand = await db.collection('car_brands').findOne({ brandId });
      return brand ? new CarBrand(brand) : null;
    } catch (error) {
      console.error('Error finding car brand by brandId:', error);
      throw error;
    }
  }

  /**
   * Find car brand by name
   */
  static async findByName(name) {
    try {
      const db = await getDb();
      const brand = await db.collection('car_brands').findOne({ 
        $or: [
          { name: { $regex: name, $options: 'i' } },
          { nameAr: { $regex: name, $options: 'i' } }
        ]
      });
      return brand ? new CarBrand(brand) : null;
    } catch (error) {
      console.error('Error finding car brand by name:', error);
      throw error;
    }
  }

  /**
   * Find all active car brands
   */
  static async findActive() {
    try {
      const db = await getDb();
      const brands = await db.collection('car_brands')
        .find({ isActive: true })
        .sort({ name: 1 })
        .toArray();
      return brands.map(brand => new CarBrand(brand));
    } catch (error) {
      console.error('Error finding active car brands:', error);
      throw error;
    }
  }

  /**
   * Find all car brands with pagination
   */
  static async findAll(options = {}) {
    try {
      const db = await getDb();
      const { page = 1, limit = 20, search = '', sortBy = 'name', sortOrder = 1 } = options;
      
      const skip = (page - 1) * limit;
      
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { nameAr: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      const brands = await db.collection('car_brands')
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();
        
      const total = await db.collection('car_brands').countDocuments(query);
      
      return {
        brands: brands.map(brand => new CarBrand(brand)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error finding all car brands:', error);
      throw error;
    }
  }

  /**
   * Create new car brand
   */
  static async create(data) {
    try {
      const db = await getDb();
      
      // Generate brandId if not provided
      if (!data.brandId) {
        data.brandId = `BRAND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const brandData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalModels: 0,
          totalVehicles: 0,
          totalParts: 0,
          lastUpdated: new Date()
        }
      };
      
      const result = await db.collection('car_brands').insertOne(brandData);
      return new CarBrand({ ...brandData, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating car brand:', error);
      throw error;
    }
  }

  /**
   * Save car brand
   */
  async save() {
    try {
      const db = await getDb();
      this.updatedAt = new Date();
      
      if (this._id) {
        // Update existing
        const result = await db.collection('car_brands').updateOne(
          { _id: this._id },
          { $set: this }
        );
        return result.modifiedCount > 0;
      } else {
        // Create new
        const result = await db.collection('car_brands').insertOne(this);
        this._id = result.insertedId;
        return true;
      }
    } catch (error) {
      console.error('Error saving car brand:', error);
      throw error;
    }
  }

  /**
   * Update car brand by ID
   */
  static async findByIdAndUpdate(id, update) {
    try {
      const db = await getDb();
      update.updatedAt = new Date();
      
      const result = await db.collection('car_brands').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: 'after' }
      );
      
      return result.value ? new CarBrand(result.value) : null;
    } catch (error) {
      console.error('Error updating car brand:', error);
      throw error;
    }
  }

  /**
   * Delete car brand by ID
   */
  static async findByIdAndDelete(id) {
    try {
      const db = await getDb();
      const result = await db.collection('car_brands').findOneAndDelete({ _id: new ObjectId(id) });
      return result.value ? new CarBrand(result.value) : null;
    } catch (error) {
      console.error('Error deleting car brand:', error);
      throw error;
    }
  }

  /**
   * Update brand statistics
   */
  async updateStats() {
    try {
      const db = await getDb();
      
      // Count related models
      const totalModels = await db.collection('car_models').countDocuments({ 
        brandId: this.brandId, 
        isActive: true 
      });
      
      // Count related vehicles
      const totalVehicles = await db.collection('user_vehicles').countDocuments({ 
        brandId: this.brandId, 
        isActive: true 
      });
      
      // Count related parts
      const totalParts = await db.collection('car_parts').countDocuments({ 
        brandId: this.brandId, 
        isActive: true 
      });
      
      this.stats = {
        totalModels,
        totalVehicles,
        totalParts,
        lastUpdated: new Date()
      };
      
      await this.save();
      return this.stats;
    } catch (error) {
      console.error('Error updating brand stats:', error);
      throw error;
    }
  }

  /**
   * Get brand statistics
   */
  static async getBrandStats(brandId) {
    try {
      const db = await getDb();
      
      const totalModels = await db.collection('car_models').countDocuments({ 
        brandId, 
        isActive: true 
      });
      
      const totalVehicles = await db.collection('user_vehicles').countDocuments({ 
        brandId, 
        isActive: true 
      });
      
      const totalParts = await db.collection('car_parts').countDocuments({ 
        brandId, 
        isActive: true 
      });
      
      return {
        totalModels,
        totalVehicles,
        totalParts,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting brand stats:', error);
      throw error;
    }
  }

  /**
   * Get popular brands
   */
  static async getPopularBrands(limit = 10) {
    try {
      const db = await getDb();
      
      const brands = await db.collection('car_brands')
        .aggregate([
          { $match: { isActive: true } },
          {
            $lookup: {
              from: 'user_vehicles',
              localField: 'brandId',
              foreignField: 'brandId',
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
      
      return brands.map(brand => new CarBrand(brand));
    } catch (error) {
      console.error('Error getting popular brands:', error);
      throw error;
    }
  }

  /**
   * Search brands
   */
  static async searchBrands(query, limit = 10) {
    try {
      const db = await getDb();
      
      const brands = await db.collection('car_brands')
        .find({
          isActive: true,
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { nameAr: { $regex: query, $options: 'i' } },
            { country: { $regex: query, $options: 'i' } }
          ]
        })
        .sort({ name: 1 })
        .limit(limit)
        .toArray();
      
      return brands.map(brand => new CarBrand(brand));
    } catch (error) {
      console.error('Error searching brands:', error);
      throw error;
    }
  }

  /**
   * Get brands by country
   */
  static async findByCountry(country) {
    try {
      const db = await getDb();
      
      const brands = await db.collection('car_brands')
        .find({ 
          country: { $regex: country, $options: 'i' },
          isActive: true 
        })
        .sort({ name: 1 })
        .toArray();
      
      return brands.map(brand => new CarBrand(brand));
    } catch (error) {
      console.error('Error finding brands by country:', error);
      throw error;
    }
  }

  /**
   * Get all countries
   */
  static async getCountries() {
    try {
      const db = await getDb();
      
      const countries = await db.collection('car_brands')
        .distinct('country', { isActive: true });
      
      return countries.sort();
    } catch (error) {
      console.error('Error getting countries:', error);
      throw error;
    }
  }
}

module.exports = CarBrand;
