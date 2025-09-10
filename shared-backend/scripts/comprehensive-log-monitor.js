#!/usr/bin/env node

/**
 * Comprehensive Log Monitor
 * Combines Render API logs with frontend error tracking
 * Provides unified view of all application logs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { getCollection } = require('../config/database');

class ComprehensiveLogMonitor {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.RENDER_API_KEY;
    this.ownerId = options.ownerId || process.env.RENDER_OWNER_ID;
    this.baseUrl = 'https://api.render.com/v1';
    this.pollInterval = options.pollInterval || 30000;
    this.isRunning = false;
    this.logBuffer = [];
    this.lastLogIds = new Map();
    this.services = options.services || [];
  }

  /**
   * Start comprehensive monitoring
   */
  async start() {
    console.log('🚀 Starting Comprehensive Log Monitor...');
    console.log('📊 Monitoring: Render API logs + Frontend errors + Database logs\n');
    
    this.isRunning = true;
    
    // Initial setup
    await this.initialize();
    
    // Start monitoring loops
    this.startRenderLogMonitoring();
    this.startFrontendErrorMonitoring();
    this.startDatabaseLogMonitoring();
    
    console.log('✅ All monitoring systems started');
  }

  /**
   * Initialize the monitor
   */
  async initialize() {
    if (!this.apiKey) {
      throw new Error('RENDER_API_KEY environment variable is required');
    }
    
    if (!this.ownerId) {
      await this.fetchOwnerId();
    }
    
    if (this.services.length === 0) {
      await this.fetchServices();
    }
  }

  /**
   * Start Render API log monitoring
   */
  startRenderLogMonitoring() {
    console.log('🔍 Starting Render API log monitoring...');
    
    const monitorRenderLogs = async () => {
      try {
        for (const service of this.services) {
          await this.fetchServiceLogs(service);
        }
        this.processLogBuffer();
      } catch (error) {
        console.error('❌ Render log monitoring error:', error.message);
      }
    };
    
    // Initial fetch
    monitorRenderLogs();
    
    // Set up polling
    this.renderTimer = setInterval(monitorRenderLogs, this.pollInterval);
  }

  /**
   * Start frontend error monitoring
   */
  startFrontendErrorMonitoring() {
    console.log('🌐 Starting frontend error monitoring...');
    
    const monitorFrontendErrors = async () => {
      try {
        await this.fetchFrontendErrors();
      } catch (error) {
        console.error('❌ Frontend error monitoring error:', error.message);
      }
    };
    
    // Initial fetch
    monitorFrontendErrors();
    
    // Set up polling
    this.frontendTimer = setInterval(monitorFrontendErrors, this.pollInterval);
  }

  /**
   * Start database log monitoring
   */
  startDatabaseLogMonitoring() {
    console.log('🗄️ Starting database log monitoring...');
    
    const monitorDatabaseLogs = async () => {
      try {
        await this.fetchDatabaseLogs();
      } catch (error) {
        console.error('❌ Database log monitoring error:', error.message);
      }
    };
    
    // Initial fetch
    monitorDatabaseLogs();
    
    // Set up polling
    this.databaseTimer = setInterval(monitorDatabaseLogs, this.pollInterval);
  }

  /**
   * Fetch frontend errors from database
   */
  async fetchFrontendErrors() {
    try {
      const collection = await getCollection('frontend_errors');
      const recentErrors = await collection
        .find({})
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();
      
      if (recentErrors.length > 0) {
        console.log(`\n🌐 FRONTEND ERRORS (${recentErrors.length} recent):`);
        console.log('='.repeat(60));
        
        recentErrors.forEach(error => {
          const timestamp = new Date(error.timestamp).toLocaleString();
          const severity = error.severity.toUpperCase();
          const icon = this.getSeverityIcon(error.severity);
          
          console.log(`${icon} [${timestamp}] ${severity}: ${error.message}`);
          console.log(`   URL: ${error.url}`);
          if (error.context) {
            console.log(`   Context: ${JSON.stringify(error.context)}`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch frontend errors:', error.message);
    }
  }

  /**
   * Fetch database logs
   */
  async fetchDatabaseLogs() {
    try {
      const collection = await getCollection('audit_logs');
      const recentLogs = await collection
        .find({})
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray();
      
      if (recentLogs.length > 0) {
        console.log(`\n🗄️ DATABASE LOGS (${recentLogs.length} recent):`);
        console.log('='.repeat(60));
        
        recentLogs.forEach(log => {
          const timestamp = new Date(log.timestamp).toLocaleString();
          console.log(`📝 [${timestamp}] ${log.action}: ${log.details}`);
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch database logs:', error.message);
    }
  }

  /**
   * Fetch service logs from Render API
   */
  async fetchServiceLogs(service) {
    try {
      const lastLogId = this.lastLogIds.get(service.id) || '';
      const response = await this.makeApiRequest(`/services/${service.id}/logs`, {
        limit: 50,
        cursor: lastLogId
      });
      
      const logs = response.logs || [];
      let newLogCount = 0;
      
      logs.forEach(log => {
        if (!this.lastLogIds.has(service.id) || log.id !== lastLogId) {
          this.logBuffer.push({
            ...log,
            serviceName: service.name,
            serviceType: service.type,
            serviceId: service.id,
            source: 'render'
          });
          newLogCount++;
        }
      });
      
      if (logs.length > 0) {
        this.lastLogIds.set(service.id, logs[0].id);
      }
      
      if (newLogCount > 0) {
        console.log(`\n🔧 ${service.name.toUpperCase()} LOGS (${newLogCount} new):`);
        console.log('='.repeat(60));
        
        logs.slice(0, newLogCount).forEach(log => {
          const timestamp = new Date(log.timestamp).toLocaleString();
          const level = this.getLogLevel(log.message);
          const icon = this.getLevelIcon(level);
          
          console.log(`${icon} [${timestamp}] ${log.message}`);
        });
      }
      
      return newLogCount;
    } catch (error) {
      console.error(`❌ Failed to fetch logs for service ${service.name}:`, error.message);
      return 0;
    }
  }

  /**
   * Process and display log buffer
   */
  processLogBuffer() {
    if (this.logBuffer.length === 0) return;
    
    // Sort logs by timestamp
    this.logBuffer.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Group logs by service
    const logsByService = this.logBuffer.reduce((acc, log) => {
      if (!acc[log.serviceName]) {
        acc[log.serviceName] = [];
      }
      acc[log.serviceName].push(log);
      return acc;
    }, {});
    
    // Display logs
    console.log('\n' + '='.repeat(80));
    console.log(`📊 COMPREHENSIVE LOG SUMMARY - ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    
    Object.entries(logsByService).forEach(([serviceName, logs]) => {
      console.log(`\n🔧 ${serviceName.toUpperCase()} (${logs.length} logs)`);
      console.log('-'.repeat(60));
      
      logs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const level = this.getLogLevel(log.message);
        const icon = this.getLevelIcon(level);
        
        console.log(`${icon} [${timestamp}] ${log.message}`);
        
        // Show additional context for errors
        if (level === 'error' && log.context) {
          console.log(`   Context: ${JSON.stringify(log.context)}`);
        }
      });
    });
    
    // Clear buffer
    this.logBuffer = [];
  }

  /**
   * Get log level from message
   */
  getLogLevel(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('error') || lowerMessage.includes('❌')) return 'error';
    if (lowerMessage.includes('warn') || lowerMessage.includes('⚠️')) return 'warn';
    if (lowerMessage.includes('info') || lowerMessage.includes('✅') || lowerMessage.includes('🚀')) return 'info';
    if (lowerMessage.includes('debug') || lowerMessage.includes('🔍')) return 'debug';
    return 'info';
  }

  /**
   * Get icon for log level
   */
  getLevelIcon(level) {
    const icons = {
      error: '❌',
      warn: '⚠️',
      info: 'ℹ️',
      debug: '🔍'
    };
    return icons[level] || 'ℹ️';
  }

  /**
   * Get icon for severity level
   */
  getSeverityIcon(severity) {
    const icons = {
      critical: '🚨',
      high: '🔴',
      medium: '🟡',
      low: '🔵'
    };
    return icons[severity] || '🔵';
  }

  /**
   * Fetch owner ID from API
   */
  async fetchOwnerId() {
    try {
      const response = await this.makeApiRequest('/owners');
      // Handle both array and object response formats
      let owners = [];
      if (Array.isArray(response)) {
        // Response is array of objects with owner property
        owners = response.map(item => item.owner || item);
      } else if (response.owners && Array.isArray(response.owners)) {
        owners = response.owners;
      } else if (response.owner) {
        owners = [response.owner];
      }
      
      if (owners.length > 0) {
        this.ownerId = owners[0].id;
        console.log(`✅ Owner ID: ${this.ownerId}`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch owner ID:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all services for the owner
   */
  async fetchServices() {
    try {
      const response = await this.makeApiRequest('/services');
      // Handle both array and object response formats
      if (Array.isArray(response)) {
        // Response is array of objects with service property
        this.services = response.map(item => item.service || item);
      } else if (response.services && Array.isArray(response.services)) {
        this.services = response.services;
      } else {
        this.services = [];
      }
      console.log(`✅ Found ${this.services.length} services to monitor`);
    } catch (error) {
      console.error('❌ Failed to fetch services:', error.message);
      throw error;
    }
  }

  /**
   * Make API request to Render
   */
  async makeApiRequest(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + endpoint);
      
      // Add query parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'Comprehensive-Log-Monitor/1.0'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonData);
            } else {
              reject(new Error(`API Error ${res.statusCode}: ${jsonData.message || data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Monitor is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.renderTimer) {
      clearInterval(this.renderTimer);
      this.renderTimer = null;
    }
    
    if (this.frontendTimer) {
      clearInterval(this.frontendTimer);
      this.frontendTimer = null;
    }
    
    if (this.databaseTimer) {
      clearInterval(this.databaseTimer);
      this.databaseTimer = null;
    }
    
    console.log('🛑 Comprehensive log monitoring stopped');
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new ComprehensiveLogMonitor({
    pollInterval: 30000, // 30 seconds
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down comprehensive log monitor...');
    monitor.stop();
    process.exit(0);
  });
  
  monitor.start().catch(error => {
    console.error('❌ Failed to start monitor:', error.message);
    process.exit(1);
  });
}

module.exports = ComprehensiveLogMonitor;
