// Enhanced error handling to prevent infinite loops and improve debugging
export class ClutchError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public endpoint?: string,
    public method?: string
  ) {
    super(message);
    this.name = 'ClutchError';
  }
}

export const handleApiError = (error: any, endpoint?: string, method?: string) => {
  console.error('🚨 API Error Details:', {
    endpoint,
    method,
    statusCode: error.statusCode || error.status,
    errorCode: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'Unknown error occurred',
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Don't clear tokens for 500 errors - these are server issues, not auth issues
  if (error.statusCode === 500 || error.status === 500) {
    console.warn('🚨 SERVER_ERROR: 500 Internal Server Error - Server issue, not auth issue');
    return new ClutchError(
      'Server temporarily unavailable',
      'SERVER_ERROR',
      500,
      endpoint,
      method
    );
  }

  // Only clear tokens for actual auth errors (401, 403)
  if (error.statusCode === 401 || error.statusCode === 403 || error.status === 401 || error.status === 403) {
    console.warn('🚨 POSSIBLE_AUTH_ISSUE: Clearing tokens due to auth error');
    // Clear tokens logic would go here
    return new ClutchError(
      'Authentication required',
      'AUTH_ERROR',
      error.statusCode || error.status,
      endpoint,
      method
    );
  }

  return new ClutchError(
    error.message || 'Request failed',
    error.code || 'REQUEST_FAILED',
    error.statusCode || error.status,
    endpoint,
    method
  );
};

// Rate limiting to prevent infinite API calls
const requestQueue = new Map<string, number>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_REQUESTS_PER_WINDOW = 5;

export const checkRateLimit = (endpoint: string): boolean => {
  const now = Date.now();
  const key = endpoint;
  const requests = requestQueue.get(key) || 0;
  
  if (requests >= MAX_REQUESTS_PER_WINDOW) {
    console.warn(`🚨 RATE_LIMIT: Too many requests to ${endpoint}`);
    return false;
  }
  
  requestQueue.set(key, requests + 1);
  
  // Clean up old entries
  setTimeout(() => {
    const current = requestQueue.get(key) || 0;
    if (current > 0) {
      requestQueue.set(key, Math.max(0, current - 1));
    }
  }, RATE_LIMIT_WINDOW);
  
  return true;
};
