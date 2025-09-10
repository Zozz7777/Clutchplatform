const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');
const bcrypt = require('bcryptjs');

// ==================== DATABASE UTILITIES ====================

/**
 * Generate a unique ID for documents
 */
const generateId = () => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convert string ID to ObjectId if valid, otherwise return null
 */
const toObjectId = (id) => {
  if (!id) return null;
  if (typeof id === 'string' && ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return id;
};

/**
 * Convert ObjectId to string
 */
const toStringId = (id) => {
  if (!id) return null;
  if (id instanceof ObjectId) {
    return id.toString();
  }
  return id;
};

/**
 * Add timestamps to document
 */
const addTimestamps = (doc, isNew = true) => {
  const now = new Date();
  if (isNew) {
    doc.createdAt = now;
  }
  doc.updatedAt = now;
  return doc;
};

/**
 * Validate ObjectId
 */
const isValidObjectId = (id) => {
  return ObjectId.isValid(id);
};

/**
 * Create pagination options
 */
const createPaginationOptions = (page = 1, limit = 10, sort = {}) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    limit: parseInt(limit),
    sort
  };
};

/**
 * Create search filter
 */
const createSearchFilter = (searchTerm, fields = []) => {
  if (!searchTerm || !fields.length) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  const searchConditions = fields.map(field => ({
    [field]: searchRegex
  }));
  
  return { $or: searchConditions };
};

/**
 * Create date range filter
 */
const createDateRangeFilter = (startDate, endDate, field = 'createdAt') => {
  const filter = {};
  
  if (startDate) {
    filter[field] = { $gte: new Date(startDate) };
  }
  
  if (endDate) {
    filter[field] = { ...filter[field], $lte: new Date(endDate) };
  }
  
  return Object.keys(filter).length > 0 ? filter : {};
};

// ==================== CRUD OPERATIONS ====================

/**
 * Create a new document
 */
