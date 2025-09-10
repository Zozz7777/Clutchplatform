const { getDb } = require('../config/database');

class Mechanic {
  constructor(data) {
    this._id = data._id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.specialization = data.specialization;
    this.experience = data.experience;
    this.rating = data.rating;
    this.isAvailable = data.isAvailable;
    this.location = data.location;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async findById(id) {
    try {
      const db = await getDb();
      const mechanic = await db.collection('mechanics').findOne({ _id: id });
      return mechanic ? new Mechanic(mechanic) : null;
    } catch (error) {
      throw new Error(`Error finding mechanic: ${error.message}`);
    }
  }

  static async findOne(query) {
    try {
      const db = await getDb();
      const mechanic = await db.collection('mechanics').findOne(query);
      return mechanic ? new Mechanic(mechanic) : null;
    } catch (error) {
      throw new Error(`Error finding mechanic: ${error.message}`);
    }
  }

  static async find(query = {}) {
    try {
      const db = await getDb();
      const mechanics = await db.collection('mechanics').find(query).toArray();
      return mechanics.map(mechanic => new Mechanic(mechanic));
    } catch (error) {
      throw new Error(`Error finding mechanics: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      const db = await getDb();
      const mechanicData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await db.collection('mechanics').insertOne(mechanicData);
      return new Mechanic({ ...mechanicData, _id: result.insertedId });
    } catch (error) {
      throw new Error(`Error creating mechanic: ${error.message}`);
    }
  }

  async save() {
    try {
      const db = await getDb();
      this.updatedAt = new Date();
      
      if (this._id) {
        // Update existing
        await db.collection('mechanics').updateOne(
          { _id: this._id },
          { $set: this }
        );
      } else {
        // Create new
        const result = await db.collection('mechanics').insertOne(this);
        this._id = result.insertedId;
      }
      return this;
    } catch (error) {
      throw new Error(`Error saving mechanic: ${error.message}`);
    }
  }

  static async findByIdAndUpdate(id, update) {
    try {
      const db = await getDb();
      const result = await db.collection('mechanics').findOneAndUpdate(
        { _id: id },
        { $set: { ...update, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value ? new Mechanic(result.value) : null;
    } catch (error) {
      throw new Error(`Error updating mechanic: ${error.message}`);
    }
  }

  static async findByIdAndDelete(id) {
    try {
      const db = await getDb();
      const result = await db.collection('mechanics').findOneAndDelete({ _id: id });
      return result.value ? new Mechanic(result.value) : null;
    } catch (error) {
      throw new Error(`Error deleting mechanic: ${error.message}`);
    }
  }
}

module.exports = Mechanic;
