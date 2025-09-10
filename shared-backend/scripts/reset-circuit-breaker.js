#!/usr/bin/env node

/**
 * Circuit Breaker Reset Script
 * Resets the circuit breaker and optimizes AI operations
 */

const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

async function resetCircuitBreaker() {
  try {
    logger.info('🔄 Resetting circuit breaker...');
    
    // Import the production safe AI wrapper
    const ProductionSafeAI = require('../services/productionSafeAI');
    const productionSafeAI = new ProductionSafeAI();
    
    // Reset circuit breaker
    productionSafeAI.circuitBreaker.failures = 0;
    productionSafeAI.circuitBreaker.lastFailure = null;
    productionSafeAI.circuitBreaker.isOpen = false;
    
    logger.info('✅ Circuit breaker reset successfully');
    
    // Get current status
    const status = productionSafeAI.getSystemStatus();
    logger.info('📊 System Status:', {
      circuitBreakerStatus: status.circuitBreakerStatus,
      failures: status.failures,
      lastFailure: status.lastFailure
    });
    
    return { success: true, message: 'Circuit breaker reset successfully' };
  } catch (error) {
    logger.error('❌ Failed to reset circuit breaker:', error);
    return { success: false, error: error.message };
  }
}

async function optimizeMemoryUsage() {
  try {
    logger.info('🧹 Optimizing memory usage...');
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      logger.info('✅ Garbage collection triggered');
    }
    
    // Clear any cached data
    const AIResponseCache = require('../services/aiResponseCache');
    const cache = new AIResponseCache();
    cache.clearCache();
    logger.info('✅ AI response cache cleared');
    
    // Get current memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    logger.info('📊 Memory Usage (MB):', memUsageMB);
    
    return { success: true, message: 'Memory optimization completed', memoryUsage: memUsageMB };
  } catch (error) {
    logger.error('❌ Failed to optimize memory usage:', error);
    return { success: false, error: error.message };
  }
}

async function main() {
  logger.info('🚀 Starting system optimization...');
  
  try {
    // Reset circuit breaker
    const circuitResult = await resetCircuitBreaker();
    if (!circuitResult.success) {
      throw new Error(`Circuit breaker reset failed: ${circuitResult.error}`);
    }
    
    // Optimize memory usage
    const memoryResult = await optimizeMemoryUsage();
    if (!memoryResult.success) {
      throw new Error(`Memory optimization failed: ${memoryResult.error}`);
    }
    
    logger.info('✅ System optimization completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ System optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { resetCircuitBreaker, optimizeMemoryUsage };
