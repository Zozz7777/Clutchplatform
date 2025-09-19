const { performance } = require('perf_hooks');

class RealPerformanceMetricsService {
  constructor() {
    this.requestMetrics = new Map();
    this.responseTimeHistory = [];
    this.errorCount = 0;
    this.requestCount = 0;
    this.startTime = Date.now();
    this.maxHistorySize = 1000;
  }

  /**
   * Start timing a request
   */
  startRequest(requestId) {
    this.requestMetrics.set(requestId, {
      startTime: performance.now(),
      timestamp: Date.now()
    });
  }

  /**
   * End timing a request and record metrics
   */
  endRequest(requestId, statusCode = 200) {
    const requestData = this.requestMetrics.get(requestId);
    if (!requestData) return;

    const endTime = performance.now();
    const responseTime = endTime - requestData.startTime;
    
    this.requestCount++;
    if (statusCode >= 400) {
      this.errorCount++;
    }

    // Store response time
    this.responseTimeHistory.push({
      timestamp: Date.now(),
      responseTime,
      statusCode
    });

    // Keep history size manageable
    if (this.responseTimeHistory.length > this.maxHistorySize) {
      this.responseTimeHistory = this.responseTimeHistory.slice(-this.maxHistorySize);
    }

    // Clean up request data
    this.requestMetrics.delete(requestId);
  }

  /**
   * Get current request count
   */
  getRequestCount() {
    return this.requestCount;
  }

  /**
   * Get current error count
   */
  getErrorCount() {
    return this.errorCount;
  }

  /**
   * Get average response time
   */
  getAverageResponseTime() {
    if (this.responseTimeHistory.length === 0) return 0;
    
    const totalTime = this.responseTimeHistory.reduce((sum, entry) => sum + entry.responseTime, 0);
    return Math.round(totalTime / this.responseTimeHistory.length * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get throughput (requests per minute)
   */
  getThroughput() {
    const uptimeMinutes = (Date.now() - this.startTime) / (1000 * 60);
    return uptimeMinutes > 0 ? Math.round(this.requestCount / uptimeMinutes) : 0;
  }

  /**
   * Get error rate percentage
   */
  getErrorRate() {
    return this.requestCount > 0 ? Math.round((this.errorCount / this.requestCount) * 100 * 100) / 100 : 0;
  }

  /**
   * Get response time percentiles
   */
  getResponseTimePercentiles() {
    if (this.responseTimeHistory.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const sortedTimes = this.responseTimeHistory
      .map(entry => entry.responseTime)
      .sort((a, b) => a - b);

    const p50Index = Math.floor(sortedTimes.length * 0.5);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    return {
      p50: Math.round(sortedTimes[p50Index] * 100) / 100,
      p95: Math.round(sortedTimes[p95Index] * 100) / 100,
      p99: Math.round(sortedTimes[p99Index] * 100) / 100
    };
  }

  /**
   * Get comprehensive performance metrics
   */
  getPerformanceMetrics() {
    const uptime = Date.now() - this.startTime;
    const uptimeMinutes = uptime / (1000 * 60);
    
    return {
      timestamp: new Date().toISOString(),
      uptime: {
        milliseconds: uptime,
        seconds: Math.round(uptime / 1000),
        minutes: Math.round(uptimeMinutes),
        hours: Math.round(uptimeMinutes / 60)
      },
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRate: this.getErrorRate()
      },
      performance: {
        averageResponseTime: this.getAverageResponseTime(),
        throughput: this.getThroughput(),
        percentiles: this.getResponseTimePercentiles()
      },
      activeRequests: this.requestMetrics.size
    };
  }

  /**
   * Get performance metrics for a specific time window
   */
  getMetricsForTimeWindow(windowMinutes = 5) {
    const cutoffTime = Date.now() - (windowMinutes * 60 * 1000);
    const recentMetrics = this.responseTimeHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    if (recentMetrics.length === 0) {
      return {
        requestCount: 0,
        errorCount: 0,
        averageResponseTime: 0,
        throughput: 0
      };
    }

    const errorCount = recentMetrics.filter(entry => entry.statusCode >= 400).length;
    const totalResponseTime = recentMetrics.reduce((sum, entry) => sum + entry.responseTime, 0);
    const averageResponseTime = totalResponseTime / recentMetrics.length;
    const throughput = recentMetrics.length / windowMinutes;

    return {
      requestCount: recentMetrics.length,
      errorCount,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      throughput: Math.round(throughput * 100) / 100
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.requestMetrics.clear();
    this.responseTimeHistory = [];
    this.errorCount = 0;
    this.requestCount = 0;
    this.startTime = Date.now();
  }

  /**
   * Get health status based on performance metrics
   */
  getHealthStatus() {
    const metrics = this.getPerformanceMetrics();
    const avgResponseTime = metrics.performance.averageResponseTime;
    const errorRate = metrics.requests.errorRate;
    
    let status = 'healthy';
    let issues = [];

    if (avgResponseTime > 1000) {
      status = 'degraded';
      issues.push('High response time');
    }

    if (errorRate > 5) {
      status = 'unhealthy';
      issues.push('High error rate');
    }

    if (avgResponseTime > 2000) {
      status = 'critical';
      issues.push('Very high response time');
    }

    return {
      status,
      issues,
      metrics
    };
  }
}

module.exports = RealPerformanceMetricsService;
