/**
 * Test Environment Setup Script
 * Sets up the complete testing environment for the Clutch Platform
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class TestEnvironmentSetup {
  constructor() {
    this.rootDir = path.join(__dirname, '../..');
    this.testingDir = path.join(__dirname, '..');
  }

  async setup() {
    console.log('🚀 Setting up Clutch Platform Testing Environment...');
    
    try {
      // Check prerequisites
      await this.checkPrerequisites();
      
      // Install dependencies
      await this.installDependencies();
      
      // Set up test databases
      await this.setupTestDatabases();
      
      // Set up test environments
      await this.setupTestEnvironments();
      
      // Generate test data
      await this.generateTestData();
      
      // Set up CI/CD integration
      await this.setupCICD();
      
      // Verify setup
      await this.verifySetup();
      
      console.log('✅ Test environment setup completed successfully!');
      
    } catch (error) {
      console.error('❌ Test environment setup failed:', error);
      throw error;
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    const prerequisites = [
      { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
      { name: 'npm', command: 'npm --version', minVersion: '9.0.0' },
      { name: 'Docker', command: 'docker --version' },
      { name: 'Docker Compose', command: 'docker-compose --version' }
    ];

    for (const prereq of prerequisites) {
      try {
        const version = execSync(prereq.command, { encoding: 'utf8' }).trim();
        console.log(`✅ ${prereq.name}: ${version}`);
        
        if (prereq.minVersion && this.compareVersions(version, prereq.minVersion) < 0) {
          throw new Error(`${prereq.name} version ${prereq.minVersion} or higher is required`);
        }
      } catch (error) {
        throw new Error(`❌ ${prereq.name} not found or version too low: ${error.message}`);
      }
    }
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    const packages = [
      { name: 'Root', path: this.rootDir },
      { name: 'Backend', path: path.join(this.rootDir, 'shared-backend') },
      { name: 'Admin', path: path.join(this.rootDir, 'clutch-admin') },
      { name: 'Testing', path: this.testingDir }
    ];

    for (const pkg of packages) {
      console.log(`Installing dependencies for ${pkg.name}...`);
      try {
        execSync('npm install --legacy-peer-deps', { 
          cwd: pkg.path, 
          stdio: 'inherit' 
        });
        console.log(`✅ ${pkg.name} dependencies installed`);
      } catch (error) {
        console.error(`❌ Failed to install ${pkg.name} dependencies:`, error);
        throw error;
      }
    }
  }

  async setupTestDatabases() {
    console.log('💾 Setting up test databases...');
    
    try {
      // Start test database containers
      execSync('docker-compose -f environments/docker-compose.test.yml up -d test-mongodb test-redis', {
        cwd: this.testingDir,
        stdio: 'inherit'
      });

      // Wait for databases to be ready
      await this.waitForDatabase('mongodb://localhost:27018/clutch_test');
      await this.waitForDatabase('redis://localhost:6380');

      console.log('✅ Test databases are ready');
      
    } catch (error) {
      console.error('❌ Failed to setup test databases:', error);
      throw error;
    }
  }

  async setupTestEnvironments() {
    console.log('🌍 Setting up test environments...');
    
    try {
      // Create test environment files
      const envFiles = [
        {
          path: path.join(this.testingDir, '.env.test'),
          content: this.generateTestEnvContent()
        },
        {
          path: path.join(this.rootDir, 'shared-backend/.env.test'),
          content: this.generateBackendTestEnvContent()
        },
        {
          path: path.join(this.rootDir, 'clutch-admin/.env.test'),
          content: this.generateAdminTestEnvContent()
        }
      ];

      for (const envFile of envFiles) {
        await fs.writeFile(envFile.path, envFile.content);
        console.log(`✅ Created ${envFile.path}`);
      }

      // Set up test directories
      const testDirs = [
        'reports',
        'reports/coverage',
        'reports/screenshots',
        'temp',
        'logs'
      ];

      for (const dir of testDirs) {
        const dirPath = path.join(this.testingDir, dir);
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`✅ Created directory ${dir}`);
      }

    } catch (error) {
      console.error('❌ Failed to setup test environments:', error);
      throw error;
    }
  }

  async generateTestData() {
    console.log('📊 Generating test data...');
    
    try {
      // Run test data generator
      execSync('node data/test-data-generator.js', {
        cwd: this.testingDir,
        stdio: 'inherit'
      });

      console.log('✅ Test data generated successfully');
      
    } catch (error) {
      console.error('❌ Failed to generate test data:', error);
      throw error;
    }
  }

  async setupCICD() {
    console.log('🔄 Setting up CI/CD integration...');
    
    try {
      // Create GitHub Actions workflow
      const workflowDir = path.join(this.rootDir, '.github/workflows');
      await fs.mkdir(workflowDir, { recursive: true });

      const workflowContent = this.generateGitHubActionsWorkflow();
      await fs.writeFile(
        path.join(workflowDir, 'test.yml'),
        workflowContent
      );

      // Create test scripts
      const scripts = [
        {
          name: 'test-ci.sh',
          content: this.generateCITestScript()
        },
        {
          name: 'test-local.sh',
          content: this.generateLocalTestScript()
        }
      ];

      for (const script of scripts) {
        const scriptPath = path.join(this.testingDir, 'scripts', script.name);
        await fs.writeFile(scriptPath, script.content);
        await fs.chmod(scriptPath, '755');
        console.log(`✅ Created ${script.name}`);
      }

    } catch (error) {
      console.error('❌ Failed to setup CI/CD integration:', error);
      throw error;
    }
  }

  async verifySetup() {
    console.log('✅ Verifying test environment setup...');
    
    try {
      // Test database connections
      await this.testDatabaseConnections();
      
      // Test API endpoints
      await this.testAPIEndpoints();
      
      // Run sample tests
      await this.runSampleTests();
      
      console.log('✅ Test environment verification completed');
      
    } catch (error) {
      console.error('❌ Test environment verification failed:', error);
      throw error;
    }
  }

  async waitForDatabase(connectionString, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        if (connectionString.includes('mongodb')) {
          const { MongoClient } = require('mongodb');
          const client = new MongoClient(connectionString);
          await client.connect();
          await client.close();
          return;
        } else if (connectionString.includes('redis')) {
          const redis = require('redis');
          const client = redis.createClient({ url: connectionString });
          await client.connect();
          await client.disconnect();
          return;
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Database connection timeout: ${connectionString}`);
  }

  async testDatabaseConnections() {
    console.log('Testing database connections...');
    
    try {
      // Test MongoDB
      const { MongoClient } = require('mongodb');
      const mongoClient = new MongoClient('mongodb://localhost:27018/clutch_test');
      await mongoClient.connect();
      await mongoClient.close();
      console.log('✅ MongoDB connection successful');

      // Test Redis
      const redis = require('redis');
      const redisClient = redis.createClient({ url: 'redis://localhost:6380' });
      await redisClient.connect();
      await redisClient.disconnect();
      console.log('✅ Redis connection successful');

    } catch (error) {
      throw new Error(`Database connection test failed: ${error.message}`);
    }
  }

  async testAPIEndpoints() {
    console.log('Testing API endpoints...');
    
    try {
      // Start backend server for testing
      const backendProcess = execSync('npm start', {
        cwd: path.join(this.rootDir, 'shared-backend'),
        env: { ...process.env, NODE_ENV: 'test' },
        detached: true,
        stdio: 'ignore'
      });

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Test health endpoint
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        console.log('✅ API health check successful');
      } else {
        throw new Error('API health check failed');
      }

      // Kill backend process
      process.kill(-backendProcess.pid);

    } catch (error) {
      throw new Error(`API endpoint test failed: ${error.message}`);
    }
  }

  async runSampleTests() {
    console.log('Running sample tests...');
    
    try {
      execSync('npm test -- --testPathPattern=unit/backend/api.test.js', {
        cwd: this.testingDir,
        stdio: 'inherit'
      });
      console.log('✅ Sample tests passed');

    } catch (error) {
      throw new Error(`Sample test failed: ${error.message}`);
    }
  }

  generateTestEnvContent() {
    return `# Test Environment Configuration
NODE_ENV=test
TEST_DB_URL=mongodb://localhost:27018/clutch_test
TEST_REDIS_URL=redis://localhost:6380
TEST_API_URL=http://localhost:5000
TEST_ADMIN_URL=http://localhost:3000
JWT_SECRET=test_jwt_secret_key
TEST_COVERAGE_THRESHOLD=80
TEST_TIMEOUT=30000
`;
  }

  generateBackendTestEnvContent() {
    return `# Backend Test Environment
NODE_ENV=test
PORT=5000
DB_URL=mongodb://localhost:27018/clutch_test
REDIS_URL=redis://localhost:6380
JWT_SECRET=test_jwt_secret_key
JWT_EXPIRES_IN=1h
BCRYPT_ROUNDS=4
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
`;
  }

  generateAdminTestEnvContent() {
    return `# Admin Test Environment
NODE_ENV=test
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;
  }

  generateGitHubActionsWorkflow() {
    return `name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
        env:
          MONGO_INITDB_DATABASE: clutch_test
      
      redis:
        image: redis:7.2-alpine
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm install --legacy-peer-deps
        cd shared-backend && npm install --legacy-peer-deps
        cd ../clutch-admin && npm install --legacy-peer-deps
        cd ../testing && npm install --legacy-peer-deps
    
    - name: Setup test environment
      run: |
        cd testing
        npm run test:setup
    
    - name: Run unit tests
      run: |
        cd testing
        npm run test:unit
    
    - name: Run integration tests
      run: |
        cd testing
        npm run test:integration
    
    - name: Run e2e tests
      run: |
        cd testing
        npm run test:e2e
    
    - name: Run performance tests
      run: |
        cd testing
        npm run test:performance
    
    - name: Generate test report
      run: |
        cd testing
        npm run test:report
    
    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: test-results
        path: testing/reports/
`;
  }

  generateCITestScript() {
    return `#!/bin/bash
# CI Test Script

set -e

echo "🚀 Starting CI Test Suite..."

# Install dependencies
npm install --legacy-peer-deps
cd shared-backend && npm install --legacy-peer-deps
cd ../clutch-admin && npm install --legacy-peer-deps
cd ../testing && npm install --legacy-peer-deps

# Setup test environment
npm run test:setup

# Run all tests
npm run test:all

# Generate report
npm run test:report

echo "✅ CI Test Suite completed successfully!"
`;
  }

  generateLocalTestScript() {
    return `#!/bin/bash
# Local Test Script

set -e

echo "🚀 Starting Local Test Suite..."

# Check if test environment is running
if ! docker-compose -f testing/environments/docker-compose.test.yml ps | grep -q "Up"; then
    echo "Starting test environment..."
    cd testing && npm run test:env:setup
fi

# Run tests
cd testing
npm run test:all

echo "✅ Local Test Suite completed successfully!"
`;
  }

  compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    
    return 0;
  }
}

// CLI usage
if (require.main === module) {
  const setup = new TestEnvironmentSetup();
  setup.setup()
    .then(() => {
      console.log('🎉 Test environment setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test environment setup failed:', error);
      process.exit(1);
    });
}

module.exports = TestEnvironmentSetup;
