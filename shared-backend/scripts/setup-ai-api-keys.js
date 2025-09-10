#!/usr/bin/env node

/**
 * AI API Keys Setup Script
 * This script helps configure AI API keys for the autonomous backend system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupAIAPIKeys() {
  console.log('🔑 AI API Keys Setup for Clutch Backend');
  console.log('=====================================\n');

  const envPath = path.join(__dirname, '..', '.env');
  const renderYamlPath = path.join(__dirname, '..', 'render.yaml');

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Creating from .env.example...');
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created from .env.example');
    } else {
      console.log('❌ .env.example file not found. Please create .env file manually.');
      return;
    }
  }

  // Read current .env content
  let envContent = fs.readFileSync(envPath, 'utf8');

  // AI API Keys configuration
  const aiProviders = [
    {
      name: 'OpenAI',
      key: 'OPENAI_API_KEY',
      description: 'OpenAI API key for GPT models',
      required: true,
      placeholder: 'sk-your-openai-api-key-here'
    },
    {
      name: 'Google Gemini',
      key: 'GEMINI_API_KEY',
      description: 'Google Gemini API key for Gemini models',
      required: true,
      placeholder: 'your-gemini-api-key-here'
    },
    {
      name: 'DeepSeek',
      key: 'DEEPSEEK_API_KEY',
      description: 'DeepSeek API key for DeepSeek models',
      required: true,
      placeholder: 'sk-your-deepseek-api-key-here'
    },
    {
      name: 'Anthropic Claude',
      key: 'ANTHROPIC_API_KEY',
      description: 'Anthropic API key for Claude models',
      required: true,
      placeholder: 'sk-ant-your-anthropic-api-key-here'
    },
    {
      name: 'Grok (X.AI)',
      key: 'GROK_API_KEY',
      description: 'Grok API key for Grok models',
      required: true,
      placeholder: 'your-grok-api-key-here'
    }
  ];

  console.log('📝 Please provide your AI API keys. You can skip any key by pressing Enter.\n');

  for (const provider of aiProviders) {
    const currentValue = getEnvValue(envContent, provider.key);
    
    if (currentValue && currentValue !== provider.placeholder) {
      console.log(`✅ ${provider.name} API key already configured`);
      continue;
    }

    const apiKey = await question(
      `🔑 Enter ${provider.name} API key (${provider.description}): `
    );

    if (apiKey.trim()) {
      envContent = setEnvValue(envContent, provider.key, apiKey.trim());
      console.log(`✅ ${provider.name} API key configured`);
    } else {
      console.log(`⚠️  Skipped ${provider.name} API key`);
    }
  }

  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env file updated with AI API keys');

  // Update render.yaml with environment variables
  console.log('\n📝 Updating render.yaml configuration...');
  updateRenderYaml(renderYamlPath);

  console.log('\n🎉 AI API Keys setup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Add the API keys to your Render dashboard environment variables');
  console.log('2. Restart your backend service');
  console.log('3. Run: npm run test-ai-providers to verify the configuration');

  rl.close();
}

function getEnvValue(content, key) {
  const regex = new RegExp(`^${key}=(.+)$`, 'm');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function setEnvValue(content, key, value) {
  const regex = new RegExp(`^${key}=.+$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}

function updateRenderYaml(renderYamlPath) {
  if (!fs.existsSync(renderYamlPath)) {
    console.log('⚠️  render.yaml not found, skipping update');
    return;
  }

  let renderContent = fs.readFileSync(renderYamlPath, 'utf8');
  
  // Add AI API keys to render.yaml if not already present
  const aiKeys = [
    'OPENAI_API_KEY',
    'GEMINI_API_KEY', 
    'DEEPSEEK_API_KEY',
    'ANTHROPIC_API_KEY',
    'GROK_API_KEY'
  ];

  for (const key of aiKeys) {
    if (!renderContent.includes(key)) {
      const keyEntry = `      - key: ${key}\n        value: your_${key.toLowerCase()}_here`;
      renderContent = renderContent.replace(
        /(envVars:)/,
        `$1\n${keyEntry}`
      );
    }
  }

  fs.writeFileSync(renderYamlPath, renderContent);
  console.log('✅ render.yaml updated with AI API key placeholders');
}

// Run the setup
if (require.main === module) {
  setupAIAPIKeys().catch(console.error);
}

module.exports = { setupAIAPIKeys };
