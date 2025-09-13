/**
 * Frontend Error Tracker
 * Automatically captures and sends console errors to the backend
 * No more manual copy-pasting of console errors!
 */

interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  userAgent: string;
  userId?: string;
  sessionId: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorTrackerConfig {
  apiEndpoint: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  enableConsoleCapture: boolean;
  enableUnhandledRejection: boolean;
  enableUncaughtException: boolean;
  enableNetworkErrors: boolean;
  enablePerformanceErrors: boolean;
}

class ErrorTracker {
  private config: ErrorTrackerConfig;
  private errorBuffer: ErrorLog[] = [];
  private sessionId: string;
  private userId: string | null = null;
  private isOnline: boolean = true;
  private retryCount: number = 0;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ErrorTrackerConfig> = {}) {
    this.config = {
      apiEndpoint: (process.env.NEXT_PUBLIC_API_URL || 'https://clutch-main-nk7x.onrender.com/api/v1') + '/errors/frontend',
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
      maxRetries: 3,
      enableConsoleCapture: true,
      enableUnhandledRejection: true,
      enableUncaughtException: true,
      enableNetworkErrors: true,
      enablePerformanceErrors: true,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  /**
   * Initialize the error tracker
   */
  private initialize(): void {
    // Only initialize on client-side
    if (typeof window === 'undefined') {
      return;
    }
    
    console.log('🔍 Initializing Error Tracker...');

    // Set up console error capture
    if (this.config.enableConsoleCapture) {
      this.setupConsoleCapture();
    }

    // Set up global error handlers
    if (this.config.enableUnhandledRejection) {
      this.setupUnhandledRejection();
    }

    if (this.config.enableUncaughtException) {
      this.setupUncaughtException();
    }

    // Set up network error tracking
    if (this.config.enableNetworkErrors) {
      this.setupNetworkErrorTracking();
    }

    // Set up performance error tracking
    if (this.config.enablePerformanceErrors) {
      this.setupPerformanceErrorTracking();
    }

    // Set up online/offline detection
    this.setupOnlineDetection();

    // Start flush timer
    this.startFlushTimer();

    console.log('✅ Error Tracker initialized');
  }

  /**
   * Set up console error capture
   */
  private setupConsoleCapture(): void {
    if (typeof window === 'undefined') return;
    
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug
    };

    // Override console.error
    console.error = (...args: any[]) => {
      originalConsole.error(...args);
      this.captureError('error', args.join(' '), this.getStackTrace());
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      originalConsole.warn(...args);
      this.captureError('warn', args.join(' '), this.getStackTrace());
    };

    // Override console.info (optional, for debugging)
    console.info = (...args: any[]) => {
      originalConsole.info(...args);
      this.captureError('info', args.join(' '), this.getStackTrace());
    };

    // Override console.debug (optional, for debugging)
    console.debug = (...args: any[]) => {
      originalConsole.debug(...args);
      this.captureError('debug', args.join(' '), this.getStackTrace());
    };
  }

  /**
   * Set up unhandled promise rejection tracking
   */
  private setupUnhandledRejection(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      const message = error?.message || error?.toString() || 'Unhandled Promise Rejection';
      const stack = error?.stack || this.getStackTrace();
      
      this.captureError('error', message, stack, {
        type: 'unhandledrejection',
        reason: error,
        promise: event.promise
      });
    });
  }

  /**
   * Set up uncaught exception tracking
   */
  private setupUncaughtException(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('error', (event) => {
      const message = event.message || 'Uncaught Exception';
      const stack = event.error?.stack || this.getStackTrace();
      
      this.captureError('error', message, stack, {
        type: 'uncaughtexception',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
  }

  /**
   * Set up network error tracking
   */
  private setupNetworkErrorTracking(): void {
    if (typeof window === 'undefined') return;
    
    // Track fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);
        
        // Log failed requests
        if (!response.ok) {
        this.captureError('warn', `HTTP ${response.status}: ${response.statusText}`, this.getStackTrace(), {
          type: 'networkerror',
          url: input.toString(),
          status: response.status,
          statusText: response.statusText
        });
        }
        
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.captureError('error', `Network Error: ${errorMessage}`, this.getStackTrace(), {
          type: 'networkerror',
          url: input.toString(),
          error: errorMessage
        });
        throw error;
      }
    };

    // Track XMLHttpRequest errors
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string, async?: boolean, user?: string, password?: string) {
      (this as any)._errorTrackerUrl = url;
      (this as any)._errorTrackerMethod = method;
      return originalXHROpen.call(this, method, url, async ?? true, user, password);
    };

    XMLHttpRequest.prototype.send = function(...args: any[]) {
      this.addEventListener('error', () => {
        const tracker = (window as any).__errorTracker;
        if (tracker) {
          tracker.captureError('error', `XHR Error: ${(this as any)._errorTrackerMethod} ${(this as any)._errorTrackerUrl}`, tracker.getStackTrace(), {
            type: 'networkerror',
            method: (this as any)._errorTrackerMethod,
            url: (this as any)._errorTrackerUrl,
            status: this.status,
            statusText: this.statusText
          });
        }
      });
      
      return originalXHRSend.call(this, ...args);
    };
  }

  /**
   * Set up performance error tracking
   */
  private setupPerformanceErrorTracking(): void {
    if (typeof window === 'undefined') return;
    
    // Track long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.captureError('warn', `Long Task: ${entry.duration}ms`, this.getStackTrace(), {
                type: 'performance',
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        // PerformanceObserver not supported
      }
    }

    // Track memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          this.captureError('warn', 'High Memory Usage', this.getStackTrace(), {
            type: 'performance',
            usedJSHeapSize: memory.usedJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            totalJSHeapSize: memory.totalJSHeapSize
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Set up online/offline detection
   */
  private setupOnlineDetection(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.retryCount = 0;
      this.flushErrors(); // Try to send buffered errors
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushErrors();
    }, this.config.flushInterval);
  }

  /**
   * Capture an error
   */
  private captureError(
    type: ErrorLog['type'],
    message: string,
    stack?: string,
    context?: Record<string, any>
  ): void {
    if (typeof window === 'undefined') return;
    
    const errorLog: ErrorLog = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type,
      message: message.substring(0, 1000), // Limit message length
      stack: stack?.substring(0, 5000), // Limit stack trace length
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      context,
      severity: this.determineSeverity(type, message)
    };

    this.errorBuffer.push(errorLog);

    // Flush immediately for critical errors
    if (errorLog.severity === 'critical') {
      this.flushErrors();
    }

    // Flush when buffer is full
    if (this.errorBuffer.length >= this.config.batchSize) {
      this.flushErrors();
    }
  }

  /**
   * Flush errors to the backend
   */
  private async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0 || !this.isOnline) {
      return;
    }

    const errorsToSend = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          errors: errorsToSend,
          metadata: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Sent ${errorsToSend.length} errors to backend`);
      this.retryCount = 0;
    } catch (error) {
      console.error('❌ Failed to send errors to backend:', error);
      
      // Put errors back in buffer for retry
      this.errorBuffer.unshift(...errorsToSend);
      
      // Retry with exponential backoff
      if (this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
        setTimeout(() => this.flushErrors(), delay);
      } else {
        console.error('❌ Max retries reached, dropping errors');
        this.errorBuffer = [];
      }
    }
  }

  /**
   * Get stack trace
   */
  private getStackTrace(): string {
    try {
      throw new Error();
    } catch (error) {
      return (error as Error).stack || '';
    }
  }

  /**
   * Determine error severity
   */
  private determineSeverity(type: ErrorLog['type'], message: string): ErrorLog['severity'] {
    const lowerMessage = message.toLowerCase();
    
    if (type === 'error') {
      if (lowerMessage.includes('critical') || lowerMessage.includes('fatal')) {
        return 'critical';
      }
      if (lowerMessage.includes('authentication') || lowerMessage.includes('unauthorized')) {
        return 'high';
      }
      if (lowerMessage.includes('network') || lowerMessage.includes('timeout')) {
        return 'medium';
      }
      return 'high';
    }
    
    if (type === 'warn') {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Manually capture an error
   */
  public captureCustomError(
    type: ErrorLog['type'],
    message: string,
    context?: Record<string, any>
  ): void {
    this.captureError(type, message, this.getStackTrace(), context);
  }

  /**
   * Get current error buffer
   */
  public getErrorBuffer(): ErrorLog[] {
    return [...this.errorBuffer];
  }

  /**
   * Clear error buffer
   */
  public clearErrorBuffer(): void {
    this.errorBuffer = [];
  }

  /**
   * Destroy the error tracker
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush remaining errors
    this.flushErrors();
  }
}

// Create global instance
const errorTracker = new ErrorTracker();

// Make it available globally for debugging
(window as any).__errorTracker = errorTracker;

export default errorTracker;
export { ErrorTracker, type ErrorLog, type ErrorTrackerConfig };
