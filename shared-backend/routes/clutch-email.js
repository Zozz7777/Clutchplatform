const express = require('express');
const ClutchEmailServer = require('../services/clutch-email-server');
const { logger } = require('../config/logger');
const { getCollection } = require('../config/database');
const emailServer = new ClutchEmailServer();
const router = express.Router();

// Middleware to ensure email server is initialized
const ensureEmailServer = async (req, res, next) => {
  try {
    if (!emailServer.transporter) {
      await emailServer.initialize();
    }
    next();
  } catch (error) {
    logger.error('❌ Email server initialization failed:', error);
    res.status(500).json({
      success: false,
      error: 'EMAIL_SERVER_ERROR',
      message: 'Email server is not available'
    });
  }
};

// Middleware to validate session
const validateSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'NO_SESSION',
        message: 'Session ID required'
      });
    }

    const session = await emailServer.validateSession(sessionId);
    req.user = {
      userId: session.userId,
      emailAddress: session.emailAddress
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'INVALID_SESSION',
      message: 'Invalid or expired session'
    });
  }
};

// Apply middleware to all routes
router.use(ensureEmailServer);

// Authentication Routes
router.post('/auth/login', async (req, res) => {
  try {
    const { emailAddress, password } = req.body;
    
    if (!emailAddress || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email address and password are required'
      });
    }

    const result = await emailServer.authenticateUser(emailAddress, password);
    
    // Set session cookie
    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      sessionId: result.sessionId,
      account: result.account
    });
  } catch (error) {
    logger.error('❌ Login failed:', error);
    res.status(401).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: error.message
    });
  }
});

router.post('/auth/logout', validateSession, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    // Remove session from database
    const sessionsCollection = await getCollection('email_sessions');
    await sessionsCollection.deleteOne({ sessionId });
    
    // Clear cookie
    res.clearCookie('sessionId');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('❌ Logout failed:', error);
    res.status(500).json({
      success: false,
      error: 'LOGOUT_FAILED',
      message: 'Failed to logout'
    });
  }
});

// Email Account Management
router.post('/accounts', async (req, res) => {
  try {
    const { userId, emailAddress, password, displayName } = req.body;
    
    if (!userId || !emailAddress || !password || !displayName) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'All fields are required'
      });
    }

    const result = await emailServer.createEmailAccount(userId, emailAddress, password, displayName);
    
    res.status(201).json({
      success: true,
      accountId: result.accountId,
      message: 'Email account created successfully'
    });
  } catch (error) {
    logger.error('❌ Account creation failed:', error);
    res.status(400).json({
      success: false,
      error: 'ACCOUNT_CREATION_FAILED',
      message: error.message
    });
  }
});

router.get('/accounts/:userId', validateSession, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied'
      });
    }

    const accountsCollection = await getCollection('email_accounts');
    const account = await accountsCollection.findOne({ userId });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'ACCOUNT_NOT_FOUND',
        message: 'Account not found'
      });
    }

    // Remove sensitive data
    delete account.password;
    
    res.json({
      success: true,
      account
    });
  } catch (error) {
    logger.error('❌ Account retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'ACCOUNT_RETRIEVAL_FAILED',
      message: 'Failed to retrieve account'
    });
  }
});

// Email Operations
router.post('/send', validateSession, async (req, res) => {
  try {
    const { to, subject, body, cc, bcc, attachments } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'To, subject, and body are required'
      });
    }

    const result = await emailServer.sendEmail(
      req.user.emailAddress,
      to,
      subject,
      body,
      {
        userId: req.user.userId,
        cc,
        bcc,
        attachments,
        fromName: req.body.fromName
      }
    );
    
    res.json({
      success: true,
      messageId: result.messageId,
      emailId: result.emailId
    });
  } catch (error) {
    logger.error('❌ Email sending failed:', error);
    res.status(500).json({
      success: false,
      error: 'EMAIL_SEND_FAILED',
      message: error.message
    });
  }
});

router.get('/emails/:userId/:folder', validateSession, async (req, res) => {
  try {
    const { userId, folder } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied'
      });
    }

    const result = await emailServer.getEmails(userId, folder, parseInt(page), parseInt(limit));
    
    res.json(result);
  } catch (error) {
    logger.error('❌ Email retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'EMAIL_RETRIEVAL_FAILED',
      message: 'Failed to retrieve emails'
    });
  }
});

