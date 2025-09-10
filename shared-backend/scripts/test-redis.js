#!/usr/bin/env node

/**
 * Redis Connection Test Script
 * 
 * This script tests Redis connectivity and authentication
 * Run with: node scripts/test-redis.js
 */

require('dotenv').config();
const { createClient } = require('redis');

async function testRedisConnection() {
  console.log('🧪 Testing Redis Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`REDIS_URL: ${process.env.REDIS_URL ? '✅ Set' : '❌ Not set'}`);
  console.log(`REDIS_USERNAME: ${process.env.REDIS_USERNAME ? '✅ Set' : '❌ Not set'}`);
  console.log(`REDIS_PASSWORD: ${process.env.REDIS_PASSWORD ? '✅ Set' : '❌ Not set'}`);
  console.log(`REDIS_TTL: ${process.env.REDIS_TTL || '3600 (default)'}`);
  console.log('');

  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL is required. Please set it in your .env file.');
    process.exit(1);
  }

  try {
    console.log('🔍 Parsing Redis URL...');
    const url = new URL(process.env.REDIS_URL);
    console.log(`Host: ${url.hostname}`);
    console.log(`Port: ${url.port || 6379}`);
    console.log(`Username: ${url.username || 'Not specified'}`);
    console.log(`Password: ${url.password ? '***' : 'Not specified'}`);
    console.log('');

    // Create client options
    let clientOptions = {};
    
    if (process.env.REDIS_USERNAME || process.env.REDIS_PASSWORD) {
      // Use separate credentials
      clientOptions = {
        socket: {
          host: url.hostname,
          port: parseInt(url.port) || 6379,
          connectTimeout: 10000,
          commandTimeout: 5000
        }
      };
      
      if (process.env.REDIS_USERNAME) {
        clientOptions.username = process.env.REDIS_USERNAME;
      }
      if (process.env.REDIS_PASSWORD) {
        clientOptions.password = process.env.REDIS_PASSWORD;
      }
      
      console.log('🔐 Using separate credentials for authentication');
    } else if (url.username || url.password) {
      // Use embedded credentials
      clientOptions = { url: process.env.REDIS_URL };
      console.log('🔐 Using embedded credentials from URL');
    } else {
      // No credentials
      clientOptions = { url: process.env.REDIS_URL };
      console.log('⚠️  No credentials provided - this may cause authentication errors');
    }

    console.log('\n🚀 Creating Redis client...');
    const client = createClient(clientOptions);

    // Event handlers
    client.on('error', (err) => {
      console.error('❌ Redis Error:', err.message);
    });

    client.on('connect', () => {
      console.log('✅ Redis connecting...');
    });

    client.on('ready', () => {
      console.log('✅ Redis ready for commands');
    });

    client.on('end', () => {
      console.log('⚠️  Redis connection ended');
    });

    console.log('🔌 Connecting to Redis...');
    await client.connect();
    
    console.log('✅ Redis connected successfully');

    // Test ping
    console.log('🏓 Testing ping...');
    const pong = await client.ping();
    console.log(`✅ Ping response: ${pong}`);

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Set a test key
    await client.set('test:connection', 'Hello Redis!', 'EX', 60);
    console.log('✅ Set test key');
    
    // Get the test key
    const value = await client.get('test:connection');
    console.log(`✅ Get test key: ${value}`);
    
    // Delete the test key
    await client.del('test:connection');
    console.log('✅ Deleted test key');

    // Test info command
    console.log('\n📊 Redis Info:');
    const info = await client.info('server');
    const version = info.split('\n').find(line => line.startsWith('redis_version'));
    console.log(`Version: ${version}`);

    // Test memory usage
    const memory = await client.memory('usage');
    console.log(`Memory Usage: ${(memory / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n🎉 All tests passed! Redis is working correctly.');
    
    // Graceful shutdown
    await client.quit();
    console.log('✅ Redis connection closed');

  } catch (error) {
    console.error('\n❌ Redis test failed:', error.message);
    
    if (error.message.includes('NOAUTH')) {
      console.error('\n🔐 Authentication Error:');
      console.error('Redis requires authentication. Please check:');
      console.error('1. REDIS_USERNAME is set correctly');
      console.error('2. REDIS_PASSWORD is set correctly');
      console.error('3. Credentials match your Redis Cloud database');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n🌐 Connection Error:');
      console.error('Cannot connect to Redis host. Please check:');
      console.error('1. REDIS_URL is correct');
      console.error('2. Redis Cloud database is running');
      console.error('3. Network connectivity');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n🔍 DNS Error:');
      console.error('Cannot resolve Redis hostname. Please check:');
      console.error('1. REDIS_URL hostname is correct');
      console.error('2. DNS resolution is working');
    }
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testRedisConnection().catch(console.error);
}

module.exports = { testRedisConnection };
