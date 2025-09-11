#!/usr/bin/env node

/**
 * Reset Circuit Breaker Script
 * Fixes the circuit breaker issue that's preventing the autonomous system from working
 */

const path = require('path');
const fs = require('fs');

// Add the project root to the module path
const projectRoot = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(projectRoot, '.env') });

const ProductionSafeAI = require('../services/productionSafeAI');
const AIProviderManager = require('../services/aiProviderManager');

async function resetCircuitBreaker() {
  console.log('🔄 Resetting Circuit Breaker...');
  
  try {
    // Reset ProductionSafeAI circuit breaker
    const productionSafeAI = new ProductionSafeAI();
    productionSafeAI.resetCircuitBreaker();
    console.log('✅ ProductionSafeAI circuit breaker reset');
    
    // Reset AI Provider Manager circuit breakers
    const aiProviderManager = new AIProviderManager();
    aiProviderManager.resetAllCircuitBreakers();
    console.log('✅ AI Provider Manager circuit breakers reset');
    
    // Reset any Redis-based circuit breakers
    try {
      const redis = require('redis');
      const client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      await client.connect();
      
      // Reset performance optimization circuit breakers
      const keys = await client.keys('circuit_breaker_*');
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`✅ Reset ${keys.length} Redis circuit breakers`);
      }
      
      await client.quit();
    } catch (redisError) {
      console.log('⚠️ Redis not available, skipping Redis circuit breaker reset');
    }
    
    console.log('🎉 Circuit breaker reset completed successfully!');
    console.log('🚀 The autonomous system should now work properly');
    
  } catch (error) {
    console.error('❌ Error resetting circuit breaker:', error);
    process.exit(1);
  }
}

// Run the reset
resetCircuitBreaker();