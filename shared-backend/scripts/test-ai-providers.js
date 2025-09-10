#!/usr/bin/env node

/**
 * AI Providers Test Script
 * Tests all configured AI providers to ensure they're working correctly
 */

require('dotenv').config();
const axios = require('axios');

const AI_PROVIDERS = [
  {
    name: 'OpenAI',
    key: 'OPENAI_API_KEY',
    testUrl: 'https://api.openai.com/v1/models',
    headers: (apiKey) => ({ 'Authorization': `Bearer ${apiKey}` })
  },
  {
    name: 'Google Gemini',
    key: 'GEMINI_API_KEY',
    testUrl: 'https://generativelanguage.googleapis.com/v1/models',
    headers: (apiKey) => ({ 'X-Goog-Api-Key': apiKey })
  },
  {
    name: 'DeepSeek',
    key: 'DEEPSEEK_API_KEY',
    testUrl: 'https://api.deepseek.com/v1/models',
    headers: (apiKey) => ({ 'Authorization': `Bearer ${apiKey}` })
  },
  {
    name: 'Anthropic Claude',
    key: 'ANTHROPIC_API_KEY',
    testUrl: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({ 'x-api-key': apiKey, 'Content-Type': 'application/json' }),
    testData: {
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }]
    }
  },
  {
    name: 'Grok (X.AI)',
    key: 'GROK_API_KEY',
    testUrl: 'https://api.x.ai/v1/models',
    headers: (apiKey) => ({ 'Authorization': `Bearer ${apiKey}` })
  }
];

async function testAIProvider(provider) {
  const apiKey = process.env[provider.key];
  
  if (!apiKey || apiKey.includes('your_') || apiKey.includes('test_')) {
    return {
      name: provider.name,
      status: 'not_configured',
      message: 'API key not configured or using placeholder value'
    };
  }

  try {
    const config = {
      method: 'GET',
      url: provider.testUrl,
      headers: provider.headers(apiKey),
      timeout: 10000
    };

    // For Anthropic, we need to use POST with test data
    if (provider.name === 'Anthropic Claude') {
      config.method = 'POST';
      config.data = provider.testData;
    }

    const response = await axios(config);
    
    return {
      name: provider.name,
      status: 'working',
      message: 'API key is valid and working',
      details: `Status: ${response.status}, Models available: ${response.data?.data?.length || 'N/A'}`
    };
  } catch (error) {
    let status = 'error';
    let message = 'API key test failed';
    
    if (error.response) {
      const statusCode = error.response.status;
      if (statusCode === 401) {
        status = 'invalid_key';
        message = 'Invalid API key';
      } else if (statusCode === 429) {
        status = 'rate_limited';
        message = 'Rate limited - API key is valid but quota exceeded';
      } else if (statusCode === 403) {
        status = 'forbidden';
        message = 'API key valid but access forbidden';
      } else {
        message = `HTTP ${statusCode}: ${error.response.data?.error?.message || error.message}`;
      }
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      status = 'network_error';
      message = 'Network error - check internet connection';
    } else if (error.code === 'ECONNABORTED') {
      status = 'timeout';
      message = 'Request timeout';
    }

    return {
      name: provider.name,
      status,
      message,
      error: error.message
    };
  }
}

async function testAllAIProviders() {
  console.log('🧪 Testing AI Providers Configuration');
  console.log('=====================================\n');

  const results = [];
  
  for (const provider of AI_PROVIDERS) {
    console.log(`Testing ${provider.name}...`);
    const result = await testAIProvider(provider);
    results.push(result);
    
    // Display result
    const statusIcon = {
      'working': '✅',
      'not_configured': '⚠️ ',
      'invalid_key': '❌',
      'rate_limited': '⏳',
      'forbidden': '🚫',
      'network_error': '🌐',
      'timeout': '⏰',
      'error': '❌'
    }[result.status] || '❓';
    
    console.log(`${statusIcon} ${result.name}: ${result.message}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');
  }

  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  
  const working = results.filter(r => r.status === 'working').length;
  const configured = results.filter(r => r.status !== 'not_configured').length;
  const total = results.length;

  console.log(`✅ Working: ${working}/${total}`);
  console.log(`🔧 Configured: ${configured}/${total}`);
  console.log(`⚠️  Not configured: ${total - configured}/${total}`);

  if (working === 0) {
    console.log('\n❌ No AI providers are working! The autonomous backend system will not function properly.');
    console.log('📝 Please run: npm run setup-ai-keys to configure your API keys.');
  } else if (working < total) {
    console.log('\n⚠️  Some AI providers are not working. The system will use fallback mechanisms.');
  } else {
    console.log('\n🎉 All AI providers are working correctly!');
  }

  return results;
}

// Run tests if called directly
if (require.main === module) {
  testAllAIProviders().catch(console.error);
}

module.exports = { testAllAIProviders, testAIProvider };