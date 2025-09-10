const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phoneNumber')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Booking validation rules
const validateBooking = [
  body('serviceType')
    .isIn(['emergency', 'scheduled', 'diagnostic', 'maintenance'])
    .withMessage('Invalid service type'),
  body('vehicleId')
    .isMongoId()
    .withMessage('Invalid vehicle ID'),
  body('preferredDate')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('location')
    .isObject()
    .withMessage('Location must be an object'),
  body('location.address')
    .notEmpty()
    .withMessage('Address is required'),
  handleValidationErrors
];

// Payment validation rules
const validatePayment = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('currency')
    .isIn(['USD', 'EUR', 'GBP', 'AED', 'SAR', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD'])
    .withMessage('Invalid currency'),
  body('paymentMethod')
    .isIn(['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash', 'check'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

// Car parts validation rules
const validateCarPart = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Part name must be between 2 and 100 characters'),
  body('brand')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must be between 1 and 50 characters'),
  body('partNumber')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Part number must be between 1 and 50 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['engine', 'brake', 'suspension', 'electrical', 'transmission', 'body', 'accessories', 'tires', 'oils', 'tools'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Vehicle validation rules
const validateVehicle = [
  body('make')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Make must be between 1 and 50 characters'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model must be between 1 and 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  body('licensePlate')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('License plate must be between 1 and 20 characters'),
  handleValidationErrors
];

// ID validation rules
const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Pagination validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Search validation rules
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query cannot be empty'),
  query('category')
    .optional()
    .isIn(['engine', 'brake', 'suspension', 'electrical', 'transmission', 'body', 'accessories', 'tires', 'oils', 'tools'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Location validation rules
const validateLocation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  handleValidationErrors
];

// Rating validation rules
const validateRating = [
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters'),
  handleValidationErrors
];

// Two-factor authentication validation
const validateTwoFactorAuth = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Token must be a 6-digit number'),
  handleValidationErrors
];

// Email validation
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

// Phone validation
const validatePhone = [
  body('phoneNumber')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Password reset validation
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateBooking,
  validatePayment,
  validateCarPart,
  validateVehicle,
  validateMongoId,
  validatePagination,
  validateSearch,
  validateLocation,
  validateRating,
  validateTwoFactorAuth,
  validateEmail,
  validatePhone,
  validatePasswordReset,
  validateProfileUpdate
};
