let logger;
try {
  const loggerModule = require('../config/logger');
  logger = loggerModule.logger || loggerModule;
} catch (error) {
  // Fallback logger for testing environments
  logger = {
    error: console.error,
    info: console.info,
    warn: console.warn,
    debug: console.debug
  };
}

// Error types and their detailed messages
const ERROR_MESSAGES = {
  // Authentication errors
  'INVALID_CREDENTIALS': 'The email or password you entered is incorrect. Please try again.',
  'ACCOUNT_LOCKED': 'Your account has been locked due to multiple failed login attempts. Please contact support.',
  'TOKEN_EXPIRED': 'Your session has expired. Please log in again.',
  'INVALID_TOKEN': 'The authentication token is invalid or corrupted.',
  'INSUFFICIENT_PERMISSIONS': 'You do not have the required permissions to perform this action.',
  
  // User/Employee errors
  'USER_NOT_FOUND': 'The requested user could not be found in our system.',
  'EMPLOYEE_NOT_FOUND': 'The requested employee could not be found in our system.',
  'USER_ALREADY_EXISTS': 'A user with this email address already exists.',
  'EMPLOYEE_ALREADY_EXISTS': 'An employee with this email address already exists.',
  'INVALID_EMAIL': 'Please provide a valid email address.',
  'INVALID_PASSWORD': 'Password must be at least 8 characters long and contain letters and numbers.',
  'PASSWORD_MISMATCH': 'The passwords you entered do not match.',
  
  // Role and permission errors
  'INVALID_ROLE': 'The specified role is not valid. Please choose from the available roles.',
  'ROLE_NOT_FOUND': 'The requested role could not be found.',
  'INSUFFICIENT_ROLES': 'You must assign at least one role to the employee.',
  'ROLE_UPDATE_FAILED': 'Failed to update user roles. Please try again.',
  
  // Department errors
  'DEPARTMENT_NOT_FOUND': 'The requested department could not be found.',
  'DEPARTMENT_ALREADY_EXISTS': 'A department with this name already exists.',
  'DEPARTMENT_IN_USE': 'Cannot delete department as it has active employees.',
  
  // Fleet errors
  'VEHICLE_NOT_FOUND': 'The requested vehicle could not be found.',
  'VEHICLE_ALREADY_EXISTS': 'A vehicle with this registration number already exists.',
  'DRIVER_NOT_FOUND': 'The requested driver could not be found.',
  'ROUTE_NOT_FOUND': 'The requested route could not be found.',
  
  // AI/Recommendations errors
  'RECOMMENDATION_NOT_FOUND': 'The requested recommendation could not be found.',
  'MODEL_NOT_FOUND': 'The requested AI model could not be found.',
  'PREDICTION_FAILED': 'Failed to generate prediction. Please try again.',
  
  // Enterprise errors
  'WHITE_LABEL_CONFIG_NOT_FOUND': 'White-label configuration not found for this organization.',
  'INVALID_CONFIG': 'The provided configuration is invalid.',
  
  // General validation errors
  'MISSING_REQUIRED_FIELDS': 'Please fill in all required fields.',
  'INVALID_INPUT': 'The provided input is invalid or malformed.',
  'INVALID_DATE': 'Please provide a valid date.',
  'INVALID_NUMBER': 'Please provide a valid number.',
  'INVALID_STATUS': 'The provided status is not valid.',
  
  // Database errors
  'DATABASE_CONNECTION_FAILED': 'Unable to connect to the database. Please try again later.',
  'DATABASE_QUERY_FAILED': 'Database operation failed. Please try again.',
  'DUPLICATE_KEY': 'A record with this information already exists.',
  
  // File upload errors
  'FILE_TOO_LARGE': 'The uploaded file is too large. Please choose a smaller file.',
  'INVALID_FILE_TYPE': 'The uploaded file type is not supported.',
  'FILE_UPLOAD_FAILED': 'Failed to upload file. Please try again.',
  
  // Rate limiting
  'RATE_LIMIT_EXCEEDED': 'Too many requests from this IP. Please wait before trying again.',
  
  // Server errors
  'INTERNAL_SERVER_ERROR': 'An unexpected error occurred. Please try again later.',
  'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable. Please try again later.',
  
  // Network errors
  'NETWORK_ERROR': 'Network connection error. Please check your internet connection.',
  'TIMEOUT_ERROR': 'Request timed out. Please try again.',
  
  // Business logic errors
  'INSUFFICIENT_FUNDS': 'Insufficient funds to complete this transaction.',
  'BOOKING_CONFLICT': 'The requested time slot is already booked.',
  'MAINTENANCE_DUE': 'Vehicle maintenance is due. Please schedule maintenance first.',
  'LICENSE_EXPIRED': 'Driver license has expired. Please renew the license.',
  
  // Custom error messages for specific operations
  'CREATE_EMPLOYEE_FAILED': 'Failed to create employee. Please check the provided information and try again.',
  'UPDATE_EMPLOYEE_FAILED': 'Failed to update employee information. Please try again.',
  'DELETE_EMPLOYEE_FAILED': 'Failed to delete employee. The employee may have active records.',
  'FETCH_EMPLOYEES_FAILED': 'Failed to retrieve employee list. Please try again.',
  
  'CREATE_DEPARTMENT_FAILED': 'Failed to create department. Please check the provided information.',
  'UPDATE_DEPARTMENT_FAILED': 'Failed to update department information. Please try again.',
  'DELETE_DEPARTMENT_FAILED': 'Failed to delete department. It may have active employees.',
  
  'CREATE_VEHICLE_FAILED': 'Failed to create vehicle record. Please check the provided information.',
  'UPDATE_VEHICLE_FAILED': 'Failed to update vehicle information. Please try again.',
  'DELETE_VEHICLE_FAILED': 'Failed to delete vehicle. It may have active bookings.',
  
  'CREATE_ROUTE_FAILED': 'Failed to create route. Please check the provided information.',
  'UPDATE_ROUTE_FAILED': 'Failed to update route information. Please try again.',
  'DELETE_ROUTE_FAILED': 'Failed to delete route. It may be in use by active trips.',
  
  'PAYROLL_PROCESSING_FAILED': 'Failed to process payroll. Please check employee data and try again.',
  'PAYROLL_RECORD_NOT_FOUND': 'The requested payroll record could not be found.',
  
  'RECOMMENDATION_IMPLEMENTATION_FAILED': 'Failed to implement recommendation. Please try again.',
  'AI_MODEL_TRAINING_FAILED': 'Failed to train AI model. Please check the data and try again.',
  
  'WHITE_LABEL_UPDATE_FAILED': 'Failed to update white-label configuration. Please try again.',
  'ORGANIZATION_NOT_FOUND': 'Organization information not found.',
  
  'EXPORT_FAILED': 'Failed to export data. Please try again.',
  'IMPORT_FAILED': 'Failed to import data. Please check the file format and try again.',
  
  'NOTIFICATION_SEND_FAILED': 'Failed to send notification. Please try again.',
  'EMAIL_SEND_FAILED': 'Failed to send email. Please check the email address and try again.',
  
  'BACKUP_FAILED': 'Failed to create backup. Please try again.',
  'RESTORE_FAILED': 'Failed to restore from backup. Please try again.',
  
  'SYNC_FAILED': 'Failed to synchronize data. Please try again.',
  'INTEGRATION_FAILED': 'Failed to integrate with external service. Please try again.'
}

