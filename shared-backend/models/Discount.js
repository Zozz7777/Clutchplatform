const { getDb } = require('../config/database');

class Discount {
  constructor() {
    this.collectionName = 'discounts';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(discountData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...discountData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      return result;
    } catch (error) {
      console.error('Error creating discount:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id, isActive: true });
    } catch (error) {
      console.error('Error finding discount by ID:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: id },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error updating discount:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: id },
        { $set: { isActive: false, updatedAt: new Date() } }
      );
      return result;
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw error;
    }
  }

  async findByType(type) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ 
        type, 
        isActive: true,
        expiryDate: { $gt: new Date() }
      }).toArray();
    } catch (error) {
      console.error('Error finding discounts by type:', error);
      throw error;
    }
  }

  async findNearby(location, radius = 10) {
    try {
      const collection = await this.getCollection();
      return await collection.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        },
        isActive: true,
        expiryDate: { $gt: new Date() }
      }).toArray();
    } catch (error) {
      console.error('Error finding nearby discounts:', error);
      throw error;
    }
  }

  async findForUser(userId) {
    try {
      const collection = await this.getCollection();
      return await collection.find({
        $or: [
          { userId: userId },
          { isPublic: true }
        ],
        isActive: true,
        expiryDate: { $gt: new Date() }
      }).toArray();
    } catch (error) {
      console.error('Error finding discounts for user:', error);
      throw error;
    }
  }

  async applyDiscount(discountId, userId, amount) {
    try {
      const collection = await this.getCollection();
      const discount = await this.findById(discountId);
      
      if (!discount) {
        throw new Error('Discount not found');
      }

      if (discount.expiryDate < new Date()) {
        throw new Error('Discount has expired');
      }

      if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
        throw new Error('Discount usage limit reached');
      }

      const discountAmount = (amount * discount.percentage) / 100;
      const finalAmount = amount - discountAmount;

      // Update usage count
      await collection.updateOne(
        { _id: discountId },
        { $inc: { usageCount: 1 } }
      );

      return {
        originalAmount: amount,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        discountPercentage: discount.percentage
      };
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }
}

module.exports = new Discount();
