/**
 * Start Local Server
 * Starts the shared backend server locally for testing
 */

const { spawn } = require('child_process');
const path = require('path');

class LocalServerManager {
  constructor() {
    this.serverProcess = null;
    this.serverPath = path.join(__dirname, '../../shared-backend');
    this.port = 3000;
  }

  /**
   * Start the local server
   */
  async startServer() {
    console.log('🚀 Starting Local Server...');
    console.log(`📁 Server Path: ${this.serverPath}`);
    console.log(`🌐 Port: ${this.port}`);
    
    return new Promise((resolve, reject) => {
      // Change to server directory and start
      this.serverProcess = spawn('npm', ['start'], {
        cwd: this.serverPath,
        stdio: 'pipe',
        shell: true
      });

      let serverReady = false;

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`📤 Server: ${output.trim()}`);
        
        // Check if server is ready
        if (output.includes('Server running') || output.includes('listening') || output.includes('started')) {
          if (!serverReady) {
            serverReady = true;
            console.log('✅ Local server is ready!');
            resolve();
          }
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.error(`❌ Server Error: ${error.trim()}`);
      });

      this.serverProcess.on('close', (code) => {
        console.log(`🔚 Server process exited with code ${code}`);
      });

      this.serverProcess.on('error', (error) => {
        console.error('❌ Failed to start server:', error);
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!serverReady) {
          console.log('⏰ Server start timeout - assuming ready');
          resolve();
        }
      }, 30000);
    });
  }

  /**
   * Stop the local server
   */
  stopServer() {
    if (this.serverProcess) {
      console.log('🛑 Stopping local server...');
      this.serverProcess.kill();
      this.serverProcess = null;
      console.log('✅ Local server stopped');
    }
  }

  /**
   * Check if server is running
   */
  async isServerRunning() {
    try {
      const axios = require('axios');
      const response = await axios.get(`http://localhost:${this.port}/health/ping`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

// Export for use
module.exports = LocalServerManager;

// Run if executed directly
if (require.main === module) {
  const serverManager = new LocalServerManager();
  
  serverManager.startServer()
    .then(() => {
      console.log('🎉 Local server started successfully!');
      console.log('💡 Press Ctrl+C to stop the server');
      
      // Keep the process alive
      process.on('SIGINT', () => {
        serverManager.stopServer();
        process.exit(0);
      });
    })
    .catch(error => {
      console.error('❌ Failed to start local server:', error);
      process.exit(1);
    });
}
