const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { getCollection } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== ENHANCED SECURITY & AUTHENTICATION ROUTES ====================

// POST /api/v1/auth-advanced/setup-mfa - Setup Multi-Factor Authentication
router.post('/setup-mfa', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Setting up MFA for user:', req.user.id);
    
    const usersCollection = await getCollection('users');
    
    // Generate secret for TOTP
    const secret = speakeasy.generateSecret({
      name: `Clutch (${req.user.email})`,
      issuer: 'Clutch Auto Parts'
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    // Store secret temporarily (user needs to verify before saving)
    const tempSecret = {
      userId: req.user.id,
      secret: secret.base32,
      tempSecret: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    
    const tempSecretsCollection = await getCollection('temp_mfa_secrets');
    await tempSecretsCollection.insertOne(tempSecret);
    
    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32,
        backupCodes: generateBackupCodes()
      },
      message: 'MFA setup initiated. Please verify with a code from your authenticator app.',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error setting up MFA:', error);
    res.status(500).json({
      success: false,
      error: 'MFA_SETUP_FAILED',
      message: 'Failed to setup MFA'
    });
  }
});

// POST /api/v1/auth-advanced/verify-mfa - Verify MFA setup
router.post('/verify-mfa', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Verifying MFA setup for user:', req.user.id);
    
    const { token, backupCode } = req.body;
    
    if (!token && !backupCode) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Token or backup code is required'
      });
    }
    
    const tempSecretsCollection = await getCollection('temp_mfa_secrets');
    const usersCollection = await getCollection('users');
    
    // Get temporary secret
    const tempSecret = await tempSecretsCollection.findOne({
      userId: req.user.id,
      tempSecret: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tempSecret) {
      return res.status(400).json({
        success: false,
        error: 'MFA_SETUP_EXPIRED',
        message: 'MFA setup has expired. Please start over.'
      });
    }
    
    let verified = false;
    
    if (token) {
      // Verify TOTP token
      verified = speakeasy.totp.verify({
        secret: tempSecret.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    } else if (backupCode) {
      // Verify backup code (simplified - in production, use proper backup code system)
      verified = backupCode === 'BACKUP123456';
    }
    
    if (!verified) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_MFA_TOKEN',
        message: 'Invalid MFA token or backup code'
      });
    }
    
    // Save MFA secret to user
    await usersCollection.updateOne(
      { _id: req.user.id },
      {
        $set: {
          mfaEnabled: true,
          mfaSecret: tempSecret.secret,
          mfaBackupCodes: generateBackupCodes(),
          mfaSetupAt: new Date()
        }
      }
    );
    
    // Remove temporary secret
    await tempSecretsCollection.deleteOne({ _id: tempSecret._id });
    
    res.json({
      success: true,
      message: 'MFA setup completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error verifying MFA:', error);
    res.status(500).json({
      success: false,
      error: 'MFA_VERIFICATION_FAILED',
      message: 'Failed to verify MFA setup'
    });
  }
});

// POST /api/v1/auth-advanced/disable-mfa - Disable MFA
router.post('/disable-mfa', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Disabling MFA for user:', req.user.id);
    
    const { password, mfaToken } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Password is required to disable MFA'
      });
    }
    
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: req.user.id });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Invalid password'
      });
    }
    
    // Verify MFA token if MFA is enabled
    if (user.mfaEnabled && mfaToken) {
      const mfaValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken,
        window: 2
      });
      
      if (!mfaValid) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_MFA_TOKEN',
          message: 'Invalid MFA token'
        });
      }
    }
    
    // Disable MFA
    await usersCollection.updateOne(
      { _id: req.user.id },
      {
        $unset: {
          mfaEnabled: 1,
          mfaSecret: 1,
          mfaBackupCodes: 1,
          mfaSetupAt: 1
        }
      }
    );
    
    res.json({
      success: true,
      message: 'MFA disabled successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error disabling MFA:', error);
    res.status(500).json({
      success: false,
      error: 'MFA_DISABLE_FAILED',
      message: 'Failed to disable MFA'
    });
  }
});

// POST /api/v1/auth-advanced/oauth/authorize - OAuth 2.0 Authorization
router.post('/oauth/authorize', async (req, res) => {
  try {
    console.log('🔗 OAuth 2.0 authorization request');
    
    const { client_id, redirect_uri, response_type, scope, state } = req.body;
    
    // Validate required parameters
    if (!client_id || !redirect_uri || !response_type) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Missing required OAuth parameters'
      });
    }
    
    // Validate client
    const clientsCollection = await getCollection('oauth_clients');
    const client = await clientsCollection.findOne({ client_id });
    
    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CLIENT',
        message: 'Invalid client ID'
      });
    }
    
    if (!client.redirect_uris.includes(redirect_uri)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REDIRECT_URI',
        message: 'Invalid redirect URI'
      });
    }
    
    // Generate authorization code
    const authCode = generateAuthCode();
    const authCodeData = {
      code: authCode,
      client_id,
      redirect_uri,
      scope: scope || 'read',
      state,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      created_at: new Date()
    };
    
    const authCodesCollection = await getCollection('oauth_auth_codes');
    await authCodesCollection.insertOne(authCodeData);
    
    // Redirect with authorization code
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', authCode);
    if (state) redirectUrl.searchParams.set('state', state);
    
    res.json({
      success: true,
      data: {
        authorization_code: authCode,
        redirect_uri: redirectUrl.toString(),
        expires_in: 600 // 10 minutes
      },
      message: 'Authorization code generated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in OAuth authorization:', error);
    res.status(500).json({
      success: false,
      error: 'OAUTH_AUTHORIZATION_FAILED',
      message: 'Failed to process OAuth authorization'
    });
  }
});

