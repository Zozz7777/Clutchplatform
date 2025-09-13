/**
 * Input Validation Middleware
 * Provides sanitization and validation for all inputs
 */

const validateInput = (req, res, next) => {
  // Basic input validation and sanitization
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Sanitize strings - escape HTML and remove scripts
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }
  
  next();
};

// Sanitize function to escape HTML and remove dangerous content
const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[<>\"'&]/g, (match) => {
      const escape = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
      return escape[match];
    })
    .trim();
};

// Escape function for additional security
const escape = (input) => {
  return sanitize(input);
};

// Validation schema for common inputs
const validationSchema = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  objectId: /^[0-9a-fA-F]{24}$/
};

const validateEmail = (email) => {
  return validationSchema.email.test(email);
};

const validatePassword = (password) => {
  return validationSchema.password.test(password);
};

const validate = (input, type) => {
  if (!validationSchema[type]) return false;
  return validationSchema[type].test(input);
};

module.exports = {
  validateInput,
  sanitize,
  escape,
  validate,
  validateEmail,
  validatePassword,
  validationSchema
};