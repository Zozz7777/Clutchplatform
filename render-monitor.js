/**
 * Render API Monitor
 * Connects to Render API for real-time monitoring
 */

const https = require('https');

class RenderMonitor {
  constructor() {
    this.apiKey = 'rnd_YPCKouaIjgsx6dCFE1LNIviswnCf';
    this.serviceId = 'clutch-main-nk7x';
    this.baseUrl = 'api.render.com';
  }

  async getServiceMetrics() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: `/v1/services/${this.serviceId}/metrics`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'Render-Monitor/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const metrics = JSON.parse(data);
            resolve(metrics);
          } catch (error) {
            reject(new Error(`Failed to parse metrics: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async getServiceInfo() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: `/v1/services/${this.serviceId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'Render-Monitor/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const serviceInfo = JSON.parse(data);
            resolve(serviceInfo);
          } catch (error) {
            reject(new Error(`Failed to parse service info: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async getDeployments() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: `/v1/services/${this.serviceId}/deploys`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'Render-Monitor/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const deployments = JSON.parse(data);
            resolve(deployments);
          } catch (error) {
            reject(new Error(`Failed to parse deployments: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async monitorService() {
    console.log('📊 Render Service Monitor');
    console.log('='.repeat(50));
    
    try {
      // Get service information
      console.log('🔍 Fetching service information...');
      const serviceInfo = await this.getServiceInfo();
      console.log(`Service: ${serviceInfo.service.name}`);
      console.log(`Status: ${serviceInfo.service.serviceDetails?.buildCommand || 'N/A'}`);
      console.log(`Region: ${serviceInfo.service.region || 'N/A'}`);
      console.log(`Plan: ${serviceInfo.service.plan || 'N/A'}`);
      
      // Get recent deployments
      console.log('\n🚀 Recent Deployments:');
      const deployments = await this.getDeployments();
      if (deployments && deployments.length > 0) {
        const recentDeploy = deployments[0];
        console.log(`Latest: ${recentDeploy.commit?.message || 'N/A'}`);
        console.log(`Status: ${recentDeploy.status}`);
        console.log(`Created: ${new Date(recentDeploy.createdAt).toLocaleString()}`);
      }
      
      // Get metrics
      console.log('\n📈 Service Metrics:');
      try {
        const metrics = await this.getServiceMetrics();
        if (metrics && metrics.length > 0) {
          const latestMetrics = metrics[metrics.length - 1];
          console.log(`CPU Usage: ${latestMetrics.cpu || 'N/A'}%`);
          console.log(`Memory Usage: ${latestMetrics.memory || 'N/A'}%`);
          console.log(`Timestamp: ${new Date(latestMetrics.timestamp).toLocaleString()}`);
        } else {
          console.log('No metrics available');
        }
      } catch (error) {
        console.log(`Metrics unavailable: ${error.message}`);
      }
      
    } catch (error) {
      console.error(`❌ Error monitoring service: ${error.message}`);
    }
  }
}

// Run the monitor
const monitor = new RenderMonitor();
monitor.monitorService().catch(console.error);
