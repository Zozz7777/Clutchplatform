const nodemailer = require('nodemailer');
const { getCollection } = require('../config/database');
const { logger } = require('../config/logger');
const emailConfig = require('../config/email-system-config');
const crypto = require('crypto');

class ClutchEmailServer {
  constructor() {
    this.transporter = null;
    this.emailConfig = emailConfig;
    this.activeConnections = new Map();
    this.rateLimitCache = new Map();
    this.loginAttempts = new Map();
  }

  async initialize() {
    try {
      // Initialize SMTP transporter
      this.transporter = nodemailer.createTransport(this.emailConfig.smtp);
      await this.transporter.verify();
      
      // Initialize database collections
      await this.initializeCollections();
      
      // Start monitoring
      if (this.emailConfig.monitoring.enabled) {
        this.startMonitoring();
      }
      
      logger.info('✅ Clutch Email Server initialized successfully');
      return true;
    } catch (error) {
      logger.error('❌ Failed to initialize Clutch Email Server:', error);
      throw error;
    }
  }

  async initializeCollections() {
    const collections = [
      'email_accounts',
      'email_messages',
      'email_folders',
      'email_attachments',
      'email_contacts',
      'email_signatures',
      'email_filters',
      'email_labels',
      'email_sessions',
      'email_activity_logs'
    ];

    for (const collectionName of collections) {
      try {
        const collection = await getCollection(collectionName);
        
        // Create indexes
        await collection.createIndex({ userId: 1 });
        await collection.createIndex({ emailId: 1 });
        await collection.createIndex({ createdAt: -1 });
        
        if (collectionName === 'email_messages') {
          await collection.createIndex({ from: 1, to: 1 });
          await collection.createIndex({ subject: 'text', body: 'text' });
          await collection.createIndex({ status: 1 });
          await collection.createIndex({ folder: 1 });
        }
        
        if (collectionName === 'email_accounts') {
          await collection.createIndex({ emailAddress: 1 }, { unique: true });
          await collection.createIndex({ status: 1 });
        }
        
        if (collectionName === 'email_sessions') {
          await collection.createIndex({ sessionId: 1 }, { unique: true });
          await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        }
        
        logger.info(`✅ Collection '${collectionName}' initialized`);
      } catch (error) {
        logger.warn(`⚠️ Collection '${collectionName}' already exists`);
      }
    }
  }

