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
    // Research-only mode configuration - NO AI PROVIDERS
    this.researchFirstMode = true; // Always use research first
    this.knowledgeBaseFirst = true; // Always check knowledge base first
    this.webSearchEnabled = true; // Enable web search for research
    this.maxAIApiUsage = 0; // ZERO AI API usage - research only
    this.aiProvidersDisabled = true; // Completely disable all AI providers
    
    // Fallback mode configuration
    this.fallbackMode = process.env.AI_FALLBACK_MODE === 'true' || true;
    this.gracefulDegradation = process.env.AI_GRACEFUL_DEGRADATION === 'true' || true;
    this.webSearchFallback = process.env.AI_WEB_SEARCH_FALLBACK === 'true' || true;
    
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

    // Clear any timeout-related environment variables that might cause issues
    delete process.env.OPENAI_TIMEOUT;
    delete process.env.ANTHROPIC_TIMEOUT;
    delete process.env.GEMINI_TIMEOUT;
    delete process.env.DEEPSEEK_TIMEOUT;
    delete process.env.GROK_TIMEOUT;
    delete process.env.AI_TIMEOUT;

    // Validate API keys on initialization
    this.validateApiKeys();

    // Initialize response cache for cost optimization
    this.responseCache = new AIResponseCache();

    this.providers = {
      openai: {
        name: 'OpenAI GPT-4',
        client: new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          timeout: undefined
        }),
        model: 'gpt-4o-mini',
        maxTokens: 4000,
        temperature: 0.3,
        priority: 1,
        isAvailable: true,
        lastError: null,
        errorCount: 0,
        maxErrors: 5,
        cooldownTime: 600000, // 10 minutes
        lastUsed: null,
        usageCount: 0,
        backoffDelay: 1000,
        maxBackoffDelay: 30000,
        backoffMultiplier: 2,
        lastRequestTime: 0
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
        maxErrors: 5,
        cooldownTime: 600000, // 10 minutes
        lastUsed: null,
        usageCount: 0,
        backoffDelay: 1000,
        maxBackoffDelay: 30000,
        backoffMultiplier: 2,
        lastRequestTime: 0
      },
      deepseek: {
        name: 'DeepSeek Chat',
        client: new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com/v1',
          timeout: undefined
        }),
        model: 'deepseek-chat',
        maxTokens: 4000,
        temperature: 0.3,
        priority: 3,
        isAvailable: true,
        lastError: null,
        errorCount: 0,
        maxErrors: 5,
        cooldownTime: 600000, // 10 minutes
        lastUsed: null,
        usageCount: 0,
        backoffDelay: 1000,
        maxBackoffDelay: 30000,
        backoffMultiplier: 2,
        lastRequestTime: 0
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
        maxErrors: 5,
        cooldownTime: 600000, // 10 minutes
        lastUsed: null,
        usageCount: 0,
        backoffDelay: 1000,
        maxBackoffDelay: 30000,
        backoffMultiplier: 2,
        lastRequestTime: 0
      },
      grok: {
        name: 'xAI Grok',
        client: new OpenAI({
          apiKey: process.env.GROK_API_KEY,
          baseURL: 'https://api.x.ai/v1',
          timeout: undefined
        }),
        model: 'grok-2-1212',
        maxTokens: 4000,
        temperature: 0.3,
        priority: 5,
        isAvailable: true,
        lastError: null,
        errorCount: 0,
        maxErrors: 5,
        cooldownTime: 600000, // 10 minutes
        lastUsed: null,
        usageCount: 0,
        backoffDelay: 1000,
        maxBackoffDelay: 30000,
        backoffMultiplier: 2,
        lastRequestTime: 0
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
   * Check if AI provider should be used based on usage limits
   */
  shouldUseAIProvider() {
    // Always return false - no AI providers should be used
    return false;
  }

  /**
   * Get current AI provider usage percentage
   */
  getCurrentUsagePercentage() {
    const totalRequests = this.getTotalRequests();
    const aiRequests = this.getAIRequests();
    return totalRequests > 0 ? aiRequests / totalRequests : 0;
  }

  /**
   * Get total requests count
   */
  getTotalRequests() {
    return Object.values(this.providers).reduce((sum, provider) => sum + provider.usageCount, 0);
  }

  /**
   * Get AI provider requests count
   */
  getAIRequests() {
    return Object.values(this.providers).reduce((sum, provider) => sum + provider.usageCount, 0);
  }

  /**
   * Try to find local solution using knowledge base and pattern matching
   */
  async tryLocalSolution(prompt, options = {}) {
    try {
      // Import required modules
      const AutonomousLearningAcademy = require('./autonomousLearningAcademy');
      const learningAcademy = new AutonomousLearningAcademy();

      // Try knowledge base search
      const knowledgeResult = await learningAcademy.searchKnowledgeBase(prompt);
      if (knowledgeResult && knowledgeResult.relevance > 0.7) {
        return {
          success: true,
          response: knowledgeResult.content,
          source: 'knowledge_base',
          confidence: knowledgeResult.relevance,
          method: 'local_research'
        };
      }

      // Try web search
      const webResults = await learningAcademy.searchWeb(prompt, options);
      if (webResults && webResults.length > 0) {
        return {
          success: true,
          response: this.synthesizeWebResults(webResults),
          source: 'web_search',
          confidence: 0.8,
          method: 'local_research'
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Local solution search failed:', error);
      return null;
    }
  }

  /**
   * Generate research-based fallback solution
   */
  async generateResearchFallback(prompt, options = {}) {
    try {
      const researchInsights = this.analyzePromptForResearch(prompt);
      
      return {
        success: true,
        response: {
          type: 'research_fallback',
          content: researchInsights,
          confidence: 0.5,
          source: 'research_analysis',
          recommendations: this.generateRecommendations(prompt)
        },
        source: 'research_fallback',
        confidence: 0.5,
        method: 'research_analysis'
      };
    } catch (error) {
      this.logger.error('Research fallback generation failed:', error);
      return {
        success: false,
        error: 'Research fallback failed',
        response: 'Unable to generate solution at this time'
      };
    }
  }

  /**
   * Analyze prompt for research insights
   */
  analyzePromptForResearch(prompt) {
    const insights = [];
    const promptLower = prompt.toLowerCase();

    // Error analysis
    if (promptLower.includes('error') || promptLower.includes('exception')) {
      insights.push('Error detected - recommend checking logs and documentation');
    }

    // Performance analysis
    if (promptLower.includes('performance') || promptLower.includes('slow')) {
      insights.push('Performance issue - recommend profiling and optimization');
    }

    // Security analysis
    if (promptLower.includes('security') || promptLower.includes('auth')) {
      insights.push('Security concern - recommend security audit and best practices');
    }

    // Database analysis
    if (promptLower.includes('database') || promptLower.includes('mongodb')) {
      insights.push('Database issue - recommend checking connections and queries');
    }

    return insights.length > 0 ? insights.join('; ') : 'General technical issue - recommend systematic troubleshooting';
  }

  /**
   * Generate recommendations based on prompt analysis
   */
  generateRecommendations(prompt) {
    const recommendations = [];
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('rate limit')) {
      recommendations.push('Implement exponential backoff');
      recommendations.push('Add request queuing');
      recommendations.push('Consider provider rotation');
    }

    if (promptLower.includes('timeout')) {
      recommendations.push('Increase timeout values');
      recommendations.push('Check network connectivity');
      recommendations.push('Optimize query performance');
    }

    if (promptLower.includes('memory') || promptLower.includes('leak')) {
      recommendations.push('Check for memory leaks');
      recommendations.push('Optimize data structures');
      recommendations.push('Implement garbage collection');
    }

    return recommendations.length > 0 ? recommendations : ['Review system logs', 'Check configuration', 'Verify dependencies'];
  }

  /**
   * Synthesize web search results
   */
  synthesizeWebResults(webResults) {
    if (!webResults || webResults.length === 0) {
      return 'No web search results available';
    }

    const topResults = webResults.slice(0, 3);
    const insights = topResults.map(result => result.title || result.content || 'Relevant information found').join('; ');
    
    return `Based on web research: ${insights}`;
  }

  /**
   * Research-first response generation with minimal AI provider usage
   */
  async generateResponse(prompt, options = {}) {
    try {
      this.logger.info('🔬 Research-only mode: Using research-based solution');
      
      // Always try local solutions first
      const localSolution = await this.tryLocalSolution(prompt, options);
      if (localSolution && localSolution.confidence > 0.6) {
        this.logger.info('✅ Using local research solution');
        return localSolution;
      }

      // Always use research fallback - no AI providers
      this.logger.info('🔬 Using research fallback (AI providers disabled)');
      return await this.generateResearchFallback(prompt, options);

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
    
    // Implement exponential backoff
    const currentTime = Date.now();
    const timeSinceLastRequest = currentTime - provider.lastRequestTime;
    
    if (timeSinceLastRequest < provider.backoffDelay) {
      const waitTime = provider.backoffDelay - timeSinceLastRequest;
      this.logger.info(`⏳ Waiting ${waitTime}ms before retrying ${provider.name} (exponential backoff)`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Update last request time
    provider.lastRequestTime = Date.now();
    
    try {
      let result;
      switch (providerName) {
        case 'openai':
          result = await this.callOpenAI(provider, prompt, options);
          break;
        case 'gemini':
          result = await this.callGemini(provider, prompt, options);
          break;
        case 'deepseek':
          result = await this.callDeepSeek(provider, prompt, options);
          break;
        case 'anthropic':
          result = await this.callAnthropic(provider, prompt, options);
          break;
        case 'grok':
          result = await this.callGrok(provider, prompt, options);
          break;
        default:
          throw new Error(`Unknown provider: ${providerName}`);
      }
      
      // Reset backoff delay on successful request
      provider.backoffDelay = 1000;
      return result;
      
    } catch (error) {
      // Increase backoff delay for next request
      provider.backoffDelay = Math.min(
        provider.backoffDelay * provider.backoffMultiplier,
        provider.maxBackoffDelay
      );
      
      this.logger.warn(`⚠️ ${provider.name} failed, increasing backoff delay to ${provider.backoffDelay}ms`);
      throw error;
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

  /**
   * Reset circuit breaker for a specific provider
   */
  resetCircuitBreaker(providerName) {
    const provider = this.providers[providerName];
    if (provider) {
      provider.isAvailable = true;
      provider.errorCount = 0;
      provider.lastError = null;
      provider.backoffDelay = 1000;
      this.logger.info(`🔄 Circuit breaker reset for ${provider.name}`);
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers() {
    Object.keys(this.providers).forEach(providerName => {
      this.resetCircuitBreaker(providerName);
    });
    this.logger.info('🔄 All AI provider circuit breakers reset');
  }

  /**
   * Determine if AI API should be used based on research-first approach
   */
  shouldUseAIAPI(problem, context = {}) {
    // Always try research first
    if (this.researchFirstMode) {
      // Check if problem can be solved with knowledge base
      if (this.knowledgeBaseFirst && this.canSolveWithKnowledgeBase(problem)) {
        return false;
      }
      
      // Check if problem can be solved with web search
      if (this.webSearchEnabled && this.canSolveWithWebSearch(problem)) {
        return false;
      }
    }
    
    // Only use AI API for complex problems that can't be solved with research
    return this.isComplexProblem(problem);
  }

  canSolveWithKnowledgeBase(problem) {
    // Check if problem is in knowledge base
    const knowledgeBaseTerms = [
      'node.js', 'express', 'mongodb', 'authentication', 'jwt', 'api', 'rest',
      'error handling', 'middleware', 'routing', 'security', 'deployment'
    ];
    
    return knowledgeBaseTerms.some(term => 
      problem.toLowerCase().includes(term)
    );
  }

  canSolveWithWebSearch(problem) {
    // Most problems can be solved with web search
    return true;
  }

  isComplexProblem(problem) {
    // Only use AI API for very complex problems
    const complexTerms = [
      'machine learning', 'ai', 'neural network', 'deep learning',
      'complex algorithm', 'advanced optimization'
    ];
    
    return complexTerms.some(term => 
      problem.toLowerCase().includes(term)
    );
  }
}

module.exports = AIProviderManager;