const createDocument = async (collectionName, data) => {
  try {
    const collection = await getCollection(collectionName);
    const document = addTimestamps(data, true);
    
    const result = await collection.insertOne(document);
    return {
      success: true,
      data: { ...document, _id: result.insertedId },
      id: result.insertedId
    };
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Find documents with pagination and filtering
 */
const findDocuments = async (collectionName, filter = {}, options = {}) => {
  try {
    const collection = await getCollection(collectionName);
    const { page = 1, limit = 10, sort = {}, projection = {} } = options;
    
    const paginationOptions = createPaginationOptions(page, limit, sort);
    
    const documents = await collection
      .find(filter, { projection })
      .skip(paginationOptions.skip)
      .limit(paginationOptions.limit)
      .sort(paginationOptions.sort)
      .toArray();
    
    const total = await collection.countDocuments(filter);
    
    return {
      success: true,
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: paginationOptions.limit,
        total,
        pages: Math.ceil(total / paginationOptions.limit)
      }
    };
  } catch (error) {
    console.error(`Error finding documents in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Find a single document by ID
 */
const findDocumentById = async (collectionName, id, projection = {}) => {
  try {
    const collection = await getCollection(collectionName);
    const objectId = toObjectId(id);
    
    if (!objectId) {
      return { success: false, error: 'Invalid ID format' };
    }
    
    const document = await collection.findOne({ _id: objectId }, { projection });
    
    if (!document) {
      return { success: false, error: 'Document not found' };
    }
    
    return { success: true, data: document };
  } catch (error) {
    console.error(`Error finding document by ID in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Find a single document by filter
 */
const findDocument = async (collectionName, filter = {}, projection = {}) => {
  try {
    const collection = await getCollection(collectionName);
    const document = await collection.findOne(filter, { projection });
    
    return { success: true, data: document };
  } catch (error) {
    console.error(`Error finding document in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Update a document by ID
 */
const updateDocumentById = async (collectionName, id, updateData) => {
  try {
    const collection = await getCollection(collectionName);
    const objectId = toObjectId(id);
    
    if (!objectId) {
      return { success: false, error: 'Invalid ID format' };
    }
    
    const updateDoc = addTimestamps(updateData, false);
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updateDoc }
    );
    
    if (result.matchedCount === 0) {
      return { success: false, error: 'Document not found' };
    }
    
    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error(`Error updating document by ID in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Update documents by filter
 */
const updateDocuments = async (collectionName, filter, updateData) => {
  try {
    const collection = await getCollection(collectionName);
    const updateDoc = addTimestamps(updateData, false);
    
    const result = await collection.updateMany(
      filter,
      { $set: updateDoc }
    );
    
    return {
      success: true,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  } catch (error) {
    console.error(`Error updating documents in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a document by ID
 */
const deleteDocumentById = async (collectionName, id) => {
  try {
    const collection = await getCollection(collectionName);
    const objectId = toObjectId(id);
    
    if (!objectId) {
      return { success: false, error: 'Invalid ID format' };
    }
    
    const result = await collection.deleteOne({ _id: objectId });
    
    if (result.deletedCount === 0) {
      return { success: false, error: 'Document not found' };
    }
    
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error(`Error deleting document by ID in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete documents by filter
 */
const deleteDocuments = async (collectionName, filter) => {
  try {
    const collection = await getCollection(collectionName);
    const result = await collection.deleteMany(filter);
    
    return {
      success: true,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    console.error(`Error deleting documents in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Count documents
 */
const countDocuments = async (collectionName, filter = {}) => {
  try {
    const collection = await getCollection(collectionName);
    const count = await collection.countDocuments(filter);
    
    return { success: true, count };
  } catch (error) {
    console.error(`Error counting documents in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Aggregate documents
 */
const aggregateDocuments = async (collectionName, pipeline) => {
  try {
    const collection = await getCollection(collectionName);
    const results = await collection.aggregate(pipeline).toArray();
    
    return { success: true, data: results };
  } catch (error) {
    console.error(`Error aggregating documents in ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
};

// ==================== USER-SPECIFIC OPERATIONS ====================

/**
 * Hash password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

/**
 * Compare password
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
  return await findDocument('users', { email: email.toLowerCase() });
};

/**
 * Find user by phone
 */
const findUserByPhone = async (phoneNumber) => {
  return await findDocument('users', { phoneNumber });
};

/**
 * Find active users
 */
const findActiveUsers = async () => {
  return await findDocuments('users', { isActive: true });
};

/**
 * Find users by role
 */
const findUsersByRole = async (role) => {
  return await findDocuments('users', { role, isActive: true });
};

// ==================== PAYMENT-SPECIFIC OPERATIONS ====================

/**
 * Find payments by user
 */
const findPaymentsByUser = async (userId, options = {}) => {
  const filter = { userId: toObjectId(userId) };
  
  if (options.status) filter.status = options.status;
  if (options.startDate || options.endDate) {
    filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
  }
  
  return await findDocuments('payments', filter, options);
};

/**
 * Find payments by mechanic
 */
const findPaymentsByMechanic = async (mechanicId, options = {}) => {
  const filter = { mechanicId: toObjectId(mechanicId) };
  
  if (options.status) filter.status = options.status;
  if (options.startDate || options.endDate) {
    filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
  }
  
  return await findDocuments('payments', filter, options);
};

/**
 * Calculate user payment totals
 */
const calculateUserPaymentTotals = async (userId, period) => {
  const filter = { userId: toObjectId(userId) };
  
  if (period) {
    filter.createdAt = createDateRangeFilter(period.startDate, period.endDate).createdAt;
  }
  
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalCompleted: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
        totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
        totalFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0] } },
        count: { $sum: 1 }
      }
    }
  ];
  
  return await aggregateDocuments('payments', pipeline);
};

// ==================== BOOKING-SPECIFIC OPERATIONS ====================

/**
 * Find bookings by user
 */
const findBookingsByUser = async (userId, options = {}) => {
  const filter = { userId: toObjectId(userId) };
  
  if (options.status) filter.status = options.status;
  if (options.startDate || options.endDate) {
    filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
  }
  
  return await findDocuments('service_bookings', filter, options);
};

/**
 * Find bookings by mechanic
 */
const findBookingsByMechanic = async (mechanicId, options = {}) => {
  const filter = { mechanicId: toObjectId(mechanicId) };
  
  if (options.status) filter.status = options.status;
  if (options.startDate || options.endDate) {
    filter.createdAt = createDateRangeFilter(options.startDate, options.endDate).createdAt;
  }
  
  return await findDocuments('service_bookings', filter, options);
};

// ==================== VEHICLE-SPECIFIC OPERATIONS ====================

/**
 * Find vehicles by user
 */
const findVehiclesByUser = async (userId, options = {}) => {
  const filter = { userId: toObjectId(userId) };
  
  if (options.isActive !== undefined) filter.isActive = options.isActive;
  
  return await findDocuments('user_vehicles', filter, options);
};

/**
 * Find vehicle by license plate
 */
const findVehicleByLicensePlate = async (licensePlate) => {
  return await findDocument('user_vehicles', { licensePlate });
};

// ==================== EXPORT ALL UTILITIES ====================

module.exports = {
  // ID utilities
  generateId,
  toObjectId,
  toStringId,
  isValidObjectId,
  
  // Document utilities
  addTimestamps,
  createPaginationOptions,
  createSearchFilter,
  createDateRangeFilter,
  
  // CRUD operations
  createDocument,
  findDocuments,
  findDocumentById,
  findDocument,
  updateDocumentById,
  updateDocuments,
  deleteDocumentById,
  deleteDocuments,
  countDocuments,
  aggregateDocuments,
  
  // User operations
  hashPassword,
  comparePassword,
  findUserByEmail,
  findUserByPhone,
  findActiveUsers,
  findUsersByRole,
  
  // Payment operations
  findPaymentsByUser,
  findPaymentsByMechanic,
  calculateUserPaymentTotals,
  
  // Booking operations
  findBookingsByUser,
  findBookingsByMechanic,
  
  // Vehicle operations
  findVehiclesByUser,
  findVehicleByLicensePlate
};
