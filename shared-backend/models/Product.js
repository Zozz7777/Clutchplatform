const { getDb } = require('../config/database');

class Product {
  constructor() {
    this.collectionName = 'products';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(productData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id, isActive: true });
    } catch (error) {
      console.error('Error finding product by ID:', error);
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
      console.error('Error updating product:', error);
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
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async findAll(query = {}) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ ...query, isActive: true }).toArray();
    } catch (error) {
      console.error('Error finding products:', error);
      throw error;
    }
  }

  async findByCategory(category) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ 
        category, 
        isActive: true 
      }).toArray();
    } catch (error) {
      console.error('Error finding products by category:', error);
      throw error;
    }
  }

  async searchProducts(searchTerm) {
    try {
      const collection = await this.getCollection();
      return await collection.find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { description: { $regex: searchTerm, $options: 'i' } },
              { category: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      }).toArray();
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
}

module.exports = new Product();