// POST /api/v1/auth-advanced/oauth/token - OAuth 2.0 Token Exchange
router.post('/oauth/token', async (req, res) => {
  try {
    console.log('🔗 OAuth 2.0 token exchange');
    
    const { grant_type, code, redirect_uri, client_id, client_secret } = req.body;
    
    if (grant_type !== 'authorization_code') {
      return res.status(400).json({
        success: false,
        error: 'UNSUPPORTED_GRANT_TYPE',
        message: 'Only authorization_code grant type is supported'
      });
    }
    
    // Validate client credentials
    const clientsCollection = await getCollection('oauth_clients');
    const client = await clientsCollection.findOne({ 
      client_id, 
      client_secret 
    });
    
    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CLIENT',
        message: 'Invalid client credentials'
      });
    }
    
    // Validate authorization code
    const authCodesCollection = await getCollection('oauth_auth_codes');
    const authCode = await authCodesCollection.findOne({
      code,
      client_id,
      redirect_uri,
      expires_at: { $gt: new Date() }
    });
    
    if (!authCode) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_GRANT',
        message: 'Invalid or expired authorization code'
      });
    }
    
    // Generate access token
    const accessToken = jwt.sign(
      { 
        client_id,
        scope: authCode.scope,
        type: 'oauth_access_token'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        client_id,
        code,
        type: 'oauth_refresh_token'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Store tokens
    const tokensCollection = await getCollection('oauth_tokens');
    await tokensCollection.insertOne({
      access_token: accessToken,
      refresh_token: refreshToken,
      client_id,
      scope: authCode.scope,
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      created_at: new Date()
    });
    
    // Remove used authorization code
    await authCodesCollection.deleteOne({ _id: authCode._id });
    
    res.json({
      success: true,
      data: {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        scope: authCode.scope
      },
      message: 'Access token generated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in OAuth token exchange:', error);
    res.status(500).json({
      success: false,
      error: 'OAUTH_TOKEN_FAILED',
      message: 'Failed to exchange authorization code for token'
    });
  }
});

// POST /api/v1/auth-advanced/oauth/refresh - OAuth 2.0 Token Refresh
router.post('/oauth/refresh', async (req, res) => {
  try {
    console.log('🔗 OAuth 2.0 token refresh');
    
    const { grant_type, refresh_token } = req.body;
    
    if (grant_type !== 'refresh_token') {
      return res.status(400).json({
        success: false,
        error: 'UNSUPPORTED_GRANT_TYPE',
        message: 'Only refresh_token grant type is supported'
      });
    }
    
    // Validate refresh token
    const tokensCollection = await getCollection('oauth_tokens');
    const tokenData = await tokensCollection.findOne({
      refresh_token,
      expires_at: { $gt: new Date() }
    });
    
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_GRANT',
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        client_id: tokenData.client_id,
        scope: tokenData.scope,
        type: 'oauth_access_token'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Update token record
    await tokensCollection.updateOne(
      { _id: tokenData._id },
      {
        $set: {
          access_token: newAccessToken,
          expires_at: new Date(Date.now() + 60 * 60 * 1000),
          updated_at: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      data: {
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: tokenData.scope
      },
      message: 'Access token refreshed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error refreshing OAuth token:', error);
    res.status(500).json({
      success: false,
      error: 'OAUTH_REFRESH_FAILED',
      message: 'Failed to refresh access token'
    });
  }
});

// GET /api/v1/auth-advanced/sessions - Advanced session management
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Fetching user sessions:', req.user.id);
    
    const sessionsCollection = await getCollection('user_sessions');
    
    const sessions = await sessionsCollection
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    const activeSessions = sessions.map(session => ({
      id: session._id,
      device: session.device || 'Unknown Device',
      browser: session.browser || 'Unknown Browser',
      location: session.location || 'Unknown Location',
      ip: session.ip,
      isCurrent: session.sessionId === req.sessionID,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt
    }));
    
    res.json({
      success: true,
      data: {
        sessions: activeSessions,
        totalSessions: activeSessions.length,
        currentSession: activeSessions.find(s => s.isCurrent)
      },
      message: 'User sessions retrieved successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_SESSIONS_FAILED',
      message: 'Failed to fetch user sessions'
    });
  }
});

// DELETE /api/v1/auth-advanced/sessions/:id - Terminate specific session
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Terminating session:', req.params.id);
    
    const { ObjectId } = require('mongodb');
    const sessionsCollection = await getCollection('user_sessions');
    
    const result = await sessionsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.user.id
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Session not found or not authorized to terminate'
      });
    }
    
    res.json({
      success: true,
      message: 'Session terminated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error terminating session:', error);
    res.status(500).json({
      success: false,
      error: 'TERMINATE_SESSION_FAILED',
      message: 'Failed to terminate session'
    });
  }
});

// POST /api/v1/auth-advanced/sessions/terminate-all - Terminate all other sessions
router.post('/sessions/terminate-all', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Terminating all other sessions for user:', req.user.id);
    
    const sessionsCollection = await getCollection('user_sessions');
    
    const result = await sessionsCollection.deleteMany({
      userId: req.user.id,
      sessionId: { $ne: req.sessionID }
    });
    
    res.json({
      success: true,
      data: {
        terminatedSessions: result.deletedCount
      },
      message: 'All other sessions terminated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error terminating all sessions:', error);
    res.status(500).json({
      success: false,
      error: 'TERMINATE_ALL_SESSIONS_FAILED',
      message: 'Failed to terminate all sessions'
    });
  }
});

// Helper functions
function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
}

function generateAuthCode() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = router;
