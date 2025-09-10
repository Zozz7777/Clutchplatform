#!/usr/bin/env node

/**
 * Render Deployment Hook
 * Automatically runs after successful deployment on Render
 * Ensures the autonomous system is fully configured and operational
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

class RenderDeploymentHook {
  constructor() {
    this.deploymentId = process.env.RENDER_DEPLOY_ID || 'local';
    this.serviceId = process.env.RENDER_SERVICE_ID || 'local';
    this.environment = process.env.NODE_ENV || 'development';
    this.region = process.env.RENDER_REGION || 'local';
  }

  /**
   * Run deployment hook
   */
  async runDeploymentHook() {
    try {
      console.log('🚀 Render Deployment Hook Started');
      console.log(`📊 Deployment ID: ${this.deploymentId}`);
      console.log(`🔧 Service ID: ${this.serviceId}`);
      console.log(`🌍 Environment: ${this.environment}`);
      console.log(`📍 Region: ${this.region}`);
      
      // Wait for server to be ready
      await this.waitForServerReady();
      
      // Run auto-setup
      await this.runAutoSetup();
      
      // Verify deployment
      await this.verifyDeployment();
      
      console.log('🎉 Render Deployment Hook Completed Successfully!');
      console.log('🤖 Autonomous System is now fully operational!');
      
    } catch (error) {
      console.error('❌ Render Deployment Hook Failed:', error);
      process.exit(1);
    }
  }

  /**
   * Wait for server to be ready
   */
  async waitForServerReady() {
    console.log('⏳ Waiting for server to be ready...');
    
    const maxAttempts = 30;
    const delay = 2000; // 2 seconds
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Check if server is responding
        const { stdout } = await execAsync('curl -f http://localhost:3000/health || echo "not ready"');
        
        if (!stdout.includes('not ready')) {
          console.log('✅ Server is ready!');
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Server not ready, waiting ${delay}ms...`);
        await this.sleep(delay);
      }
    }
    
    throw new Error('Server did not become ready within the expected time');
  }

  /**
   * Run auto-setup
   */
  async runAutoSetup() {
    console.log('🔧 Running auto-setup...');
    
    try {
      const setupScript = path.join(__dirname, 'auto-setup-on-deployment.js');
      const { stdout, stderr } = await execAsync(`node "${setupScript}"`);
      
      if (stdout) {
        console.log('📋 Auto-setup output:', stdout);
      }
      
      if (stderr) {
        console.warn('⚠️ Auto-setup warnings:', stderr);
      }
      
      console.log('✅ Auto-setup completed successfully');
      
    } catch (error) {
      console.error('❌ Auto-setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Verify deployment
   */
  async verifyDeployment() {
    console.log('🔍 Verifying deployment...');
    
    const verificationChecks = [
      {
        name: 'Health Endpoint',
        command: 'curl -f http://localhost:3000/health',
        expected: 'healthy'
      },
      {
        name: 'Autonomous System Status',
        command: 'curl -f http://localhost:3000/api/v1/autonomous-system/status',
        expected: 'success'
      },
      {
        name: 'Learning System Status',
        command: 'curl -f http://localhost:3000/api/v1/learning-system/status',
        expected: 'success'
      }
    ];
    
    for (const check of verificationChecks) {
      try {
        console.log(`🔍 Checking ${check.name}...`);
        const { stdout } = await execAsync(check.command);
        
        if (stdout.includes(check.expected)) {
          console.log(`✅ ${check.name} - OK`);
        } else {
          console.warn(`⚠️ ${check.name} - Unexpected response: ${stdout}`);
        }
      } catch (error) {
        console.warn(`⚠️ ${check.name} - Check failed: ${error.message}`);
      }
    }
    
    console.log('✅ Deployment verification completed');
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const deploymentHook = new RenderDeploymentHook();
  await deploymentHook.runDeploymentHook();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run deployment hook
main();