router.get('/emails/:emailId', validateSession, async (req, res) => {
  try {
    const { emailId } = req.params;
    
    const result = await emailServer.getEmail(emailId);
    
    // Check if user owns this email
    if (result.email.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied'
      });
    }
    
    res.json(result);
  } catch (error) {
    logger.error('❌ Email retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'EMAIL_RETRIEVAL_FAILED',
      message: 'Failed to retrieve email'
    });
  }
});

router.put('/emails/:emailId/move', validateSession, async (req, res) => {
  try {
    const { emailId } = req.params;
    const { folder } = req.body;
    
    if (!folder) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FOLDER',
        message: 'Target folder is required'
      });
    }

    const result = await emailServer.moveEmail(emailId, folder);
    
    res.json(result);
  } catch (error) {
    logger.error('❌ Email move failed:', error);
    res.status(500).json({
      success: false,
      error: 'EMAIL_MOVE_FAILED',
      message: error.message
    });
  }
});

router.delete('/emails/:emailId', validateSession, async (req, res) => {
  try {
    const { emailId } = req.params;
    
    const result = await emailServer.deleteEmail(emailId);
    
    res.json(result);
  } catch (error) {
    logger.error('❌ Email deletion failed:', error);
    res.status(500).json({
      success: false,
      error: 'EMAIL_DELETION_FAILED',
      message: error.message
    });
  }
});

// Folder Management
router.get('/folders/:userId', validateSession, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied'
      });
    }

    const result = await emailServer.getFolders(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('❌ Folder retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'FOLDER_RETRIEVAL_FAILED',
      message: 'Failed to retrieve folders'
    });
  }
});

router.post('/folders', validateSession, async (req, res) => {
  try {
    const { userId, name, type } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'User ID and folder name are required'
      });
    }

    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied'
      });
    }

    const result = await emailServer.createFolder(userId, name, type);
    
    res.status(201).json(result);
  } catch (error) {
    logger.error('❌ Folder creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'FOLDER_CREATION_FAILED',
      message: error.message
    });
  }
});

// Contact Management
router.get('/contacts/:userId', validateSession, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied'
      });
    }

    const result = await emailServer.getContacts(userId);
    
    res.json(result);
  } catch (error) {
    logger.error('❌ Contact retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'CONTACT_RETRIEVAL_FAILED',
      message: 'Failed to retrieve contacts'
    });
  }
});

router.post('/contacts', validateSession, async (req, res) => {
  try {
    const { userId, contact } = req.body;
    
    if (!userId || !contact || !contact.name || !contact.email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'User ID, contact name, and email are required'
      });
    }

    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied'
      });
    }

    const result = await emailServer.addContact(userId, contact);
    
    res.status(201).json(result);
  } catch (error) {
    logger.error('❌ Contact creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'CONTACT_CREATION_FAILED',
      message: error.message
    });
  }
});

// Search
router.get('/search/:userId', validateSession, async (req, res) => {
  try {
    const { userId } = req.params;
    const { query, folder = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_QUERY',
        message: 'Search query is required'
      });
    }

    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied'
      });
    }

    const result = await emailServer.searchEmails(userId, query, folder);
    
    res.json(result);
  } catch (error) {
    logger.error('❌ Email search failed:', error);
    res.status(500).json({
      success: false,
      error: 'EMAIL_SEARCH_FAILED',
      message: 'Failed to search emails'
    });
  }
});

// Admin Routes
router.get('/admin/stats', async (req, res) => {
  try {
    const result = await emailServer.getEmailStats();
    
    res.json(result);
  } catch (error) {
    logger.error('❌ Stats retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'STATS_RETRIEVAL_FAILED',
      message: 'Failed to retrieve statistics'
    });
  }
});

// Health Check
router.get('/health', async (req, res) => {
  try {
    const isHealthy = emailServer.transporter && await emailServer.transporter.verify();
    
    res.json({
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    logger.error('❌ Health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
