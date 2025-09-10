const { ObjectId } = require('mongodb');
const { getCollection, getDB } = require('../config/database');
const bcrypt = require('bcryptjs');

class DatabaseService {
  constructor() {
    this.collections = {};
  }

  // Get collection with caching
  async getCollection(collectionName) {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = await getCollection(collectionName);
    }
    return this.collections[collectionName];
  }

  // Get database instance
  async getDB() {
    return await getDB();
  }

  // Get analytics events
  async getAnalyticsEvents(filter = {}) {
    return await this.find('analytics_events', filter);
  }

  // Generic CRUD operations
  async create(collectionName, data) {
    const collection = await this.getCollection(collectionName);
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  }

  async findById(collectionName, id) {
    const collection = await this.getCollection(collectionName);
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async findOne(collectionName, filter) {
    const collection = await this.getCollection(collectionName);
    return await collection.findOne(filter);
  }

  async find(collectionName, filter = {}, options = {}) {
    const collection = await this.getCollection(collectionName);
    const { sort, limit, skip, projection } = options;
    
    let query = collection.find(filter);
    
    if (sort) query = query.sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    if (projection) query = query.project(projection);
    
    return await query.toArray();
  }

  async update(collectionName, id, data) {
    const collection = await this.getCollection(collectionName);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      }
    );
    return result;
  }

  async updateOne(collectionName, filter, data) {
    const collection = await this.getCollection(collectionName);
    const result = await collection.updateOne(
      filter,
      { 
        $set: {
          ...data,
          updatedAt: new Date()
        }
      }
    );
    return result;
  }

  async delete(collectionName, id) {
    const collection = await this.getCollection(collectionName);
    return await collection.deleteOne({ _id: new ObjectId(id) });
  }

  async count(collectionName, filter = {}) {
    const collection = await this.getCollection(collectionName);
    return await collection.countDocuments(filter);
  }

  async aggregate(collectionName, pipeline) {
    const collection = await this.getCollection(collectionName);
    return await collection.aggregate(pipeline).toArray();
  }

  // User-specific operations
  async createUser(userData) {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }
    
    return await this.create('users', userData);
  }

  async findUserByEmail(email) {
    return await this.findOne('users', { email: email.toLowerCase() });
  }

  async findUserByPhone(phone) {
    return await this.findOne('users', { phoneNumber: phone });
  }

  async findUserByFirebaseUid(firebaseUid) {
    return await this.findOne('users', { firebaseUid });
  }

  async updateUser(id, userData) {
    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }
    
    return await this.update('users', id, userData);
  }

  async verifyUserPassword(user, password) {
    if (!user.password) return false;
    return await bcrypt.compare(password, user.password);
  }

  // Booking-specific operations
  async createBooking(bookingData) {
    return await this.create('bookings', bookingData);
  }

  async findBookingsByUser(userId) {
    return await this.find('bookings', { userId: new ObjectId(userId) });
  }

  async findBookingsByMechanic(mechanicId) {
    return await this.find('bookings', { mechanicId: new ObjectId(mechanicId) });
  }

  async updateBookingStatus(id, status) {
    return await this.update('bookings', id, { status });
  }

  // Mechanic-specific operations
  async createMechanic(mechanicData) {
    return await this.create('mechanics', mechanicData);
  }

  async findMechanicByEmail(email) {
    return await this.findOne('mechanics', { email: email.toLowerCase() });
  }

  async findMechanicByPhone(phone) {
    return await this.findOne('mechanics', { phoneNumber: phone });
  }

  async findMechanicByFirebaseUid(firebaseUid) {
    return await this.findOne('mechanics', { firebaseUid });
  }

  async findNearbyMechanics(coordinates, maxDistance = 10000) {
    return await this.find('mechanics', {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: maxDistance
        }
      },
      isVerified: true,
      isActive: true
    });
  }

  // Vehicle-specific operations
  async createVehicle(vehicleData) {
    return await this.create('vehicles', vehicleData);
  }

  async findVehiclesByUser(userId) {
    return await this.find('vehicles', { userId: new ObjectId(userId) });
  }

  // Transaction-specific operations
  async createTransaction(transactionData) {
    return await this.create('transactions', transactionData);
  }

  async findTransactionsByUser(userId) {
    return await this.find('transactions', { userId: new ObjectId(userId) });
  }

  async findTransactionsByMechanic(mechanicId) {
    return await this.find('transactions', { mechanicId: new ObjectId(mechanicId) });
  }

  // Analytics operations
  async createAnalyticsEvent(eventData) {
    return await this.create('analytics_events', eventData);
  }

  async getAnalyticsEvents(filter = {}, options = {}) {
    return await this.find('analytics_events', filter, options);
  }

  // Support ticket operations
  async createSupportTicket(ticketData) {
    return await this.create('support_tickets', ticketData);
  }

  async findSupportTicketsByUser(userId) {
    return await this.find('support_tickets', { userId: new ObjectId(userId) });
  }

  async updateSupportTicketStatus(id, status) {
    return await this.update('support_tickets', id, { status });
  }

  // Role and permission operations
  async createRole(roleData) {
    return await this.create('roles', roleData);
  }

  async findRoleByName(name) {
    return await this.findOne('roles', { name });
  }

  async createPermission(permissionData) {
    return await this.create('permissions', permissionData);
  }

  // Campaign operations
  async createCampaign(campaignData) {
    return await this.create('campaigns', campaignData);
  }

  async findActiveCampaigns() {
    return await this.find('campaigns', { 
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
  }

  // Payment operations
  async createPayment(paymentData) {
    return await this.create('payments', paymentData);
  }

  async findPaymentByTransactionId(transactionId) {
    return await this.findOne('payments', { transactionId });
  }

  async updatePaymentStatus(id, status) {
    return await this.update('payments', id, { status });
  }

  // Payout operations
  async createPayout(payoutData) {
    return await this.create('payouts', payoutData);
  }

  async findPayoutsByMechanic(mechanicId) {
    return await this.find('payouts', { mechanicId: new ObjectId(mechanicId) });
  }

  // Order operations
  async createOrder(orderData) {
    return await this.create('orders', orderData);
  }

  async findOrdersByUser(userId) {
    return await this.find('orders', { userId: new ObjectId(userId) });
  }

  // Lead operations
  async createLead(leadData) {
    return await this.create('leads', leadData);
  }

  async findLeadsByStatus(status) {
    return await this.find('leads', { status });
  }

  // Invoice operations
  async createInvoice(invoiceData) {
    return await this.create('invoices', invoiceData);
  }

  async findInvoicesByUser(userId) {
    return await this.find('invoices', { userId: new ObjectId(userId) });
  }

  // Maintenance operations
  async createMaintenance(maintenanceData) {
    return await this.create('maintenance', maintenanceData);
  }

  async findMaintenanceByVehicle(vehicleId) {
    return await this.find('maintenance', { vehicleId: new ObjectId(vehicleId) });
  }

  // Parts shop operations
  async createPartsShop(partsShopData) {
    return await this.create('parts_shops', partsShopData);
  }

  async findPartsShopsNearby(coordinates, maxDistance = 10000) {
    return await this.find('parts_shops', {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: maxDistance
        }
      },
      isActive: true
    });
  }

  // Parts order operations
  async createPartsOrder(partsOrderData) {
    return await this.create('parts_orders', partsOrderData);
  }

  async findPartsOrdersByUser(userId) {
    return await this.find('parts_orders', { userId: new ObjectId(userId) });
  }

  // Dispute operations
  async createDispute(disputeData) {
    return await this.create('disputes', disputeData);
  }

  async findDisputesByUser(userId) {
    return await this.find('disputes', { userId: new ObjectId(userId) });
  }

  async findDisputesByMechanic(mechanicId) {
    return await this.find('disputes', { mechanicId: new ObjectId(mechanicId) });
  }

  // Activity operations
  async createActivity(activityData) {
    return await this.create('activities', activityData);
  }

  async findActivitiesByUser(userId, limit = 50) {
    return await this.find('activities', { userId: new ObjectId(userId) }, { 
      sort: { createdAt: -1 }, 
      limit 
    });
  }

  // Employee operations
  async createEmployee(employeeData) {
    return await this.create('employees', employeeData);
  }

  async findEmployeeByEmail(email) {
    return await this.findOne('employees', { email: email.toLowerCase() });
  }

  // Car operations
  async createCar(carData) {
    return await this.create('cars', carData);
  }

  async findCarsByUser(userId) {
    return await this.find('cars', { userId: new ObjectId(userId) });
  }

  // Utility methods
  async createIndex(collectionName, indexSpec, options = {}) {
    const collection = await this.getCollection(collectionName);
    return await collection.createIndex(indexSpec, options);
  }

  async dropIndex(collectionName, indexName) {
    const collection = await this.getCollection(collectionName);
    return await collection.dropIndex(indexName);
  }

  async getIndexes(collectionName) {
    const collection = await this.getCollection(collectionName);
    return await collection.indexes();
  }

  async getStats(collectionName) {
    const collection = await this.getCollection(collectionName);
    return await collection.stats();
  }

  // Bulk operations
  async bulkInsert(collectionName, documents) {
    const collection = await this.getCollection(collectionName);
    return await collection.insertMany(documents);
  }

  async bulkUpdate(collectionName, operations) {
    const collection = await this.getCollection(collectionName);
    return await collection.bulkWrite(operations);
  }

  // Search operations
  async search(collectionName, searchTerm, fields = []) {
    const collection = await this.getCollection(collectionName);
    const searchQuery = {
      $or: fields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }))
    };
    return await this.find(collectionName, searchQuery);
  }
}

module.exports = new DatabaseService();
