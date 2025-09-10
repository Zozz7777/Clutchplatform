#!/usr/bin/env node

/**
 * Autonomous System Status Checker
 * Verifies that all autonomous systems are running correctly
 */

const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AutonomousSystemStatusChecker {
  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'https://clutch-main-nk7x.onrender.com';
    this.logger = {
      info: (msg) => console.log(`ℹ️ ${msg}`),
      warn: (msg) => console.log(`⚠️ ${msg}`),
      error: (msg) => console.log(`❌ ${msg}`),
      success: (msg) => console.log(`✅ ${msg}`)
    };
  }

  async checkSystemStatus() {
    console.log('🔍 Checking Autonomous System Status...');
    console.log('=====================================');

    const results = {
      serverHealth: false,
      aiMonitoringAgent: false,
      autonomousSystem: false,
      autonomousDashboard: false,
      npmVulnerabilities: false,
      apiEndpoints: false
    };

    try {
      // 1. Check server health
      results.serverHealth = await this.checkServerHealth();
      
      // 2. Check AI Monitoring Agent
      results.aiMonitoringAgent = await this.checkAIMonitoringAgent();
      
      // 3. Check Autonomous System
      results.autonomousSystem = await this.checkAutonomousSystem();
      
      // 4. Check Autonomous Dashboard
      results.autonomousDashboard = await this.checkAutonomousDashboard();
      
      // 5. Check NPM vulnerabilities
      results.npmVulnerabilities = await this.checkNPMVulnerabilities();
      
      // 6. Check API endpoints
      results.apiEndpoints = await this.checkAPIEndpoints();

      // Generate summary
      this.generateSummary(results);

    } catch (error) {
      this.logger.error(`Status check failed: ${error.message}`);
    }
  }

  async checkServerHealth() {
    try {
      this.logger.info('🏥 Checking server health...');
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 10000 });
      
      if (response.status === 200) {
        this.logger.success('✅ Server is healthy');
        return true;
      } else {
        this.logger.warn(`⚠️ Server returned status ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`❌ Server health check failed: ${error.message}`);
      return false;
    }
  }

  async checkAIMonitoringAgent() {
    try {
      this.logger.info('🤖 Checking AI Monitoring Agent...');
      const response = await axios.get(`${this.baseUrl}/api/v1/ai-agent/status`, { timeout: 10000 });
      
      if (response.data && response.data.success) {
        const status = response.data.data;
        this.logger.success(`✅ AI Monitoring Agent is running (Issues: ${status.totalIssues})`);
        return true;
      } else {
        this.logger.warn('⚠️ AI Monitoring Agent not responding correctly');
        return false;
      }
    } catch (error) {
      this.logger.error(`❌ AI Monitoring Agent check failed: ${error.message}`);
      return false;
    }
  }

  async checkAutonomousSystem() {
    try {
      this.logger.info('🎭 Checking Autonomous System...');
      const response = await axios.get(`${this.baseUrl}/api/v1/autonomous-system/status`, { timeout: 10000 });
      
      if (response.data && response.data.success) {
        const status = response.data.data;
        this.logger.success(`✅ Autonomous System is running (Components: ${status.components})`);
        return true;
      } else {
        this.logger.warn('⚠️ Autonomous System not responding correctly');
        return false;
      }
    } catch (error) {
      this.logger.error(`❌ Autonomous System check failed: ${error.message}`);
      return false;
    }
  }

  async checkAutonomousDashboard() {
    try {
      this.logger.info('🎛️ Checking Autonomous Dashboard...');
      const response = await axios.get(`${this.baseUrl}/api/v1/autonomous-dashboard/status`, { timeout: 10000 });
      
      if (response.data && response.data.success) {
        const status = response.data.data;
        this.logger.success(`✅ Autonomous Dashboard is running (Status: ${status.orchestrator.status})`);
        return true;
      } else {
        this.logger.warn('⚠️ Autonomous Dashboard not responding correctly');
        return false;
      }
    } catch (error) {
      this.logger.error(`❌ Autonomous Dashboard check failed: ${error.message}`);
      return false;
    }
  }

  async checkNPMVulnerabilities() {
    try {
      this.logger.info('🔒 Checking NPM vulnerabilities...');
      const { stdout } = await execAsync('npm audit --json');
      const auditData = JSON.parse(stdout);
      
      if (auditData.vulnerabilities && Object.keys(auditData.vulnerabilities).length > 0) {
        const vulnCount = Object.keys(auditData.vulnerabilities).length;
        this.logger.warn(`⚠️ Found ${vulnCount} NPM vulnerabilities`);
        return false;
      } else {
        this.logger.success('✅ No NPM vulnerabilities found');
        return true;
      }
    } catch (error) {
      this.logger.error(`❌ NPM vulnerability check failed: ${error.message}`);
      return false;
    }
  }

  async checkAPIEndpoints() {
    try {
      this.logger.info('🔗 Checking critical API endpoints...');
      
      const endpoints = [
        '/api/v1/auth/employee-me',
        '/api/v1/admin/dashboard/consolidated',
        '/api/v1/dashboard/consolidated'
      ];
      
      let workingEndpoints = 0;
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, { 
            timeout: 5000,
            validateStatus: () => true // Accept any status code
          });
          
          if (response.status !== 404) {
            workingEndpoints++;
            this.logger.success(`✅ ${endpoint} is accessible`);
          } else {
            this.logger.warn(`⚠️ ${endpoint} returns 404`);
          }
        } catch (error) {
          this.logger.warn(`⚠️ ${endpoint} check failed: ${error.message}`);
        }
      }
      
      if (workingEndpoints === endpoints.length) {
        this.logger.success('✅ All critical API endpoints are working');
        return true;
      } else {
        this.logger.warn(`⚠️ Only ${workingEndpoints}/${endpoints.length} endpoints are working`);
        return false;
      }
    } catch (error) {
      this.logger.error(`❌ API endpoint check failed: ${error.message}`);
      return false;
    }
  }

  generateSummary(results) {
    console.log('\n📊 AUTONOMOUS SYSTEM STATUS SUMMARY');
    console.log('=====================================');
    
    const totalChecks = Object.keys(results).length;
    const passedChecks = Object.values(results).filter(Boolean).length;
    const systemHealth = (passedChecks / totalChecks) * 100;
    
    console.log(`🏥 Server Health: ${results.serverHealth ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
    console.log(`🤖 AI Monitoring Agent: ${results.aiMonitoringAgent ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    console.log(`🎭 Autonomous System: ${results.autonomousSystem ? '✅ RUNNING' : '❌ STOPPED'}`);
    console.log(`🎛️ Autonomous Dashboard: ${results.autonomousDashboard ? '✅ OPERATIONAL' : '❌ OFFLINE'}`);
    console.log(`🔒 NPM Security: ${results.npmVulnerabilities ? '✅ SECURE' : '❌ VULNERABILITIES'}`);
    console.log(`🔗 API Endpoints: ${results.apiEndpoints ? '✅ WORKING' : '❌ ISSUES'}`);
    
    console.log('\n📈 OVERALL SYSTEM HEALTH');
    console.log('========================');
    console.log(`System Health: ${systemHealth.toFixed(1)}% (${passedChecks}/${totalChecks} checks passed)`);
    
    if (systemHealth >= 90) {
      this.logger.success('🎉 EXCELLENT: Autonomous system is fully operational!');
    } else if (systemHealth >= 70) {
      this.logger.warn('⚠️ GOOD: Most systems are working, minor issues detected');
    } else if (systemHealth >= 50) {
      this.logger.warn('⚠️ FAIR: Several systems need attention');
    } else {
      this.logger.error('❌ POOR: Major system issues detected, immediate action required');
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (!results.serverHealth) {
      console.log('🔧 Fix server health issues');
    }
    if (!results.aiMonitoringAgent) {
      console.log('🤖 Restart AI Monitoring Agent');
    }
    if (!results.autonomousSystem) {
      console.log('🎭 Start Autonomous System Orchestrator');
    }
    if (!results.autonomousDashboard) {
      console.log('🎛️ Initialize Autonomous Dashboard');
    }
    if (!results.npmVulnerabilities) {
      console.log('🔒 Run: npm run fix:vulnerabilities');
    }
    if (!results.apiEndpoints) {
      console.log('🔗 Check API route configurations');
    }
    
    if (systemHealth === 100) {
      console.log('🎉 All systems are perfect! No action needed.');
    }
  }
}

// Main execution
async function main() {
  const checker = new AutonomousSystemStatusChecker();
  await checker.checkSystemStatus();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = AutonomousSystemStatusChecker;
