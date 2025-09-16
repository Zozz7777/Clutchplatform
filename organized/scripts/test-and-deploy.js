#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TestAndDeployRunner {
  constructor() {
    this.serverProcess = null;
    this.testResults = null;
  }

  async startServer() {
    console.log('🚀 Starting Clutch Backend Server...\n');
    
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'shared-backend', 'server.js');
      
      if (!fs.existsSync(serverPath)) {
        reject(new Error('Server file not found: ' + serverPath));
        return;
      }

      this.serverProcess = spawn('node', [serverPath], {
        cwd: path.join(__dirname, 'shared-backend'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverStarted = false;
      let output = '';

      this.serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
        
        // Check if server is ready
        if (output.includes('Enhanced server running on port') && !serverStarted) {
          serverStarted = true;
          console.log('✅ Server started successfully!\n');
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server Error:', data.toString());
      });

      this.serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0 && !serverStarted) {
          reject(new Error(`Server exited with code ${code}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!serverStarted) {
          reject(new Error('Server startup timeout'));
        }
      }, 30000);
    });
  }

  async runTests() {
    console.log('🧪 Running Comprehensive Tests...\n');
    
    return new Promise((resolve, reject) => {
      const testPath = path.join(__dirname, 'run-comprehensive-tests.js');
      
      if (!fs.existsSync(testPath)) {
        reject(new Error('Test file not found: ' + testPath));
        return;
      }

      const testProcess = spawn('node', [testPath], {
        cwd: __dirname,
        stdio: 'inherit'
      });

      testProcess.on('error', (error) => {
        console.error('Failed to run tests:', error);
        reject(error);
      });

      testProcess.on('exit', (code) => {
        this.testResults = { exitCode: code };
        if (code === 0) {
          console.log('\n✅ All tests passed!');
          resolve();
        } else {
          console.log('\n❌ Some tests failed!');
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });
    });
  }

  async stopServer() {
    if (this.serverProcess) {
      console.log('\n🛑 Stopping server...');
      this.serverProcess.kill('SIGTERM');
      
      return new Promise((resolve) => {
        this.serverProcess.on('exit', () => {
          console.log('✅ Server stopped');
          resolve();
        });
        
        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.serverProcess && !this.serverProcess.killed) {
            this.serverProcess.kill('SIGKILL');
            console.log('⚠️ Server force killed');
            resolve();
          }
        }, 5000);
      });
    }
  }

  async run() {
    try {
      // Start server
      await this.startServer();
      
      // Wait a bit for server to fully initialize
      console.log('⏳ Waiting for server to fully initialize...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Run tests
      await this.runTests();
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('📊 Check the generated reports for detailed results.');
      
    } catch (error) {
      console.error('\n❌ Test execution failed:', error.message);
      throw error;
    } finally {
      // Always stop the server
      await this.stopServer();
    }
  }
}

// ==================== EXECUTION ====================

async function main() {
  const runner = new TestAndDeployRunner();
  
  try {
    await runner.run();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test and deploy process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TestAndDeployRunner;
