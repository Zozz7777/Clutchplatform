const { getDb } = require('../config/database');

class TradeIn {
  constructor() {
    this.collectionName = 'tradeIns';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(tradeInData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...tradeInData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating trade-in listing:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error finding trade-in by ID:', error);
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
      console.error('Error updating trade-in:', error);
      throw error;
    }
  }

  async findByUserId(userId) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error finding trade-ins by user ID:', error);
      throw error;
    }
  }

  async findByStatus(status) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ status }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error finding trade-ins by status:', error);
      throw error;
    }
  }

  async searchTradeIns(filters = {}) {
    try {
      const collection = await this.getCollection();
      const query = { status: 'active' };

      if (filters.make) query.make = { $regex: filters.make, $options: 'i' };
      if (filters.model) query.model = { $regex: filters.model, $options: 'i' };
      if (filters.yearMin) query.year = { $gte: filters.yearMin };
      if (filters.yearMax) query.year = { ...query.year, $lte: filters.yearMax };
      if (filters.priceMin) query.askingPrice = { $gte: filters.priceMin };
      if (filters.priceMax) query.askingPrice = { ...query.askingPrice, $lte: filters.priceMax };
      if (filters.location) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [filters.location.longitude, filters.location.latitude]
            },
            $maxDistance: (filters.radius || 50) * 1000 // Convert km to meters
          }
        };
      }

      return await collection.find(query).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error searching trade-ins:', error);
      throw error;
    }
  }

  async makeOffer(tradeInId, buyerId, offerAmount, message = '') {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: tradeInId },
        {
          $push: {
            offers: {
              buyerId,
              offerAmount,
              message,
              createdAt: new Date(),
              status: 'pending'
            }
          },
          $set: { updatedAt: new Date() }
        }
      );
      return result;
    } catch (error) {
      console.error('Error making offer:', error);
      throw error;
    }
  }

  async acceptOffer(tradeInId, offerId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { 
          _id: tradeInId,
          'offers._id': offerId
        },
        {
          $set: {
            'offers.$.status': 'accepted',
            status: 'sold',
            soldAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }

  async rejectOffer(tradeInId, offerId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { 
          _id: tradeInId,
          'offers._id': offerId
        },
        {
          $set: {
            'offers.$.status': 'rejected',
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error rejecting offer:', error);
      throw error;
    }
  }

  async getValuation(vehicleData) {
    try {
      // This would typically integrate with external valuation APIs
      // For now, return mock valuation data
      const baseValue = 15000; // Base value for a typical car
      const ageFactor = Math.max(0.3, 1 - (new Date().getFullYear() - vehicleData.year) * 0.1);
      const mileageFactor = Math.max(0.5, 1 - (vehicleData.mileage / 200000));
      const conditionFactor = vehicleData.condition === 'excellent' ? 1.2 : 
                             vehicleData.condition === 'good' ? 1.0 :
                             vehicleData.condition === 'fair' ? 0.8 : 0.6;

      const estimatedValue = baseValue * ageFactor * mileageFactor * conditionFactor;

      return {
        estimatedValue: Math.round(estimatedValue),
        confidence: 0.85,
        factors: {
          age: ageFactor,
          mileage: mileageFactor,
          condition: conditionFactor
        },
        range: {
          low: Math.round(estimatedValue * 0.8),
          high: Math.round(estimatedValue * 1.2)
        }
      };
    } catch (error) {
      console.error('Error getting vehicle valuation:', error);
      throw error;
    }
  }
}

module.exports = new TradeIn();
