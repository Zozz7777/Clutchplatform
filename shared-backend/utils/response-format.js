/**
 * Standardized response format utility for all API endpoints
 * Ensures consistent response structure across the entire application
 */

/**
 * Standard success response format
 * @param {any} data - The response data
 * @param {string} message - Success message
 * @param {object} meta - Additional metadata (pagination, etc.)
 * @returns {object} Standardized success response
 */
const successResponse = (data, message = 'Success', meta = {}) => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };
};

/**
 * Standard error response format
 * @param {string} error - Error code/type
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} details - Additional error details
 * @returns {object} Standardized error response
 */
const errorResponse = (error, message, statusCode = 500, details = null) => {
  return {
    success: false,
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };
};

/**
 * Standard paginated response format
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Success message
 * @returns {object} Standardized paginated response
 */
const paginatedResponse = (data, page, limit, total, message = 'Data retrieved successfully') => {
  return successResponse(data, message, {
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
};

/**
 * Standard validation error response
 * @param {Array} validationErrors - Array of validation errors
 * @returns {object} Standardized validation error response
 */
const validationErrorResponse = (validationErrors) => {
  return errorResponse(
    'VALIDATION_ERROR',
    'Request validation failed',
    400,
    { validationErrors }
  );
};

/**
 * Standard not found response
 * @param {string} resource - Resource name (e.g., 'User', 'Vehicle')
 * @param {string} id - Resource ID
 * @returns {object} Standardized not found response
 */
const notFoundResponse = (resource, id) => {
  return errorResponse(
    'RESOURCE_NOT_FOUND',
    `${resource} with ID '${id}' not found`,
    404
  );
};

/**
 * Standard unauthorized response
 * @param {string} message - Unauthorized message
 * @returns {object} Standardized unauthorized response
 */
const unauthorizedResponse = (message = 'Unauthorized access') => {
  return errorResponse(
    'UNAUTHORIZED',
    message,
    401
  );
};

/**
 * Standard forbidden response
 * @param {string} message - Forbidden message
 * @returns {object} Standardized forbidden response
 */
const forbiddenResponse = (message = 'Insufficient permissions') => {
  return errorResponse(
    'FORBIDDEN',
    message,
    403
  );
};

/**
 * Standard conflict response
 * @param {string} message - Conflict message
 * @param {any} details - Additional conflict details
 * @returns {object} Standardized conflict response
 */
const conflictResponse = (message, details = null) => {
  return errorResponse(
    'CONFLICT',
    message,
    409,
    details
  );
};

/**
 * Standard server error response
 * @param {string} message - Server error message
 * @param {any} details - Additional error details
 * @returns {object} Standardized server error response
 */
const serverErrorResponse = (message = 'Internal server error', details = null) => {
  return errorResponse(
    'INTERNAL_SERVER_ERROR',
    message,
    500,
    details
  );
};

/**
 * Express middleware to standardize response format
 * Adds helper methods to res object
 */
const responseMiddleware = (req, res, next) => {
  // Add standardized response methods to res object
  res.success = (data, message, meta) => {
    return res.json(successResponse(data, message, meta));
  };

  res.error = (error, message, statusCode, details) => {
    return res.status(statusCode).json(errorResponse(error, message, statusCode, details));
  };

  res.paginated = (data, page, limit, total, message) => {
    return res.json(paginatedResponse(data, page, limit, total, message));
  };

  res.validationError = (validationErrors) => {
    return res.status(400).json(validationErrorResponse(validationErrors));
  };

  res.notFound = (resource, id) => {
    return res.status(404).json(notFoundResponse(resource, id));
  };

  res.unauthorized = (message) => {
    return res.status(401).json(unauthorizedResponse(message));
  };

  res.forbidden = (message) => {
    return res.status(403).json(forbiddenResponse(message));
  };

  res.conflict = (message, details) => {
    return res.status(409).json(conflictResponse(message, details));
  };

  res.serverError = (message, details) => {
    return res.status(500).json(serverErrorResponse(message, details));
  };

  next();
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  serverErrorResponse,
  responseMiddleware
};
