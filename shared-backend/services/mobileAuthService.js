const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP, verifyOTP } = require('./smsService');
const { logger } = require('../config/logger');

class MobileAuthService {
  constructor() {
    this.dbService = require('./databaseService');
  }

  /**
   * Register a new mobile user
   */
  async registerUser(userData) {
    try {
      const { phoneNumber, email, password, fullName, deviceToken } = userData;

      // Check if user already exists
      const existingUser = await this.dbService.findOne('users', {
        $or: [{ email }, { phoneNumber }]
      });

      if (existingUser) {
        throw new Error('User with this email or phone number already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const newUser = {
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        email,
        phoneNumber,
        password: hashedPassword,
        userType: 'customer',
        isVerified: false,
        isActive: true,
        deviceTokens: deviceToken ? [deviceToken] : [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const user = await this.dbService.create('users', newUser);

      // Send OTP for phone verification
      await this.sendVerificationOTP(phoneNumber);

      // Remove password from response
      delete user.password;

      return {
        user,
        requiresVerification: true
      };
    } catch (error) {
      logger.error('Mobile registration error:', error);
      throw error;
    }
  }

  /**
   * Login mobile user
   */
  async loginUser(identifier, password, deviceToken) {
    try {
      // Find user by email or phone
      const user = await this.dbService.findOne('users', {
        $or: [{ email: identifier }, { phoneNumber: identifier }]
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Update device token if provided
      if (deviceToken && !user.deviceTokens?.includes(deviceToken)) {
        await this.dbService.updateOne('users', 
          { _id: user._id },
          { 
            $addToSet: { deviceTokens: deviceToken },
            updatedAt: new Date()
          }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          userType: user.userType 
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Remove password from response
      delete user.password;

      return {
        user,
        token,
        requiresVerification: !user.isVerified
      };
    } catch (error) {
      logger.error('Mobile login error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP for phone number
   */
  async verifyOTP(phoneNumber, otp) {
    try {
      const verificationResult = await verifyOTP(phoneNumber, otp);

      if (verificationResult.success && verificationResult.verified) {
        // Update user verification status
        await this.dbService.updateOne('users',
          { phoneNumber },
          { 
            isVerified: true,
            phoneVerifiedAt: new Date(),
            updatedAt: new Date()
          }
        );

        return {
          verified: true,
          message: 'Phone number verified successfully'
        };
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      logger.error('OTP verification error:', error);
      throw error;
    }
  }

  /**
   * Send verification OTP
   */
  async sendVerificationOTP(phoneNumber) {
    try {
      const result = await sendOTP(phoneNumber, 'verification');
      
      if (!result.success) {
        throw new Error('Failed to send OTP');
      }

      return result;
    } catch (error) {
      logger.error('Send verification OTP error:', error);
      throw error;
    }
  }

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(identifier) {
    try {
      // Find user by email or phone
      const user = await this.dbService.findOne('users', {
        $or: [{ email: identifier }, { phoneNumber: identifier }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Send OTP to phone number
      const result = await sendOTP(user.phoneNumber, 'password_reset');
      
      if (!result.success) {
        throw new Error('Failed to send password reset OTP');
      }

      return result;
    } catch (error) {
      logger.error('Send password reset OTP error:', error);
      throw error;
    }
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(identifier, otp, newPassword) {
    try {
      // Find user by email or phone
      const user = await this.dbService.findOne('users', {
        $or: [{ email: identifier }, { phoneNumber: identifier }]
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify OTP
      const verificationResult = await verifyOTP(user.phoneNumber, otp);

      if (!verificationResult.success || !verificationResult.verified) {
        throw new Error('Invalid OTP');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.dbService.updateOne('users',
        { _id: user._id },
        { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      );

      return {
        success: true,
        message: 'Password reset successfully'
      };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(userId) {
    try {
      const user = await this.dbService.findOne('users', { _id: userId });

      if (!user || !user.isActive) {
        throw new Error('Invalid user');
      }

      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email,
          userType: user.userType 
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      return { token };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Logout user (remove device token)
   */
  async logoutUser(userId, deviceToken) {
    try {
      if (deviceToken) {
        await this.dbService.updateOne('users',
          { _id: userId },
          { 
            $pull: { deviceTokens: deviceToken },
            updatedAt: new Date()
          }
        );
      }

      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const user = await this.dbService.findOne('users', { _id: userId });

      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive data
      delete user.password;
      delete user.deviceTokens;

      return user;
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData.email; // Email should be updated through separate process
      delete updateData.phoneNumber; // Phone should be updated through verification process

      updateData.updatedAt = new Date();

      const user = await this.dbService.updateOne('users',
        { _id: userId },
        updateData
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }
}

module.exports = new MobileAuthService();
