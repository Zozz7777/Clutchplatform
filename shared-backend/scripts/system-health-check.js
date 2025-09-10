#!/usr/bin/env node

/**
 * System Health Check and Auto-Fix Script
 * Comprehensive system health monitoring and automatic issue resolution
 */

const winston = require('winston');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

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

async function checkSystemHealth() {
  try {
    logger.info('🏥 Starting comprehensive system health check...');
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      issues: [],
      fixes: [],
      metrics: {}
    };
    
    // Check memory usage
    const memoryHealth = await checkMemoryUsage();
    healthReport.metrics.memory = memoryHealth;
    if (memoryHealth.usage > 90) {
      healthReport.issues.push('High memory usage detected');
      healthReport.overall = 'warning';
    }
    
    // Check circuit breaker status
    const circuitBreakerHealth = await checkCircuitBreaker();
    healthReport.metrics.circuitBreaker = circuitBreakerHealth;
    if (circuitBreakerHealth.isOpen) {
      healthReport.issues.push('Circuit breaker is open');
      healthReport.overall = 'critical';
    }
    
    // Check AI provider status
    const aiProviderHealth = await checkAIProviders();
    healthReport.metrics.aiProviders = aiProviderHealth;
    if (aiProviderHealth.availableProviders < 2) {
      healthReport.issues.push('Limited AI provider availability');
      healthReport.overall = 'warning';
    }
    
    // Check database connectivity
    const databaseHealth = await checkDatabase();
    healthReport.metrics.database = databaseHealth;
    if (!databaseHealth.connected) {
      healthReport.issues.push('Database connectivity issues');
      healthReport.overall = 'critical';
    }
    
    // Check route availability
    const routeHealth = await checkRoutes();
    healthReport.metrics.routes = routeHealth;
    if (routeHealth.failedRoutes.length > 0) {
      healthReport.issues.push(`Failed routes: ${routeHealth.failedRoutes.join(', ')}`);
      healthReport.overall = 'warning';
    }
    
    logger.info('📊 Health Check Results:', healthReport);
    
    return healthReport;
  } catch (error) {
    logger.error('❌ Health check failed:', error);
    return {
      timestamp: new Date().toISOString(),
      overall: 'error',
      issues: ['Health check failed'],
      error: error.message
    };
  }
}

async function checkMemoryUsage() {
  try {
    const memUsage = process.memoryUsage();
    const usage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    
    return {
      usage: usage,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      status: usage > 90 ? 'critical' : usage > 80 ? 'warning' : 'healthy'
    };
  } catch (error) {
    return { error: error.message, status: 'error' };
  }
}

async function checkCircuitBreaker() {
  try {
    const ProductionSafeAI = require('../services/productionSafeAI');
    const productionSafeAI = new ProductionSafeAI();
    const status = productionSafeAI.getSystemStatus();
    
    return {
      isOpen: status.circuitBreakerStatus === 'OPEN',
      failures: status.failures,
      lastFailure: status.lastFailure,
      status: status.circuitBreakerStatus
    };
  } catch (error) {
    return { error: error.message, status: 'error' };
  }
}

async function checkAIProviders() {
  try {
    const AIProviderManager = require('../services/aiProviderManager');
    const providerManager = new AIProviderManager();
    
    let availableProviders = 0;
    const providerStatus = {};
    
    for (const [name, provider] of Object.entries(providerManager.providers)) {
      providerStatus[name] = {
        available: provider.isAvailable,
        errorCount: provider.errorCount,
        lastError: provider.lastError
      };
      if (provider.isAvailable) {
        availableProviders++;
      }
    }
    
    return {
      availableProviders: availableProviders,
      totalProviders: Object.keys(providerManager.providers).length,
      providerStatus: providerStatus,
      status: availableProviders >= 2 ? 'healthy' : 'warning'
    };
  } catch (error) {
    return { error: error.message, status: 'error' };
  }
}

