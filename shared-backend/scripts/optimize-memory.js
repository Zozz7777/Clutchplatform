#!/usr/bin/env node

/**
 * Memory Optimization Script
 * Optimizes memory usage and clears unnecessary data
 */

const winston = require('winston');
const fs = require('fs').promises;
const path = require('path');

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

async function optimizeMemory() {
  try {
    logger.info('🧹 Starting memory optimization...');
    
    // Get initial memory usage
    const initialMem = process.memoryUsage();
    logger.info('📊 Initial Memory Usage (MB):', {
      rss: Math.round(initialMem.rss / 1024 / 1024),
      heapTotal: Math.round(initialMem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(initialMem.heapUsed / 1024 / 1024),
      external: Math.round(initialMem.external / 1024 / 1024)
    });
    
    // Clear AI response cache
    try {
      const AIResponseCache = require('../services/aiResponseCache');
      const cache = new AIResponseCache();
      cache.clearCache();
      logger.info('✅ AI response cache cleared');
    } catch (error) {
      logger.warn('⚠️ Could not clear AI response cache:', error.message);
    }
    
    // Clear old log files
    await clearOldLogs();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      logger.info('✅ Garbage collection triggered');
    }
    
    // Get final memory usage
    const finalMem = process.memoryUsage();
    const memorySaved = {
      rss: Math.round((initialMem.rss - finalMem.rss) / 1024 / 1024),
      heapUsed: Math.round((initialMem.heapUsed - finalMem.heapUsed) / 1024 / 1024)
    };
    
    logger.info('📊 Final Memory Usage (MB):', {
      rss: Math.round(finalMem.rss / 1024 / 1024),
      heapTotal: Math.round(finalMem.heapTotal / 1024 / 1024),
      heapUsed: Math.round(finalMem.heapUsed / 1024 / 1024),
      external: Math.round(finalMem.external / 1024 / 1024)
    });
    
    logger.info('💾 Memory Saved (MB):', memorySaved);
    
    return { 
      success: true, 
      message: 'Memory optimization completed',
      memorySaved: memorySaved,
      finalUsage: {
        rss: Math.round(finalMem.rss / 1024 / 1024),
        heapUsed: Math.round(finalMem.heapUsed / 1024 / 1024)
      }
    };
  } catch (error) {
    logger.error('❌ Memory optimization failed:', error);
    return { success: false, error: error.message };
  }
}

async function clearOldLogs() {
  try {
    const logsDir = path.join(__dirname, '../logs');
    
    // Check if logs directory exists
    try {
      await fs.access(logsDir);
    } catch {
      logger.info('📁 No logs directory found');
      return;
    }
    
    const files = await fs.readdir(logsDir);
    let clearedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(logsDir, file);
      const stats = await fs.stat(filePath);
      
      // Clear files older than 7 days or larger than 10MB
      const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      const sizeInMB = stats.size / (1024 * 1024);
      
      if (ageInDays > 7 || sizeInMB > 10) {
        await fs.unlink(filePath);
        clearedCount++;
        logger.info(`🗑️ Cleared old log file: ${file} (${Math.round(sizeInMB)}MB, ${Math.round(ageInDays)} days old)`);
      }
    }
    
    if (clearedCount > 0) {
      logger.info(`✅ Cleared ${clearedCount} old log files`);
    } else {
      logger.info('📁 No old log files to clear');
    }
  } catch (error) {
    logger.warn('⚠️ Could not clear old logs:', error.message);
  }
}

async function main() {
  logger.info('🚀 Starting memory optimization...');
  
  try {
    const result = await optimizeMemory();
    
    if (result.success) {
      logger.info('✅ Memory optimization completed successfully');
      logger.info(`💾 Memory saved: ${result.memorySaved.heapUsed}MB heap, ${result.memorySaved.rss}MB RSS`);
      process.exit(0);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    logger.error('❌ Memory optimization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { optimizeMemory, clearOldLogs };
