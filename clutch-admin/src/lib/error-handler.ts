/**
 * Centralized error handling utility
 * Provides consistent error handling across the application
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}
  
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle errors with proper logging and user feedback
   */
  public handleError(error: unknown, context?: ErrorContext): void {
    const errorMessage = this.extractErrorMessage(error);
    const errorContext = this.buildErrorContext(context);
    
    // Log error details for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error occurred:', {
        message: errorMessage,
        context: errorContext,
        originalError: error
      });
    }
    
    // In production, you might want to send errors to a logging service
    // this.sendToLoggingService(errorMessage, errorContext, error);
  }

  /**
   * Handle warnings with proper logging
   */
  public handleWarning(message: string, context?: ErrorContext): void {
    const warningContext = this.buildErrorContext(context);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning:', {
        message,
        context: warningContext
      });
    }
  }

  /**
   * Handle WebSocket connection errors
   */
  public handleWebSocketError(error: unknown, service: string, action: string): void {
    this.handleError(error, {
      component: 'WebSocket',
      action: `${service}.${action}`
    });
  }

  /**
   * Handle API errors
   */
  public handleApiError(error: unknown, endpoint: string, method: string): void {
    this.handleError(error, {
      component: 'API',
      action: `${method} ${endpoint}`
    });
  }

  /**
   * Handle data loading errors
   */
  public handleDataLoadError(error: unknown, dataType: string): void {
    this.handleError(error, {
      component: 'DataLoader',
      action: `load_${dataType}`
    });
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'An unknown error occurred';
  }

  private buildErrorContext(context?: ErrorContext): ErrorContext {
    return {
      timestamp: new Date().toISOString(),
      ...context
    };
  }

  // Future: Send to logging service in production
  // private sendToLoggingService(message: string, context: ErrorContext, originalError: unknown): void {
  //   // Implementation for production logging service
  // }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions for common use cases
export const handleError = (error: unknown, context?: ErrorContext) => 
  errorHandler.handleError(error, context);

export const handleWarning = (message: string, context?: ErrorContext) => 
  errorHandler.handleWarning(message, context);

export const handleWebSocketError = (error: unknown, service: string, action: string) => 
  errorHandler.handleWebSocketError(error, service, action);

export const handleApiError = (error: unknown, endpoint: string, method: string) => 
  errorHandler.handleApiError(error, endpoint, method);

export const handleDataLoadError = (error: unknown, dataType: string) => 
  errorHandler.handleDataLoadError(error, dataType);

// API response handler
export const handleApiResponse = <T>(
  response: any,
  context: string,
  fallbackValue: T
): T => {
  try {
    if (response && response.success !== false) {
      return response.data || response || fallbackValue;
    }
    return fallbackValue;
  } catch (error) {
    errorHandler.handleError(error, context, { showToast: false });
    return fallbackValue;
  }
};

// Error handling wrapper
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string,
  options: { fallbackValue: R; showToast?: boolean } = { fallbackValue: null as R, showToast: false }
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleError(error, context, options);
      return options.fallbackValue;
    }
  };
};