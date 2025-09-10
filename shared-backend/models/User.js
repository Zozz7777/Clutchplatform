const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { getCollection } = require('../config/database');

class User {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.userId = data.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email?.toLowerCase();
    this.phoneNumber = data.phoneNumber;
    this.password = data.password;
    this.role = data.role || 'user';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isVerified = data.isVerified !== undefined ? data.isVerified : false;
    this.profilePicture = data.profilePicture;
    this.dateOfBirth = data.dateOfBirth;
    this.gender = data.gender;
    this.address = data.address;
    this.preferences = data.preferences || {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    };
    this.twoFactorAuth = data.twoFactorAuth || {
      enabled: false,
      secret: null,
      backupCodes: [],
      method: 'totp'
    };
    this.lastLogin = data.lastLogin;
    this.loginAttempts = data.loginAttempts || 0;
    this.lockUntil = data.lockUntil;
    this.resetPasswordToken = data.resetPasswordToken;
    this.resetPasswordExpires = data.resetPasswordExpires;
    this.emailVerificationToken = data.emailVerificationToken;
    this.emailVerificationExpires = data.emailVerificationExpires;
    this.metadata = data.metadata || new Map();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Static methods
  static async findById(id) {
    try {
      const collection = await getCollection('users');
      const user = await collection.findOne({ _id: new ObjectId(id) });
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  static async findByEmail(email) {
    try {
      const collection = await getCollection('users');
      const user = await collection.findOne({ email: email.toLowerCase() });
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  static async findByPhone(phoneNumber) {
    try {
      const collection = await getCollection('users');
      const user = await collection.findOne({ phoneNumber });
      return user ? new User(user) : null;
    } catch (error) {
      console.error('Error finding user by phone:', error);
      return null;
    }
  }

  static async findActiveUsers() {
    try {
      const collection = await getCollection('users');
      const users = await collection.find({ isActive: true }).toArray();
      return users.map(user => new User(user));
    } catch (error) {
      console.error('Error finding active users:', error);
      return [];
    }
  }

  static async findByRole(role) {
    try {
      const collection = await getCollection('users');
      const users = await collection.find({ role, isActive: true }).toArray();
      return users.map(user => new User(user));
    } catch (error) {
      console.error('Error finding users by role:', error);
      return [];
    }
  }

  static async create(userData) {
    try {
      const collection = await getCollection('users');
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }
      
      const user = new User(userData);
      const result = await collection.insertOne(user);
      user._id = result.insertedId;
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const collection = await getCollection('users');
      this.updatedAt = new Date();
      
      if (this._id) {
        // Update existing user
        const result = await collection.updateOne(
          { _id: this._id },
          { $set: this }
        );
        return result.modifiedCount > 0;
      } else {
        // Create new user
        const result = await collection.insertOne(this);
        this._id = result.insertedId;
        return true;
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  isLocked() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  }

  async incLoginAttempts() {
    try {
      const collection = await getCollection('users');
      
      // If we have a previous lock that has expired, restart at 1
      if (this.lockUntil && this.lockUntil < Date.now()) {
        await collection.updateOne(
          { _id: this._id },
          { 
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
          }
        );
        this.loginAttempts = 1;
        this.lockUntil = null;
        return;
      }
      
      const updates = { $inc: { loginAttempts: 1 } };
      
      // Lock account after 5 failed attempts
      if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }; // 2 hours
        this.lockUntil = updates.$set.lockUntil;
      }
      
      await collection.updateOne({ _id: this._id }, updates);
      this.loginAttempts++;
    } catch (error) {
      console.error('Error incrementing login attempts:', error);
      throw error;
    }
  }

  async resetLoginAttempts() {
    try {
      const collection = await getCollection('users');
      await collection.updateOne(
        { _id: this._id },
        { $unset: { loginAttempts: 1, lockUntil: 1 } }
      );
      this.loginAttempts = 0;
      this.lockUntil = null;
    } catch (error) {
      console.error('Error resetting login attempts:', error);
      throw error;
    }
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }
}

module.exports = User;
