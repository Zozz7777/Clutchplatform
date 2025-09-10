/**
 * AI Provider Manager
 * Manages multiple AI providers with automatic fallback and load balancing
 */

const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Anthropic = require('@anthropic-ai/sdk');
const winston = require('winston');
const AIResponseCache = require('./aiResponseCache');

class AIProviderManager {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/ai-provider-manager.log' }),
        new winston.transports.Console()
      ]
    });

    // Validate API keys on initialization
    this.validateApiKeys();

    // Initialize response cache for cost optimization
    this.responseCache = new AIResponseCache();

    this.providers = {
      openai: {
        name: 'OpenAI GPT-4',
        client: new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        }),
        model: 'gpt-4o-mini',
        maxTokens: 4000,
        temperature: 0.3,
        priority: 1,
        isAvailable: true,
        lastError: null,
        errorCount: 0,
        maxErrors: 3,
        cooldownTime: 300000, // 5 minutes
        lastUsed: null,
        usageCount: 0
      },
      gemini: {
        name: 'Google Gemini Pro',
        client: new GoogleGenerativeAI(process.env.GEMINI_API_KEY),
        model: 'gemini-1.5-flash',
        maxTokens: 4000,
        temperature: 0.3,
        priority: 2,
        isAvailable: true,
        lastError: null,
        errorCount: 0,
        maxErrors: 3,
        cooldownTime: 300000, // 5 minutes
        lastUsed: null,
        usageCount: 0
      },
      deepseek: {
        name: 'DeepSeek Chat',
        client: new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com/v1'
        }),
        model: 'deepseek-chat',
        maxTokens: 4000,
        temperature: 0.3,
        priority: 3,
        isAvailable: true,
        lastError: null,
        errorCount: 0,
        maxErrors: 3,
        cooldownTime: 300000, // 5 minutes
        lastUsed: null,
        usageCount: 0
      },
      anthropic: {
        name: 'Anthropic Claude',
        client: new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        }),
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4000,
        temperature: 0.3,
        priority: 4,
        isAvailable: true,
        lastError: null,
        errorCount: 0,
        maxErrors: 3,
        cooldownTime: 300000, // 5 minutes
        lastUsed: null,
        usageCount: 0
      },
      grok: {
        name: 'xAI Grok',
        client: new OpenAI({
          apiKey: process.env.GROK_API_KEY,
          baseURL: 'https://api.x.ai/v1'
        }),
        model: 'grok-2-1212',
        maxTokens: 4000,
        temperature: 0.3,
        priority: 5,
        isAvailable: true,
        lastError: null,
        errorCount: 0,
        maxErrors: 3,
        cooldownTime: 300000, // 5 minutes
        lastUsed: null,
        usageCount: 0
      }
    };

    this.currentProvider = 'openai';
    this.fallbackChain = ['openai', 'gemini', 'deepseek', 'anthropic', 'grok'];
    this.rateLimitInfo = {
      openai: { requestsPerMinute: 60, tokensPerMinute: 150000 },
      gemini: { requestsPerMinute: 60, tokensPerMinute: 32000 },
      deepseek: { requestsPerMinute: 60, tokensPerMinute: 200000 },
      anthropic: { requestsPerMinute: 50, tokensPerMinute: 40000 },
      grok: { requestsPerMinute: 60, tokensPerMinute: 100000 }
    };
  }

  /**
   * Validate API keys on initialization
   */
  validateApiKeys() {
    const requiredKeys = [
      'OPENAI_API_KEY',
      'GEMINI_API_KEY', 
      'DEEPSEEK_API_KEY',
      'ANTHROPIC_API_KEY',
      'GROK_API_KEY'
    ];

    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
      this.logger.warn(`⚠️ Missing API keys: ${missingKeys.join(', ')}`);
      this.logger.warn('Some AI providers will be unavailable until keys are configured');
    } else {
      this.logger.info('✅ All API keys are configured');
    }
  }

  /**
   * Check if provider has valid API key
   */
  hasValidApiKey(providerName) {
    const keyMap = {
      openai: 'OPENAI_API_KEY',
      gemini: 'GEMINI_API_KEY',
      deepseek: 'DEEPSEEK_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      grok: 'GROK_API_KEY'
    };

    const keyName = keyMap[providerName];
    return keyName && process.env[keyName] && process.env[keyName].trim().length > 0;
  }

  /**
   * Get the best available provider
   */
  getBestProvider() {
    // Check if current provider is available
    if (this.isProviderAvailable(this.currentProvider)) {
      return this.currentProvider;
    }

    // Find next available provider in fallback chain
    for (const providerName of this.fallbackChain) {
      if (this.isProviderAvailable(providerName)) {
        this.currentProvider = providerName;
        this.logger.info(`🔄 Switched to provider: ${providerName}`);
        return providerName;
      }
    }

    // If no provider is available, try to reset and use primary
    this.resetProviderErrors();
    return this.currentProvider;
  }

  /**
   * Check if provider is available
   */
  isProviderAvailable(providerName) {
    const provider = this.providers[providerName];
    if (!provider) return false;

    // Check if provider has valid API key
    if (!this.hasValidApiKey(providerName)) {
      return false;
    }

    // Check if provider is marked as unavailable
    if (!provider.isAvailable) {
      // Check if cooldown period has passed
      if (provider.lastError && Date.now() - provider.lastError < provider.cooldownTime) {
        return false;
      }
      // Reset availability after cooldown
      provider.isAvailable = true;
      provider.errorCount = 0;
    }

    return true;
  }

  /**
   * Generate AI response with automatic fallback and caching
   */
  async generateResponse(prompt, options = {}) {
    try {
      // Filter out any timeout parameter that might cause issues with AI providers
      const cleanOptions = { ...options };
      delete cleanOptions.timeout;
      
      // Check cache first
      const cachedResponse = await this.responseCache.get(prompt, cleanOptions);
      if (cachedResponse) {
        this.logger.info('💾 Using cached AI response');
        return {
          success: true,
          response: cachedResponse,
          provider: 'cache',
          model: 'cached',
          cached: true,
          timestamp: new Date()
        };
      }

      const maxRetries = this.fallbackChain.length;
      let lastError = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const providerName = this.getBestProvider();
        const provider = this.providers[providerName];

        try {
          this.logger.info(`🤖 Using ${provider.name} for AI request (attempt ${attempt + 1})`);
          
          const response = await this.callProvider(providerName, prompt, cleanOptions);
          
          // Update usage statistics
          provider.lastUsed = Date.now();
          provider.usageCount++;
          
          // Cache the response for future use
          await this.responseCache.set(prompt, response, cleanOptions);
          
          this.logger.info(`✅ Successfully got response from ${provider.name}`);
          return {
            success: true,
            response: response,
            provider: providerName,
            model: provider.model,
            cached: false,
            timestamp: new Date()
          };

        } catch (error) {
          lastError = error;
          this.logger.error(`❌ ${provider.name} failed:`, error.message);
          
          // Mark provider as unavailable if it's a rate limit or quota error
          if (this.isRateLimitError(error) || this.isQuotaError(error)) {
            this.markProviderUnavailable(providerName, error);
          }
          
          // Try next provider
          this.currentProvider = this.getNextProvider();
        }
      }

      // All providers failed
      this.logger.error('❌ All AI providers failed');
      return {
        success: false,
        error: 'All AI providers are unavailable',
        lastError: lastError?.message,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('❌ AI response generation failed:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Call specific provider
   */
  async callProvider(providerName, prompt, options = {}) {
    const provider = this.providers[providerName];
    
    switch (providerName) {
      case 'openai':
        return await this.callOpenAI(provider, prompt, options);
      case 'gemini':
        return await this.callGemini(provider, prompt, options);
      case 'deepseek':
        return await this.callDeepSeek(provider, prompt, options);
      case 'anthropic':
        return await this.callAnthropic(provider, prompt, options);
      case 'grok':
        return await this.callGrok(provider, prompt, options);
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  /**
   * Call OpenAI API with comprehensive error handling
   */
  async callOpenAI(provider, prompt, options) {
    try {
      if (!provider.client) {
        throw new Error('OpenAI client not initialized');
      }

      const response = await provider.client.chat.completions.create({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: options.systemPrompt || 'You are an expert enterprise backend developer. Provide comprehensive, production-ready solutions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || provider.maxTokens,
        temperature: options.temperature || provider.temperature
      });

      if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
        throw new Error('Invalid response format from OpenAI');
      }

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error('OpenAI API call failed:', {
        error: error.message,
        code: error.code,
        status: error.status,
        type: error.type
      });
      throw error;
    }
  }

  /**
   * Call Gemini API with comprehensive error handling
   */
  async callGemini(provider, prompt, options) {
    try {
      if (!provider.client) {
        throw new Error('Gemini client not initialized');
      }

      const model = provider.client.getGenerativeModel({ 
        model: provider.model,
        generationConfig: {
          maxOutputTokens: options.maxTokens || provider.maxTokens,
          temperature: options.temperature || provider.temperature
        }
      });

      const systemPrompt = options.systemPrompt || 'You are an expert enterprise backend developer. Provide comprehensive, production-ready solutions.';
      const fullPrompt = `${systemPrompt}\n\n${prompt}`;

      const result = await model.generateContent(fullPrompt);
      
      if (!result || !result.response) {
        throw new Error('Invalid response format from Gemini');
      }

      const response = await result.response;
      
      if (!response.text) {
        throw new Error('No text content in Gemini response');
      }
      
      return response.text();
    } catch (error) {
      this.logger.error('Gemini API call failed:', {
        error: error.message,
        code: error.code,
        status: error.status
      });
      throw error;
    }
  }

  /**
   * Call DeepSeek API
   */
  async callDeepSeek(provider, prompt, options) {
    const response = await provider.client.chat.completions.create({
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || 'You are an expert enterprise backend developer. Provide comprehensive, production-ready solutions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || provider.maxTokens,
      temperature: options.temperature || provider.temperature
    });

    return response.choices[0].message.content;
  }

  /**
   * Call Anthropic API
   */
  async callAnthropic(provider, prompt, options) {
    const systemPrompt = options.systemPrompt || 'You are an expert enterprise backend developer. Provide comprehensive, production-ready solutions.';
    
    const response = await provider.client.messages.create({
      model: provider.model,
      max_tokens: options.maxTokens || provider.maxTokens,
      temperature: options.temperature || provider.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text;
  }

  /**
   * Call Grok API
   */
  async callGrok(provider, prompt, options) {
    const response = await provider.client.chat.completions.create({
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || 'You are an expert enterprise backend developer. Provide comprehensive, production-ready solutions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || provider.maxTokens,
      temperature: options.temperature || provider.temperature
    });

    return response.choices[0].message.content;
  }

  /**
   * Check if error is rate limit related
   */
  isRateLimitError(error) {
    const rateLimitIndicators = [
      'rate limit',
      'too many requests',
      'quota exceeded',
      'requests per minute',
      '429'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return rateLimitIndicators.some(indicator => errorMessage.includes(indicator));
  }

  /**
   * Check if error is quota related
   */
  isQuotaError(error) {
    const quotaIndicators = [
      'quota',
      'billing',
      'credit',
      'usage limit',
      'insufficient funds'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return quotaIndicators.some(indicator => errorMessage.includes(indicator));
  }

  /**
   * Mark provider as unavailable
   */
  markProviderUnavailable(providerName, error) {
    const provider = this.providers[providerName];
    provider.isAvailable = false;
    provider.lastError = Date.now();
    provider.errorCount++;
    
    this.logger.warn(`⚠️ Marked ${provider.name} as unavailable (error ${provider.errorCount}/${provider.maxErrors})`);
    
    // If too many errors, extend cooldown
    if (provider.errorCount >= provider.maxErrors) {
      provider.cooldownTime = Math.min(provider.cooldownTime * 2, 1800000); // Max 30 minutes
      this.logger.warn(`⏰ Extended cooldown for ${provider.name} to ${provider.cooldownTime}ms`);
    }
  }

  /**
   * Get next provider in fallback chain
   */
  getNextProvider() {
    const currentIndex = this.fallbackChain.indexOf(this.currentProvider);
    const nextIndex = (currentIndex + 1) % this.fallbackChain.length;
    return this.fallbackChain[nextIndex];
  }

  /**
   * Reset provider errors
   */
  resetProviderErrors() {
    Object.values(this.providers).forEach(provider => {
      provider.isAvailable = true;
      provider.errorCount = 0;
      provider.lastError = null;
    });
    this.logger.info('🔄 Reset all provider error states');
  }

  /**
   * Get provider statistics
   */
  getProviderStats() {
    const stats = {};
    
    Object.entries(this.providers).forEach(([name, provider]) => {
      stats[name] = {
        name: provider.name,
        isAvailable: this.isProviderAvailable(name),
        hasValidApiKey: this.hasValidApiKey(name),
        errorCount: provider.errorCount,
        usageCount: provider.usageCount,
        lastUsed: provider.lastUsed,
        lastError: provider.lastError,
        cooldownTime: provider.cooldownTime
      };
    });

    return {
      currentProvider: this.currentProvider,
      providers: stats,
      fallbackChain: this.fallbackChain,
      cacheStats: this.responseCache.getStats(),
      costSavings: this.responseCache.estimateCostSavings()
    };
  }

  /**
   * Health check for all providers
   */
  async healthCheck() {
    const results = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        const testPrompt = "Respond with 'OK' if you can process this request.";
        const response = await this.callProvider(name, testPrompt, { maxTokens: 10 });
        
        results[name] = {
          status: 'healthy',
          response: response.substring(0, 50),
          timestamp: new Date()
        };
        
        // Reset error count on successful health check
        provider.errorCount = 0;
        provider.isAvailable = true;
        
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date()
        };
        
        this.markProviderUnavailable(name, error);
      }
    }
    
    return results;
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(providerName, config) {
    if (this.providers[providerName]) {
      Object.assign(this.providers[providerName], config);
      this.logger.info(`🔧 Updated configuration for ${providerName}`);
    }
  }

  /**
   * Add new provider
   */
  addProvider(name, config) {
    this.providers[name] = {
      ...config,
      isAvailable: true,
      lastError: null,
      errorCount: 0,
      maxErrors: 3,
      cooldownTime: 300000,
      lastUsed: null,
      usageCount: 0
    };
    
    this.fallbackChain.push(name);
    this.logger.info(`➕ Added new AI provider: ${name}`);
  }
}

module.exports = AIProviderManager;
