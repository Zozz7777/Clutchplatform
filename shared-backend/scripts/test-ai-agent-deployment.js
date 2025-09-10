#!/usr/bin/env node

/**
 * AI Agent Deployment Test Script
 * Tests the AI agent setup and functionality after deployment
 */

const axios = require('axios');

class AIAgentDeploymentTest {
  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'https://clutch-main-nk7x.onrender.com';
    this.testResults = [];
  }

  /**
   * Run all deployment tests
   */
  async runTests() {
    console.log('🧪 Testing AI Agent Deployment...\n');
    
    const tests = [
      { name: 'Backend Health Check', test: this.testBackendHealth.bind(this) },
      { name: 'AI Agent Status', test: this.testAIAgentStatus.bind(this) },
      { name: 'AI Agent Capabilities', test: this.testAIAgentCapabilities.bind(this) },
      { name: 'Developer Statistics', test: this.testDeveloperStats.bind(this) },
      { name: 'Knowledge Base', test: this.testKnowledgeBase.bind(this) },
      { name: 'Issue Detection', test: this.testIssueDetection.bind(this) }
    ];

    for (const test of tests) {
      try {
        console.log(`🔍 Testing: ${test.name}`);
        const result = await test.test();
        this.testResults.push({ name: test.name, success: true, result });
        console.log(`✅ ${test.name}: PASSED\n`);
      } catch (error) {
        this.testResults.push({ name: test.name, success: false, error: error.message });
        console.log(`❌ ${test.name}: FAILED - ${error.message}\n`);
      }
    }

    this.printTestSummary();
    return this.testResults;
  }

  /**
   * Test backend health
   */
  async testBackendHealth() {
    const response = await axios.get(`${this.baseUrl}/health`, { timeout: 10000 });
    
    if (response.status !== 200) {
      throw new Error(`Health check returned status ${response.status}`);
    }
    
    return {
      status: response.status,
      responseTime: response.headers['x-response-time'] || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test AI agent status
   */
  async testAIAgentStatus() {
    const response = await axios.get(`${this.baseUrl}/api/v1/ai-agent/status`, { timeout: 10000 });
    
    if (!response.data.success) {
      throw new Error('AI agent status check failed');
    }
    
    const status = response.data.data;
    return {
      isRunning: status.isRunning,
      lastCheck: status.lastCheck,
      totalIssues: status.totalIssues,
      hasEnterpriseDeveloper: !!status.enterpriseDeveloper
    };
  }

  /**
   * Test AI agent capabilities
   */
  async testAIAgentCapabilities() {
    const response = await axios.get(`${this.baseUrl}/api/v1/ai-agent/capabilities`, { timeout: 10000 });
    
    if (!response.data.success) {
      throw new Error('AI agent capabilities check failed');
    }
    
    const capabilities = response.data.data;
    return {
      developerName: capabilities.developer?.name,
      supportedIssueTypes: capabilities.supportedIssueTypes?.length || 0,
      features: capabilities.features?.length || 0
    };
  }

  /**
   * Test developer statistics
   */
  async testDeveloperStats() {
    const response = await axios.get(`${this.baseUrl}/api/v1/ai-agent/developer-stats`, { timeout: 10000 });
    
    if (!response.data.success) {
      throw new Error('Developer statistics check failed');
    }
    
    const stats = response.data.data;
    return {
      persona: stats.persona?.name,
      totalResolutions: stats.totalResolutions,
      successRate: stats.successRate,
      performance: stats.performance
    };
  }

  /**
   * Test knowledge base
   */
  async testKnowledgeBase() {
    // Test if knowledge base is accessible through insights
    const response = await axios.get(`${this.baseUrl}/api/v1/ai-agent/insights`, { timeout: 15000 });
    
    if (!response.data.success) {
      throw new Error('Knowledge base test failed');
    }
    
    return {
      insightsGenerated: !!response.data.data.insights,
      insightsLength: response.data.data.insights?.length || 0
    };
  }

  /**
   * Test issue detection
   */
  async testIssueDetection() {
    // Test with a mock issue
    const mockIssue = {
      type: 'database',
      severity: 'medium',
      message: 'Test issue for deployment verification',
      timestamp: new Date().toISOString()
    };

    const response = await axios.post(
      `${this.baseUrl}/api/v1/ai-agent/analyze-issue`,
      { issue: mockIssue },
      { timeout: 30000 }
    );
    
    if (!response.data.success) {
      throw new Error('Issue analysis test failed');
    }
    
    return {
      analysisCompleted: !!response.data.data.resolution,
      hasSolution: !!response.data.data.resolution?.solution
    };
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    console.log('📊 Test Summary:');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / this.testResults.length) * 100)}%\n`);
    
    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.testResults
        .filter(r => !r.success)
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
      console.log('');
    }
    
    console.log('🎯 Deployment Status:');
    if (failed === 0) {
      console.log('🎉 AI Agent deployment is fully functional!');
    } else if (failed <= 2) {
      console.log('⚠️ AI Agent deployment is mostly functional with minor issues');
    } else {
      console.log('❌ AI Agent deployment has significant issues that need attention');
    }
  }

  /**
   * Get deployment recommendations
   */
  getRecommendations() {
    const recommendations = [];
    
    const failedTests = this.testResults.filter(r => !r.success);
    
    if (failedTests.some(t => t.name.includes('Health'))) {
      recommendations.push('Check backend service status and connectivity');
    }
    
    if (failedTests.some(t => t.name.includes('Status'))) {
      recommendations.push('Verify AI agent environment variables are set correctly');
    }
    
    if (failedTests.some(t => t.name.includes('Capabilities'))) {
      recommendations.push('Check AI agent initialization and startup process');
    }
    
    if (failedTests.some(t => t.name.includes('Knowledge'))) {
      recommendations.push('Verify platform documentation is accessible');
    }
    
    if (failedTests.some(t => t.name.includes('Issue'))) {
      recommendations.push('Check OpenAI API key and ChatGPT integration');
    }
    
    return recommendations;
  }
}

// CLI usage
if (require.main === module) {
  const tester = new AIAgentDeploymentTest();
  
  tester.runTests()
    .then(results => {
      const recommendations = tester.getRecommendations();
      
      if (recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        console.log('===================');
        recommendations.forEach(rec => {
          console.log(`• ${rec}`);
        });
      }
      
      const allPassed = results.every(r => r.success);
      process.exit(allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = AIAgentDeploymentTest;
