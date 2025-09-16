import { toast } from 'sonner';

export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  timestamp: string;
  context?: string;
  userId?: string;
  sessionId?: string;
  stack?: string;
}

export interface ErrorReport {
  id: string;
  errors: ErrorInfo[];
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  resolved: boolean;
}

class ErrorHandler {
  private errorReports: Map<string, ErrorReport> = new Map();
  private maxErrorsPerReport = 10;
  private errorReportingEnabled = true;

  public handleError(
    error: Error | string,
    context?: string,
    options: {
      showToast?: boolean;
      logToConsole?: boolean;
      reportToServer?: boolean;
      fallbackMessage?: string;
    } = {}
  ): ErrorInfo {
    const {
      showToast = true,
      logToConsole = true,
      reportToServer = true,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      code: this.extractErrorCode(error),
      status: this.extractStatusCode(error),
      timestamp: new Date().toISOString(),
      context: context || 'Unknown',
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      stack: typeof error === 'object' && error.stack ? error.stack : undefined
    };

    // Log to console
    if (logToConsole) {
      console.error('Error handled:', errorInfo);
    }

    // Show toast notification
    if (showToast) {
      this.showErrorToast(errorInfo);
    }

    // Report to server
    if (reportToServer && this.errorReportingEnabled) {
      this.reportErrorToServer(errorInfo);
    }

    // Track error for reporting
    this.trackError(errorInfo);

    return errorInfo;
  }

  public handleApiError(
    error: any,
    context: string,
    fallbackMessage?: string
  ): ErrorInfo {
    let message = fallbackMessage || 'API request failed';
    let code: string | undefined;
    let status: number | undefined;

    if (error.response) {
      // Server responded with error status
      status = error.response.status;
      code = error.response.data?.code || `HTTP_${status}`;
      message = error.response.data?.message || error.response.statusText || message;
    } else if (error.request) {
      // Request was made but no response received
      message = 'Network error - no response from server';
      code = 'NETWORK_ERROR';
    } else {
      // Something else happened
      message = error.message || message;
      code = 'UNKNOWN_ERROR';
    }

    return this.handleError(
      { message, code, status } as any,
      context,
      {
        showToast: true,
        logToConsole: true,
        reportToServer: true,
        fallbackMessage
      }
    );
  }

  public handleValidationError(
    errors: Record<string, string[]>,
    context: string = 'Validation'
  ): ErrorInfo {
    const message = Object.entries(errors)
      .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
      .join('; ');

    return this.handleError(
      { message, code: 'VALIDATION_ERROR' } as any,
      context,
      {
        showToast: true,
        logToConsole: true,
        reportToServer: false,
        fallbackMessage: 'Validation failed'
      }
    );
  }

  public handleNetworkError(
    error: any,
    context: string = 'Network'
  ): ErrorInfo {
    let message = 'Network connection failed';
    let code = 'NETWORK_ERROR';

    if (error.code === 'NETWORK_ERROR') {
      message = 'Unable to connect to server';
    } else if (error.code === 'TIMEOUT') {
      message = 'Request timed out';
      code = 'TIMEOUT_ERROR';
    } else if (error.code === 'ABORTED') {
      message = 'Request was cancelled';
      code = 'ABORTED_ERROR';
    }

    return this.handleError(
      { message, code } as any,
      context,
      {
        showToast: true,
        logToConsole: true,
        reportToServer: true,
        fallbackMessage: 'Network error occurred'
      }
    );
  }

  public handleAuthError(
    error: any,
    context: string = 'Authentication'
  ): ErrorInfo {
    let message = 'Authentication failed';
    let code = 'AUTH_ERROR';

    if (error.status === 401) {
      message = 'Session expired. Please log in again.';
      code = 'SESSION_EXPIRED';
    } else if (error.status === 403) {
      message = 'Access denied. Insufficient permissions.';
      code = 'ACCESS_DENIED';
    } else if (error.status === 429) {
      message = 'Too many requests. Please try again later.';
      code = 'RATE_LIMITED';
    }

    return this.handleError(
      { message, code, status: error.status } as any,
      context,
      {
        showToast: true,
        logToConsole: true,
        reportToServer: true,
        fallbackMessage: 'Authentication error'
      }
    );
  }

  public handleFileError(
    error: any,
    context: string = 'File Operation'
  ): ErrorInfo {
    let message = 'File operation failed';
    let code = 'FILE_ERROR';

    if (error.code === 'FILE_TOO_LARGE') {
      message = 'File size exceeds the maximum allowed limit';
      code = 'FILE_TOO_LARGE';
    } else if (error.code === 'INVALID_FILE_TYPE') {
      message = 'File type is not supported';
      code = 'INVALID_FILE_TYPE';
    } else if (error.code === 'UPLOAD_FAILED') {
      message = 'File upload failed';
      code = 'UPLOAD_FAILED';
    } else if (error.code === 'DOWNLOAD_FAILED') {
      message = 'File download failed';
      code = 'DOWNLOAD_FAILED';
    }

    return this.handleError(
      { message, code } as any,
      context,
      {
        showToast: true,
        logToConsole: true,
        reportToServer: true,
        fallbackMessage: 'File operation failed'
      }
    );
  }

