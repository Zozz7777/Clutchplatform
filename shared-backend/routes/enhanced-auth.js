const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// ==================== BIOMETRIC AUTHENTICATION ====================

// Setup biometric authentication
router.post('/biometric-setup', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { biometricType, deviceId, deviceInfo } = req.body;

        if (!biometricType || !deviceId) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Biometric type and device ID are required'
            });
        }

        const biometricCollection = await getCollection('biometric_auth');
        
        // Check if biometric is already set up for this device
        const existingBiometric = await biometricCollection.findOne({
            userId,
            deviceId,
            biometricType
        });

        if (existingBiometric) {
            return res.status(400).json({
                success: false,
                error: 'BIOMETRIC_ALREADY_SETUP',
                message: 'Biometric authentication already set up for this device'
            });
        }

        // Generate biometric setup data
        const biometricData = {
            userId,
            deviceId,
            biometricType, // 'face-id', 'touch-id', 'fingerprint'
            deviceInfo: deviceInfo || {},
            isEnabled: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await biometricCollection.insertOne(biometricData);

        res.status(201).json({
            success: true,
            message: 'Biometric authentication setup successfully',
            data: {
                id: result.insertedId,
                biometricType,
                deviceId
            }
        });
    } catch (error) {
        logger.error('Biometric setup error:', error);
        res.status(500).json({
            success: false,
            error: 'BIOMETRIC_SETUP_ERROR',
            message: 'Failed to setup biometric authentication'
        });
    }
});

// Verify biometric authentication
router.post('/biometric-verify', async (req, res) => {
    try {
        const { deviceId, biometricType, verificationData } = req.body;

        if (!deviceId || !biometricType || !verificationData) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_REQUIRED_FIELDS',
                message: 'Device ID, biometric type, and verification data are required'
            });
        }

        const biometricCollection = await getCollection('biometric_auth');
        const biometric = await biometricCollection.findOne({
            deviceId,
            biometricType,
            isEnabled: true
        });

        if (!biometric) {
            return res.status(404).json({
                success: false,
                error: 'BIOMETRIC_NOT_FOUND',
                message: 'Biometric authentication not found for this device'
            });
        }

        // In a real implementation, you would verify the biometric data
        // For now, we'll simulate successful verification
        const isVerified = true; // Replace with actual biometric verification

        if (!isVerified) {
            return res.status(401).json({
                success: false,
                error: 'BIOMETRIC_VERIFICATION_FAILED',
                message: 'Biometric verification failed'
            });
        }

        // Generate session token for biometric login
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        const sessionsCollection = await getCollection('sessions');
        await sessionsCollection.insertOne({
            userId: biometric.userId,
            sessionToken,
            loginMethod: 'biometric',
            deviceId,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        res.json({
            success: true,
            message: 'Biometric verification successful',
            data: {
                sessionToken,
                userId: biometric.userId
            }
        });
    } catch (error) {
        logger.error('Biometric verification error:', error);
        res.status(500).json({
            success: false,
            error: 'BIOMETRIC_VERIFICATION_ERROR',
            message: 'Failed to verify biometric authentication'
        });
    }
});

// ==================== TWO-FACTOR AUTHENTICATION ====================

// Setup 2FA
router.post('/2fa/setup', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Generate secret key
        const secret = speakeasy.generateSecret({
            name: 'Clutch Platform',
            issuer: 'Clutch',
            length: 20
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        const twoFactorCollection = await getCollection('two_factor_auth');
        
        // Store 2FA setup data
        await twoFactorCollection.updateOne(
            { userId },
            {
                $set: {
                    secret: secret.base32,
                    isEnabled: false,
                    backupCodes: generateBackupCodes(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        res.json({
            success: true,
            message: '2FA setup initiated',
            data: {
                secret: secret.base32,
                qrCodeUrl,
                backupCodes: [] // Don't send backup codes in response for security
            }
        });
    } catch (error) {
        logger.error('2FA setup error:', error);
        res.status(500).json({
            success: false,
            error: '2FA_SETUP_ERROR',
            message: 'Failed to setup 2FA'
        });
    }
});

// Verify 2FA setup
router.post('/2fa/verify', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'MISSING_TOKEN',
                message: '2FA token is required'
            });
        }

        const twoFactorCollection = await getCollection('two_factor_auth');
        const twoFactor = await twoFactorCollection.findOne({ userId });

        if (!twoFactor) {
            return res.status(404).json({
                success: false,
                error: '2FA_NOT_SETUP',
                message: '2FA not setup for this user'
            });
        }

        // Verify token
        const verified = speakeasy.totp.verify({
            secret: twoFactor.secret,
            encoding: 'base32',
            token: token,
            window: 2 // Allow 2 time steps for clock skew
        });

        if (!verified) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_2FA_TOKEN',
                message: 'Invalid 2FA token'
            });
        }

        // Enable 2FA
        await twoFactorCollection.updateOne(
            { userId },
            {
                $set: {
                    isEnabled: true,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: '2FA verified and enabled successfully'
        });
    } catch (error) {
        logger.error('2FA verification error:', error);
        res.status(500).json({
            success: false,
            error: '2FA_VERIFICATION_ERROR',
            message: 'Failed to verify 2FA'
        });
    }
});

