'use strict';

// Mongoose compatibility shim backed by MongoDB native driver
// Supports a minimal subset of the Mongoose API used in this codebase.

const { getCollection } = require('../config/database');
const EventEmitter = require('events');
const databaseUtils = require('../utils/databaseUtils');

class Query {
  constructor(collectionName, filter = {}, projection = {}) {
    this.collectionName = collectionName;
    this.filter = filter || {};
    this.projection = projection || {};
    this._sort = undefined;
    this._limit = undefined;
    this._skip = undefined;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  select() {
    // No-op projection handler for now
    return this;
  }

  populate(path, select) {
    // Store population info for later use
    this._populate = this._populate || [];
    this._populate.push({ path, select });
    return this;
  }

  lean() {
    return this.exec();
  }

  async exec() {
    const coll = await getCollection(this.collectionName);
    let cursor = coll.find(this.filter, { projection: this.projection });
    if (this._sort) cursor = cursor.sort(this._sort);
    if (typeof this._skip === 'number') cursor = cursor.skip(this._skip);
    if (typeof this._limit === 'number') cursor = cursor.limit(this._limit);
    const results = await cursor.toArray();
    
    // Handle population if specified
    if (this._populate && this._populate.length > 0) {
      for (const pop of this._populate) {
        await this._populateDocuments(results, pop);
      }
    }
    
    return results;
  }

  async _populateDocuments(documents, populateInfo) {
    if (!documents || documents.length === 0) return;
    
    const { path, select } = populateInfo;
    const refCollection = path.split('.')[0]; // Get the main reference collection
    
    // Get all unique IDs to populate
    const idsToPopulate = new Set();
    documents.forEach(doc => {
      const value = this._getNestedValue(doc, path);
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(id => idsToPopulate.add(id));
        } else {
          idsToPopulate.add(value);
        }
      }
    });
    
    if (idsToPopulate.size === 0) return;
    
    // Fetch referenced documents
    const refColl = await getCollection(refCollection);
    const refDocs = await refColl.find({ 
      _id: { $in: Array.from(idsToPopulate).map(id => databaseUtils.toObjectId(id)) }
    }).toArray();
    
    // Create a map for quick lookup
    const refMap = new Map();
    refDocs.forEach(doc => refMap.set(doc._id.toString(), doc));
    
    // Populate the documents
    documents.forEach(doc => {
      this._setNestedValue(doc, path, this._getPopulatedValue(doc, path, refMap));
    });
  }

  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  _getPopulatedValue(doc, path, refMap) {
    const value = this._getNestedValue(doc, path);
    if (!value) return value;
    
    if (Array.isArray(value)) {
      return value.map(id => refMap.get(id?.toString()) || id);
    } else {
      return refMap.get(value?.toString()) || value;
    }
  }
}

function normalizeId(filter) {
  if (!filter) return filter;
  if (filter._id && typeof filter._id === 'string') {
    filter._id = databaseUtils.toObjectId(filter._id);
  }
  return filter;
}

function pluralizeName(name) {
  if (!name) return name;
  const lower = String(name).trim().toLowerCase();
  if (lower.endsWith('s')) return lower;
  return `${lower}s`;
}

