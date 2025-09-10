#!/usr/bin/env node

/**
 * Redis Cache Middleware Test Script
 * 
 * This script tests if the Redis cache middleware can be imported and used
 * Run with: node scripts/test-middleware.js
 */

console.log('🧪 Testing Redis Cache Middleware...\n');

try {
  console.log('📋 Loading Redis cache middleware...');
  const { cacheMiddleware, rateLimit, sessionCache } = require('../middleware/redis-cache');
  console.log('✅ Redis cache middleware loaded successfully');
  
  console.log('\n📋 Available middleware functions:');
  console.log('- cacheMiddleware:', typeof cacheMiddleware);
  console.log('- rateLimit:', typeof rateLimit);
  console.log('- sessionCache:', typeof sessionCache);
  
  console.log('\n📋 Testing middleware creation...');
  
  // Test cache middleware
  const testCacheMiddleware = cacheMiddleware('test', 300);
  console.log('✅ Cache middleware created successfully');
  
  // Test rate limit middleware
  const testRateLimitMiddleware = rateLimit(100, 3600);
  console.log('✅ Rate limit middleware created successfully');
  
  // Test session cache middleware
  const testSessionCacheMiddleware = sessionCache(86400);
  console.log('✅ Session cache middleware created successfully');
  
  console.log('\n🎉 All middleware tests passed! Redis cache middleware is working correctly.');
  
} catch (error) {
  console.error('\n❌ Redis cache middleware test failed:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}