async function checkDatabase() {
  try {
    // Simple database connectivity check
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    
    await client.connect();
    await client.db().admin().ping();
    await client.close();
    
    return { connected: true, status: 'healthy' };
  } catch (error) {
    return { connected: false, error: error.message, status: 'error' };
  }
}

async function checkRoutes() {
  try {
    const axios = require('axios');
    const baseUrl = process.env.BACKEND_URL || 'https://clutch-main-nk7x.onrender.com';
    
    const routesToCheck = [
      '/health',
      '/api/v1/auth/employee-me',
      '/api/v1/admin/dashboard/consolidated',
      '/api/v1/dashboard/consolidated'
    ];
    
    const results = [];
    const failedRoutes = [];
    
    for (const route of routesToCheck) {
      try {
        const response = await axios.get(`${baseUrl}${route}`, { timeout: 5000 });
        results.push({ route, status: response.status, success: true });
      } catch (error) {
        results.push({ route, status: error.response?.status || 'error', success: false });
        failedRoutes.push(route);
      }
    }
    
    return {
      totalRoutes: routesToCheck.length,
      successfulRoutes: results.filter(r => r.success).length,
      failedRoutes: failedRoutes,
      results: results,
      status: failedRoutes.length === 0 ? 'healthy' : 'warning'
    };
  } catch (error) {
    return { error: error.message, status: 'error' };
  }
}

async function autoFixIssues(healthReport) {
  try {
    logger.info('🔧 Starting automatic issue resolution...');
    
    const fixes = [];
    
    // Fix high memory usage
    if (healthReport.metrics.memory?.usage > 90) {
      logger.info('🧹 Fixing high memory usage...');
      const { optimizeMemory } = require('./optimize-memory');
      const result = await optimizeMemory();
      if (result.success) {
        fixes.push('Memory optimization completed');
      }
    }
    
    // Fix circuit breaker
    if (healthReport.metrics.circuitBreaker?.isOpen) {
      logger.info('🔄 Resetting circuit breaker...');
      const { resetCircuitBreaker } = require('./reset-circuit-breaker');
      const result = await resetCircuitBreaker();
      if (result.success) {
        fixes.push('Circuit breaker reset');
      }
    }
    
    // Fix NPM vulnerabilities
    logger.info('🔒 Checking for NPM vulnerabilities...');
    try {
      const { stdout } = await execAsync('npm audit --audit-level=high');
      if (stdout.includes('found 0 vulnerabilities')) {
        logger.info('✅ No NPM vulnerabilities found');
      } else {
        logger.info('🔧 Fixing NPM vulnerabilities...');
        await execAsync('npm run fix:vulnerabilities');
        fixes.push('NPM vulnerabilities fixed');
      }
    } catch (error) {
      logger.warn('⚠️ Could not check NPM vulnerabilities:', error.message);
    }
    
    logger.info('✅ Automatic issue resolution completed');
    return fixes;
  } catch (error) {
    logger.error('❌ Automatic issue resolution failed:', error);
    return [];
  }
}

async function main() {
  logger.info('🚀 Starting system health check and auto-fix...');
  
  try {
    // Run health check
    const healthReport = await checkSystemHealth();
    
    // Auto-fix issues if any
    if (healthReport.issues.length > 0) {
      logger.info(`🔧 Found ${healthReport.issues.length} issues, attempting auto-fix...`);
      const fixes = await autoFixIssues(healthReport);
      healthReport.fixes = fixes;
    }
    
    // Final status
    logger.info('📊 Final System Status:', {
      overall: healthReport.overall,
      issues: healthReport.issues.length,
      fixes: healthReport.fixes.length,
      timestamp: healthReport.timestamp
    });
    
    if (healthReport.overall === 'healthy') {
      logger.info('✅ System is healthy');
      process.exit(0);
    } else if (healthReport.overall === 'warning') {
      logger.warn('⚠️ System has warnings but is operational');
      process.exit(0);
    } else {
      logger.error('❌ System has critical issues');
      process.exit(1);
    }
  } catch (error) {
    logger.error('❌ System health check failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkSystemHealth, autoFixIssues };
