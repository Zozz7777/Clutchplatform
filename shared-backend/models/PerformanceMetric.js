const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class PerformanceMetric {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.team = data.team;
    this.period = data.period; // 'daily'|'weekly'|'monthly'|'quarterly'
    this.metricName = data.metricName;
    this.value = data.value;
    this.createdAt = data.createdAt || new Date();
  }

  static async findById(id) {
    try {
      const collection = await getCollection('performance_metrics');
      const metric = await collection.findOne({ _id: new ObjectId(id) });
      return metric ? new PerformanceMetric(metric) : null;
    } catch (error) {
      console.error('Error finding performance metric by ID:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('performance_metrics');
      const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
      
      const metrics = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return metrics.map(metric => new PerformanceMetric(metric));
    } catch (error) {
      console.error('Error finding performance metrics:', error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const collection = await getCollection('performance_metrics');
      const metric = new PerformanceMetric(data);
      const result = await collection.insertOne(metric);
      return new PerformanceMetric({ ...metric, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating performance metric:', error);
      throw error;
    }
  }

  async save() {
    try {
      const collection = await getCollection('performance_metrics');
      const result = await collection.replaceOne(
        { _id: this._id },
        this,
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Error saving performance metric:', error);
      throw error;
    }
  }

  static async getTeamMetrics(team, period) {
    try {
      const collection = await getCollection('performance_metrics');
      const metrics = await collection.find({ team, period }).toArray();
      return metrics.map(metric => new PerformanceMetric(metric));
    } catch (error) {
      console.error('Error getting team metrics:', error);
      throw error;
    }
  }
}

module.exports = PerformanceMetric;
