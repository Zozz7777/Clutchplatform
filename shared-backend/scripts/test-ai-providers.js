#!/usr/bin/env node

/**
 * Test Script for AI Provider Manager
 * Tests all AI providers and fallback functionality
 */

const AIProviderManager = require('../services/aiProviderManager');
const winston = require('winston');

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

async function testAIProviders() {
  logger.info('🚀 Starting AI Provider Manager Test...');
  
  const aiManager = new AIProviderManager();
  
  // Test 1: Health Check
  logger.info('\n📊 Testing Provider Health Check...');
  try {
    const healthResults = await aiManager.healthCheck();
    logger.info('Health Check Results:');
    Object.entries(healthResults).forEach(([provider, result]) => {
      const status = result.status === 'healthy' ? '✅' : '❌';
      logger.info(`  ${status} ${provider}: ${result.status}`);
      if (result.error) {
        logger.warn(`    Error: ${result.error}`);
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
  }
  
  // Test 2: Provider Statistics
  logger.info('\n📈 Getting Provider Statistics...');
  const stats = aiManager.getProviderStats();
  logger.info('Provider Statistics:');
  logger.info(`  Current Provider: ${stats.currentProvider}`);
  logger.info(`  Fallback Chain: ${stats.fallbackChain.join(' → ')}`);
  
  Object.entries(stats.providers).forEach(([name, provider]) => {
    logger.info(`  ${name}:`);
    logger.info(`    Available: ${provider.isAvailable ? '✅' : '❌'}`);
    logger.info(`    Usage Count: ${provider.usageCount}`);
    logger.info(`    Error Count: ${provider.errorCount}`);
  });
  
  // Test 3: Simple AI Request
  logger.info('\n🤖 Testing Simple AI Request...');
  const testPrompt = "Respond with 'AI Provider Test Successful' if you can process this request.";
  
  try {
    const response = await aiManager.generateResponse(testPrompt, {
      maxTokens: 50,
      temperature: 0.1
    });
    
    if (response.success) {
      logger.info(`✅ AI Request Successful!`);
      logger.info(`  Provider: ${response.provider}`);
      logger.info(`  Model: ${response.model}`);
      logger.info(`  Response: ${response.response.substring(0, 100)}...`);
    } else {
      logger.error(`❌ AI Request Failed: ${response.error}`);
    }
  } catch (error) {
    logger.error('AI request test failed:', error);
  }
  
  // Test 4: Fallback Test (Simulate OpenAI failure)
  logger.info('\n🔄 Testing Fallback Mechanism...');
  
  // Mark OpenAI as unavailable to test fallback
  aiManager.markProviderUnavailable('openai', new Error('Simulated rate limit'));
  
  try {
    const fallbackResponse = await aiManager.generateResponse(testPrompt, {
      maxTokens: 50,
      temperature: 0.1
    });
    
    if (fallbackResponse.success) {
      logger.info(`✅ Fallback Successful!`);
      logger.info(`  Fallback Provider: ${fallbackResponse.provider}`);
      logger.info(`  Model: ${fallbackResponse.model}`);
    } else {
      logger.error(`❌ Fallback Failed: ${fallbackResponse.error}`);
    }
  } catch (error) {
    logger.error('Fallback test failed:', error);
  }
  
  // Test 5: Enterprise Analysis Test
  logger.info('\n🏢 Testing Enterprise Analysis...');
  const enterprisePrompt = `
  Analyze this backend issue and provide a solution:
  
  Issue: Database connection timeout errors occurring frequently
  Environment: Production Node.js application with MongoDB
  Symptoms: 500 errors, slow response times, connection pool exhaustion
  
  Provide a comprehensive analysis and solution.
  `;
  
  try {
    const enterpriseResponse = await aiManager.generateResponse(enterprisePrompt, {
      systemPrompt: 'You are an expert enterprise backend developer. Provide detailed, production-ready solutions with proper error handling and monitoring.',
      maxTokens: 1000,
      temperature: 0.3
    });
    
    if (enterpriseResponse.success) {
      logger.info(`✅ Enterprise Analysis Successful!`);
      logger.info(`  Provider: ${enterpriseResponse.provider}`);
      logger.info(`  Model: ${enterpriseResponse.model}`);
      logger.info(`  Analysis Length: ${enterpriseResponse.response.length} characters`);
      logger.info(`  Analysis Preview: ${enterpriseResponse.response.substring(0, 200)}...`);
    } else {
      logger.error(`❌ Enterprise Analysis Failed: ${enterpriseResponse.error}`);
    }
  } catch (error) {
    logger.error('Enterprise analysis test failed:', error);
  }
  
  // Test 6: Final Statistics
  logger.info('\n📊 Final Provider Statistics...');
  const finalStats = aiManager.getProviderStats();
  Object.entries(finalStats.providers).forEach(([name, provider]) => {
    logger.info(`  ${name}:`);
    logger.info(`    Available: ${provider.isAvailable ? '✅' : '❌'}`);
    logger.info(`    Usage Count: ${provider.usageCount}`);
    logger.info(`    Error Count: ${provider.errorCount}`);
    if (provider.lastUsed) {
      logger.info(`    Last Used: ${new Date(provider.lastUsed).toISOString()}`);
    }
  });
  
  logger.info('\n🎉 AI Provider Manager Test Complete!');
}

// Run the test
if (require.main === module) {
  testAIProviders().catch(error => {
    logger.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testAIProviders };
