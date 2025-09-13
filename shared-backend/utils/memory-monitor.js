/**
 * Accurate Memory Monitoring System
 * Provides correct memory usage calculations for production monitoring
 */

const os = require('os');

class MemoryMonitor {
  constructor() {
    this.systemMemory = os.totalmem();
    this.lastCheck = null;
    this.memoryHistory = [];
  }

  /**
   * Get accurate system memory usage percentage
   * This is the correct way to measure actual system memory usage
   */
  getSystemMemoryUsage() {
    const freeMemory = os.freemem();
    const usedMemory = this.systemMemory - freeMemory;
    const usagePercentage = (usedMemory / this.systemMemory) * 100;
    
    return {
      total: this.systemMemory,
      used: usedMemory,
      free: freeMemory,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      unit: 'bytes'
    };
  }

  /**
   * Get V8 heap memory usage (for Node.js process only)
   * This is what we were incorrectly using before
   */
  getV8HeapUsage() {
    const memUsage = process.memoryUsage();
    const heapUsagePercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      heapUsagePercentage: Math.round(heapUsagePercentage * 100) / 100,
      external: memUsage.external,
      rss: memUsage.rss,
      unit: 'bytes'
    };
  }

  /**
   * Get comprehensive memory report
   */
  getMemoryReport() {
    const systemMemory = this.getSystemMemoryUsage();
    const v8Heap = this.getV8HeapUsage();
    
    const report = {
      timestamp: new Date().toISOString(),
      system: {
        total: this.formatBytes(systemMemory.total),
        used: this.formatBytes(systemMemory.used),
        free: this.formatBytes(systemMemory.free),
        usagePercentage: systemMemory.usagePercentage,
        status: this.getMemoryStatus(systemMemory.usagePercentage)
      },
      nodejs: {
        heapUsed: this.formatBytes(v8Heap.heapUsed),
        heapTotal: this.formatBytes(v8Heap.heapTotal),
        heapUsagePercentage: v8Heap.heapUsagePercentage,
        external: this.formatBytes(v8Heap.external),
        rss: this.formatBytes(v8Heap.rss),
        status: this.getMemoryStatus(v8Heap.heapUsagePercentage)
      },
      recommendations: this.getMemoryRecommendations(systemMemory.usagePercentage, v8Heap.heapUsagePercentage)
    };

    // Store in history
    this.memoryHistory.push(report);
    if (this.memoryHistory.length > 100) {
      this.memoryHistory = this.memoryHistory.slice(-100);
    }

    this.lastCheck = report;
    return report;
  }

  /**
   * Get memory status based on usage percentage
   */
  getMemoryStatus(usagePercentage) {
    if (usagePercentage >= 90) return 'critical';
    if (usagePercentage >= 80) return 'warning';
    if (usagePercentage >= 60) return 'moderate';
    return 'healthy';
  }

  /**
   * Get memory optimization recommendations
   */
  getMemoryRecommendations(systemUsage, heapUsage) {
    const recommendations = [];

    if (systemUsage > 80) {
      recommendations.push({
        type: 'system',
        priority: 'high',
        message: `System memory usage is ${systemUsage}% - consider scaling up`,
        action: 'scale_up'
      });
    }

    if (heapUsage > 85) {
      recommendations.push({
        type: 'nodejs',
        priority: 'medium',
        message: `Node.js heap usage is ${heapUsage}% - consider garbage collection`,
        action: 'gc'
      });
    }

    if (systemUsage < 30 && heapUsage < 50) {
      recommendations.push({
        type: 'optimization',
        priority: 'low',
        message: 'Memory usage is healthy - system is well optimized',
        action: 'maintain'
      });
    }

    return recommendations;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get memory trend analysis
   */
  getMemoryTrend() {
    if (this.memoryHistory.length < 2) {
      return { trend: 'insufficient_data', change: 0 };
    }

    const recent = this.memoryHistory.slice(-5);
    const older = this.memoryHistory.slice(-10, -5);
    
    if (older.length === 0) {
      return { trend: 'insufficient_data', change: 0 };
    }

    const recentAvg = recent.reduce((sum, r) => sum + r.system.usagePercentage, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.system.usagePercentage, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    let trend = 'stable';
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';
    
    return { trend, change: Math.round(change * 100) / 100 };
  }

  /**
   * Check if memory usage requires attention
   */
  requiresAttention() {
    const systemMemory = this.getSystemMemoryUsage();
    const v8Heap = this.getV8HeapUsage();
    
    return {
      system: systemMemory.usagePercentage > 80,
      nodejs: v8Heap.heapUsagePercentage > 85,
      overall: systemMemory.usagePercentage > 80 || v8Heap.heapUsagePercentage > 85
    };
  }
}

// Create global instance
const memoryMonitor = new MemoryMonitor();

module.exports = {
  memoryMonitor,
  getSystemMemoryUsage: () => memoryMonitor.getSystemMemoryUsage(),
  getV8HeapUsage: () => memoryMonitor.getV8HeapUsage(),
  getMemoryReport: () => memoryMonitor.getMemoryReport(),
  getMemoryTrend: () => memoryMonitor.getMemoryTrend(),
  requiresAttention: () => memoryMonitor.requiresAttention()
};
