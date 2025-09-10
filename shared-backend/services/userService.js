const {
  createDocument,
  findDocument,
  findDocumentById,
  findDocuments,
  updateDocumentById,
  deleteDocumentById,
  countDocuments,
  hashPassword,
  comparePassword,
  generateId,
  toObjectId,
  createSearchFilter,
  createDateRangeFilter
} = require('../utils/databaseUtils');

// ==================== USER SERVICE ====================

class UserService {
  constructor() {
    this.collectionName = 'users';
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      // Hash password if provided
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }

      // Generate user ID
      userData.userId = userData.userId || generateId();

      // Set default values
      userData.isActive = userData.isActive !== undefined ? userData.isActive : true;
      userData.isVerified = userData.isVerified !== undefined ? userData.isVerified : false;
      userData.role = userData.role || 'user';

      // Normalize email
      if (userData.email) {
        userData.email = userData.email.toLowerCase().trim();
      }

      const result = await createDocument(this.collectionName, userData);
      
      if (result.success) {
        // Remove password from response
        const { password, ...userWithoutPassword } = result.data;
        return { success: true, data: userWithoutPassword };
      }
      
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(userId, projection = {}) {
    try {
      const result = await findDocumentById(this.collectionName, userId, projection);
      
      if (result.success && result.data) {
        // Remove password from response unless specifically requested
        if (!projection.password && result.data.password) {
          const { password, ...userWithoutPassword } = result.data;
          return { success: true, data: userWithoutPassword };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email, projection = {}) {
    try {
      const result = await findDocument(this.collectionName, { email: email.toLowerCase() }, projection);
      
      if (result.success && result.data) {
        // Remove password from response unless specifically requested
        if (!projection.password && result.data.password) {
          const { password, ...userWithoutPassword } = result.data;
          return { success: true, data: userWithoutPassword };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find user by phone number
   */
  async findUserByPhone(phoneNumber, projection = {}) {
    try {
      const result = await findDocument(this.collectionName, { phoneNumber }, projection);
      
      if (result.success && result.data) {
        // Remove password from response unless specifically requested
        if (!projection.password && result.data.password) {
          const { password, ...userWithoutPassword } = result.data;
          return { success: true, data: userWithoutPassword };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error finding user by phone:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find users with filtering and pagination
   */
  async findUsers(filter = {}, options = {}) {
    try {
      const result = await findDocuments(this.collectionName, filter, options);
      
      if (result.success && result.data) {
        // Remove passwords from response
        const usersWithoutPasswords = result.data.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        
        return {
          ...result,
          data: usersWithoutPasswords
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error finding users:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user by ID
   */
  async updateUserById(userId, updateData) {
    try {
      // Hash password if provided
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }

      // Normalize email if provided
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase().trim();
      }

      const result = await updateDocumentById(this.collectionName, userId, updateData);
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete user by ID
   */
  async deleteUserById(userId) {
    try {
      const result = await deleteDocumentById(this.collectionName, userId);
      return result;
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId, password) {
    try {
      const userResult = await findDocumentById(this.collectionName, userId, { password: 1 });
      
      if (!userResult.success || !userResult.data) {
        return { success: false, error: 'User not found' };
      }

      const isValid = await comparePassword(password, userResult.data.password);
      return { success: true, isValid };
    } catch (error) {
      console.error('Error verifying password:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Find active users
   */
  async findActiveUsers(options = {}) {
    return await this.findUsers({ isActive: true }, options);
  }

  /**
   * Find users by role
   */
  async findUsersByRole(role, options = {}) {
    return await this.findUsers({ role, isActive: true }, options);
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm, options = {}) {
    try {
      const searchFields = ['firstName', 'lastName', 'email', 'phoneNumber'];
      const searchFilter = createSearchFilter(searchTerm, searchFields);
      
      return await this.findUsers(searchFilter, options);
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const totalUsers = await countDocuments(this.collectionName);
      const activeUsers = await countDocuments(this.collectionName, { isActive: true });
      const verifiedUsers = await countDocuments(this.collectionName, { isVerified: true });

      return {
        success: true,
        data: {
          total: totalUsers.count || 0,
          active: activeUsers.count || 0,
          verified: verifiedUsers.count || 0
        }
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get users by date range
   */
  async getUsersByDateRange(startDate, endDate, options = {}) {
    try {
      const dateFilter = createDateRangeFilter(startDate, endDate, 'createdAt');
      return await this.findUsers(dateFilter, options);
    } catch (error) {
      console.error('Error getting users by date range:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user login attempts
   */
  async updateLoginAttempts(userId, increment = true) {
    try {
      const user = await this.findUserById(userId);
      
      if (!user.success || !user.data) {
        return { success: false, error: 'User not found' };
      }

      let updateData = {};
      
      if (increment) {
        const newAttempts = (user.data.loginAttempts || 0) + 1;
        updateData.loginAttempts = newAttempts;
        
        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          updateData.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        }
      } else {
        // Reset login attempts
        updateData.loginAttempts = 0;
        updateData.lockUntil = null;
      }

      return await this.updateUserById(userId, updateData);
    } catch (error) {
      console.error('Error updating login attempts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user account is locked
   */
  async isAccountLocked(userId) {
    try {
      const user = await this.findUserById(userId);
      
      if (!user.success || !user.data) {
        return { success: false, error: 'User not found' };
      }

      const isLocked = user.data.lockUntil && new Date(user.data.lockUntil) > new Date();
      
      return { success: true, isLocked };
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user last login
   */
  async updateLastLogin(userId) {
    try {
      const updateData = {
        lastLogin: new Date(),
        loginAttempts: 0,
        lockUntil: null
      };

      return await this.updateUserById(userId, updateData);
    } catch (error) {
      console.error('Error updating last login:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user by ID (alias for findUserById)
   */
  async getUserById(userId, projection = {}) {
    return await this.findUserById(userId, projection);
  }

  /**
   * Get user full name
   */
  getFullName(user) {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }

  /**
   * Validate user data
   */
  validateUserData(userData) {
    const errors = [];

    if (!userData.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    if (!userData.firstName) {
      errors.push('First name is required');
    }

    if (!userData.lastName) {
      errors.push('Last name is required');
    }

    if (!userData.phoneNumber) {
      errors.push('Phone number is required');
    }

    if (userData.password && userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new UserService();
