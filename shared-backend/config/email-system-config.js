const emailSystemConfig = {
  // Domain Configuration
  domain: process.env.CLUTCH_EMAIL_DOMAIN || 'yourclutch.com',
  
  // SMTP Configuration
  smtp: {
    host: process.env.CLUTCH_SMTP_HOST || 'smtp.yourclutch.com',
    port: parseInt(process.env.CLUTCH_SMTP_PORT) || 587,
    secure: process.env.CLUTCH_SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.CLUTCH_SMTP_USER || 'noreply@yourclutch.com',
      pass: process.env.CLUTCH_SMTP_PASS || ''
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  
  // IMAP Configuration
  imap: {
    host: process.env.CLUTCH_IMAP_HOST || 'imap.yourclutch.com',
    port: parseInt(process.env.CLUTCH_IMAP_PORT) || 993,
    secure: process.env.CLUTCH_IMAP_SECURE === 'true' || true,
    auth: {
      user: process.env.CLUTCH_IMAP_USER || 'noreply@yourclutch.com',
      pass: process.env.CLUTCH_IMAP_PASS || ''
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  
  // Email Server Settings
  server: {
    name: process.env.EMAIL_SERVER_NAME || 'Clutch Email Server',
    version: '1.0.0',
    maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS) || 100,
    timeout: parseInt(process.env.EMAIL_TIMEOUT) || 30000
  },
  
  // Storage Configuration
  storage: {
    limit: parseInt(process.env.EMAIL_STORAGE_LIMIT) || 1073741824, // 1GB per user
    maxAttachmentSize: parseInt(process.env.EMAIL_MAX_ATTACHMENT_SIZE) || 10485760, // 10MB
    compression: process.env.EMAIL_COMPRESSION === 'true' || true
  },
  
  // Security Configuration
  security: {
    maxLoginAttempts: parseInt(process.env.EMAIL_MAX_LOGIN_ATTEMPTS) || 5,
    lockoutDuration: parseInt(process.env.EMAIL_LOCKOUT_DURATION) || 900000, // 15 minutes
    passwordMinLength: parseInt(process.env.EMAIL_PASSWORD_MIN_LENGTH) || 8,
    requireSSL: process.env.EMAIL_REQUIRE_SSL === 'true' || true
  },
  
  // Rate Limiting
  rateLimit: {
    emailsPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR) || 100,
    emailsPerDay: parseInt(process.env.EMAIL_RATE_LIMIT_PER_DAY) || 1000,
    connectionsPerMinute: parseInt(process.env.EMAIL_CONNECTIONS_PER_MINUTE) || 60
  },
  
  // Spam Protection
  spam: {
    enabled: process.env.EMAIL_SPAM_PROTECTION === 'true' || true,
    threshold: parseFloat(process.env.EMAIL_SPAM_THRESHOLD) || 5.0,
    whitelist: process.env.EMAIL_WHITELIST ? process.env.EMAIL_WHITELIST.split(',') : [],
    blacklist: process.env.EMAIL_BLACKLIST ? process.env.EMAIL_BLACKLIST.split(',') : []
  },
  
  // Backup Configuration
  backup: {
    enabled: process.env.EMAIL_BACKUP_ENABLED === 'true' || true,
    interval: process.env.EMAIL_BACKUP_INTERVAL || 'daily',
    retention: parseInt(process.env.EMAIL_BACKUP_RETENTION) || 30 // days
  },
  
  // Monitoring
  monitoring: {
    enabled: process.env.EMAIL_MONITORING_ENABLED === 'true' || true,
    healthCheckInterval: parseInt(process.env.EMAIL_HEALTH_CHECK_INTERVAL) || 60000, // 1 minute
    alertThreshold: parseInt(process.env.EMAIL_ALERT_THRESHOLD) || 90 // percentage
  },
  
  // Default Email Templates
  templates: {
    welcome: {
      subject: 'Welcome to Your Clutch Email',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ED1B24; color: white; padding: 20px; text-align: center;">
              <h1>Welcome to Your Clutch Email</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hello {{displayName}},</h2>
              <p>Welcome to your new email account at Your Clutch!</p>
              <p>Your email address: <strong>{{emailAddress}}</strong></p>
              <p>You can now:</p>
              <ul>
                <li>Send and receive emails</li>
                <li>Organize messages in folders</li>
                <li>Manage your contacts</li>
                <li>Access your email from anywhere</li>
              </ul>
              <p>Best regards,<br>The Clutch Team</p>
            </div>
          </body>
        </html>
      `
    },
    passwordReset: {
      subject: 'Password Reset Request',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ED1B24; color: white; padding: 20px; text-align: center;">
              <h1>Password Reset</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hello {{displayName}},</h2>
              <p>You requested a password reset for your Clutch email account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{resetLink}}" style="background-color: #ED1B24; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
              </div>
              <p>If you didn't request this, please ignore this email.</p>
              <p>Best regards,<br>The Clutch Team</p>
            </div>
          </body>
        </html>
      `
    }
  }
};

module.exports = emailSystemConfig;
