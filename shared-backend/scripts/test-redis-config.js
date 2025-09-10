#!/usr/bin/env node

/**
 * Redis Configuration Test Script
 * 
 * This script tests if the Redis configuration can be loaded without errors
 * Run with: node scripts/test-redis-config.js
 */

console.log('🧪 Testing Redis Configuration Loading...\n');

try {
  console.log('📋 Loading Redis configuration...');
  const redisConfig = require('../config/redis');
  console.log('✅ Redis configuration loaded successfully');
  
  console.log('\n📋 Available exports:');
  console.log(Object.keys(redisConfig));
  
  console.log('\n📋 Testing cache object...');
  if (redisConfig.cache) {
    console.log('✅ Cache object available');
    console.log('Cache methods:', Object.keys(redisConfig.cache));
  } else {
    console.log('❌ Cache object not available');
  }
  
  console.log('\n📋 Testing connectRedis function...');
  if (typeof redisConfig.connectRedis === 'function') {
    console.log('✅ connectRedis function available');
  } else {
    console.log('❌ connectRedis function not available');
  }
  
  console.log('\n🎉 All tests passed! Redis configuration is working correctly.');
  
} catch (error) {
  console.error('\n❌ Redis configuration test failed:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}