function model(collectionName, schema) {
  const resolvedCollectionName = (schema && schema.options && schema.options.collection)
    ? schema.options.collection
    : pluralizeName(collectionName);
  async function findOne(filter = {}, projection = {}) {
    const coll = await getCollection(resolvedCollectionName);
    return await coll.findOne(normalizeId(filter), { projection });
  }

  async function findById(id, projection = {}) {
    const coll = await getCollection(resolvedCollectionName);
    return await coll.findOne({ _id: databaseUtils.toObjectId(id) }, { projection });
  }

  async function countDocuments(filter = {}) {
    const coll = await getCollection(resolvedCollectionName);
    return await coll.countDocuments(filter);
  }

  function find(filter = {}, projection = {}) {
    return new Query(resolvedCollectionName, filter, projection);
  }

  async function updateOne(filter, update) {
    const coll = await getCollection(resolvedCollectionName);
    return await coll.updateOne(normalizeId(filter), update);
  }

  async function updateMany(filter, update) {
    const coll = await getCollection(resolvedCollectionName);
    return await coll.updateMany(filter, update);
  }

  async function deleteOne(filter) {
    const coll = await getCollection(resolvedCollectionName);
    return await coll.deleteOne(normalizeId(filter));
  }

  async function findByIdAndUpdate(id, update, options = {}) {
    const coll = await getCollection(resolvedCollectionName);
    const objectId = databaseUtils.toObjectId(id);
    const updateDoc = { ...update };
    
    // Handle $set operator
    if (update.$set) {
      updateDoc.$set = { ...update.$set, updatedAt: new Date() };
    } else {
      updateDoc.$set = { ...update, updatedAt: new Date() };
    }
    
    const result = await coll.findOneAndUpdate(
      { _id: objectId },
      updateDoc,
      { 
        returnDocument: options.new ? 'after' : 'before',
        upsert: options.upsert || false,
        ...options
      }
    );
    
    return result;
  }

  async function aggregate(pipeline = []) {
    const coll = await getCollection(resolvedCollectionName);
    return await coll.aggregate(pipeline).toArray();
  }

  async function create(doc) {
    const coll = await getCollection(resolvedCollectionName);
    const toInsert = { ...doc, createdAt: doc.createdAt || new Date(), updatedAt: new Date() };
    const res = await coll.insertOne(toInsert);
    return { ...toInsert, _id: res.insertedId };
  }

  function Model(doc = {}) {
    Object.assign(this, doc);
  }

  Model.prototype.save = async function save() {
    const coll = await getCollection(resolvedCollectionName);
    const now = new Date();
    if (schema && schema._pres && schema._pres.has('save')) {
      for (const hook of schema._pres.get('save')) {
        await new Promise((resolve, reject) => {
          try { hook.call(this, (err) => err ? reject(err) : resolve()); } catch (e) { reject(e); }
        });
      }
    }
    if (this._id) {
      const id = databaseUtils.toObjectId(this._id);
      const updateDoc = { ...this, _id: id, updatedAt: now };
      await coll.updateOne({ _id: id }, { $set: updateDoc }, { upsert: true });
      return this;
    }
    const toInsert = { ...this, createdAt: this.createdAt || now, updatedAt: now };
    const res = await coll.insertOne(toInsert);
    this._id = res.insertedId;
    return this;
  };

  // Attach static-like methods
  Model.find = find;
  Model.findOne = findOne;
  Model.findById = findById;
  Model.countDocuments = countDocuments;
  Model.updateOne = updateOne;
  Model.updateMany = updateMany;
  Model.deleteOne = deleteOne;
  Model.findByIdAndUpdate = findByIdAndUpdate;
  Model.aggregate = aggregate;
  Model.create = create;

  // Apply schema statics and methods if present
  if (schema && schema.statics) {
    Object.entries(schema.statics).forEach(([k, v]) => { Model[k] = v.bind(Model); });
  }
  if (schema && schema.methods) {
    Object.entries(schema.methods).forEach(([k, v]) => { Model.prototype[k] = v; });
  }

  return Model;
}

class Schema {
  constructor(definition = {}, options = {}) {
    this.definition = definition;
    this.options = options || {};
    this._pres = new Map();
    this._indexes = [];
    this._virtuals = new Map();
    this.methods = {};
    this.statics = {};
  }
  pre(hook, fn) {
    if (!this._pres.has(hook)) this._pres.set(hook, []);
    this._pres.get(hook).push(fn);
    return this;
  }
  index(fields, options) {
    this._indexes.push({ fields, options });
    return this;
  }
  virtual(name) {
    const self = this;
    return {
      get(fn) { self._virtuals.set(name, { ...(self._virtuals.get(name)||{}), get: fn }); return self; },
      set(fn) { self._virtuals.set(name, { ...(self._virtuals.get(name)||{}), set: fn }); return self; }
    };
  }
}
Schema.Types = {
  Mixed: class Mixed {},
  ObjectId: class ObjectId {}
};

// Minimal connection emulation
class Connection extends EventEmitter {
  constructor() {
    super();
    this.readyState = 0; // 0 = disconnected, 1 = connected
  }
}

const connection = new Connection();

async function connect(/* uri, options */) {
  // Wait for the native client to be connected
  const { connectToDatabase } = require('../config/database');
  try {
    await connectToDatabase();
    connection.readyState = 1;
    // Defer to next tick to emit
    process.nextTick(() => connection.emit('connected'));
  } catch (error) {
    connection.readyState = 0;
    process.nextTick(() => connection.emit('error', error));
  }
  return connection;
}

module.exports = {
  Schema,
  model,
  connection,
  connect
};


