#!/usr/bin/env node

/**
 * Render Log Monitor
 * Automatically fetches and monitors logs from Render services
 * Supports both backend and frontend log aggregation
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class RenderLogMonitor {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.RENDER_API_KEY;
    this.ownerId = options.ownerId || process.env.RENDER_OWNER_ID;
    this.baseUrl = 'https://api.render.com/v1';
    this.services = options.services || [];
    this.logLevel = options.logLevel || 'info';
    this.maxLogs = options.maxLogs || 1000;
    this.pollInterval = options.pollInterval || 30000; // 30 seconds
    this.isRunning = false;
    this.logBuffer = [];
    this.lastLogIds = new Map();
    
    if (!this.apiKey) {
      throw new Error('RENDER_API_KEY environment variable is required');
    }
  }

  /**
   * Initialize the log monitor
   */
  async initialize() {
    console.log('🚀 Initializing Render Log Monitor...');
    
    if (!this.ownerId) {
      await this.fetchOwnerId();
    }
    
    if (this.services.length === 0) {
      await this.fetchServices();
    }
    
    console.log(`✅ Found ${this.services.length} services to monitor`);
    this.services.forEach(service => {
      console.log(`  - ${service.name} (${service.type}) - ${service.id}`);
    });
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
    } catch (error) {
      console.error('❌ Failed to fetch services:', error.message);
      throw error;
    }
  }

  /**
   * Start monitoring logs
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Log monitor is already running');
      return;
    }

    await this.initialize();
    this.isRunning = true;
    
    console.log('📊 Starting log monitoring...');
    console.log(`⏰ Polling interval: ${this.pollInterval / 1000} seconds`);
    
    // Initial log fetch
    await this.fetchAllLogs();
    
    // Set up polling
    this.pollTimer = setInterval(async () => {
      try {
        await this.fetchAllLogs();
      } catch (error) {
        console.error('❌ Error during log polling:', error.message);
      }
    }, this.pollInterval);
  }

  /**
   * Stop monitoring logs
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Log monitor is not running');
      return;
    }

    this.isRunning = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    
    console.log('🛑 Log monitoring stopped');
  }

  /**
   * Fetch logs for all services
   */
  async fetchAllLogs() {
    const promises = this.services.map(service => this.fetchServiceLogs(service));
    const results = await Promise.allSettled(promises);
    
    let totalNewLogs = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        totalNewLogs += result.value;
      } else {
        console.error(`❌ Failed to fetch logs for ${this.services[index].name}:`, result.reason.message);
      }
    });
    
    if (totalNewLogs > 0) {
      console.log(`📝 Fetched ${totalNewLogs} new log entries`);
      this.processLogBuffer();
    }
  }

  /**
   * Fetch logs for a specific service
   */
  async fetchServiceLogs(service) {
    try {
      const lastLogId = this.lastLogIds.get(service.id) || '';
      const response = await this.makeApiRequest(`/services/${service.id}/logs`, {
        limit: this.maxLogs,
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
            serviceId: service.id
          });
          newLogCount++;
        }
      });
      
      // Update last log ID
      if (logs.length > 0) {
        this.lastLogIds.set(service.id, logs[0].id);
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
    console.log(`📊 LOG SUMMARY - ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    
    Object.entries(logsByService).forEach(([serviceName, logs]) => {
      console.log(`\n🔧 ${serviceName.toUpperCase()} (${logs.length} logs)`);
      console.log('-'.repeat(60));
      
      logs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const level = this.getLogLevel(log.message);
        const levelIcon = this.getLevelIcon(level);
        
        console.log(`${levelIcon} [${timestamp}] ${log.message}`);
        
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
          'User-Agent': 'Render-Log-Monitor/1.0'
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
   * Export logs to file
   */
  async exportLogs(filename = null) {
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      filename = `render-logs-${timestamp}.json`;
    }
    
    const logData = {
      timestamp: new Date().toISOString(),
      services: this.services,
      logs: this.logBuffer
    };
    
    const filepath = path.join(process.cwd(), filename);
    fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    
    console.log(`📁 Logs exported to: ${filepath}`);
    return filepath;
  }

  /**
   * Get service health status
   */
  async getServiceHealth() {
    const healthData = [];
    
    for (const service of this.services) {
      try {
        const response = await this.makeApiRequest(`/services/${service.id}`);
        healthData.push({
          name: service.name,
          type: service.type,
          status: response.service?.status || 'unknown',
          lastDeploy: response.service?.lastDeploy?.createdAt || null,
          region: response.service?.region || 'unknown'
        });
      } catch (error) {
        healthData.push({
          name: service.name,
          type: service.type,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return healthData;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';
  
  const monitor = new RenderLogMonitor({
    pollInterval: 30000, // 30 seconds
    maxLogs: 1000
  });
  
  async function runCommand() {
    try {
      switch (command) {
        case 'start':
          await monitor.start();
          break;
          
        case 'health':
          await monitor.initialize();
          const health = await monitor.getServiceHealth();
          console.log('🏥 Service Health Status:');
          console.log(JSON.stringify(health, null, 2));
          break;
          
        case 'export':
          await monitor.initialize();
          await monitor.fetchAllLogs();
          await monitor.exportLogs();
          break;
          
        default:
          console.log('Usage: node log-monitor.js [start|health|export]');
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down log monitor...');
    monitor.stop();
    process.exit(0);
  });
  
  runCommand();
}

module.exports = RenderLogMonitor;
