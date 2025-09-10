const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');

// Enhanced request logging middleware with correlation IDs
class RequestLogger {
  constructor() {
    this.requestHistory = new Map();
    this.maxHistorySize = 1000; // Keep last 1000 requests for debugging
  }

  // Generate correlation ID middleware
  correlationIdMiddleware() {
    return (req, res, next) => {
      // Generate correlation ID if not provided
      const correlationId = req.headers['x-correlation-id'] || uuidv4();
      
      // Add to request object
      req.correlationId = correlationId;
      
      // Add to response headers
      res.setHeader('X-Correlation-ID', correlationId);
      
      // Store request start time
      req.startTime = Date.now();
      
      next();
    };
  }

  // Enhanced request logging middleware
  requestLoggingMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Capture request details
      const requestData = {
        correlationId: req.correlationId,
        method: req.method,
        url: req.url,
        path: req.path,
        query: req.query,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id || req.user?.userId || 'anonymous',
        userRole: req.user?.role || 'guest',
        timestamp: new Date().toISOString(),
        startTime: startTime
      };

      // Log sensitive request info (excluding passwords and tokens)
      const safeHeaders = { ...req.headers };
      delete safeHeaders.authorization;
      delete safeHeaders.cookie;
      requestData.headers = safeHeaders;

      // Capture request body (excluding sensitive fields for logging only)
      if (req.body && Object.keys(req.body).length > 0) {
        const safeBody = { ...req.body };
        // Only remove sensitive fields from logging, not from the actual request
        if (safeBody.password) safeBody.password = '[REDACTED]';
        if (safeBody.token) safeBody.token = '[REDACTED]';
        if (safeBody.secret) safeBody.secret = '[REDACTED]';
        requestData.body = safeBody;
      }

      // Store in request history
      this.addToHistory(req.correlationId, requestData);

      // Override res.end to capture response
      const originalEnd = res.end;
      res.end = (chunk, encoding) => {
        const responseTime = Date.now() - startTime;
        
        // Log response details
        const responseData = {
          correlationId: req.correlationId,
          statusCode: res.statusCode,
          responseTime: responseTime,
          contentLength: res.get('content-length') || 0,
          timestamp: new Date().toISOString()
        };

        // Update request history with response data
        this.updateHistory(req.correlationId, responseData);

        // Log to console in structured format
        this.logRequest(requestData, responseData);

        // Call original end
        originalEnd.call(res, chunk, encoding);
      };

      next();
    };
  }

  // Morgan-style logging for access logs
  getMorganMiddleware() {
    // Custom format with correlation ID
    morgan.token('correlation-id', (req) => req.correlationId);
    morgan.token('user-id', (req) => req.user?.id || req.user?.userId || 'anonymous');
    morgan.token('user-role', (req) => req.user?.role || 'guest');

    const logFormat = process.env.NODE_ENV === 'production' 
      ? ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :correlation-id'
      : ':method :url :status :response-time ms - :res[content-length] - :correlation-id - :user-id (:user-role)';

    return morgan(logFormat, {
      stream: {
        write: (message) => {
          // Remove newline for cleaner console output
          console.log('ACCESS:', message.trim());
        }
      },
      skip: (req, res) => {
        // Skip health checks and static files in production
        if (process.env.NODE_ENV === 'production') {
          return req.path === '/health' || req.path.startsWith('/uploads');
        }
        return false;
      }
    });
  }

  // API performance monitoring middleware
  performanceMiddleware() {
    return (req, res, next) => {
      const start = process.hrtime.bigint();
      
      res.on('finish', () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        // Log slow requests (> 1 second)
        if (duration > 1000) {
          console.warn('SLOW_REQUEST:', {
            correlationId: req.correlationId,
            method: req.method,
            url: req.url,
            duration: `${duration.toFixed(2)}ms`,
            statusCode: res.statusCode,
            userId: req.user?.id || 'anonymous'
          });
        }

        // Log errors (4xx, 5xx)
        if (res.statusCode >= 400) {
          console.error('ERROR_REQUEST:', {
            correlationId: req.correlationId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration.toFixed(2)}ms`,
            userId: req.user?.id || 'anonymous',
            userAgent: req.headers['user-agent']
          });
        }
      });

      next();
    };
  }

  // Add request to history
  addToHistory(correlationId, requestData) {
    // Maintain size limit
    if (this.requestHistory.size >= this.maxHistorySize) {
      const firstKey = this.requestHistory.keys().next().value;
      this.requestHistory.delete(firstKey);
    }
    
    this.requestHistory.set(correlationId, { request: requestData });
  }

  // Update history with response data
  updateHistory(correlationId, responseData) {
    const entry = this.requestHistory.get(correlationId);
    if (entry) {
      entry.response = responseData;
      entry.completed = true;
    }
  }

  // Structured logging
  logRequest(requestData, responseData) {
    const level = responseData.statusCode >= 500 ? 'ERROR' : 
                  responseData.statusCode >= 400 ? 'WARN' : 'INFO';
    
    const logEntry = {
      level,
      correlationId: requestData.correlationId,
      request: {
        method: requestData.method,
        url: requestData.url,
        userId: requestData.userId,
        userRole: requestData.userRole,
        ip: requestData.ip,
        userAgent: requestData.userAgent
      },
      response: {
        statusCode: responseData.statusCode,
        responseTime: responseData.responseTime,
        contentLength: responseData.contentLength
      },
      timestamp: responseData.timestamp
    };

    // Include body for errors or slow requests
    if (responseData.statusCode >= 400 || responseData.responseTime > 1000) {
      logEntry.request.body = requestData.body;
      logEntry.request.query = requestData.query;
    }

    console.log('REQUEST_LOG:', JSON.stringify(logEntry));
  }

  // Get request history (for debugging)
  getRequestHistory(correlationId = null) {
    if (correlationId) {
      return this.requestHistory.get(correlationId);
    }
    return Array.from(this.requestHistory.values());
  }

  // Get recent errors
  getRecentErrors(limit = 10) {
    return Array.from(this.requestHistory.values())
      .filter(entry => entry.response && entry.response.statusCode >= 400)
      .slice(-limit);
  }

  // Get slow requests
  getSlowRequests(limit = 10, threshold = 1000) {
    return Array.from(this.requestHistory.values())
      .filter(entry => entry.response && entry.response.responseTime > threshold)
      .slice(-limit);
  }
}

// Export singleton instance
const requestLogger = new RequestLogger();

module.exports = {
  requestLogger,
  correlationIdMiddleware: () => requestLogger.correlationIdMiddleware(),
  requestLoggingMiddleware: () => requestLogger.requestLoggingMiddleware(),
  morganMiddleware: () => requestLogger.getMorganMiddleware(),
  performanceMiddleware: () => requestLogger.performanceMiddleware()
};
