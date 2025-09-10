#!/usr/bin/env node

/**
 * Analyze AI Team Approach Script
 * Investigates why the AI team is still using API-first approach instead of research-first
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function analyzeAIApproach() {
  console.log('🔍 Analyzing AI Team Approach');
  console.log('=============================\n');

  const analysis = {
    issues: [],
    findings: [],
    recommendations: []
  };

  // Check 1: API Keys Configuration
  console.log('1️⃣ Checking API Keys Configuration...');
  const apiKeysStatus = checkAPIKeysConfiguration();
  analysis.findings.push(apiKeysStatus);

  // Check 2: Research-First Implementation
  console.log('\n2️⃣ Checking Research-First Implementation...');
  const researchImplementation = checkResearchFirstImplementation();
  analysis.findings.push(researchImplementation);

  // Check 3: Web Search Service
  console.log('\n3️⃣ Checking Web Search Service...');
  const webSearchStatus = checkWebSearchService();
  analysis.findings.push(webSearchStatus);

  // Check 4: Knowledge Base Status
  console.log('\n4️⃣ Checking Knowledge Base Status...');
  const knowledgeBaseStatus = checkKnowledgeBaseStatus();
  analysis.findings.push(knowledgeBaseStatus);

  // Check 5: AI Provider Manager Configuration
  console.log('\n5️⃣ Checking AI Provider Manager Configuration...');
  const aiProviderStatus = checkAIProviderManagerConfiguration();
  analysis.findings.push(aiProviderStatus);

  // Check 6: Recent Logs Analysis
  console.log('\n6️⃣ Analyzing Recent Logs...');
  const logsAnalysis = await analyzeRecentLogs();
  analysis.findings.push(logsAnalysis);

  // Generate recommendations
  console.log('\n📋 Analysis Summary');
  console.log('===================');
  
  analysis.findings.forEach((finding, index) => {
    console.log(`\n${index + 1}. ${finding.title}`);
    console.log(`   Status: ${finding.status}`);
    console.log(`   Details: ${finding.details}`);
    
    if (finding.issues && finding.issues.length > 0) {
      console.log(`   Issues:`);
      finding.issues.forEach(issue => {
        console.log(`     - ${issue}`);
        analysis.issues.push(issue);
      });
    }
    
    if (finding.recommendations && finding.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      finding.recommendations.forEach(rec => {
        console.log(`     - ${rec}`);
        analysis.recommendations.push(rec);
      });
    }
  });

  // Root cause analysis
  console.log('\n🎯 Root Cause Analysis');
  console.log('======================');
  
  const rootCauses = identifyRootCauses(analysis);
  rootCauses.forEach((cause, index) => {
    console.log(`${index + 1}. ${cause}`);
  });

  // Action plan
  console.log('\n📋 Action Plan');
  console.log('==============');
  
  const actionPlan = generateActionPlan(analysis);
  actionPlan.forEach((action, index) => {
    console.log(`${index + 1}. ${action}`);
  });

  return analysis;
}

function checkAPIKeysConfiguration() {
  const requiredKeys = [
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
    'DEEPSEEK_API_KEY',
    'ANTHROPIC_API_KEY',
    'GROK_API_KEY'
  ];

  const issues = [];
  const recommendations = [];
  let configuredCount = 0;

  requiredKeys.forEach(key => {
    const value = process.env[key];
    if (!value || value.includes('your_') || value.includes('test_') || value.includes('placeholder')) {
      issues.push(`${key} not properly configured`);
    } else {
      configuredCount++;
    }
  });

  if (configuredCount === 0) {
    issues.push('No AI API keys are properly configured');
    recommendations.push('Configure at least one AI API key to enable fallback functionality');
  } else if (configuredCount < requiredKeys.length) {
    recommendations.push('Configure additional AI API keys for better redundancy');
  }

  return {
    title: 'API Keys Configuration',
    status: configuredCount > 0 ? 'partial' : 'failed',
    details: `${configuredCount}/${requiredKeys.length} API keys configured`,
    issues,
    recommendations
  };
}

function checkResearchFirstImplementation() {
  const issues = [];
  const recommendations = [];

  // Check if enhanced autonomous AI team exists
  const enhancedAITeamPath = path.join(__dirname, '..', 'services', 'enhancedAutonomousAITeam.js');
  if (!fs.existsSync(enhancedAITeamPath)) {
    issues.push('Enhanced Autonomous AI Team service not found');
    recommendations.push('Create enhanced autonomous AI team service');
  }

  // Check if learning academy exists
  const learningAcademyPath = path.join(__dirname, '..', 'services', 'autonomousLearningAcademy.js');
  if (!fs.existsSync(learningAcademyPath)) {
    issues.push('Autonomous Learning Academy service not found');
    recommendations.push('Create autonomous learning academy service');
  }

  // Check if real web search service exists
  const webSearchPath = path.join(__dirname, '..', 'services', 'realWebSearchService.js');
  if (!fs.existsSync(webSearchPath)) {
    issues.push('Real Web Search Service not found');
    recommendations.push('Create real web search service');
  }

  return {
    title: 'Research-First Implementation',
    status: issues.length === 0 ? 'implemented' : 'incomplete',
    details: `${issues.length} implementation issues found`,
    issues,
    recommendations
  };
}

function checkWebSearchService() {
  const issues = [];
  const recommendations = [];

  // Check for Google Search API configuration
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    issues.push('Google Search API not configured');
    recommendations.push('Configure Google Custom Search API for better web search results');
  }

  // Check if web search is enabled
  const webSearchConfigPath = path.join(__dirname, '..', 'config', 'web-search-config.json');
  if (!fs.existsSync(webSearchConfigPath)) {
    recommendations.push('Create web search configuration file');
  }

  return {
    title: 'Web Search Service',
    status: issues.length === 0 ? 'configured' : 'needs_configuration',
    details: 'Web search service implementation status',
    issues,
    recommendations
  };
}

function checkKnowledgeBaseStatus() {
  const issues = [];
  const recommendations = [];

  // Check if advanced knowledge base exists
  const knowledgeBasePath = path.join(__dirname, '..', 'services', 'advancedKnowledgeBase.js');
  if (!fs.existsSync(knowledgeBasePath)) {
    issues.push('Advanced Knowledge Base service not found');
    recommendations.push('Create advanced knowledge base service');
  }

  // Check if knowledge base data exists
  const knowledgeDataPath = path.join(__dirname, '..', 'data', 'knowledge-base.json');
  if (!fs.existsSync(knowledgeDataPath)) {
    issues.push('Knowledge base data file not found');
    recommendations.push('Create knowledge base data file with backend development knowledge');
  }

  return {
    title: 'Knowledge Base Status',
    status: issues.length === 0 ? 'available' : 'missing',
    details: 'Knowledge base availability and configuration',
    issues,
    recommendations
  };
}

function checkAIProviderManagerConfiguration() {
  const issues = [];
  const recommendations = [];

  // Check if AI provider manager exists
  const aiProviderPath = path.join(__dirname, '..', 'services', 'aiProviderManager.js');
  if (!fs.existsSync(aiProviderPath)) {
    issues.push('AI Provider Manager service not found');
    recommendations.push('Create AI provider manager service');
    return {
      title: 'AI Provider Manager Configuration',
      status: 'missing',
      details: 'AI Provider Manager service not found',
      issues,
      recommendations
    };
  }

  // Check fallback configuration
  const fallbackConfigPath = path.join(__dirname, '..', 'config', 'fallback-config.json');
  if (!fs.existsSync(fallbackConfigPath)) {
    issues.push('Fallback configuration not found');
    recommendations.push('Create fallback configuration for graceful degradation');
  }

  return {
    title: 'AI Provider Manager Configuration',
    status: issues.length === 0 ? 'configured' : 'needs_configuration',
    details: 'AI Provider Manager configuration status',
    issues,
    recommendations
  };
}

async function analyzeRecentLogs() {
  const issues = [];
  const recommendations = [];

  // Check for recent log files
  const logsDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logsDir)) {
    issues.push('Logs directory not found');
    recommendations.push('Create logs directory and ensure proper logging');
    return {
      title: 'Recent Logs Analysis',
      status: 'no_logs',
      details: 'No logs directory found',
      issues,
      recommendations
    };
  }

  // Look for common error patterns
  const logFiles = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
  
  if (logFiles.length === 0) {
    issues.push('No log files found');
    recommendations.push('Ensure logging is properly configured');
  }

  // Check for API-first behavior patterns
  const apiFirstPatterns = [
    'calling AI provider',
    'using AI API',
    'fallback to AI',
    'AI API recommended'
  ];

  let apiFirstCount = 0;
  let researchFirstCount = 0;

  logFiles.forEach(file => {
    try {
      const logContent = fs.readFileSync(path.join(logsDir, file), 'utf8');
      
      apiFirstPatterns.forEach(pattern => {
        const matches = (logContent.match(new RegExp(pattern, 'gi')) || []).length;
        apiFirstCount += matches;
      });

      const researchPatterns = [
        'researching solution',
        'searching knowledge base',
        'web search results',
        'found solution in knowledge base'
      ];

      researchPatterns.forEach(pattern => {
        const matches = (logContent.match(new RegExp(pattern, 'gi')) || []).length;
        researchFirstCount += matches;
      });
    } catch (error) {
      // Skip files that can't be read
    }
  });

  if (apiFirstCount > researchFirstCount) {
    issues.push('API-first approach is being used more than research-first approach');
    recommendations.push('Investigate why research-first approach is not being utilized');
  }

  return {
    title: 'Recent Logs Analysis',
    status: apiFirstCount > researchFirstCount ? 'api_first_dominant' : 'research_first_dominant',
    details: `API-first: ${apiFirstCount}, Research-first: ${researchFirstCount}`,
    issues,
    recommendations
  };
}

function identifyRootCauses(analysis) {
  const rootCauses = [];

  // Check if API keys are missing
  const apiKeysIssue = analysis.findings.find(f => f.title === 'API Keys Configuration');
  if (apiKeysIssue && apiKeysIssue.status === 'failed') {
    rootCauses.push('Missing AI API keys causing system to fail and fall back to API calls');
  }

  // Check if research-first implementation is incomplete
  const researchIssue = analysis.findings.find(f => f.title === 'Research-First Implementation');
  if (researchIssue && researchIssue.status === 'incomplete') {
    rootCauses.push('Incomplete research-first implementation causing fallback to API-first approach');
  }

  // Check if web search is not working
  const webSearchIssue = analysis.findings.find(f => f.title === 'Web Search Service');
  if (webSearchIssue && webSearchIssue.issues.length > 0) {
    rootCauses.push('Web search service not properly configured, limiting research capabilities');
  }

  // Check if knowledge base is missing
  const knowledgeBaseIssue = analysis.findings.find(f => f.title === 'Knowledge Base Status');
  if (knowledgeBaseIssue && knowledgeBaseIssue.status === 'missing') {
    rootCauses.push('Missing knowledge base forcing reliance on external AI APIs');
  }

  if (rootCauses.length === 0) {
    rootCauses.push('No obvious root causes identified - may be configuration or timing issue');
  }

  return rootCauses;
}

function generateActionPlan(analysis) {
  const actionPlan = [];

  // Priority 1: Fix API keys
  const apiKeysIssue = analysis.findings.find(f => f.title === 'API Keys Configuration');
  if (apiKeysIssue && apiKeysIssue.status !== 'configured') {
    actionPlan.push('Configure AI API keys using: npm run setup-ai-keys');
  }

  // Priority 2: Fix research-first implementation
  const researchIssue = analysis.findings.find(f => f.title === 'Research-First Implementation');
  if (researchIssue && researchIssue.status === 'incomplete') {
    actionPlan.push('Complete research-first implementation by ensuring all services are created');
  }

  // Priority 3: Configure web search
  const webSearchIssue = analysis.findings.find(f => f.title === 'Web Search Service');
  if (webSearchIssue && webSearchIssue.issues.length > 0) {
    actionPlan.push('Configure web search service with proper API keys');
  }

  // Priority 4: Create knowledge base
  const knowledgeBaseIssue = analysis.findings.find(f => f.title === 'Knowledge Base Status');
  if (knowledgeBaseIssue && knowledgeBaseIssue.status === 'missing') {
    actionPlan.push('Create and populate knowledge base with backend development knowledge');
  }

  // Priority 5: Test the system
  actionPlan.push('Test the system with: npm run test-ai-providers');
  actionPlan.push('Monitor logs to verify research-first approach is working');

  return actionPlan;
}

// Run the analysis
if (require.main === module) {
  analyzeAIApproach().catch(console.error);
}

module.exports = { analyzeAIApproach };
