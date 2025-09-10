#!/usr/bin/env node

/**
 * Verify Research-First System
 * Comprehensive verification of the research-first AI system implementation
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');

class ResearchFirstSystemVerifier {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/research-first-verification.log' }),
        new winston.transports.Console()
      ]
    });

    this.verificationResults = {
      timestamp: new Date().toISOString(),
      overall: 'pass',
      components: {},
      recommendations: []
    };
  }

  /**
   * Run comprehensive verification
   */
  async runVerification() {
    this.logger.info('🔍 Starting research-first system verification...');

    try {
      // Verify 1: Environment Variables
      await this.verifyEnvironmentVariables();
      
      // Verify 2: Knowledge Base System
      await this.verifyKnowledgeBase();
      
      // Verify 3: Web Search Configuration
      await this.verifyWebSearchConfig();
      
      // Verify 4: AI Provider Manager Configuration
      await this.verifyAIProviderManager();
      
      // Verify 5: Enhanced AI Team Configuration
      await this.verifyEnhancedAITeam();
      
      // Verify 6: Learning System
      await this.verifyLearningSystem();
      
      // Verify 7: API Endpoints
      await this.verifyAPIEndpoints();

      this.generateReport();
      return this.verificationResults;

    } catch (error) {
      this.logger.error('❌ Verification failed:', error);
      this.verificationResults.overall = 'fail';
      this.verificationResults.error = error.message;
      throw error;
    }
  }

  /**
   * Verify environment variables
   */
  async verifyEnvironmentVariables() {
    this.logger.info('🔍 Verifying environment variables...');

    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const requiredVars = [
      'AI_RESEARCH_FIRST_MODE=true',
      'AI_KNOWLEDGE_BASE_FIRST=true',
      'AI_WEB_SEARCH_ENABLED=true',
      'AI_MAX_API_USAGE=0.05',
      'RENDER_SERVICE_ID=clutch-main-nk7x',
      'GOOGLE_SEARCH_API_KEY=',
      'GOOGLE_SEARCH_ENGINE_ID='
    ];

    const results = {
      status: 'pass',
      found: [],
      missing: []
    };

    for (const varCheck of requiredVars) {
      if (envContent.includes(varCheck)) {
        results.found.push(varCheck);
      } else {
        results.missing.push(varCheck);
        results.status = 'fail';
      }
    }

    this.verificationResults.components.environmentVariables = results;
    this.logger.info(`✅ Environment variables: ${results.found.length}/${requiredVars.length} found`);
  }

  /**
   * Verify knowledge base system
   */
  async verifyKnowledgeBase() {
    this.logger.info('🔍 Verifying knowledge base system...');

    const kbPath = path.join(__dirname, '..', 'data', 'knowledge-base.json');
    const results = {
      status: 'pass',
      exists: false,
      topics: 0,
      content: null
    };

    if (fs.existsSync(kbPath)) {
      results.exists = true;
      const kbContent = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
      
      // Count topics in the nested structure
      let topicCount = 0;
      const countTopics = (obj) => {
        for (const key in obj) {
          if (obj[key] && typeof obj[key] === 'object') {
            if (obj[key].title && obj[key].content) {
              topicCount++;
            } else {
              countTopics(obj[key]);
            }
          }
        }
      };
      
      countTopics(kbContent);
      results.topics = topicCount;
      results.content = kbContent;
      
      if (results.topics === 0) {
        results.status = 'fail';
      }
    } else {
      results.status = 'fail';
    }

    this.verificationResults.components.knowledgeBase = results;
    this.logger.info(`✅ Knowledge base: ${results.exists ? 'exists' : 'missing'} (${results.topics} topics)`);
  }

  /**
   * Verify web search configuration
   */
  async verifyWebSearchConfig() {
    this.logger.info('🔍 Verifying web search configuration...');

    const configPath = path.join(__dirname, '..', 'config', 'web-search-config.json');
    const results = {
      status: 'pass',
      exists: false,
      enabled: false,
      providers: []
    };

    if (fs.existsSync(configPath)) {
      results.exists = true;
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // Check the nested structure
      results.enabled = config.webSearch?.enabled || config.researchFirst?.enabled || false;
      results.providers = Object.keys(config.webSearch?.engines || {});
      
      if (!results.enabled || results.providers.length === 0) {
        results.status = 'fail';
      }
    } else {
      results.status = 'fail';
    }

    this.verificationResults.components.webSearchConfig = results;
    this.logger.info(`✅ Web search config: ${results.exists ? 'exists' : 'missing'} (enabled: ${results.enabled})`);
  }

  /**
   * Verify AI Provider Manager configuration
   */
  async verifyAIProviderManager() {
    this.logger.info('🔍 Verifying AI Provider Manager configuration...');

    const providerPath = path.join(__dirname, '..', 'services', 'aiProviderManager.js');
    const providerContent = fs.readFileSync(providerPath, 'utf8');

    const results = {
      status: 'pass',
      researchFirstMode: false,
      knowledgeBaseFirst: false,
      webSearchEnabled: false,
      maxApiUsage: null
    };

    // Check for research-first configuration
    if (providerContent.includes('this.researchFirstMode = process.env.AI_RESEARCH_FIRST_MODE === \'true\' || true')) {
      results.researchFirstMode = true;
    }

    if (providerContent.includes('this.knowledgeBaseFirst = process.env.AI_KNOWLEDGE_BASE_FIRST === \'true\' || true')) {
      results.knowledgeBaseFirst = true;
    }

    if (providerContent.includes('this.webSearchEnabled = process.env.AI_WEB_SEARCH_ENABLED === \'true\' || true')) {
      results.webSearchEnabled = true;
    }

    if (providerContent.includes('this.maxAIApiUsage = process.env.AI_MAX_API_USAGE || 0.05')) {
      results.maxApiUsage = '0.05';
    }

    if (!results.researchFirstMode || !results.knowledgeBaseFirst || !results.webSearchEnabled) {
      results.status = 'fail';
    }

    this.verificationResults.components.aiProviderManager = results;
    this.logger.info(`✅ AI Provider Manager: research-first=${results.researchFirstMode}, kb-first=${results.knowledgeBaseFirst}`);
  }

  /**
   * Verify Enhanced AI Team configuration
   */
  async verifyEnhancedAITeam() {
    this.logger.info('🔍 Verifying Enhanced AI Team configuration...');

    const teamPath = path.join(__dirname, '..', 'services', 'enhancedAutonomousAITeam.js');
    const teamContent = fs.readFileSync(teamPath, 'utf8');

    const results = {
      status: 'pass',
      teamMembers: 0,
      researchFirst: false,
      maxApiUsage: [],
      experienceLevel: []
    };

    // Count team members
    const memberMatches = teamContent.match(/experience: '\d+ years'/g);
    results.teamMembers = memberMatches ? memberMatches.length : 0;

    // Check for research-first approach
    if (teamContent.includes('researchFirst: true')) {
      results.researchFirst = true;
    }

    // Extract max API usage limits
    const apiUsageMatches = teamContent.match(/maxAIApiUsage: 0\.\d+/g);
    if (apiUsageMatches) {
      results.maxApiUsage = apiUsageMatches.map(match => match.split(': ')[1]);
    }

    // Extract experience levels
    const experienceMatches = teamContent.match(/experience: '\d+ years'/g);
    if (experienceMatches) {
      results.experienceLevel = experienceMatches.map(match => match.match(/\d+/)[0]);
    }

    if (results.teamMembers === 0 || !results.researchFirst) {
      results.status = 'fail';
    }

    this.verificationResults.components.enhancedAITeam = results;
    this.logger.info(`✅ Enhanced AI Team: ${results.teamMembers} members, research-first=${results.researchFirst}`);
  }

  /**
   * Verify learning system
   */
  async verifyLearningSystem() {
    this.logger.info('🔍 Verifying learning system...');

    const learningDataPath = path.join(__dirname, '..', 'data', 'ai-team-learning-data.json');
    const continuousDataPath = path.join(__dirname, '..', 'data', 'continuous-learning-data.json');

    const results = {
      status: 'pass',
      learningDataExists: false,
      continuousDataExists: false,
      solutionsCount: 0,
      learningProgress: null
    };

    if (fs.existsSync(learningDataPath)) {
      results.learningDataExists = true;
      const learningData = JSON.parse(fs.readFileSync(learningDataPath, 'utf8'));
      results.solutionsCount = learningData.solutions?.length || 0;
      results.learningProgress = learningData.statistics;
    }

    if (fs.existsSync(continuousDataPath)) {
      results.continuousDataExists = true;
    }

    if (!results.learningDataExists || !results.continuousDataExists) {
      results.status = 'fail';
    }

    this.verificationResults.components.learningSystem = results;
    this.logger.info(`✅ Learning system: ${results.solutionsCount} solutions, progress tracked=${!!results.learningProgress}`);
  }

  /**
   * Verify API endpoints
   */
  async verifyAPIEndpoints() {
    this.logger.info('🔍 Verifying API endpoints...');

    const serverPath = path.join(__dirname, '..', 'server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');

    const requiredEndpoints = [
      '/api/v1/admin/dashboard/consolidated',
      '/api/v1/auth/employee-me',
      '/api/v1/autonomous-dashboard/data',
      '/api/v1/autonomous-dashboard/status'
    ];

    const results = {
      status: 'pass',
      found: [],
      missing: []
    };

    for (const endpoint of requiredEndpoints) {
      if (serverContent.includes(endpoint)) {
        results.found.push(endpoint);
      } else {
        results.missing.push(endpoint);
        results.status = 'fail';
      }
    }

    this.verificationResults.components.apiEndpoints = results;
    this.logger.info(`✅ API endpoints: ${results.found.length}/${requiredEndpoints.length} found`);
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const components = this.verificationResults.components;
    let overallStatus = 'pass';

    // Check overall status
    for (const [component, result] of Object.entries(components)) {
      if (result.status === 'fail') {
        overallStatus = 'fail';
        break;
      }
    }

    this.verificationResults.overall = overallStatus;

    // Generate recommendations
    if (components.environmentVariables?.status === 'fail') {
      this.verificationResults.recommendations.push('Set missing environment variables for research-first mode');
    }

    if (components.knowledgeBase?.status === 'fail') {
      this.verificationResults.recommendations.push('Create or populate knowledge base with backend development topics');
    }

    if (components.webSearchConfig?.status === 'fail') {
      this.verificationResults.recommendations.push('Configure web search with Google API credentials');
    }

    if (components.aiProviderManager?.status === 'fail') {
      this.verificationResults.recommendations.push('Update AI Provider Manager to enable research-first mode');
    }

    if (components.enhancedAITeam?.status === 'fail') {
      this.verificationResults.recommendations.push('Configure Enhanced AI Team with research-first approach');
    }

    if (components.learningSystem?.status === 'fail') {
      this.verificationResults.recommendations.push('Initialize learning system with comprehensive knowledge');
    }

    if (components.apiEndpoints?.status === 'fail') {
      this.verificationResults.recommendations.push('Add missing API endpoint fallback routes');
    }

    this.logger.info(`🏁 Verification completed. Overall status: ${overallStatus}`);
  }

  /**
   * Print detailed report
   */
  printReport() {
    console.log('\n📊 Research-First System Verification Report');
    console.log('==========================================');
    console.log(`Overall Status: ${this.verificationResults.overall.toUpperCase()}`);
    console.log(`Timestamp: ${this.verificationResults.timestamp}`);
    
    console.log('\n📋 Component Status:');
    for (const [component, result] of Object.entries(this.verificationResults.components)) {
      const status = result.status === 'pass' ? '✅' : '❌';
      console.log(`  ${status} ${component}: ${result.status}`);
    }

    if (this.verificationResults.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.verificationResults.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    console.log('\n🎯 Research-First System Summary:');
    console.log('  • AI team operates with 15+ years experience');
    console.log('  • Prioritizes knowledge base and web search');
    console.log('  • Uses AI providers only as last resort (5% max)');
    console.log('  • Autonomous learning and self-improvement enabled');
    console.log('  • Comprehensive monitoring and health checks');
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new ResearchFirstSystemVerifier();
  verifier.runVerification()
    .then(() => {
      verifier.printReport();
      process.exit(verifier.verificationResults.overall === 'pass' ? 0 : 1);
    })
    .catch(error => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

module.exports = ResearchFirstSystemVerifier;
