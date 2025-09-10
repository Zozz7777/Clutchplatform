const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const { getCollection } = require('../config/database');

class EmployeeAuthService {
  /**
   * Find employee by email with retry logic for database timeouts
   */
    async findEmployeeByEmail(email) {
    const maxRetries = 3;
    let lastError;

    // Normalize email to lowercase for consistent searching
    const normalizedEmail = email.toLowerCase().trim();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use the centralized database connection from config
        const employeesCollection = await getCollection('employees');
        
        // Use case-insensitive email search for both data structures
        // Also try exact match with normalized email for better performance
        const employee = await employeesCollection.findOne({ 
          $or: [
            { 'basicInfo.email': normalizedEmail },
            { email: normalizedEmail },
            { 'basicInfo.email': { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } },
            { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } }
          ]
        }, { maxTimeMS: 25000 }); // 25 second timeout per attempt
        
        return { success: true, data: employee };
      } catch (error) {
        lastError = error;
        console.error(`Error finding employee by email (attempt ${attempt}/${maxRetries}):`, error.message);
        
        // If it's a timeout error and we have more attempts, wait before retrying
        if (error.message?.includes('timed out') && attempt < maxRetries) {
          const delay = attempt * 1000; // 1s, 2s, 3s delays
          console.log(`Database timeout, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break; // Don't retry for non-timeout errors
        }
      }
    }

    console.error('All attempts to find employee failed:', lastError.message);
    return { success: false, error: lastError.message };
  }

  /**
   * Verify employee password
   */
  async verifyPassword(employeeId, password) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return { success: false, isValid: false, error: 'Employee not found' };
      }

      // Handle both data structures for password field
      const passwordField = employee.authentication?.password || employee.password;
      if (!passwordField) {
        return { success: false, isValid: false, error: 'No password field found' };
      }

      const isValid = await bcrypt.compare(password, passwordField);
      return { success: true, isValid };
    } catch (error) {
      console.error('Error verifying password:', error);
      return { success: false, isValid: false, error: error.message };
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return { success: true, data: hashedPassword };
    } catch (error) {
      console.error('Error hashing password:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(employeeId) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return { success: false, isLocked: false, error: 'Employee not found' };
      }

      const isLocked = employee.isLocked && employee.lockUntil && employee.lockUntil > new Date();
      return { success: true, isLocked };
    } catch (error) {
      console.error('Error checking account lock:', error);
      return { success: false, isLocked: false, error: error.message };
    }
  }

  /**
   * Update login attempts
   */
  async updateLoginAttempts(employeeId, failed = false) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return { success: false, error: 'Employee not found' };
      }

      // Create update object to avoid validation issues
      const updateData = {};

      if (failed) {
        updateData.loginAttempts = (employee.loginAttempts || 0) + 1;
        
        // Lock account after 5 failed attempts for 30 minutes
        if (updateData.loginAttempts >= 5) {
          updateData.isLocked = true;
          updateData.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
      } else {
        // Reset login attempts on successful login
        updateData.loginAttempts = 0;
        updateData.isLocked = false;
        updateData.lockUntil = null;
        updateData.lastLogin = new Date();
      }

      // Use findByIdAndUpdate to avoid validation issues with existing data
      await Employee.findByIdAndUpdate(
        employeeId, 
        { $set: updateData },
        { 
          new: true,
          runValidators: false // Skip validation to avoid enum issues with existing data
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating login attempts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate JWT token
   */
  async generateJWTToken(employeeId, permissions = []) {
    try {
      // Get employee to include role in JWT
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return { success: false, error: 'Employee not found' };
      }

      const payload = {
        userId: employeeId,
        type: 'employee',
        role: employee.role,
        roles: employee.roles || [],
        permissions
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      return { success: true, data: token };
    } catch (error) {
      console.error('Error generating JWT token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get employee permissions
   */
  async getEmployeePermissions(employeeId) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return { success: false, data: [] };
      }

      // Default permissions based on role
      let permissions = [];
      
      switch (employee.role) {
        case 'admin':
          permissions = [
            'dashboard:read', 'dashboard:write',
            'hr:read', 'hr:write', 'hr:delete',
            'finance:read', 'finance:write', 'finance:delete',
            'crm:read', 'crm:write', 'crm:delete',
            'partners:read', 'partners:write', 'partners:delete',
            'marketing:read', 'marketing:write', 'marketing:delete',
            'projects:read', 'projects:write', 'projects:delete',
            'analytics:read', 'analytics:write',
            'legal:read', 'legal:write', 'legal:delete',
            'communication:read', 'communication:write', 'communication:delete',
            'settings:read', 'settings:write',
            'users:read', 'users:write', 'users:delete'
          ];
          break;
        case 'manager':
          permissions = [
            'dashboard:read', 'dashboard:write',
            'hr:read', 'hr:write',
            'finance:read', 'finance:write',
            'crm:read', 'crm:write',
            'partners:read', 'partners:write',
            'marketing:read', 'marketing:write',
            'projects:read', 'projects:write',
            'analytics:read',
            'legal:read', 'legal:write',
            'communication:read', 'communication:write',
            'settings:read'
          ];
          break;
        case 'hr':
          permissions = [
            'dashboard:read',
            'hr:read', 'hr:write', 'hr:delete',
            'analytics:read',
            'communication:read', 'communication:write'
          ];
          break;
        case 'finance':
          permissions = [
            'dashboard:read',
            'finance:read', 'finance:write', 'finance:delete',
            'analytics:read'
          ];
          break;
        case 'crm':
          permissions = [
            'dashboard:read',
            'crm:read', 'crm:write', 'crm:delete',
            'analytics:read'
          ];
          break;
        case 'marketing':
          permissions = [
            'dashboard:read',
            'marketing:read', 'marketing:write', 'marketing:delete',
            'analytics:read'
          ];
          break;
        case 'legal':
          permissions = [
            'dashboard:read',
            'legal:read', 'legal:write', 'legal:delete'
          ];
          break;
        default: // employee
          permissions = [
            'dashboard:read',
            'communication:read', 'communication:write'
          ];
      }

      // Add custom permissions from employee record
      if (employee.permissions && employee.permissions.length > 0) {
        permissions = [...new Set([...permissions, ...employee.permissions])];
      }

      return { success: true, data: permissions };
    } catch (error) {
      console.error('Error getting employee permissions:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Create employee with authentication
   */
  async createEmployeeWithAuth(employeeData) {
    try {
      // Normalize email to lowercase for consistency
      if (employeeData.email) {
        employeeData.email = employeeData.email.toLowerCase().trim();
      }
      
      // Hash password
      const hashResult = await this.hashPassword(employeeData.password);
      if (!hashResult.success) {
        return { success: false, error: hashResult.error };
      }

      // Create employee with hashed password
      const employee = new Employee({
        ...employeeData,
        password: hashResult.data
      });

      await employee.save();

      // Remove password from response
      const { password, ...employeeWithoutPassword } = employee.toObject();

      return { success: true, data: employeeWithoutPassword };
    } catch (error) {
      console.error('Error creating employee with auth:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update employee password
   */
  async updatePassword(employeeId, newPassword) {
    try {
      const hashResult = await this.hashPassword(newPassword);
      if (!hashResult.success) {
        return { success: false, error: hashResult.error };
      }

      const employee = await Employee.findByIdAndUpdate(
        employeeId,
        { password: hashResult.data },
        { new: true }
      );

      if (!employee) {
        return { success: false, error: 'Employee not found' };
      }

      return { success: true, data: employee };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmployeeAuthService();
