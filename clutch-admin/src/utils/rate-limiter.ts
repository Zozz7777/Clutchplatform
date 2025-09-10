/**
 * Rate Limiter Utility
 * Helps manage API request frequency to avoid hitting backend rate limits
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  retryAfterMs: number
}

class RateLimiter {
  private requests: number[] = []
  private config: RateLimitConfig
  private pendingRequests: number = 0
  private maxConcurrentRequests: number = 10

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if a request can be made now
   */
  canMakeRequest(): boolean {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Remove old requests outside the window
    this.requests = this.requests.filter(time => time > windowStart)

    return this.requests.length < this.config.maxRequests && this.pendingRequests < this.maxConcurrentRequests
  }

  /**
   * Record a request
   */
  recordRequest(): void {
    this.requests.push(Date.now())
    this.pendingRequests++
  }

  /**
   * Mark request as completed
   */
  completeRequest(): void {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1)
  }

  /**
   * Get the delay needed before the next request
   */
  getDelayMs(): number {
    if (this.canMakeRequest()) {
      return 0
    }

    // If we have too many concurrent requests, wait a short time
    if (this.pendingRequests >= this.maxConcurrentRequests) {
      return 100 // 100ms delay for concurrent requests
    }

    const oldestRequest = Math.min(...this.requests)
    const nextAvailableTime = oldestRequest + this.config.windowMs
    return Math.max(0, nextAvailableTime - Date.now())
  }

  /**
   * Wait for the next available slot
   */
  async waitForSlot(): Promise<void> {
    const delay = this.getDelayMs()
    if (delay > 0) {
      // Only log if delay is significant (> 1 second)
      if (delay > 1000) {
        console.log(`⏳ Rate limiter: Waiting ${delay}ms before next request`)
      }
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  /**
   * Make a request with rate limiting
   */
  async makeRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    await this.waitForSlot()
    this.recordRequest()
    
    try {
      const result = await requestFn()
      return result
    } finally {
      this.completeRequest()
    }
  }

  /**
   * Reset the rate limiter
   */
  reset(): void {
    this.requests = []
    this.pendingRequests = 0
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API requests - Much more permissive
  general: new RateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    retryAfterMs: 1000 // 1 second
  }),

  // Dashboard data - More permissive
  dashboard: new RateLimiter({
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minute
    retryAfterMs: 1000 // 1 second
  }),

  // Authentication - More permissive
  auth: new RateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
    retryAfterMs: 1000 // 1 second
  }),

  // Real-time updates - More permissive
  realtime: new RateLimiter({
    maxRequests: 40,
    windowMs: 60 * 1000, // 1 minute
    retryAfterMs: 1000 // 1 second
  })
}

/**
 * Utility function to create a rate-limited version of any async function
 */
export function withRateLimit<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  rateLimiter: RateLimiter
) {
  return async (...args: T): Promise<R> => {
    return rateLimiter.makeRequest(() => fn(...args))
  }
}

/**
 * Utility function to batch multiple requests with rate limiting
 */
export async function batchRequests<T>(
  requests: (() => Promise<T>)[],
  rateLimiter: RateLimiter = rateLimiters.general
): Promise<T[]> {
  const results: T[] = []
  
  for (const request of requests) {
    try {
      const result = await rateLimiter.makeRequest(request)
      results.push(result)
    } catch (error) {
      console.error('Batch request failed:', error)
      // Continue with other requests even if one fails
      results.push(error as T)
    }
  }
  
  return results
}

export default RateLimiter
