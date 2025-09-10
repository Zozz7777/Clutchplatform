#!/usr/bin/env node

/**
 * Setup script for Render Log Monitoring
 * Helps configure and test the log monitoring system
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

class LogMonitoringSetup {
  constructor() {
    this.configPath = path.join(__dirname, 'log-monitor-config.json');
    this.envPath = path.join(__dirname, '..', '.env');
  }

  /**
   * Run the setup process
   */
  async run() {
    console.log('🚀 Setting up Render Log Monitoring...\n');
    
    try {
      await this.checkEnvironment();
      await this.testApiConnection();
      await this.discoverServices();
      await this.generateConfig();
      await this.testLogMonitoring();
      
      console.log('\n✅ Log monitoring setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Set your RENDER_API_KEY in the environment');
      console.log('2. Run: node scripts/log-monitor.js start');
      console.log('3. Or run: npm run logs:monitor');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Check environment variables
   */
  async checkEnvironment() {
    console.log('🔍 Checking environment configuration...');
    
    const requiredVars = ['RENDER_API_KEY'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.log('⚠️ Missing required environment variables:');
      missing.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      console.log('\n💡 To get your Render API key:');
      console.log('   1. Go to https://dashboard.render.com/');
      console.log('   2. Click on your account settings');
      console.log('   3. Create a new API key');
      console.log('   4. Set it as: export RENDER_API_KEY="your-key-here"');
      
      throw new Error('Missing required environment variables');
    }
    
    console.log('✅ Environment variables configured');
  }

  /**
   * Test API connection
   */
  async testApiConnection() {
    console.log('🔌 Testing Render API connection...');
    
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
        const ownerId = owners[0].id;
        console.log(`✅ API connection successful (Owner ID: ${ownerId})`);
        this.ownerId = ownerId;
      } else {
        throw new Error('No owners found in API response');
      }
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Discover services
   */
  async discoverServices() {
    console.log('🔍 Discovering services...');
    
    try {
      const response = await this.makeApiRequest('/services');
      // Handle both array and object response formats
      let services = [];
      if (Array.isArray(response)) {
        // Response is array of objects with service property
        services = response.map(item => item.service || item);
      } else if (response.services && Array.isArray(response.services)) {
        services = response.services;
      }
      
      console.log(`✅ Found ${services.length} services:`);
      services.forEach(service => {
        console.log(`   - ${service.name} (${service.type}) - ${service.id}`);
      });
      
      this.services = services;
    } catch (error) {
      console.error('❌ Failed to discover services:', error.message);
      throw error;
    }
  }

  /**
   * Generate configuration file
   */
  async generateConfig() {
    console.log('📝 Generating configuration...');
    
    const config = {
      render: {
        apiKey: "${RENDER_API_KEY}",
        ownerId: this.ownerId,
        baseUrl: "https://api.render.com/v1"
      },
      monitoring: {
        pollInterval: 30000,
        maxLogs: 1000,
        logLevel: "info",
        services: this.services.map(service => ({
          name: service.name,
          type: service.type,
          id: service.id
        }))
      },
      filters: {
        includeLevels: ["error", "warn", "info"],
        excludePatterns: [
          "health check",
          "ping",
          "favicon"
        ],
        includePatterns: [
          "authentication",
          "database",
          "api",
          "error",
          "deployment"
        ]
      },
      output: {
        console: true,
        file: {
          enabled: true,
          path: "./logs",
          maxSize: "10MB",
          maxFiles: 5
        },
        webhook: {
          enabled: false,
          url: "${WEBHOOK_URL}",
          headers: {
            "Authorization": "Bearer ${WEBHOOK_TOKEN}"
          }
        }
      }
    };
    
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Configuration saved to: ${this.configPath}`);
  }

  /**
   * Test log monitoring
   */
  async testLogMonitoring() {
    console.log('🧪 Testing log monitoring...');
    
    try {
      const LogMonitor = require('./log-monitor');
      const monitor = new LogMonitor({
        apiKey: process.env.RENDER_API_KEY,
        ownerId: this.ownerId,
        services: this.services,
        pollInterval: 5000, // Quick test
        maxLogs: 10
      });
      
      await monitor.initialize();
      console.log('✅ Log monitor initialized successfully');
      
      // Test fetching logs
      await monitor.fetchAllLogs();
      console.log('✅ Log fetching test successful');
      
    } catch (error) {
      console.error('❌ Log monitoring test failed:', error.message);
      throw error;
    }
  }

  /**
   * Make API request to Render
   */
  async makeApiRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const url = new URL('https://api.render.com/v1' + endpoint);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.RENDER_API_KEY}`,
          'Accept': 'application/json',
          'User-Agent': 'Render-Log-Monitor-Setup/1.0'
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
}

// Run setup if called directly
if (require.main === module) {
  const setup = new LogMonitoringSetup();
  setup.run().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = LogMonitoringSetup;
