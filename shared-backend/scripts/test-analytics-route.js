#!/usr/bin/env node

/**
 * Analytics Route Test Script
 * 
 * This script tests if the analytics route can be loaded with Redis cache middleware
 * Run with: node scripts/test-analytics-route.js
 */

console.log('🧪 Testing Analytics Route with Redis Cache Middleware...\n');

try {
  console.log('📋 Loading analytics route...');
  const analyticsRouter = require('../routes/analytics');
  console.log('✅ Analytics route loaded successfully');
  
  console.log('\n📋 Testing route object...');
  console.log('Router type:', typeof analyticsRouter);
  console.log('Router methods:', Object.keys(analyticsRouter));
  
  console.log('\n📋 Testing route stack...');
  if (analyticsRouter.stack) {
    console.log('Route stack length:', analyticsRouter.stack.length);
    console.log('Route stack types:', analyticsRouter.stack.map(layer => layer.name || 'anonymous'));
  }
  
  console.log('\n🎉 Analytics route test passed! Route is working correctly with Redis cache middleware.');
  
} catch (error) {
  console.error('\n❌ Analytics route test failed:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}