// HTTP status codes for different error types
const ERROR_STATUS_CODES = {
  // 4xx Client Errors
  'INVALID_CREDENTIALS': 401,
  'TOKEN_EXPIRED': 401,
  'INVALID_TOKEN': 401,
  'INSUFFICIENT_PERMISSIONS': 403,
  'USER_NOT_FOUND': 404,
  'EMPLOYEE_NOT_FOUND': 404,
  'DEPARTMENT_NOT_FOUND': 404,
  'VEHICLE_NOT_FOUND': 404,
  'ROUTE_NOT_FOUND': 404,
  'RECOMMENDATION_NOT_FOUND': 404,
  'MODEL_NOT_FOUND': 404,
  'WHITE_LABEL_CONFIG_NOT_FOUND': 404,
  'PAYROLL_RECORD_NOT_FOUND': 404,
  'ORGANIZATION_NOT_FOUND': 404,
  
  'USER_ALREADY_EXISTS': 409,
  'EMPLOYEE_ALREADY_EXISTS': 409,
  'DEPARTMENT_ALREADY_EXISTS': 409,
  'VEHICLE_ALREADY_EXISTS': 409,
  'DUPLICATE_KEY': 409,
  'BOOKING_CONFLICT': 409,
  
  'MISSING_REQUIRED_FIELDS': 400,
  'INVALID_INPUT': 400,
  'INVALID_EMAIL': 400,
  'INVALID_PASSWORD': 400,
  'INVALID_ROLE': 400,
  'INVALID_DATE': 400,
  'INVALID_NUMBER': 400,
  'INVALID_STATUS': 400,
  'INVALID_FILE_TYPE': 400,
  'FILE_TOO_LARGE': 400,
  'PASSWORD_MISMATCH': 400,
  'INSUFFICIENT_ROLES': 400,
  
  'RATE_LIMIT_EXCEEDED': 429,
  
  // 5xx Server Errors
  'INTERNAL_SERVER_ERROR': 500,
  'DATABASE_CONNECTION_FAILED': 500,
  'DATABASE_QUERY_FAILED': 500,
  'SERVICE_UNAVAILABLE': 503,
  'NETWORK_ERROR': 500,
  'TIMEOUT_ERROR': 408,
  
  // Business logic errors (usually 400 or 422)
  'INSUFFICIENT_FUNDS': 422,
  'MAINTENANCE_DUE': 422,
  'LICENSE_EXPIRED': 422,
  'DEPARTMENT_IN_USE': 422,
  'VEHICLE_IN_USE': 422,
  'ROUTE_IN_USE': 422,
  'EMPLOYEE_HAS_ACTIVE_RECORDS': 422
}

