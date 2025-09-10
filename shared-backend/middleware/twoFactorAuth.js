const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { logger } = require('../config/logger');
const userService = require('../services/userService');
const mfaSetup = require('../models/mfaSetup');

class TwoFactorAuth {
  constructor() {
    this.secretLength = 32;
    this.algorithm = 'sha1';
    this.digits = 6;
    this.period = 30;
    this.window = 2; // Allow 2 time steps for clock skew
  }

  // Generate secret for TOTP
  generateSecret(userId, label = 'Clutch') {
    try {
      const secret = speakeasy.generateSecret({
        name: `${label} (${userId})`,
        issuer: 'Clutch Automotive Services',
        length: this.secretLength
      });

      return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
        qrCode: null // Will be generated on demand
      };
    } catch (error) {
      logger.error('❌ Error generating TOTP secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  // Generate QR code for authenticator apps
  async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      logger.error('❌ Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify TOTP token
  verifyToken(token, secret) {
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: this.window,
        algorithm: this.algorithm,
        digits: this.digits,
        period: this.period
      });
    } catch (error) {
      logger.error('❌ Error verifying TOTP token:', error);
      return false;
    }
  }

  // Generate backup codes
  generateBackupCodes(count = 10) {
    try {
      const codes = [];
      for (let i = 0; i < count; i++) {
        const code = speakeasy.generateSecret({
          length: 8,
          name: 'backup',
          issuer: 'Clutch'
        });
        codes.push(code.base32.substring(0, 8).toUpperCase());
      }
      return codes;
    } catch (error) {
      logger.error('❌ Error generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  // Verify backup code
  verifyBackupCode(code, storedCodes) {
    try {
      const hashedCode = this.hashBackupCode(code);
      return storedCodes.includes(hashedCode);
    } catch (error) {
      logger.error('❌ Error verifying backup code:', error);
      return false;
    }
  }

  // Hash backup code for storage
  hashBackupCode(code) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  // Setup 2FA for user
  async setup2FA(userId, method = 'totp') {
    try {
      const user = await userService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let mfaData = {
        userId: userId,
        method: method,
        isEnabled: false,
        createdAt: new Date()
      };

      if (method === 'totp') {
        const secret = this.generateSecret(userId);
        const qrCode = await this.generateQRCode(secret.otpauthUrl);
        const backupCodes = this.generateBackupCodes();

        mfaData = {
          ...mfaData,
          secret: secret.secret,
          otpauthUrl: secret.otpauthUrl,
          qrCode: qrCode,
          backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
          backupCodesUsed: []
        };
      } else if (method === 'sms') {
        mfaData = {
          ...mfaData,
          phoneNumber: user.phoneNumber,
          smsEnabled: true
        };
      } else if (method === 'email') {
        mfaData = {
          ...mfaData,
          email: user.email,
          emailEnabled: true
        };
      }

      // Save or update MFA setup
      await mfaSetup.findOneAndUpdate(
        { userId: userId },
        mfaData,
        { upsert: true, new: true }
      );

      return {
        success: true,
        method: method,
        setupData: method === 'totp' ? {
          qrCode: qrCode,
          backupCodes: backupCodes,
          secret: secret.secret
        } : null
      };
    } catch (error) {
      logger.error('❌ Error setting up 2FA:', error);
      throw new Error('Failed to setup 2FA');
    }
  }

  // Enable 2FA for user
  async enable2FA(userId, token, method = 'totp') {
    try {
      const mfaConfig = await mfaSetup.findOne({ userId: userId });
      if (!mfaConfig) {
        throw new Error('2FA not configured');
      }

      let isValid = false;

      if (method === 'totp') {
        isValid = this.verifyToken(token, mfaConfig.secret);
      } else if (method === 'backup') {
        isValid = this.verifyBackupCode(token, mfaConfig.backupCodes);
        if (isValid) {
          // Mark backup code as used
          const hashedToken = this.hashBackupCode(token);
          mfaConfig.backupCodesUsed.push(hashedToken);
          mfaConfig.backupCodes = mfaConfig.backupCodes.filter(code => code !== hashedToken);
        }
      }

      if (!isValid) {
        throw new Error('Invalid verification token');
      }

      // Enable 2FA
      mfaConfig.isEnabled = true;
      mfaConfig.enabledAt = new Date();
      await mfaConfig.save();

      // Update user model
      await userService.updateUser(userId, {
        'security.mfaEnabled': true,
        'security.mfaMethod': method
      });

      return { success: true, message: '2FA enabled successfully' };
    } catch (error) {
      logger.error('❌ Error enabling 2FA:', error);
      throw error;
    }
  }

  // Disable 2FA for user
  async disable2FA(userId, token) {
    try {
      const mfaConfig = await mfaSetup.findOne({ userId: userId });
      if (!mfaConfig || !mfaConfig.isEnabled) {
        throw new Error('2FA not enabled');
      }

      // Verify token before disabling
      const isValid = this.verifyToken(token, mfaConfig.secret) ||
                     this.verifyBackupCode(token, mfaConfig.backupCodes);

      if (!isValid) {
        throw new Error('Invalid verification token');
      }

      // Disable 2FA
      mfaConfig.isEnabled = false;
      mfaConfig.disabledAt = new Date();
      await mfaConfig.save();

      // Update user model
      await userService.updateUser(userId, {
        'security.mfaEnabled': false,
        'security.mfaMethod': null
      });

      return { success: true, message: '2FA disabled successfully' };
    } catch (error) {
      logger.error('❌ Error disabling 2FA:', error);
      throw error;
    }
  }

  // Verify 2FA token
  async verify2FA(userId, token, method = 'totp') {
    try {
      const mfaConfig = await mfaSetup.findOne({ userId: userId });
      if (!mfaConfig || !mfaConfig.isEnabled) {
        return { isValid: false, reason: '2FA not enabled' };
      }

      let isValid = false;

      if (method === 'totp') {
        isValid = this.verifyToken(token, mfaConfig.secret);
      } else if (method === 'backup') {
        isValid = this.verifyBackupCode(token, mfaConfig.backupCodes);
        if (isValid) {
          // Mark backup code as used
          const hashedToken = this.hashBackupCode(token);
          mfaConfig.backupCodesUsed.push(hashedToken);
          mfaConfig.backupCodes = mfaConfig.backupCodes.filter(code => code !== hashedToken);
          await mfaConfig.save();
        }
      }

      return { isValid, reason: isValid ? 'valid' : 'invalid_token' };
    } catch (error) {
      logger.error('❌ Error verifying 2FA:', error);
      return { isValid: false, reason: 'error' };
    }
  }

  // Generate new backup codes
  async regenerateBackupCodes(userId, token) {
    try {
      const mfaConfig = await mfaSetup.findOne({ userId: userId });
      if (!mfaConfig || !mfaConfig.isEnabled) {
        throw new Error('2FA not enabled');
      }

      // Verify current token
      const isValid = this.verifyToken(token, mfaConfig.secret);
      if (!isValid) {
        throw new Error('Invalid verification token');
      }

      // Generate new backup codes
      const newBackupCodes = this.generateBackupCodes();
      mfaConfig.backupCodes = newBackupCodes.map(code => this.hashBackupCode(code));
      mfaConfig.backupCodesUsed = [];
      await mfaConfig.save();

      return {
        success: true,
        backupCodes: newBackupCodes,
        message: 'Backup codes regenerated successfully'
      };
    } catch (error) {
      logger.error('❌ Error regenerating backup codes:', error);
      throw error;
    }
  }

  // Send SMS verification code
  async sendSMSVerification(phoneNumber) {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // This would integrate with SMS service like Twilio
      // For now, return mock success
      logger.info(`📱 SMS verification code sent to ${phoneNumber}: ${code}`);
      
      return {
        success: true,
        code: code, // In production, this would be sent via SMS
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      };
    } catch (error) {
      logger.error('❌ Error sending SMS verification:', error);
      throw new Error('Failed to send SMS verification');
    }
  }

  // Send email verification code
  async sendEmailVerification(email) {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // This would integrate with email service like SendGrid
      // For now, return mock success
      logger.info(`📧 Email verification code sent to ${email}: ${code}`);
      
      return {
        success: true,
        code: code, // In production, this would be sent via email
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      };
    } catch (error) {
      logger.error('❌ Error sending email verification:', error);
      throw new Error('Failed to send email verification');
    }
  }

  // Middleware for protecting routes
  require2FA() {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        const mfaConfig = await mfaSetup.findOne({ userId: userId });
        if (!mfaConfig || !mfaConfig.isEnabled) {
          return res.status(403).json({
            success: false,
            error: '2FA not enabled',
            require2FASetup: true
          });
        }

        // Check if 2FA token is provided
        const token = req.headers['x-2fa-token'] || req.body.twoFactorToken;
        if (!token) {
          return res.status(403).json({
            success: false,
            error: '2FA token required',
            require2FAToken: true
          });
        }

        // Verify 2FA token
        const verification = await this.verify2FA(userId, token);
        if (!verification.isValid) {
          return res.status(403).json({
            success: false,
            error: 'Invalid 2FA token',
            reason: verification.reason
          });
        }

        next();
      } catch (error) {
        logger.error('❌ 2FA middleware error:', error);
        return res.status(500).json({
          success: false,
          error: '2FA verification failed'
        });
      }
    };
  }

  // Middleware for optional 2FA
  optional2FA() {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return next();
        }

        const mfaConfig = await mfaSetup.findOne({ userId: userId });
        if (!mfaConfig || !mfaConfig.isEnabled) {
          return next();
        }

        const token = req.headers['x-2fa-token'] || req.body.twoFactorToken;
        if (token) {
          const verification = await this.verify2FA(userId, token);
          if (verification.isValid) {
            req.user.mfaVerified = true;
          }
        }

        next();
      } catch (error) {
        logger.error('❌ Optional 2FA middleware error:', error);
        next();
      }
    };
  }
}

module.exports = new TwoFactorAuth();