  // Authentication Methods
  async authenticateUser(emailAddress, password) {
    try {
      const accountsCollection = await getCollection('email_accounts');
      const account = await accountsCollection.findOne({ 
        emailAddress: emailAddress.toLowerCase(),
        status: 'active'
      });

      if (!account) {
        throw new Error('Account not found');
      }

      // Check for account lockout
      const lockoutKey = `lockout_${emailAddress}`;
      const lockoutInfo = this.loginAttempts.get(lockoutKey);
      
      if (lockoutInfo && lockoutInfo.attempts >= this.emailConfig.security.maxLoginAttempts) {
        const timeSinceLastAttempt = Date.now() - lockoutInfo.lastAttempt;
        if (timeSinceLastAttempt < this.emailConfig.security.lockoutDuration) {
          throw new Error('Account temporarily locked due to too many failed attempts');
        } else {
          // Reset lockout after duration
          this.loginAttempts.delete(lockoutKey);
        }
      }

      // Verify password
      const hashedPassword = await this.hashPassword(password);
      if (account.password !== hashedPassword) {
        // Increment failed attempts
        const currentAttempts = this.loginAttempts.get(lockoutKey) || { attempts: 0, lastAttempt: 0 };
        currentAttempts.attempts += 1;
        currentAttempts.lastAttempt = Date.now();
        this.loginAttempts.set(lockoutKey, currentAttempts);
        
        throw new Error('Invalid password');
      }

      // Reset failed attempts on successful login
      this.loginAttempts.delete(lockoutKey);

      // Create session
      const sessionId = this.generateSessionId();
      const session = {
        sessionId,
        userId: account.userId,
        emailAddress: account.emailAddress,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        ipAddress: null, // Will be set by the route handler
        userAgent: null  // Will be set by the route handler
      };

      const sessionsCollection = await getCollection('email_sessions');
      await sessionsCollection.insertOne(session);

      // Log successful login
      await this.logActivity(account.userId, 'login', 'success', {
        emailAddress: account.emailAddress,
        sessionId
      });

      return {
        success: true,
        sessionId,
        account: {
          userId: account.userId,
          emailAddress: account.emailAddress,
          displayName: account.displayName,
          storageUsed: account.storageUsed,
          storageLimit: account.storageLimit
        }
      };
    } catch (error) {
      logger.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  async validateSession(sessionId) {
    try {
      const sessionsCollection = await getCollection('email_sessions');
      const session = await sessionsCollection.findOne({ 
        sessionId,
        expiresAt: { $gt: new Date() }
      });

      if (!session) {
        throw new Error('Invalid or expired session');
      }

      return {
        success: true,
        userId: session.userId,
        emailAddress: session.emailAddress
      };
    } catch (error) {
      logger.error('❌ Session validation failed:', error);
      throw error;
    }
  }

  // Email Account Management
  async createEmailAccount(userId, emailAddress, password, displayName) {
    try {
      // Validate password strength
      if (password.length < this.emailConfig.security.passwordMinLength) {
        throw new Error(`Password must be at least ${this.emailConfig.security.passwordMinLength} characters long`);
      }

      const accountsCollection = await getCollection('email_accounts');
      
      // Check if email already exists
      const existingAccount = await accountsCollection.findOne({ 
        emailAddress: emailAddress.toLowerCase() 
      });
      
      if (existingAccount) {
        throw new Error('Email address already exists');
      }
      
      const account = {
        userId,
        emailAddress: emailAddress.toLowerCase(),
        password: await this.hashPassword(password),
        displayName,
        status: 'active',
        storageUsed: 0,
        storageLimit: this.emailConfig.storage.limit,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        settings: {
          signature: '',
          autoReply: false,
          autoReplyMessage: '',
          forwardTo: null,
          filters: []
        }
      };

      const result = await accountsCollection.insertOne(account);
      
      // Create default folders
      await this.createDefaultFolders(userId);
      
      // Send welcome email
      await this.sendWelcomeEmail(emailAddress, displayName);
      
      // Log account creation
      await this.logActivity(userId, 'account_created', 'success', {
        emailAddress: emailAddress.toLowerCase()
      });
      
      logger.info(`✅ Email account created: ${emailAddress}`);
      return { success: true, accountId: result.insertedId };
    } catch (error) {
      logger.error('❌ Failed to create email account:', error);
      throw error;
    }
  }

  async createDefaultFolders(userId) {
    try {
      const foldersCollection = await getCollection('email_folders');
      
      const defaultFolders = [
        { name: 'Inbox', type: 'inbox', userId, createdAt: new Date(), system: true },
        { name: 'Sent', type: 'sent', userId, createdAt: new Date(), system: true },
        { name: 'Drafts', type: 'drafts', userId, createdAt: new Date(), system: true },
        { name: 'Trash', type: 'trash', userId, createdAt: new Date(), system: true },
        { name: 'Spam', type: 'spam', userId, createdAt: new Date(), system: true },
        { name: 'Archive', type: 'archive', userId, createdAt: new Date(), system: true }
      ];

      await foldersCollection.insertMany(defaultFolders);
      logger.info(`✅ Default folders created for user: ${userId}`);
    } catch (error) {
      logger.error('❌ Failed to create default folders:', error);
    }
  }

  // Email Sending with Rate Limiting
  async sendEmail(from, to, subject, body, options = {}) {
    try {
      // Check rate limiting
      const rateLimitKey = `send_${from}`;
      const rateLimit = this.rateLimitCache.get(rateLimitKey) || { count: 0, resetTime: Date.now() + 3600000 };
      
      if (Date.now() > rateLimit.resetTime) {
        rateLimit.count = 0;
        rateLimit.resetTime = Date.now() + 3600000;
      }
      
      if (rateLimit.count >= this.emailConfig.rateLimit.emailsPerHour) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      rateLimit.count++;
      this.rateLimitCache.set(rateLimitKey, rateLimit);

      const messagesCollection = await getCollection('email_messages');
      
      const emailMessage = {
        from: from.toLowerCase(),
        to: Array.isArray(to) ? to.map(email => email.toLowerCase()) : [to.toLowerCase()],
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.map(email => email.toLowerCase()) : [options.cc.toLowerCase()]) : [],
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.map(email => email.toLowerCase()) : [options.bcc.toLowerCase()]) : [],
        subject,
        body: {
          text: options.text || '',
          html: options.html || body
        },
        attachments: options.attachments || [],
        messageId: this.generateMessageId(),
        threadId: options.threadId || this.generateThreadId(),
        status: 'sent',
        sentAt: new Date(),
        createdAt: new Date(),
        userId: options.userId || null,
        folder: 'sent'
      };

      // Send via SMTP
      const mailOptions = {
        from: `"${options.fromName || 'Clutch Email'}" <${from}>`,
        to: to.join(', '),
        cc: options.cc ? options.cc.join(', ') : undefined,
        bcc: options.bcc ? options.bcc.join(', ') : undefined,
        subject,
        text: options.text,
        html: options.html || body,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Store in database
      emailMessage.smtpMessageId = result.messageId;
      await messagesCollection.insertOne(emailMessage);
      
      // Log email sent
      if (options.userId) {
        await this.logActivity(options.userId, 'email_sent', 'success', {
          messageId: result.messageId,
          to: to
        });
      }
      
      logger.info(`✅ Email sent successfully: ${result.messageId}`);
      return { success: true, messageId: result.messageId, emailId: emailMessage._id };
    } catch (error) {
      logger.error('❌ Failed to send email:', error);
      throw error;
    }
  }

  // Email Receiving (IMAP)
  async receiveEmails(userId, folder = 'inbox') {
    try {
      const messagesCollection = await getCollection('email_messages');
      
      const query = { 
        to: { $regex: new RegExp(`@${this.emailConfig.domain}`, 'i') },
        status: 'received'
      };

      if (folder === 'inbox') {
        query.folder = 'inbox';
      }

      const emails = await messagesCollection
        .find(query)
        .sort({ receivedAt: -1 })
        .limit(50)
        .toArray();

      return { success: true, emails };
    } catch (error) {
      logger.error('❌ Failed to receive emails:', error);
      throw error;
    }
  }

  // Email Management
  async getEmails(userId, folder = 'inbox', page = 1, limit = 20) {
    try {
      const messagesCollection = await getCollection('email_messages');
      
      const query = { userId, folder };
      const skip = (page - 1) * limit;

      const emails = await messagesCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await messagesCollection.countDocuments(query);

      return {
        success: true,
        emails,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('❌ Failed to get emails:', error);
      throw error;
    }
  }

  async getEmail(emailId) {
    try {
      const messagesCollection = await getCollection('email_messages');
      const email = await messagesCollection.findOne({ _id: emailId });
      
      if (!email) {
        throw new Error('Email not found');
      }

      return { success: true, email };
    } catch (error) {
      logger.error('❌ Failed to get email:', error);
      throw error;
    }
  }

  async moveEmail(emailId, folder) {
    try {
      const messagesCollection = await getCollection('email_messages');
      
      const result = await messagesCollection.updateOne(
        { _id: emailId },
        { $set: { folder, updatedAt: new Date() } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Email not found or already in target folder');
      }

      logger.info(`✅ Email moved to folder: ${folder}`);
      return { success: true };
    } catch (error) {
      logger.error('❌ Failed to move email:', error);
      throw error;
    }
  }

  async deleteEmail(emailId) {
    try {
      const messagesCollection = await getCollection('email_messages');
      
      const result = await messagesCollection.updateOne(
        { _id: emailId },
        { $set: { folder: 'trash', deletedAt: new Date(), updatedAt: new Date() } }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Email not found');
      }

      logger.info(`✅ Email moved to trash`);
      return { success: true };
    } catch (error) {
      logger.error('❌ Failed to delete email:', error);
      throw error;
    }
  }

  // Folder Management
  async getFolders(userId) {
    try {
      const foldersCollection = await getCollection('email_folders');
      const folders = await foldersCollection.find({ userId }).toArray();
      
      return { success: true, folders };
    } catch (error) {
      logger.error('❌ Failed to get folders:', error);
      throw error;
    }
  }

  async createFolder(userId, name, type = 'custom') {
    try {
      const foldersCollection = await getCollection('email_folders');
      
      const folder = {
        userId,
        name,
        type,
        createdAt: new Date(),
        system: false
      };

      const result = await foldersCollection.insertOne(folder);
      
      logger.info(`✅ Folder created: ${name}`);
      return { success: true, folderId: result.insertedId };
    } catch (error) {
      logger.error('❌ Failed to create folder:', error);
      throw error;
    }
  }

  // Contact Management
  async addContact(userId, contact) {
    try {
      const contactsCollection = await getCollection('email_contacts');
      
      const newContact = {
        userId,
        name: contact.name,
        email: contact.email.toLowerCase(),
        phone: contact.phone || '',
        company: contact.company || '',
        notes: contact.notes || '',
        createdAt: new Date()
      };

      const result = await contactsCollection.insertOne(newContact);
      
      logger.info(`✅ Contact added: ${contact.name}`);
      return { success: true, contactId: result.insertedId };
    } catch (error) {
      logger.error('❌ Failed to add contact:', error);
      throw error;
    }
  }

  async getContacts(userId) {
    try {
      const contactsCollection = await getCollection('email_contacts');
      const contacts = await contactsCollection.find({ userId }).toArray();
      
      return { success: true, contacts };
    } catch (error) {
      logger.error('❌ Failed to get contacts:', error);
      throw error;
    }
  }

  // Search
  async searchEmails(userId, query, folder = 'all') {
    try {
      const messagesCollection = await getCollection('email_messages');
      
      const searchQuery = {
        userId,
        $or: [
          { subject: { $regex: query, $options: 'i' } },
          { 'body.text': { $regex: query, $options: 'i' } },
          { 'body.html': { $regex: query, $options: 'i' } },
          { from: { $regex: query, $options: 'i' } },
          { to: { $regex: query, $options: 'i' } }
        ]
      };

      if (folder !== 'all') {
        searchQuery.folder = folder;
      }

      const emails = await messagesCollection
        .find(searchQuery)
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      return { success: true, emails };
    } catch (error) {
      logger.error('❌ Failed to search emails:', error);
      throw error;
    }
  }

  // Utility Methods
  generateMessageId() {
    return `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${this.emailConfig.domain}>`;
  }

  generateThreadId() {
    return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  async hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async sendWelcomeEmail(emailAddress, displayName) {
    try {
      const template = this.emailConfig.templates.welcome;
      const html = template.html
        .replace('{{displayName}}', displayName)
        .replace('{{emailAddress}}', emailAddress);

      await this.sendEmail(
        'noreply@yourclutch.com',
        [emailAddress],
        template.subject,
        html,
        {
          fromName: 'Clutch Email System',
          html: html
        }
      );
    } catch (error) {
      logger.error('❌ Failed to send welcome email:', error);
    }
  }

  async logActivity(userId, action, status, details = {}) {
    try {
      const logsCollection = await getCollection('email_activity_logs');
      await logsCollection.insertOne({
        userId,
        action,
        status,
        details,
        timestamp: new Date(),
        ipAddress: details.ipAddress || null
      });
    } catch (error) {
      logger.error('❌ Failed to log activity:', error);
    }
  }

  startMonitoring() {
    setInterval(async () => {
      try {
        const stats = await this.getEmailStats();
        logger.info('📊 Email System Stats:', stats.stats);
        
        // Check for alerts
        if (stats.stats.storageUsed > this.emailConfig.monitoring.alertThreshold) {
          logger.warn('⚠️ Storage usage alert:', stats.stats.storageUsed);
        }
      } catch (error) {
        logger.error('❌ Monitoring check failed:', error);
      }
    }, this.emailConfig.monitoring.healthCheckInterval);
  }

  // Admin Methods
  async getEmailStats() {
    try {
      const messagesCollection = await getCollection('email_messages');
      const accountsCollection = await getCollection('email_accounts');
      
      const stats = {
        totalEmails: await messagesCollection.countDocuments(),
        totalAccounts: await accountsCollection.countDocuments(),
        emailsToday: await messagesCollection.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }),
        storageUsed: 0, // Calculate from attachments
        activeSessions: this.activeConnections.size,
        uptime: process.uptime()
      };

      return { success: true, stats };
    } catch (error) {
      logger.error('❌ Failed to get email stats:', error);
      throw error;
    }
  }
}

module.exports = ClutchEmailServer;
