const logger = require('../utils/logger');

// GDPR Compliance Middleware
const gdprCompliance = (req, res, next) => {
  // Add GDPR headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Data processing consent tracking
  if (req.body && req.body.personalData) {
    req.gdprConsent = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      dataTypes: Object.keys(req.body.personalData)
    };
  }
  
  next();
};

// SOC 2 Compliance - Audit Logging
const soc2AuditLogging = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log all data access and modifications
    const auditLog = {
      timestamp: new Date().toISOString(),
      userId: req.user?.userId || 'anonymous',
      action: req.method,
      resource: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      dataSize: data ? data.length : 0,
      sensitiveData: checkForSensitiveData(req.body, req.query)
    };
    
    logger.audit('SOC2_AUDIT', auditLog);
    originalSend.call(this, data);
  };
  
  next();
};

// PCI DSS Compliance - Payment Data Protection
const pciDssProtection = (req, res, next) => {
  // Remove sensitive payment data from logs
  if (req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove credit card numbers
    if (sanitizedBody.cardNumber) {
      sanitizedBody.cardNumber = '****-****-****-' + sanitizedBody.cardNumber.slice(-4);
    }
    
    // Remove CVV
    if (sanitizedBody.cvv) {
      sanitizedBody.cvv = '***';
    }
    
    // Remove SSN
    if (sanitizedBody.ssn) {
      sanitizedBody.ssn = '***-**-' + sanitizedBody.ssn.slice(-4);
    }
    
    req.sanitizedBody = sanitizedBody;
  }
  
  next();
};

// HIPAA Compliance - Health Data Protection
const hipaaProtection = (req, res, next) => {
  // Check for health-related data
  const healthDataFields = ['medicalRecord', 'diagnosis', 'treatment', 'prescription', 'healthCondition'];
  
  if (req.body) {
    const hasHealthData = healthDataFields.some(field => req.body[field]);
    
    if (hasHealthData) {
      // Add HIPAA compliance headers
      res.setHeader('X-HIPAA-Compliant', 'true');
      res.setHeader('X-Data-Classification', 'PHI');
      
      // Log PHI access
      logger.audit('HIPAA_PHI_ACCESS', {
        timestamp: new Date().toISOString(),
        userId: req.user?.userId,
        ip: req.ip,
        resource: req.originalUrl,
        dataFields: healthDataFields.filter(field => req.body[field])
      });
    }
  }
  
  next();
};

// Data Encryption Middleware
const dataEncryption = (req, res, next) => {
  const crypto = require('crypto');
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  
  // Encrypt sensitive data in request
  if (req.body && req.body.sensitiveData) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(algorithm, secretKey);
      
      let encrypted = cipher.update(JSON.stringify(req.body.sensitiveData), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      req.body.encryptedData = {
        data: encrypted,
        iv: iv.toString('hex'),
        algorithm: algorithm
      };
      
      delete req.body.sensitiveData;
    } catch (error) {
      logger.error('Encryption error:', error);
      return res.status(500).json({
        success: false,
        error: 'ENCRYPTION_FAILED',
        message: 'Failed to encrypt sensitive data'
      });
    }
  }
  
  next();
};

// Audit Logging Middleware
const auditLogging = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Comprehensive audit logging
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId: req.user?.userId || 'anonymous',
      sessionId: req.sessionID,
      action: req.method,
      resource: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: Date.now() - req.startTime,
      dataClassification: classifyData(req.body, req.query),
      securityLevel: determineSecurityLevel(req.originalUrl, req.method)
    };
    
    // Log to different levels based on security classification
    if (auditEntry.dataClassification === 'high' || auditEntry.securityLevel === 'critical') {
      logger.security('HIGH_SECURITY_ACCESS', auditEntry);
    } else {
      logger.audit('STANDARD_ACCESS', auditEntry);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Access Control Middleware
const accessControl = (req, res, next) => {
  // Fine-grained permission checking
  const requiredPermissions = getRequiredPermissions(req.originalUrl, req.method);
  
  if (requiredPermissions.length > 0 && req.user) {
    const userPermissions = req.user.permissions || [];
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission) || 
      userPermissions.includes('admin') ||
      userPermissions.includes('super_admin')
    );
    
    if (!hasPermission) {
      logger.security('ACCESS_DENIED', {
        userId: req.user.userId,
        resource: req.originalUrl,
        method: req.method,
        requiredPermissions,
        userPermissions
      });
      
      return res.status(403).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  next();
};

// Session Management Middleware
const sessionManagement = (req, res, next) => {
  // Secure session configuration
  if (req.session) {
    // Set secure session options
    req.session.cookie.secure = process.env.NODE_ENV === 'production';
    req.session.cookie.httpOnly = true;
    req.session.cookie.sameSite = 'strict';
    req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
    
    // Track session activity
    req.session.lastActivity = new Date().toISOString();
    req.session.ip = req.ip;
    req.session.userAgent = req.get('User-Agent');
    
    // Check for session timeout
    if (req.session.lastActivity) {
      const lastActivity = new Date(req.session.lastActivity);
      const now = new Date();
      const timeDiff = now.getTime() - lastActivity.getTime();
      
      if (timeDiff > 30 * 60 * 1000) { // 30 minutes
        req.session.destroy();
        return res.status(401).json({
          success: false,
          error: 'SESSION_EXPIRED',
          message: 'Session has expired',
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  next();
};

// Helper Functions
function checkForSensitiveData(body, query) {
  const sensitiveFields = ['password', 'ssn', 'creditCard', 'bankAccount', 'medicalRecord'];
  const foundFields = [];
  
  [...Object.keys(body || {}), ...Object.keys(query || {})].forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      foundFields.push(key);
    }
  });
  
  return foundFields;
}

function classifyData(body, query) {
  const highSensitivityFields = ['ssn', 'creditCard', 'medicalRecord', 'biometric'];
  const mediumSensitivityFields = ['email', 'phone', 'address', 'financial'];
  
  const allFields = [...Object.keys(body || {}), ...Object.keys(query || {})];
  
  if (allFields.some(field => highSensitivityFields.some(sensitive => field.toLowerCase().includes(sensitive)))) {
    return 'high';
  } else if (allFields.some(field => mediumSensitivityFields.some(sensitive => field.toLowerCase().includes(sensitive)))) {
    return 'medium';
  }
  
  return 'low';
}

function determineSecurityLevel(url, method) {
  const criticalEndpoints = ['/admin', '/users', '/payments', '/security'];
  const sensitiveMethods = ['DELETE', 'PUT', 'POST'];
  
  if (criticalEndpoints.some(endpoint => url.includes(endpoint)) && sensitiveMethods.includes(method)) {
    return 'critical';
  } else if (sensitiveMethods.includes(method)) {
    return 'high';
  }
  
  return 'standard';
}

function getRequiredPermissions(url, method) {
  const permissionMap = {
    '/admin/users': ['manage_users'],
    '/admin/roles': ['manage_roles'],
    '/admin/settings': ['manage_settings'],
    '/payments': ['process_payments'],
    '/security': ['view_security'],
    '/reports': ['view_reports']
  };
  
  for (const [endpoint, permissions] of Object.entries(permissionMap)) {
    if (url.includes(endpoint)) {
      return permissions;
    }
  }
  
  return [];
}

module.exports = {
  gdprCompliance,
  soc2AuditLogging,
  pciDssProtection,
  hipaaProtection,
  dataEncryption,
  auditLogging,
  accessControl,
  sessionManagement
};
