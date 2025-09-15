/**
 * Enhanced Input Validation Middleware
 * Provides comprehensive sanitization and validation for all inputs
 */

const validateInput = (req, res, next) => {
  try {
    // Validate and sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Validate and sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    // Validate and sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Input validation error:', error);
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      timestamp: new Date().toISOString()
    });
  }
};

// Enhanced sanitize function to escape HTML and remove dangerous content
const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove dangerous JavaScript patterns
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Escape HTML entities
    .replace(/[<>\"'&]/g, (match) => {
      const escape = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return escape[match];
    })
    // Remove null bytes and control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
};

// Sanitize objects recursively
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitize(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// Escape function for additional security
const escape = (input) => {
  return sanitize(input);
};

// Enhanced validation schema for common inputs
const validationSchema = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  objectId: /^[0-9a-fA-F]{24}$/,
  licensePlate: /^[A-Z0-9\-\s]{3,10}$/i,
  vin: /^[A-HJ-NPR-Z0-9]{17}$/i,
  currency: /^[A-Z]{3}$/,
  status: /^(active|inactive|pending|completed|failed|cancelled|refunded)$/i,
  priority: /^(low|medium|high|urgent)$/i,
  role: /^(admin|hr|employee|driver|fleet_manager|finance_manager|system_admin)$/i
};

// Individual validation functions
const validateEmail = (email) => {
  return validationSchema.email.test(email);
};

const validatePassword = (password) => {
  return validationSchema.password.test(password);
};

const validatePhone = (phone) => {
  return validationSchema.phone.test(phone);
};

const validateObjectId = (id) => {
  return validationSchema.objectId.test(id);
};

const validateLicensePlate = (plate) => {
  return validationSchema.licensePlate.test(plate);
};

const validateVIN = (vin) => {
  return validationSchema.vin.test(vin);
};

const validateCurrency = (currency) => {
  return validationSchema.currency.test(currency);
};

const validateStatus = (status) => {
  return validationSchema.status.test(status);
};

const validatePriority = (priority) => {
  return validationSchema.priority.test(priority);
};

const validateRole = (role) => {
  return validationSchema.role.test(role);
};

// Comprehensive validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const errors = [];
      
      // Validate body
      if (schema.body) {
        for (const field in schema.body) {
          const rules = schema.body[field];
          const value = req.body[field];
          
          if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} is required`);
            continue;
          }
          
          if (value !== undefined && value !== null && value !== '') {
            if (rules.type && typeof value !== rules.type) {
              errors.push(`${field} must be of type ${rules.type}`);
            }
            
            if (rules.min && value.length < rules.min) {
              errors.push(`${field} must be at least ${rules.min} characters long`);
            }
            
            if (rules.max && value.length > rules.max) {
              errors.push(`${field} must be no more than ${rules.max} characters long`);
            }
            
            if (rules.pattern && !rules.pattern.test(value)) {
              errors.push(`${field} format is invalid`);
            }
            
            if (rules.enum && !rules.enum.includes(value)) {
              errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            }
          }
        }
      }
      
      // Validate query parameters
      if (schema.query) {
        for (const field in schema.query) {
          const rules = schema.query[field];
          const value = req.query[field];
          
          if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`Query parameter ${field} is required`);
            continue;
          }
          
          if (value !== undefined && value !== null && value !== '') {
            if (rules.pattern && !rules.pattern.test(value)) {
              errors.push(`Query parameter ${field} format is invalid`);
            }
          }
        }
      }
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors,
          timestamp: new Date().toISOString()
        });
      }
      
      next();
    } catch (error) {
      console.error('Request validation error:', error);
      res.status(500).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed due to server error',
        timestamp: new Date().toISOString()
      });
    }
  };
};

const validate = (input, type) => {
  if (!validationSchema[type]) return false;
  return validationSchema[type].test(input);
};

module.exports = {
  validateInput,
  validateRequest,
  sanitize,
  sanitizeObject,
  escape,
  validate,
  validateEmail,
  validatePassword,
  validatePhone,
  validateObjectId,
  validateLicensePlate,
  validateVIN,
  validateCurrency,
  validateStatus,
  validatePriority,
  validateRole,
  validationSchema
};