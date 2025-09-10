#!/usr/bin/env node

/**
 * Fix Research-First Approach Script
 * Comprehensive solution to ensure the AI team uses research-first approach instead of API-first
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function fixResearchFirstApproach() {
  console.log('🔧 Fixing Research-First Approach');
  console.log('=================================\n');

  const fixes = [];
  const results = [];

  // Fix 1: Ensure knowledge base is properly loaded
  console.log('1️⃣ Ensuring knowledge base is properly loaded...');
  const knowledgeBaseFix = await ensureKnowledgeBaseLoaded();
  fixes.push(knowledgeBaseFix);
  results.push(knowledgeBaseFix);

  // Fix 2: Configure web search service
  console.log('\n2️⃣ Configuring web search service...');
  const webSearchFix = await configureWebSearchService();
  fixes.push(webSearchFix);
  results.push(webSearchFix);

  // Fix 3: Update AI provider manager for research-first
  console.log('\n3️⃣ Updating AI provider manager for research-first approach...');
  const aiProviderFix = await updateAIProviderManagerForResearchFirst();
  fixes.push(aiProviderFix);
  results.push(aiProviderFix);

  // Fix 4: Create research-first configuration
  console.log('\n4️⃣ Creating research-first configuration...');
  const configFix = await createResearchFirstConfiguration();
  fixes.push(configFix);
  results.push(configFix);

  // Fix 5: Update autonomous learning academy
  console.log('\n5️⃣ Updating autonomous learning academy...');
  const academyFix = await updateAutonomousLearningAcademy();
  fixes.push(academyFix);
  results.push(academyFix);

  // Fix 6: Create monitoring for research-first approach
  console.log('\n6️⃣ Creating monitoring for research-first approach...');
  const monitoringFix = await createResearchFirstMonitoring();
  fixes.push(monitoringFix);
  results.push(monitoringFix);

  // Summary
  console.log('\n📊 Fix Summary');
  console.log('==============');
  
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.title}: ${result.message}`);
    
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  });

  console.log(`\n📈 Results: ${successCount} successful, ${failureCount} failed`);

  if (failureCount === 0) {
    console.log('\n🎉 All fixes applied successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure Google Search API key (optional but recommended)');
    console.log('2. Test the system: npm run test-ai-providers');
    console.log('3. Monitor logs to verify research-first approach');
    console.log('4. Run analysis: npm run analyze-ai-approach');
  } else {
    console.log('\n⚠️  Some fixes failed. Please check the errors above.');
  }

  return { fixes, results, successCount, failureCount };
}

async function ensureKnowledgeBaseLoaded() {
  try {
    const knowledgeBasePath = path.join(__dirname, '..', 'data', 'knowledge-base.json');
    
    if (!fs.existsSync(knowledgeBasePath)) {
      return {
        title: 'Knowledge Base Loading',
        success: false,
        message: 'Knowledge base file not found',
        error: 'knowledge-base.json not found in data directory'
      };
    }

    // Verify knowledge base structure
    const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));
    
    if (!knowledgeBase.backendDevelopment) {
      return {
        title: 'Knowledge Base Loading',
        success: false,
        message: 'Knowledge base structure is invalid',
        error: 'Missing backendDevelopment section'
      };
    }

    return {
      title: 'Knowledge Base Loading',
      success: true,
      message: 'Knowledge base loaded successfully',
      details: `Contains ${Object.keys(knowledgeBase).length} main categories`
    };

  } catch (error) {
    return {
      title: 'Knowledge Base Loading',
      success: false,
      message: 'Failed to load knowledge base',
      error: error.message
    };
  }
}

async function configureWebSearchService() {
  try {
    const webSearchConfigPath = path.join(__dirname, '..', 'config', 'web-search-config.json');
    
    if (!fs.existsSync(webSearchConfigPath)) {
      return {
        title: 'Web Search Configuration',
        success: false,
        message: 'Web search configuration not found',
        error: 'web-search-config.json not found'
      };
    }

    // Verify web search service exists
    const webSearchServicePath = path.join(__dirname, '..', 'services', 'realWebSearchService.js');
    
    if (!fs.existsSync(webSearchServicePath)) {
      return {
        title: 'Web Search Configuration',
        success: false,
        message: 'Real web search service not found',
        error: 'realWebSearchService.js not found'
      };
    }

    return {
      title: 'Web Search Configuration',
      success: true,
      message: 'Web search service configured successfully',
      details: 'Real web search service and configuration file present'
    };

  } catch (error) {
    return {
      title: 'Web Search Configuration',
      success: false,
      message: 'Failed to configure web search service',
      error: error.message
    };
  }
}

async function updateAIProviderManagerForResearchFirst() {
  try {
    const aiProviderPath = path.join(__dirname, '..', 'services', 'aiProviderManager.js');
    
    if (!fs.existsSync(aiProviderPath)) {
      return {
        title: 'AI Provider Manager Update',
        success: false,
        message: 'AI Provider Manager not found',
        error: 'aiProviderManager.js not found'
      };
    }

    let content = fs.readFileSync(aiProviderPath, 'utf8');
    
    // Add research-first configuration if not present
    if (!content.includes('researchFirstMode')) {
      const researchFirstConfig = `
    // Research-first mode configuration
    this.researchFirstMode = process.env.AI_RESEARCH_FIRST_MODE === 'true' || true;
    this.knowledgeBaseFirst = process.env.AI_KNOWLEDGE_BASE_FIRST === 'true' || true;
    this.webSearchEnabled = process.env.AI_WEB_SEARCH_ENABLED === 'true' || true;
    this.maxAIApiUsage = process.env.AI_MAX_API_USAGE || 0.05; // Only 5% of tasks should use AI API
    `;
      
      content = content.replace(
        /(constructor\(\)\s*{)/,
        `$1${researchFirstConfig}`
      );
    }

    // Add research-first method if not present
    if (!content.includes('shouldUseAIAPI')) {
      const researchFirstMethod = `
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
`;
      
      content = content.replace(
        /(module\.exports = AIProviderManager;)/,
        `${researchFirstMethod}\n\n$1`
      );
    }

    fs.writeFileSync(aiProviderPath, content);

    return {
      title: 'AI Provider Manager Update',
      success: true,
      message: 'AI Provider Manager updated for research-first approach',
      details: 'Added research-first configuration and methods'
    };

  } catch (error) {
    return {
      title: 'AI Provider Manager Update',
      success: false,
      message: 'Failed to update AI Provider Manager',
      error: error.message
    };
  }
}

async function createResearchFirstConfiguration() {
  try {
    const configPath = path.join(__dirname, '..', 'config', 'research-first-config.json');
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const researchFirstConfig = {
      researchFirst: {
        enabled: true,
        priority: [
          'knowledge_base',
          'web_search',
          'ai_api'
        ],
        thresholds: {
          knowledge_base: 0.8,
          web_search: 0.6,
          ai_api: 0.3
        },
        maxAIApiUsage: 0.05, // Only 5% of tasks should use AI API
        fallbackToAI: true
      },
      knowledgeBase: {
        enabled: true,
        dataFile: './data/knowledge-base.json',
        searchSettings: {
          maxResults: 5,
          relevanceThreshold: 0.7
        }
      },
      webSearch: {
        enabled: true,
        engines: ['duckduckgo', 'stackoverflow', 'github'],
        maxResults: 10,
        timeout: 15000
      },
      monitoring: {
        enabled: true,
        logResearchFirst: true,
        trackAIApiUsage: true,
        alertOnHighAIApiUsage: true,
        highUsageThreshold: 0.1 // Alert if more than 10% of tasks use AI API
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(researchFirstConfig, null, 2));

    return {
      title: 'Research-First Configuration',
      success: true,
      message: 'Research-first configuration created',
      details: 'Configuration file created with proper settings'
    };

  } catch (error) {
    return {
      title: 'Research-First Configuration',
      success: false,
      message: 'Failed to create research-first configuration',
      error: error.message
    };
  }
}

async function updateAutonomousLearningAcademy() {
  try {
    const academyPath = path.join(__dirname, '..', 'services', 'autonomousLearningAcademy.js');
    
    if (!fs.existsSync(academyPath)) {
      return {
        title: 'Autonomous Learning Academy Update',
        success: false,
        message: 'Autonomous Learning Academy not found',
        error: 'autonomousLearningAcademy.js not found'
      };
    }

    let content = fs.readFileSync(academyPath, 'utf8');
    
    // Ensure real web search service is imported and used
    if (!content.includes('RealWebSearchService')) {
      return {
        title: 'Autonomous Learning Academy Update',
        success: false,
        message: 'Real web search service not properly integrated',
        error: 'RealWebSearchService not imported or used'
      };
    }

    return {
      title: 'Autonomous Learning Academy Update',
      success: true,
      message: 'Autonomous Learning Academy properly configured',
      details: 'Real web search service integrated'
    };

  } catch (error) {
    return {
      title: 'Autonomous Learning Academy Update',
      success: false,
      message: 'Failed to update Autonomous Learning Academy',
      error: error.message
    };
  }
}

async function createResearchFirstMonitoring() {
  try {
    const monitoringPath = path.join(__dirname, '..', 'services', 'researchFirstMonitoring.js');
    
    const monitoringService = `/**
 * Research-First Approach Monitoring Service
 * Monitors and reports on the usage of research-first vs API-first approach
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');

class ResearchFirstMonitoring {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/research-first-monitoring.log' }),
        new winston.transports.Console()
      ]
    });

    this.stats = {
      totalRequests: 0,
      knowledgeBaseRequests: 0,
      webSearchRequests: 0,
      aiApiRequests: 0,
      researchFirstSuccess: 0,
      aiApiFallback: 0,
      startTime: new Date()
    };

    this.loadStats();
  }

  /**
   * Record a research-first request
   */
  recordResearchFirstRequest(source, success = true) {
    this.stats.totalRequests++;
    
    switch (source) {
      case 'knowledge_base':
        this.stats.knowledgeBaseRequests++;
        break;
      case 'web_search':
        this.stats.webSearchRequests++;
        break;
      case 'ai_api':
        this.stats.aiApiRequests++;
        break;
    }

    if (success && source !== 'ai_api') {
      this.stats.researchFirstSuccess++;
    } else if (source === 'ai_api') {
      this.stats.aiApiFallback++;
    }

    this.saveStats();
    this.logUsage();
  }

  /**
   * Get current statistics
   */
  getStats() {
    const uptime = Date.now() - this.stats.startTime.getTime();
    const hours = uptime / (1000 * 60 * 60);
    
    return {
      ...this.stats,
      uptime: hours,
      researchFirstRate: this.stats.totalRequests > 0 ? 
        (this.stats.researchFirstSuccess / this.stats.totalRequests) * 100 : 0,
      aiApiUsageRate: this.stats.totalRequests > 0 ? 
        (this.stats.aiApiRequests / this.stats.totalRequests) * 100 : 0,
      knowledgeBaseUsageRate: this.stats.totalRequests > 0 ? 
        (this.stats.knowledgeBaseRequests / this.stats.totalRequests) * 100 : 0,
      webSearchUsageRate: this.stats.totalRequests > 0 ? 
        (this.stats.webSearchRequests / this.stats.totalRequests) * 100 : 0
    };
  }

  /**
   * Log current usage statistics
   */
  logUsage() {
    const stats = this.getStats();
    
    this.logger.info('Research-First Approach Statistics', {
      totalRequests: stats.totalRequests,
      researchFirstRate: stats.researchFirstRate.toFixed(2) + '%',
      aiApiUsageRate: stats.aiApiUsageRate.toFixed(2) + '%',
      knowledgeBaseUsageRate: stats.knowledgeBaseUsageRate.toFixed(2) + '%',
      webSearchUsageRate: stats.webSearchUsageRate.toFixed(2) + '%'
    });

    // Alert if AI API usage is too high
    if (stats.aiApiUsageRate > 10) {
      this.logger.warn('High AI API usage detected', {
        aiApiUsageRate: stats.aiApiUsageRate.toFixed(2) + '%',
        threshold: '10%'
      });
    }
  }

  /**
   * Save statistics to file
   */
  saveStats() {
    try {
      const statsPath = path.join(__dirname, '..', 'data', 'research-first-stats.json');
      const dataDir = path.dirname(statsPath);
      
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      fs.writeFileSync(statsPath, JSON.stringify(this.stats, null, 2));
    } catch (error) {
      this.logger.error('Failed to save statistics:', error);
    }
  }

  /**
   * Load statistics from file
   */
  loadStats() {
    try {
      const statsPath = path.join(__dirname, '..', 'data', 'research-first-stats.json');
      
      if (fs.existsSync(statsPath)) {
        const savedStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        this.stats = { ...this.stats, ...savedStats };
      }
    } catch (error) {
      this.logger.error('Failed to load statistics:', error);
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      knowledgeBaseRequests: 0,
      webSearchRequests: 0,
      aiApiRequests: 0,
      researchFirstSuccess: 0,
      aiApiFallback: 0,
      startTime: new Date()
    };
    
    this.saveStats();
    this.logger.info('Statistics reset');
  }
}

module.exports = ResearchFirstMonitoring;
`;

    fs.writeFileSync(monitoringPath, monitoringService);

    return {
      title: 'Research-First Monitoring',
      success: true,
      message: 'Research-first monitoring service created',
      details: 'Monitoring service created to track research-first approach usage'
    };

  } catch (error) {
    return {
      title: 'Research-First Monitoring',
      success: false,
      message: 'Failed to create research-first monitoring',
      error: error.message
    };
  }
}

// Run the fix
if (require.main === module) {
  fixResearchFirstApproach().catch(console.error);
}

module.exports = { fixResearchFirstApproach };