// Disable 2FA
router.post('/2fa/disable', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;

        const twoFactorCollection = await getCollection('two_factor_auth');
        const twoFactor = await twoFactorCollection.findOne({ userId });

        if (!twoFactor || !twoFactor.isEnabled) {
            return res.status(404).json({
                success: false,
                error: '2FA_NOT_ENABLED',
                message: '2FA not enabled for this user'
            });
        }

        // Verify token before disabling
        const verified = speakeasy.totp.verify({
            secret: twoFactor.secret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_2FA_TOKEN',
                message: 'Invalid 2FA token'
            });
        }

        // Disable 2FA
        await twoFactorCollection.updateOne(
            { userId },
            {
                $set: {
                    isEnabled: false,
                    updatedAt: new Date()
                }
            }
        );

        res.json({
            success: true,
            message: '2FA disabled successfully'
        });
    } catch (error) {
        logger.error('2FA disable error:', error);
        res.status(500).json({
            success: false,
            error: '2FA_DISABLE_ERROR',
            message: 'Failed to disable 2FA'
        });
    }
});

// ==================== DEVICE MANAGEMENT ====================

// Get user devices
router.get('/devices', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const devicesCollection = await getCollection('user_devices');
        const devices = await devicesCollection.find({ userId }).toArray();

        res.json({
            success: true,
            data: devices
        });
    } catch (error) {
        logger.error('Get devices error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_DEVICES_ERROR',
            message: 'Failed to retrieve devices'
        });
    }
});

// Remove device
router.delete('/devices/:deviceId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { deviceId } = req.params;

        const devicesCollection = await getCollection('user_devices');
        const result = await devicesCollection.deleteOne({
            userId,
            deviceId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'DEVICE_NOT_FOUND',
                message: 'Device not found'
            });
        }

        // Also remove biometric auth for this device
        const biometricCollection = await getCollection('biometric_auth');
        await biometricCollection.deleteMany({
            userId,
            deviceId
        });

        res.json({
            success: true,
            message: 'Device removed successfully'
        });
    } catch (error) {
        logger.error('Remove device error:', error);
        res.status(500).json({
            success: false,
            error: 'REMOVE_DEVICE_ERROR',
            message: 'Failed to remove device'
        });
    }
});

// Logout all devices
router.post('/logout-all-devices', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sessionsCollection = await getCollection('sessions');
        await sessionsCollection.deleteMany({ userId });

        res.json({
            success: true,
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        logger.error('Logout all devices error:', error);
        res.status(500).json({
            success: false,
            error: 'LOGOUT_ALL_DEVICES_ERROR',
            message: 'Failed to logout from all devices'
        });
    }
});

// ==================== SESSION MANAGEMENT ====================

// Get user sessions
router.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const sessionsCollection = await getCollection('sessions');
        const sessions = await sessionsCollection.find({ 
            userId,
            expiresAt: { $gt: new Date() }
        }).toArray();

        res.json({
            success: true,
            data: sessions
        });
    } catch (error) {
        logger.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: 'GET_SESSIONS_ERROR',
            message: 'Failed to retrieve sessions'
        });
    }
});

// Revoke specific session
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { sessionId } = req.params;

        const sessionsCollection = await getCollection('sessions');
        const result = await sessionsCollection.deleteOne({
            _id: sessionId,
            userId
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'SESSION_NOT_FOUND',
                message: 'Session not found'
            });
        }

        res.json({
            success: true,
            message: 'Session revoked successfully'
        });
    } catch (error) {
        logger.error('Revoke session error:', error);
        res.status(500).json({
            success: false,
            error: 'REVOKE_SESSION_ERROR',
            message: 'Failed to revoke session'
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

function generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
        codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
}

module.exports = router;