/**
 * Create a detailed error response
 * @param {string} errorCode - The error code
 * @param {string} customMessage - Optional custom message to override default
 * @param {Object} details - Additional error details
 * @param {Error} originalError - Original error object for logging
 * @returns {Object} Formatted error response
 */
function createErrorResponse(errorCode, customMessage = null, details = {}, originalError = null) {
  const message = customMessage || ERROR_MESSAGES[errorCode] || 'An unexpected error occurred.'
  const statusCode = ERROR_STATUS_CODES[errorCode] || 500
  
  // Log the error for debugging
  if (originalError) {
    logger.error(`Error ${errorCode}:`, {
      message: originalError.message,
      stack: originalError.stack,
      details,
      timestamp: new Date().toISOString()
    })
  }
  
  return {
    success: false,
    error: errorCode,
    message: message,
    details: details,
    timestamp: new Date().toISOString(),
    statusCode: statusCode
  }
}

/**
 * Handle database errors and return appropriate error responses
 * @param {Error} error - The database error
 * @param {string} operation - The operation being performed
 * @returns {Object} Formatted error response
 */
function handleDatabaseError(error, operation = 'database operation') {
  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyPattern)[0]
    return createErrorResponse('DUPLICATE_KEY', 
      `A record with this ${field} already exists.`, 
      { field, value: error.keyValue[field] },
      error
    )
  }
  
  if (error.name === 'ValidationError') {
    // Mongoose validation error
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }))
    return createErrorResponse('INVALID_INPUT',
      'Validation failed. Please check the provided data.',
      { validationErrors },
      error
    )
  }
  
  if (error.name === 'CastError') {
    // Invalid ObjectId or type casting error
    return createErrorResponse('INVALID_INPUT',
      `Invalid ${error.path} format.`,
      { field: error.path, value: error.value },
      error
    )
  }
  
  // Generic database error
  return createErrorResponse('DATABASE_QUERY_FAILED',
    `Failed to ${operation}. Please try again.`,
    { operation },
    error
  )
}

/**
 * Handle authentication and authorization errors
 * @param {Error} error - The auth error
 * @returns {Object} Formatted error response
 */
function handleAuthError(error) {
  if (error.name === 'JsonWebTokenError') {
    return createErrorResponse('INVALID_TOKEN', null, {}, error)
  }
  
  if (error.name === 'TokenExpiredError') {
    return createErrorResponse('TOKEN_EXPIRED', null, {}, error)
  }
  
  if (error.message.includes('permission') || error.message.includes('role')) {
    return createErrorResponse('INSUFFICIENT_PERMISSIONS', null, {}, error)
  }
  
  return createErrorResponse('INVALID_CREDENTIALS', null, {}, error)
}

/**
 * Handle validation errors
 * @param {Array} validationErrors - Array of validation errors
 * @returns {Object} Formatted error response
 */
function handleValidationError(validationErrors) {
  return createErrorResponse('INVALID_INPUT',
    'Please check the provided information and try again.',
    { validationErrors },
    null
  )
}

/**
 * Express middleware for error handling
 * @param {Error} error - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(error, req, res, next) {
  let errorResponse
  
  // Handle different types of errors
  if (error.name === 'ValidationError') {
    errorResponse = handleValidationError(Object.values(error.errors))
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    errorResponse = handleAuthError(error)
  } else if (error.code === 11000 || error.name === 'CastError') {
    errorResponse = handleDatabaseError(error)
  } else if (error.customError) {
    // Custom error with predefined code
    errorResponse = createErrorResponse(error.code, error.message, error.details, error)
  } else {
    // Generic server error
    errorResponse = createErrorResponse('INTERNAL_SERVER_ERROR', null, {}, error)
  }
  
  // Log the error
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  })
  
  // Send response
  res.status(errorResponse.statusCode).json(errorResponse)
}

/**
 * Create a custom error class
 */
class CustomError extends Error {
  constructor(code, message, details = {}, statusCode = null) {
    super(message)
    this.name = 'CustomError'
    this.code = code
    this.details = details
    this.statusCode = statusCode || ERROR_STATUS_CODES[code] || 500
    this.customError = true
  }
}

module.exports = {
  createErrorResponse,
  handleDatabaseError,
  handleAuthError,
  handleValidationError,
  errorHandler,
  CustomError,
  ERROR_MESSAGES,
  ERROR_STATUS_CODES
}
