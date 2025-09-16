/**
 * Complete Testing Flow
 * Starts local server, tests locally, then tests online in batches
 */

const LocalServerManager = require('./start-local-server');
const LocalEndpointTester = require('./local-endpoint-tester');

class CompleteTestingFlow {
  constructor() {
    this.serverManager = new LocalServerManager();
    this.endpointTester = new LocalEndpointTester();
    this.isLocalServerStarted = false;
  }

  /**
   * Run the complete testing flow
   */
  async runCompleteFlow() {
    console.log('🚀 Starting Complete Testing Flow');
    console.log('📊 Strategy: Local Server → Local Testing → Online Testing (100 at a time)');
    console.log('=' * 80);

    try {
      // Step 1: Check if local server is already running
      console.log('\n🔍 STEP 1: Checking Local Server Status...');
      const isRunning = await this.serverManager.isServerRunning();
      
      if (isRunning) {
        console.log('✅ Local server is already running!');
        this.isLocalServerStarted = false; // Don't stop it later
      } else {
        console.log('🏠 Local server not running. Starting it...');
        await this.serverManager.startServer();
        this.isLocalServerStarted = true;
        console.log('✅ Local server started successfully!');
      }

      // Step 2: Wait a moment for server to be fully ready
      console.log('\n⏳ STEP 2: Waiting for server to be fully ready...');
      await this.delay(3000);

      // Step 3: Run endpoint testing
      console.log('\n🧪 STEP 3: Running Endpoint Testing...');
      await this.endpointTester.runCompleteTesting();

      console.log('\n🎉 Complete testing flow finished successfully!');

    } catch (error) {
      console.error('❌ Complete testing flow failed:', error);
      throw error;
    } finally {
      // Cleanup: Stop local server if we started it
      if (this.isLocalServerStarted) {
        console.log('\n🧹 Cleaning up: Stopping local server...');
        this.serverManager.stopServer();
      }
    }
  }

  /**
   * Run only local testing (skip online)
   */
  async runLocalOnly() {
    console.log('🏠 Running Local Testing Only...');
    
    try {
      // Check if local server is running
      const isRunning = await this.serverManager.isServerRunning();
      
      if (!isRunning) {
        console.log('🏠 Starting local server...');
        await this.serverManager.startServer();
        this.isLocalServerStarted = true;
        await this.delay(3000);
      }

      // Discover and test endpoints locally
      await this.endpointTester.discoverRealEndpoints();
      const localSuccess = await this.endpointTester.testLocally();
      
      if (localSuccess) {
        console.log('✅ Local testing successful! Ready for online testing.');
      } else {
        console.log('❌ Local testing failed. Fix local issues first.');
      }

    } catch (error) {
      console.error('❌ Local testing failed:', error);
      throw error;
    } finally {
      if (this.isLocalServerStarted) {
        this.serverManager.stopServer();
      }
    }
  }

  /**
   * Run only online testing (assume local is working)
   */
  async runOnlineOnly() {
    console.log('🌐 Running Online Testing Only...');
    
    try {
      await this.endpointTester.discoverRealEndpoints();
      await this.endpointTester.testOnlineInBatches();
      
    } catch (error) {
      console.error('❌ Online testing failed:', error);
      throw error;
    }
  }

  /**
   * Utility method for delays
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use
module.exports = CompleteTestingFlow;

// Run if executed directly
if (require.main === module) {
  const flow = new CompleteTestingFlow();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  const mode = args[0] || 'complete';
  
  switch (mode) {
    case 'local':
      flow.runLocalOnly().catch(console.error);
      break;
    case 'online':
      flow.runOnlineOnly().catch(console.error);
      break;
    case 'complete':
    default:
      flow.runCompleteFlow().catch(console.error);
      break;
  }
}