  public handlePaymentError(
    error: any,
    context: string = 'Payment'
  ): ErrorInfo {
    let message = 'Payment processing failed';
    let code = 'PAYMENT_ERROR';

    if (error.code === 'INSUFFICIENT_FUNDS') {
      message = 'Insufficient funds for this transaction';
      code = 'INSUFFICIENT_FUNDS';
    } else if (error.code === 'CARD_DECLINED') {
      message = 'Payment card was declined';
      code = 'CARD_DECLINED';
    } else if (error.code === 'PAYMENT_TIMEOUT') {
      message = 'Payment processing timed out';
      code = 'PAYMENT_TIMEOUT';
    } else if (error.code === 'INVALID_PAYMENT_METHOD') {
      message = 'Invalid payment method';
      code = 'INVALID_PAYMENT_METHOD';
    }

    return this.handleError(
      { message, code } as any,
      context,
      {
        showToast: true,
        logToConsole: true,
        reportToServer: true,
        fallbackMessage: 'Payment processing failed'
      }
    );
  }

  private extractErrorCode(error: any): string | undefined {
    if (error.code) return error.code;
    if (error.response?.data?.code) return error.response.data.code;
    if (error.name) return error.name;
    return undefined;
  }

  private extractStatusCode(error: any): number | undefined {
    if (error.status) return error.status;
    if (error.response?.status) return error.response.status;
    return undefined;
  }

  private getCurrentUserId(): string | undefined {
    // This would typically come from your auth context
    return localStorage.getItem('userId') || undefined;
  }

  private getCurrentSessionId(): string | undefined {
    // This would typically come from your session management
    return localStorage.getItem('sessionId') || undefined;
  }

  private showErrorToast(errorInfo: ErrorInfo): void {
    const isRetryable = this.isRetryableError(errorInfo);
    
    toast.error(errorInfo.message, {
      description: errorInfo.context,
      action: isRetryable ? {
        label: 'Retry',
        onClick: () => this.handleRetry(errorInfo)
      } : undefined,
      duration: 5000
    });
  }

  private isRetryableError(errorInfo: ErrorInfo): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVER_ERROR',
      'RATE_LIMITED'
    ];
    
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    return (
      retryableCodes.includes(errorInfo.code || '') ||
      (errorInfo.status && retryableStatuses.includes(errorInfo.status))
    );
  }

  private handleRetry(errorInfo: ErrorInfo): void {
    // This would typically retry the failed operation
    toast.info('Retrying operation...');
    // Implementation would depend on the specific context
  }

  private trackError(errorInfo: ErrorInfo): void {
    const errorKey = `${errorInfo.code || 'UNKNOWN'}_${errorInfo.context}`;
    const existingReport = this.errorReports.get(errorKey);

    if (existingReport) {
      existingReport.errors.push(errorInfo);
      existingReport.count++;
      existingReport.lastOccurrence = errorInfo.timestamp;
      
      // Limit the number of errors per report
      if (existingReport.errors.length > this.maxErrorsPerReport) {
        existingReport.errors = existingReport.errors.slice(-this.maxErrorsPerReport);
      }
    } else {
      this.errorReports.set(errorKey, {
        id: errorKey,
        errors: [errorInfo],
        count: 1,
        firstOccurrence: errorInfo.timestamp,
        lastOccurrence: errorInfo.timestamp,
        resolved: false
      });
    }
  }

  private async reportErrorToServer(errorInfo: ErrorInfo): Promise<void> {
    try {
      // This would typically send the error to your error reporting service
      // For now, we'll just log it
      console.log('Reporting error to server:', errorInfo);
      
      // Example implementation:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorInfo)
      // });
    } catch (error) {
      console.error('Failed to report error to server:', error);
    }
  }

  public getErrorReports(): ErrorReport[] {
    return Array.from(this.errorReports.values());
  }

  public getErrorReport(id: string): ErrorReport | undefined {
    return this.errorReports.get(id);
  }

  public markErrorResolved(id: string): void {
    const report = this.errorReports.get(id);
    if (report) {
      report.resolved = true;
    }
  }

  public clearErrorReports(): void {
    this.errorReports.clear();
  }

  public setErrorReportingEnabled(enabled: boolean): void {
    this.errorReportingEnabled = enabled;
  }

  public isErrorReportingEnabled(): boolean {
    return this.errorReportingEnabled;
  }

  // Utility method for wrapping async functions with error handling
  public async withErrorHandling<T>(
    fn: () => Promise<T>,
    context: string,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallbackValue;
    }
  }

  // Utility method for wrapping sync functions with error handling
  public withSyncErrorHandling<T>(
    fn: () => T,
    context: string,
    fallbackValue?: T
  ): T | undefined {
    try {
      return fn();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallbackValue;
    }
  }
}

export const errorHandler = new ErrorHandler();
export default errorHandler;
