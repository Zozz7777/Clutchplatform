#!/usr/bin/env node

/**
 * Test AI Provider Manager
 * Debug script to test the AI provider manager functionality
 */

require('dotenv').config();
const AIProviderManager = require('../services/aiProviderManager');

async function testAIProviderManager() {
  console.log('🧪 Testing AI Provider Manager');
  console.log('================================\n');

  try {
    // Initialize AI Provider Manager
    console.log('🔧 Initializing AI Provider Manager...');
    const aiManager = new AIProviderManager();
    
    // Check provider availability
    console.log('\n📊 Provider Availability:');
    const providers = ['openai', 'gemini', 'deepseek', 'anthropic', 'grok'];
    
    for (const providerName of providers) {
      const isAvailable = aiManager.isProviderAvailable(providerName);
      const hasValidKey = aiManager.hasValidApiKey(providerName);
      const provider = aiManager.providers[providerName];
      
      console.log(`  ${providerName}:`);
      console.log(`    Available: ${isAvailable ? '✅' : '❌'}`);
      console.log(`    Valid API Key: ${hasValidKey ? '✅' : '❌'}`);
      console.log(`    Is Available Flag: ${provider.isAvailable ? '✅' : '❌'}`);
      console.log(`    Error Count: ${provider.errorCount}`);
      console.log(`    Last Error: ${provider.lastError ? new Date(provider.lastError).toISOString() : 'None'}`);
      console.log('');
    }
    
    // Test getBestProvider
    console.log('🎯 Testing getBestProvider:');
    const bestProvider = aiManager.getBestProvider();
    console.log(`  Best Provider: ${bestProvider}`);
    
    // Test fallback chain
    console.log('\n🔄 Fallback Chain:');
    console.log(`  Chain: ${aiManager.fallbackChain.join(' -> ')}`);
    console.log(`  Current Provider: ${aiManager.currentProvider}`);
    
    // Test a simple AI request
    console.log('\n🤖 Testing AI Request:');
    const testPrompt = "Hello, this is a test. Please respond with 'Test successful'.";
    
    const response = await aiManager.generateResponse(testPrompt, {
      maxTokens: 50,
      temperature: 0.1
    });
    
    if (response.success) {
      console.log('✅ AI Request Successful:');
      console.log(`  Provider: ${response.provider}`);
      console.log(`  Model: ${response.model}`);
      console.log(`  Response: ${response.response.substring(0, 100)}...`);
    } else {
      console.log('❌ AI Request Failed:');
      console.log(`  Error: ${response.error}`);
      console.log(`  Last Error: ${response.lastError}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testAIProviderManager().catch(console.error);
}

module.exports = { testAIProviderManager };
