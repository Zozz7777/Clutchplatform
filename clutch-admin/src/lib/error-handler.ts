/**
 * Comprehensive error handling utility for frontend API calls
 * Provides consistent error handling, logging, and user feedback
 */

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: string;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackValue?: any;
  retryable?: boolean;
  maxRetries?: number;
}

/**
 * Standard error handler for API calls
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle API errors with comprehensive logging and user feedback
   */
  async handleError(
    error: any,
    context: string,
    options: ErrorHandlerOptions = {}
  ): Promise<any> {
    const {
      showToast = true,
      logError = true,
      fallbackValue = null,
      retryable = false,
      maxRetries = 3
    } = options;

    // Parse error information
    const errorInfo = this.parseError(error);
    
    // Log error if enabled
    if (logError) {
      this.logError(errorInfo, context);
    }

    // Show user feedback if enabled
    if (showToast) {
      this.showUserFeedback(errorInfo, context);
    }

    // Return fallback value
    return fallbackValue;
  }

  /**
   * Parse error object to extract meaningful information
   */
  private parseError(error: any): ApiError {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        statusCode: 0,
        timestamp: new Date().toISOString()
      };
    }

    // HTTP errors
    if (error.status || error.statusCode) {
      const statusCode = error.status || error.statusCode;
      return {
        code: this.getErrorCode(statusCode),
        message: error.message || this.getDefaultMessage(statusCode),
        statusCode,
        details: error.details,
        timestamp: new Date().toISOString()
      };
    }

    // API response errors
    if (error.error && error.message) {
      return {
        code: error.error,
        message: error.message,
        statusCode: error.statusCode || 500,
        details: error.details,
        timestamp: error.timestamp || new Date().toISOString()
      };
    }

    // Generic errors
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get error code based on HTTP status
   */
  private getErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'VALIDATION_ERROR';
      case 429: return 'RATE_LIMITED';
      case 500: return 'SERVER_ERROR';
      case 502: return 'BAD_GATEWAY';
      case 503: return 'SERVICE_UNAVAILABLE';
      default: return 'HTTP_ERROR';
    }
  }

  /**
   * Get default error message based on HTTP status
   */
  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'Authentication required. Please log in.';
      case 403: return 'Access denied. You do not have permission to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'Conflict detected. The resource may have been modified.';
      case 422: return 'Validation failed. Please check your input.';
      case 429: return 'Too many requests. Please try again later.';
      case 500: return 'Server error. Please try again later.';
      case 502: return 'Service temporarily unavailable.';
      case 503: return 'Service is currently unavailable.';
      default: return 'An error occurred while processing your request.';
    }
  }

  /**
   * Log error with context information
   */
  private logError(errorInfo: ApiError, context: string): void {
    const logData = {
      context,
      error: errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}] API Error:`, logData);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
      console.error(`[${context}] API Error:`, errorInfo);
    }
  }

  /**
   * Show user feedback based on error type
   */
  private showUserFeedback(errorInfo: ApiError, context: string): void {
    // Import toast dynamically to avoid circular dependencies
    import('sonner').then(({ toast }) => {
      switch (errorInfo.code) {
        case 'UNAUTHORIZED':
          toast.error('Session expired. Please log in again.');
          // Redirect to login after a delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          break;
          
        case 'FORBIDDEN':
          toast.error('Access denied. You do not have permission for this action.');
          break;
          
        case 'NETWORK_ERROR':
          toast.error('Network error. Please check your connection and try again.');
          break;
          
        case 'RATE_LIMITED':
          toast.warning('Too many requests. Please wait a moment and try again.');
          break;
          
        case 'VALIDATION_ERROR':
          toast.error('Please check your input and try again.');
          break;
          
        case 'SERVER_ERROR':
        case 'SERVICE_UNAVAILABLE':
          toast.error('Service temporarily unavailable. Please try again later.');
          break;
          
        default:
          toast.error(errorInfo.message || 'An unexpected error occurred.');
      }
    }).catch(() => {
      // Fallback if toast is not available
      console.error('Error showing user feedback:', errorInfo);
    });
  }

  /**
   * Retry failed requests with exponential backoff
   */
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    context: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry certain error types
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`[${context}] Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetryableError(error: any): boolean {
    const statusCode = error.status || error.statusCode;
    
    // Don't retry client errors (4xx) except 429 (rate limit)
    if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
      return true;
    }
    
    // Don't retry validation errors
    if (error.error === 'VALIDATION_ERROR') {
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

/**
 * Higher-order function to wrap API calls with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string,
  options: ErrorHandlerOptions = {}
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      return await errorHandler.handleError(error, context, options);
    }
  };
}

/**
 * Utility function for handling API responses
 */
export function handleApiResponse<T>(
  response: any,
  context: string,
  fallbackValue: T
): T {
  if (response && response.success) {
    return response.data;
  }
  
  // Handle API error response
  if (response && response.error) {
    errorHandler.handleError(response, context, {
      showToast: true,
      logError: true,
      fallbackValue
    });
  }
  
  return fallbackValue;
}