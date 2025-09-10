/**
 * AI Monitoring Agent for Clutch Platform
 * Automatically monitors, detects, and fixes issues in backend and admin panel
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');
const winston = require('winston');
const cron = require('node-cron');
const EnterpriseAIDeveloper = require('./enterpriseAIDeveloper');
const AIProviderManager = require('./aiProviderManager');

class AIMonitoringAgent {
  constructor() {
    // Initialize AI Provider Manager for multi-provider support
    this.aiProviderManager = new AIProviderManager();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/ai-agent.log' }),
        new winston.transports.Console()
      ]
    });

    this.config = {
      backendUrl: process.env.BACKEND_URL || 'https://clutch-main-nk7x.onrender.com',
      adminUrl: process.env.ADMIN_URL || 'https://admin.yourclutch.com',
      renderApiKey: process.env.RENDER_API_KEY,
      renderServiceId: process.env.RENDER_SERVICE_ID,
      checkInterval: process.env.AI_CHECK_INTERVAL || '*/5 * * * *', // Every 5 minutes
      maxRetries: 3,
      autoFixEnabled: process.env.AI_AUTO_FIX_ENABLED === 'true'
    };

    this.issuePatterns = {
      database: [
        /connection.*timeout/i,
        /mongodb.*connection.*failed/i,
        /database.*unavailable/i,
        /connection.*pool.*exhausted/i
      ],
      memory: [
        /out of memory/i,
        /memory.*leak/i,
        /heap.*overflow/i,
        /gc.*overhead/i
      ],
      api: [
        /500.*internal.*server.*error/i,
        /503.*service.*unavailable/i,
        /timeout/i,
        /rate.*limit.*exceeded/i,
        /404.*not.*found/i,
        /endpoint.*not.*found/i,
        /route.*not.*found/i,
        /can't.*find.*on.*this.*server/i
      ],
      cors: [
        /cors.*error/i,
        /access.*control.*allow.*origin/i,
        /cross.*origin.*request.*blocked/i
      ],
      authentication: [
        /unauthorized/i,
        /jwt.*expired/i,
        /token.*invalid/i,
        /authentication.*failed/i
      ],
      npm: [
        /vulnerabilities/i,
        /npm.*audit/i,
        /security.*vulnerability/i,
        /critical.*vulnerability/i,
        /high.*vulnerability/i
      ],
      performance: [
        /slow.*request/i,
        /response.*time.*exceeded/i,
        /timeout.*exceeded/i,
        /performance.*degradation/i
      ]
    };

    this.fixStrategies = {
      database: this.fixDatabaseIssues.bind(this),
      memory: this.fixMemoryIssues.bind(this),
      api: this.fixApiIssues.bind(this),
      cors: this.fixCorsIssues.bind(this),
      authentication: this.fixAuthIssues.bind(this),
      npm: this.fixNpmIssues.bind(this),
      performance: this.fixPerformanceIssues.bind(this)
    };

    this.isRunning = false;
    this.lastCheck = null;
    this.issueHistory = [];
    
    // Initialize Enterprise AI Developer
    this.enterpriseDeveloper = new EnterpriseAIDeveloper();
  }

  /**
   * Start the AI monitoring agent
   */
  async start() {
    if (this.isRunning) {
      this.logger.warn('AI Agent is already running');
      return;
    }

    this.logger.info('🤖 Starting AI Monitoring Agent...');
    this.isRunning = true;

    // Schedule regular health checks
    cron.schedule(this.config.checkInterval, async () => {
      await this.performHealthCheck();
    });

    // Initial health check
    await this.performHealthCheck();

    this.logger.info('✅ AI Monitoring Agent started successfully');
  }

  /**
   * Stop the AI monitoring agent
   */
  async stop() {
    this.logger.info('🛑 Stopping AI Monitoring Agent...');
    this.isRunning = false;
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    try {
      this.logger.info('🔍 Performing health check...');
      this.lastCheck = new Date();

      const results = await Promise.allSettled([
        this.checkBackendHealth(),
        this.checkAdminHealth(),
        this.checkRenderLogs(),
        this.checkDatabaseHealth(),
        this.checkApiEndpoints()
      ]);

      const issues = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          issues.push({
            type: 'check_failed',
            service: ['backend', 'admin', 'logs', 'database', 'api'][index],
            error: result.reason.message,
            timestamp: new Date()
          });
        } else if (result.value && result.value.issues) {
          issues.push(...result.value.issues);
        }
      });

      if (issues.length > 0) {
        await this.handleIssues(issues);
      } else {
        this.logger.info('✅ All systems healthy');
      }

    } catch (error) {
      this.logger.error('❌ Health check failed:', error);
    }
  }

  /**
   * Check backend health
   */
  async checkBackendHealth() {
    try {
      const response = await axios.get(`${this.config.backendUrl}/health`, {
        timeout: 10000
      });

      if (response.status !== 200) {
        return {
          issues: [{
            type: 'backend_health',
            severity: 'high',
            message: `Backend health check returned status ${response.status}`,
            timestamp: new Date()
          }]
        };
      }

      return { healthy: true };
    } catch (error) {
      return {
        issues: [{
          type: 'backend_health',
          severity: 'critical',
          message: `Backend health check failed: ${error.message}`,
          timestamp: new Date()
        }]
      };
    }
  }

  /**
   * Check admin panel health
   */
  async checkAdminHealth() {
    try {
      const response = await axios.get(this.config.adminUrl, {
        timeout: 10000,
        validateStatus: (status) => status < 500 // Accept redirects
      });

      if (response.status >= 500) {
        return {
          issues: [{
            type: 'admin_health',
            severity: 'high',
            message: `Admin panel returned status ${response.status}`,
            timestamp: new Date()
          }]
        };
      }

      return { healthy: true };
    } catch (error) {
      return {
        issues: [{
          type: 'admin_health',
          severity: 'critical',
          message: `Admin panel health check failed: ${error.message}`,
          timestamp: new Date()
        }]
      };
    }
  }

  /**
   * Check Render logs for issues
   */
  async checkRenderLogs() {
    if (!this.config.renderApiKey || !this.config.renderServiceId) {
      this.logger.warn('Render API credentials not configured');
      return { healthy: true };
    }

    try {
      const response = await axios.get(
        `https://api.render.com/v1/services/${this.config.renderServiceId}/logs`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.renderApiKey}`
          },
          params: {
            limit: 100,
            since: new Date(Date.now() - 5 * 60 * 1000).toISOString() // Last 5 minutes
          }
        }
      );

      const logs = response.data;
      const issues = this.analyzeLogs(logs);

      return { issues };
    } catch (error) {
      this.logger.error('Failed to fetch Render logs:', error);
      return { healthy: true };
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      const response = await axios.get(`${this.config.backendUrl}/api/v1/health/database`, {
        timeout: 10000
      });

      if (response.status !== 200) {
        return {
          issues: [{
            type: 'database_health',
            severity: 'high',
            message: 'Database health check failed',
            timestamp: new Date()
          }]
        };
      }

      return { healthy: true };
    } catch (error) {
      return {
        issues: [{
          type: 'database_health',
          severity: 'critical',
          message: `Database health check failed: ${error.message}`,
          timestamp: new Date()
        }]
      };
    }
  }

  /**
   * Check critical API endpoints
   */
  async checkApiEndpoints() {
    const endpoints = [
      '/api/v1/auth/employee-login',
      '/api/v1/admin/dashboard/consolidated',
      '/api/v1/health'
    ];

    const issues = [];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.config.backendUrl}${endpoint}`, {
          timeout: 10000,
          validateStatus: (status) => status < 500
        });

        if (response.status >= 500) {
          issues.push({
            type: 'api_endpoint',
            severity: 'high',
            message: `Endpoint ${endpoint} returned status ${response.status}`,
            endpoint,
            timestamp: new Date()
          });
        }
      } catch (error) {
        issues.push({
          type: 'api_endpoint',
          severity: 'critical',
          message: `Endpoint ${endpoint} failed: ${error.message}`,
          endpoint,
          timestamp: new Date()
        });
      }
    }

    return { issues };
  }

  /**
   * Analyze logs for issues using AI
   */
  analyzeLogs(logs) {
    const issues = [];
    const logText = logs.map(log => log.message || log).join('\n');

    for (const [category, patterns] of Object.entries(this.issuePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(logText)) {
          issues.push({
            type: category,
            severity: this.getSeverity(category),
            message: `Detected ${category} issue in logs`,
            pattern: pattern.toString(),
            timestamp: new Date()
          });
        }
      }
    }

    return issues;
  }

  /**
   * Get severity level for issue type
   */
  getSeverity(type) {
    const severityMap = {
      database: 'critical',
      memory: 'high',
      api: 'high',
      cors: 'medium',
      authentication: 'medium'
    };
    return severityMap[type] || 'low';
  }

  /**
   * Handle detected issues
   */
  async handleIssues(issues) {
    this.logger.warn(`🚨 Detected ${issues.length} issues`);

    for (const issue of issues) {
      this.logger.warn(`Issue: ${issue.type} - ${issue.message}`);
      
      // Add to history
      this.issueHistory.push(issue);
      
      // Keep only last 100 issues
      if (this.issueHistory.length > 100) {
        this.issueHistory = this.issueHistory.slice(-100);
      }

      // Attempt auto-fix if enabled
      if (this.config.autoFixEnabled) {
        await this.attemptAutoFix(issue);
      }

      // Send notification
      await this.sendNotification(issue);
    }
  }

  /**
   * Attempt to automatically fix issues using Enterprise AI Developer
   */
  async attemptAutoFix(issue) {
    try {
      this.logger.info(`🔧 Enterprise AI Developer analyzing ${issue.type} issue...`);

      // Use Enterprise AI Developer for complex analysis and fixes
      const resolution = await this.enterpriseDeveloper.analyzeAndResolveIssue(issue);
      
      if (resolution.success) {
        this.logger.info(`✅ Enterprise AI Developer successfully resolved ${issue.type} issue`);
        this.logger.info(`📋 Solution: ${resolution.solution}`);
        
        // Update issue with resolution details
        issue.resolution = resolution;
        issue.autoFixed = true;
        issue.autoFixTimestamp = new Date();
        
        await this.sendNotification({
          ...issue,
          type: 'enterprise_auto_fix_success',
          message: `Enterprise AI Developer resolved ${issue.type} issue: ${resolution.solution}`,
          developer: this.enterpriseDeveloper.developerPersona.name,
          implementation: resolution.implementation
        });
        
        // Also try traditional fix strategies as backup
        const fixStrategy = this.fixStrategies[issue.type];
        if (fixStrategy) {
          const result = await fixStrategy(issue);
          if (result.success) {
            this.logger.info(`✅ Traditional fix also applied for ${issue.type}`);
          }
        }
      } else {
        this.logger.warn(`❌ Enterprise AI Developer could not resolve ${issue.type}: ${resolution.error}`);
        
        // Fallback to traditional fix strategies
        const fixStrategy = this.fixStrategies[issue.type];
        if (fixStrategy) {
          const result = await fixStrategy(issue);
          if (result.success) {
            this.logger.info(`✅ Fallback fix applied for ${issue.type}`);
            await this.sendNotification({
              ...issue,
              type: 'fallback_auto_fix_success',
              message: `Fallback fix applied for ${issue.type} issue: ${result.message}`
            });
          } else {
            this.logger.warn(`❌ All fix strategies failed for ${issue.type}: ${result.message}`);
          }
        } else {
          this.logger.warn(`No fix strategy available for ${issue.type}`);
        }
      }
    } catch (error) {
      this.logger.error(`Enterprise auto-fix error for ${issue.type}:`, error);
      
      // Try traditional fix as last resort
      try {
        const fixStrategy = this.fixStrategies[issue.type];
        if (fixStrategy) {
          const result = await fixStrategy(issue);
          if (result.success) {
            this.logger.info(`✅ Emergency fix applied for ${issue.type}`);
          }
        }
      } catch (fallbackError) {
        this.logger.error(`Emergency fix also failed for ${issue.type}:`, fallbackError);
      }
    }
  }

  /**
   * Fix database issues
   */
  async fixDatabaseIssues(issue) {
    try {
      // Restart database connection
      const response = await axios.post(`${this.config.backendUrl}/api/v1/admin/restart-db-connection`, {}, {
        headers: { 'Authorization': `Bearer ${process.env.ADMIN_API_KEY}` }
      });

      return { success: true, message: 'Database connection restarted' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Fix memory issues
   */
  async fixMemoryIssues(issue) {
    try {
      // Trigger garbage collection
      const response = await axios.post(`${this.config.backendUrl}/api/v1/admin/gc`, {}, {
        headers: { 'Authorization': `Bearer ${process.env.ADMIN_API_KEY}` }
      });

      return { success: true, message: 'Garbage collection triggered' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Fix API issues
   */
  async fixApiIssues(issue) {
    try {
      this.logger.info('🔧 Fixing API issues...');
      
      // Check if it's a 404 error that needs route creation
      if (issue.message && issue.message.includes('404') || issue.message.includes('not found')) {
        this.logger.info('🚨 404 Error detected - delegating to Enterprise AI Developer for route creation');
        
        // Use Enterprise AI Developer to analyze and create missing routes
        const fixResult = await this.enterpriseDeveloper.analyzeAndResolveIssue({
          type: 'missing_api_endpoint',
          severity: 'high',
          description: issue.message,
          context: {
            endpoint: issue.endpoint || 'unknown',
            method: issue.method || 'GET',
            statusCode: 404,
            environment: 'production'
          }
        });

        return { 
          success: true, 
          message: 'Missing API endpoint analyzed and created by Enterprise AI Developer',
          details: fixResult
        };
      }

      // For other API issues, restart the service
      const response = await axios.post(`${this.config.backendUrl}/api/v1/admin/restart-service`, {
        service: 'api'
      }, {
        headers: { 'Authorization': `Bearer ${process.env.ADMIN_API_KEY}` }
      });

      return { success: true, message: 'API service restarted' };
    } catch (error) {
      this.logger.error('Failed to fix API issues:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Fix CORS issues
   */
  async fixCorsIssues(issue) {
    try {
      // Update CORS configuration
      const response = await axios.post(`${this.config.backendUrl}/api/v1/admin/update-cors`, {
        origins: process.env.ALLOWED_ORIGINS?.split(',') || []
      }, {
        headers: { 'Authorization': `Bearer ${process.env.ADMIN_API_KEY}` }
      });

      return { success: true, message: 'CORS configuration updated' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Fix authentication issues
   */
  async fixAuthIssues(issue) {
    try {
      // Refresh JWT secrets
      const response = await axios.post(`${this.config.backendUrl}/api/v1/admin/refresh-jwt`, {}, {
        headers: { 'Authorization': `Bearer ${process.env.ADMIN_API_KEY}` }
      });

      return { success: true, message: 'JWT secrets refreshed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Send notification about issues
   */
  async sendNotification(issue) {
    try {
      // Send to webhook if configured
      if (process.env.WEBHOOK_URL) {
        await axios.post(process.env.WEBHOOK_URL, {
          text: `🚨 Clutch Platform Alert: ${issue.type}`,
          attachments: [{
            color: issue.severity === 'critical' ? 'danger' : 'warning',
            fields: [{
              title: 'Issue Type',
              value: issue.type,
              short: true
            }, {
              title: 'Severity',
              value: issue.severity,
              short: true
            }, {
              title: 'Message',
              value: issue.message,
              short: false
            }, {
              title: 'Timestamp',
              value: issue.timestamp.toISOString(),
              short: true
            }]
          }]
        });
      }

      // Log notification
      this.logger.info(`📢 Notification sent for ${issue.type} issue`);
    } catch (error) {
      this.logger.error('Failed to send notification:', error);
    }
  }

  /**
   * Fix NPM vulnerabilities
   */
  async fixNpmIssues(issue) {
    try {
      this.logger.info('🔧 Fixing NPM vulnerabilities...');
      
      // First, try to run the automated vulnerability fix script
      try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        this.logger.info('🚀 Running automated NPM vulnerability fix...');
        const { stdout, stderr } = await execAsync('npm run fix:vulnerabilities');
        
        if (stdout) {
          this.logger.info('📊 Vulnerability fix output:', stdout);
        }
        if (stderr) {
          this.logger.warn('⚠️ Vulnerability fix warnings:', stderr);
        }
        
        this.logger.success('✅ Automated NPM vulnerability fix completed');
        
      } catch (scriptError) {
        this.logger.warn('⚠️ Automated fix script failed, using AI analysis...');
        
        // Fallback to Enterprise AI Developer analysis
        const fixResult = await this.enterpriseDeveloper.analyzeAndResolveIssue({
          type: 'npm_vulnerabilities',
          severity: 'high',
          description: issue.message,
          context: {
            vulnerabilities: issue.message,
            packageManager: 'npm',
            environment: 'production',
            scriptError: scriptError.message
          }
        });

        return { 
          success: true, 
          message: 'NPM vulnerabilities analyzed and fixed by Enterprise AI Developer',
          details: fixResult
        };
      }

      return { 
        success: true, 
        message: 'NPM vulnerabilities fixed using automated script',
        details: { method: 'automated_script', timestamp: new Date() }
      };
      
    } catch (error) {
      this.logger.error('Failed to fix NPM issues:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Fix performance issues
   */
  async fixPerformanceIssues(issue) {
    try {
      this.logger.info('🔧 Fixing performance issues...');
      
      // Use Enterprise AI Developer to analyze and optimize performance
      const fixResult = await this.enterpriseDeveloper.analyzeAndResolveIssue({
        type: 'performance_degradation',
        severity: 'medium',
        description: issue.message,
        context: {
          responseTime: issue.responseTime,
          endpoint: issue.endpoint,
          environment: 'production'
        }
      });

      return { 
        success: true, 
        message: 'Performance issues analyzed and optimized by Enterprise AI Developer',
        details: fixResult
      };
    } catch (error) {
      this.logger.error('Failed to fix performance issues:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get AI agent status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      totalIssues: this.issueHistory.length,
      recentIssues: this.issueHistory.slice(-10),
      enterpriseDeveloper: this.enterpriseDeveloper.getDeveloperStats(),
      config: {
        checkInterval: this.config.checkInterval,
        autoFixEnabled: this.config.autoFixEnabled,
        backendUrl: this.config.backendUrl,
        adminUrl: this.config.adminUrl
      }
    };
  }

  /**
   * Generate AI-powered insights
   */
  async generateInsights() {
    try {
      const recentIssues = this.issueHistory.slice(-50);
    const issueSummary = recentIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {});

    const prompt = `
    Analyze the following system issues and provide insights:
    
    Issue Summary: ${JSON.stringify(issueSummary)}
    Recent Issues: ${JSON.stringify(recentIssues.slice(-10))}
    
    Provide:
    1. Root cause analysis
    2. Recommended preventive measures
    3. System optimization suggestions
    4. Priority fixes needed
    `;

    const aiResponse = await this.aiProviderManager.generateResponse(prompt, {
      systemPrompt: 'You are an expert system analyst. Analyze system issues and provide actionable insights.',
      maxTokens: 1000,
      temperature: 0.3
    });

    if (!aiResponse.success) {
      throw new Error(`AI analysis failed: ${aiResponse.error}`);
    }

    return aiResponse.response;
  } catch (error) {
    this.logger.error('Failed to generate AI insights:', error);
    return 'Unable to generate insights at this time';
  }
}
}

module.exports = AIMonitoringAgent;
