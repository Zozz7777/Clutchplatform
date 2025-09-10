#!/usr/bin/env node

/**
 * Fix Missing API Keys Script
 * Comprehensive solution for missing AI API keys that prevent the autonomous backend from working
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function fixMissingAPIKeys() {
  console.log('🔧 Fixing Missing AI API Keys Issue');
  console.log('===================================\n');

  const issues = [];
  const solutions = [];

  // Check current environment
  const requiredKeys = [
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
    'DEEPSEEK_API_KEY',
    'ANTHROPIC_API_KEY',
    'GROK_API_KEY'
  ];

  console.log('🔍 Checking current API key configuration...\n');

  for (const key of requiredKeys) {
    const value = process.env[key];
    
    if (!value) {
      issues.push(`Missing ${key}`);
      console.log(`❌ ${key}: Not set`);
    } else if (value.includes('your_') || value.includes('test_') || value.includes('placeholder')) {
      issues.push(`${key} has placeholder value`);
      console.log(`⚠️  ${key}: Placeholder value detected`);
    } else {
      console.log(`✅ ${key}: Configured`);
    }
  }

  if (issues.length === 0) {
    console.log('\n🎉 All AI API keys are properly configured!');
    return;
  }

  console.log(`\n📊 Found ${issues.length} issues with AI API keys:`);
  issues.forEach(issue => console.log(`   - ${issue}`));

  // Generate solutions
  console.log('\n🛠️  Solutions:');
  console.log('=============');

  // Solution 1: Environment file setup
  solutions.push({
    title: '1. Configure API Keys in .env file',
    description: 'Add your actual API keys to the .env file',
    action: 'Run: npm run setup-ai-keys',
    priority: 'high'
  });

  // Solution 2: Render environment variables
  solutions.push({
    title: '2. Add API Keys to Render Dashboard',
    description: 'Configure environment variables in Render dashboard',
    action: 'Go to Render Dashboard > Your Service > Environment > Add Variables',
    priority: 'high'
  });

  // Solution 3: Fallback configuration
  solutions.push({
    title: '3. Enable Fallback Mode',
    description: 'Configure the system to work with limited AI providers',
    action: 'Update AI provider manager configuration',
    priority: 'medium'
  });

  // Solution 4: Mock mode for development
  solutions.push({
    title: '4. Enable Development Mode',
    description: 'Use mock responses for development/testing',
    action: 'Set NODE_ENV=development and enable mock mode',
    priority: 'low'
  });

  solutions.forEach((solution, index) => {
    const priorityIcon = {
      'high': '🔴',
      'medium': '🟡',
      'low': '🟢'
    }[solution.priority] || '⚪';
    
    console.log(`\n${priorityIcon} ${solution.title}`);
    console.log(`   Description: ${solution.description}`);
    console.log(`   Action: ${solution.action}`);
  });

  // Create fallback configuration
  console.log('\n🔧 Creating fallback configuration...');
  createFallbackConfiguration();

  // Update AI provider manager for graceful degradation
  console.log('🔧 Updating AI provider manager for graceful degradation...');
  updateAIProviderManagerForFallback();

  // Create development mode configuration
  console.log('🔧 Creating development mode configuration...');
  createDevelopmentModeConfig();

  console.log('\n📋 Immediate Actions Required:');
  console.log('==============================');
  console.log('1. Run: npm run setup-ai-keys');
  console.log('2. Add API keys to Render dashboard environment variables');
  console.log('3. Restart your backend service');
  console.log('4. Run: npm run test-ai-providers to verify');

  console.log('\n🎯 The autonomous backend system will now:');
  console.log('- Use available AI providers');
  console.log('- Fall back to web search when AI APIs are unavailable');
  console.log('- Use mock responses in development mode');
  console.log('- Continue operating with reduced functionality');

  return { issues, solutions };
}

function createFallbackConfiguration() {
  const fallbackConfig = {
    aiProviders: {
      fallbackMode: true,
      gracefulDegradation: true,
      webSearchFallback: true,
      mockMode: process.env.NODE_ENV === 'development',
      retryAttempts: 3,
      retryDelay: 5000,
      circuitBreakerThreshold: 10,
      circuitBreakerTimeout: 300000 // 5 minutes
    },
    autonomousSystem: {
      continueWithoutAI: true,
      useWebSearch: true,
      useKnowledgeBase: true,
      reducedFunctionality: true
    }
  };

  const configPath = path.join(__dirname, '..', 'config', 'fallback-config.json');
  const configDir = path.dirname(configPath);
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(fallbackConfig, null, 2));
  console.log('✅ Fallback configuration created');
}

function updateAIProviderManagerForFallback() {
  const aiProviderManagerPath = path.join(__dirname, '..', 'services', 'aiProviderManager.js');
  
  if (!fs.existsSync(aiProviderManagerPath)) {
    console.log('⚠️  AI Provider Manager not found, skipping update');
    return;
  }

  let content = fs.readFileSync(aiProviderManagerPath, 'utf8');
  
  // Add fallback mode configuration if not present
  if (!content.includes('fallbackMode')) {
    const fallbackConfig = `
    // Fallback mode configuration
    this.fallbackMode = process.env.AI_FALLBACK_MODE === 'true' || true;
    this.gracefulDegradation = process.env.AI_GRACEFUL_DEGRADATION === 'true' || true;
    this.webSearchFallback = process.env.AI_WEB_SEARCH_FALLBACK === 'true' || true;
    `;
    
    content = content.replace(
      /(constructor\(\)\s*{)/,
      `$1${fallbackConfig}`
    );
  }

  fs.writeFileSync(aiProviderManagerPath, content);
  console.log('✅ AI Provider Manager updated for fallback mode');
}

function createDevelopmentModeConfig() {
  const devConfig = {
    development: {
      mockAIResponses: true,
      useWebSearch: true,
      useKnowledgeBase: true,
      skipAPIValidation: true,
      reducedLogging: false
    },
    production: {
      mockAIResponses: false,
      useWebSearch: true,
      useKnowledgeBase: true,
      skipAPIValidation: false,
      reducedLogging: true
    }
  };

  const configPath = path.join(__dirname, '..', 'config', 'development-config.json');
  const configDir = path.dirname(configPath);
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(devConfig, null, 2));
  console.log('✅ Development mode configuration created');
}

// Run the fix
if (require.main === module) {
  fixMissingAPIKeys().catch(console.error);
}

module.exports = { fixMissingAPIKeys };
