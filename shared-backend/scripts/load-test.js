#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');
const { logger } = require('../config/logger');

/**
 * Load Testing Script
 * Tests backend performance under various load conditions
 */

class LoadTester {
  constructor() {
    this.config = {
      baseUrl: process.env.BACKEND_URL || 'https://clutch-main-nk7x.onrender.com',
      concurrentUsers: parseInt(process.env.LOAD_TEST_CONCURRENT_USERS) || 10,
      duration: parseInt(process.env.LOAD_TEST_DURATION) || 60, // seconds
      rampUpTime: parseInt(process.env.LOAD_TEST_RAMP_UP) || 10, // seconds
      testScenarios: [
        'health_check',
        'auth_login',
        'user_profile',
        'booking_create',
        'booking_list',
        'mechanic_search',
        'payment_process'
      ]
    };

    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: [],
      scenarios: {},
      startTime: null,
      endTime: null
    };

    this.isRunning = false;
  }

  // Initialize load test
  async initialize() {
    logger.info('🚀 Initializing load test...');
    logger.info(`📊 Configuration: ${this.config.concurrentUsers} users, ${this.config.duration}s duration`);
    
    // Test connection to backend
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/health`, {
        timeout: 5000
      });
      
      if (response.status === 200) {
        logger.info('✅ Backend connection successful');
      } else {
        throw new Error(`Backend health check failed: ${response.status}`);
      }
    } catch (error) {
      logger.error('❌ Backend connection failed:', error.message);
      throw error;
    }
  }

  // Run load test
  async runLoadTest() {
    if (this.isRunning) {
      logger.warn('Load test already running');
      return;
    }

    this.isRunning = true;
    this.results.startTime = new Date();

    logger.info('🔥 Starting load test...');

    try {
      // Run different test scenarios
      for (const scenario of this.config.testScenarios) {
        logger.info(`📋 Running scenario: ${scenario}`);
        await this.runScenario(scenario);
      }

      // Run concurrent load test
      await this.runConcurrentLoadTest();

      this.results.endTime = new Date();
      this.generateReport();

    } catch (error) {
      logger.error('❌ Load test failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Run specific test scenario
  async runScenario(scenarioName) {
    const startTime = Date.now();
    const requests = [];
    const numRequests = 50; // 50 requests per scenario

    logger.info(`🔄 Running ${numRequests} requests for scenario: ${scenarioName}`);

    for (let i = 0; i < numRequests; i++) {
      const request = this.executeScenario(scenarioName, i);
      requests.push(request);
    }

    // Wait for all requests to complete
    const responses = await Promise.allSettled(requests);
    
    // Process results
    const scenarioResults = {
      name: scenarioName,
      totalRequests: responses.length,
      successfulRequests: responses.filter(r => r.status === 'fulfilled').length,
      failedRequests: responses.filter(r => r.status === 'rejected').length,
      responseTimes: [],
      errors: []
    };

    responses.forEach((response, index) => {
      if (response.status === 'fulfilled') {
        scenarioResults.responseTimes.push(response.value.responseTime);
      } else {
        scenarioResults.errors.push({
          request: index,
          error: response.reason.message
        });
      }
    });

    const duration = Date.now() - startTime;
    scenarioResults.duration = duration;
    scenarioResults.avgResponseTime = scenarioResults.responseTimes.length > 0
      ? scenarioResults.responseTimes.reduce((a, b) => a + b, 0) / scenarioResults.responseTimes.length
      : 0;

    this.results.scenarios[scenarioName] = scenarioResults;
    
    logger.info(`✅ Scenario ${scenarioName} completed: ${scenarioResults.successfulRequests}/${scenarioResults.totalRequests} successful`);
  }

  // Execute specific scenario
  async executeScenario(scenarioName, requestIndex) {
    const startTime = Date.now();
    
    try {
      let response;
      
      switch (scenarioName) {
        case 'health_check':
          response = await axios.get(`${this.config.baseUrl}/api/health`, {
            timeout: 5000
          });
          break;

        case 'auth_login':
          response = await axios.post(`${this.config.baseUrl}/api/auth/login`, {
            email: `test${requestIndex}@example.com`,
            password: 'testpassword123'
          }, {
            timeout: 10000
          });
          break;

        case 'user_profile':
          response = await axios.get(`${this.config.baseUrl}/api/users/profile`, {
            headers: {
              'Authorization': 'Bearer test_token'
            },
            timeout: 5000
          });
          break;

        case 'booking_create':
          response = await axios.post(`${this.config.baseUrl}/api/bookings`, {
            serviceType: 'emergency',
            location: {
              latitude: 30.0444,
              longitude: 31.2357
            },
            description: 'Test booking for load testing'
          }, {
            headers: {
              'Authorization': 'Bearer test_token'
            },
            timeout: 10000
          });
          break;

        case 'booking_list':
          response = await axios.get(`${this.config.baseUrl}/api/bookings?page=1&limit=10`, {
            headers: {
              'Authorization': 'Bearer test_token'
            },
            timeout: 5000
          });
          break;

        case 'mechanic_search':
          response = await axios.get(`${this.config.baseUrl}/api/mechanics/search?lat=30.0444&lng=31.2357&radius=10`, {
            timeout: 5000
          });
          break;

        case 'payment_process':
          response = await axios.post(`${this.config.baseUrl}/api/payments/process`, {
            bookingId: `booking_${requestIndex}`,
            amount: 100,
            paymentMethod: 'card'
          }, {
            headers: {
              'Authorization': 'Bearer test_token'
            },
            timeout: 15000
          });
          break;

        default:
          throw new Error(`Unknown scenario: ${scenarioName}`);
      }

      const responseTime = Date.now() - startTime;
      
      return {
        scenario: scenarioName,
        requestIndex,
        status: response.status,
        responseTime,
        success: true
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        scenario: scenarioName,
        requestIndex,
        status: error.response?.status || 0,
        responseTime,
        success: false,
        error: error.message
      };
    }
  }

  // Run concurrent load test
  async runConcurrentLoadTest() {
    logger.info(`🔥 Starting concurrent load test: ${this.config.concurrentUsers} users for ${this.config.duration}s`);

    const startTime = Date.now();
    const endTime = startTime + (this.config.duration * 1000);
    const rampUpInterval = this.config.rampUpTime * 1000 / this.config.concurrentUsers;

    const userPromises = [];

    // Create concurrent users
    for (let i = 0; i < this.config.concurrentUsers; i++) {
      const userPromise = this.simulateUser(i, startTime, endTime, rampUpInterval);
      userPromises.push(userPromise);
    }

    // Wait for all users to complete
    const userResults = await Promise.allSettled(userPromises);

    // Aggregate results
    userResults.forEach(result => {
      if (result.status === 'fulfilled') {
        this.results.totalRequests += result.value.totalRequests;
        this.results.successfulRequests += result.value.successfulRequests;
        this.results.failedRequests += result.value.failedRequests;
        this.results.responseTimes.push(...result.value.responseTimes);
        this.results.errors.push(...result.value.errors);
      }
    });

    logger.info('✅ Concurrent load test completed');
  }

  // Simulate a single user
  async simulateUser(userId, startTime, endTime, rampUpInterval) {
    // Wait for ramp-up
    await new Promise(resolve => setTimeout(resolve, userId * rampUpInterval));

    const userResults = {
      userId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };

    // Simulate user behavior
    while (Date.now() < endTime) {
      try {
        // Randomly select a scenario
        const scenario = this.config.testScenarios[
          Math.floor(Math.random() * this.config.testScenarios.length)
        ];

        const result = await this.executeScenario(scenario, userResults.totalRequests);
        
        userResults.totalRequests++;
        userResults.responseTimes.push(result.responseTime);

        if (result.success) {
          userResults.successfulRequests++;
        } else {
          userResults.failedRequests++;
          userResults.errors.push({
            scenario: result.scenario,
            error: result.error
          });
        }

        // Random delay between requests (1-5 seconds)
        const delay = Math.random() * 4000 + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (error) {
        userResults.totalRequests++;
        userResults.failedRequests++;
        userResults.errors.push({
          scenario: 'unknown',
          error: error.message
        });
      }
    }

    return userResults;
  }

  // Generate test report
  generateReport() {
    const totalDuration = this.results.endTime - this.results.startTime;
    const avgResponseTime = this.results.responseTimes.length > 0
      ? this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length
      : 0;

    const successRate = this.results.totalRequests > 0
      ? (this.results.successfulRequests / this.results.totalRequests) * 100
      : 0;

    const requestsPerSecond = totalDuration > 0
      ? (this.results.totalRequests / totalDuration) * 1000
      : 0;

    console.log('\n' + '='.repeat(80));
    console.log('📊 LOAD TEST REPORT');
    console.log('='.repeat(80));

    console.log(`\n🕒 Test Duration: ${(totalDuration / 1000).toFixed(2)} seconds`);
    console.log(`👥 Concurrent Users: ${this.config.concurrentUsers}`);
    console.log(`📈 Total Requests: ${this.results.totalRequests}`);
    console.log(`✅ Successful Requests: ${this.results.successfulRequests}`);
    console.log(`❌ Failed Requests: ${this.results.failedRequests}`);
    console.log(`📊 Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`🚀 Requests Per Second: ${requestsPerSecond.toFixed(2)}`);

    console.log('\n📋 SCENARIO RESULTS:');
    console.log('-'.repeat(50));
    
    Object.values(this.results.scenarios).forEach(scenario => {
      console.log(`\n🔹 ${scenario.name}:`);
      console.log(`   Requests: ${scenario.successfulRequests}/${scenario.totalRequests} successful`);
      console.log(`   Avg Response Time: ${scenario.avgResponseTime.toFixed(2)}ms`);
      console.log(`   Duration: ${(scenario.duration / 1000).toFixed(2)}s`);
    });

    // Performance analysis
    console.log('\n📈 PERFORMANCE ANALYSIS:');
    console.log('-'.repeat(50));
    
    if (successRate >= 95) {
      console.log('✅ Excellent performance - Success rate above 95%');
    } else if (successRate >= 90) {
      console.log('⚠️  Good performance - Success rate above 90%');
    } else {
      console.log('❌ Poor performance - Success rate below 90%');
    }

    if (avgResponseTime < 1000) {
      console.log('✅ Excellent response time - Average below 1 second');
    } else if (avgResponseTime < 3000) {
      console.log('⚠️  Acceptable response time - Average below 3 seconds');
    } else {
      console.log('❌ Poor response time - Average above 3 seconds');
    }

    if (requestsPerSecond > 10) {
      console.log('✅ High throughput - More than 10 requests per second');
    } else if (requestsPerSecond > 5) {
      console.log('⚠️  Moderate throughput - More than 5 requests per second');
    } else {
      console.log('❌ Low throughput - Less than 5 requests per second');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-'.repeat(50));
    
    if (successRate < 95) {
      console.log('🔧 Consider optimizing error handling and retry mechanisms');
    }
    
    if (avgResponseTime > 1000) {
      console.log('🔧 Consider implementing caching and database optimizations');
    }
    
    if (requestsPerSecond < 10) {
      console.log('🔧 Consider scaling up server resources or implementing load balancing');
    }

    console.log('\n' + '='.repeat(80));

    // Save detailed results
    this.saveDetailedResults();
  }

  // Save detailed results to file
  saveDetailedResults() {
    const fs = require('fs');
    const path = require('path');
    
    const resultsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `load-test-results-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    const detailedResults = {
      config: this.config,
      results: this.results,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(filepath, JSON.stringify(detailedResults, null, 2));
    logger.info(`📄 Detailed results saved to: ${filepath}`);
  }

  // Run quick health check
  async quickHealthCheck() {
    logger.info('🔍 Running quick health check...');
    
    const scenarios = ['health_check', 'auth_login', 'user_profile'];
    const results = [];

    for (const scenario of scenarios) {
      try {
        const startTime = Date.now();
        const result = await this.executeScenario(scenario, 0);
        const duration = Date.now() - startTime;
        
        results.push({
          scenario,
          success: result.success,
          responseTime: result.responseTime,
          status: result.status
        });
        
        logger.info(`✅ ${scenario}: ${result.success ? 'PASS' : 'FAIL'} (${result.responseTime}ms)`);
      } catch (error) {
        results.push({
          scenario,
          success: false,
          error: error.message
        });
        
        logger.error(`❌ ${scenario}: FAIL - ${error.message}`);
      }
    }

    const allPassed = results.every(r => r.success);
    logger.info(`🎯 Health check result: ${allPassed ? 'PASSED' : 'FAILED'}`);
    
    return { passed: allPassed, results };
  }
}

// Main execution
async function main() {
  const loadTester = new LoadTester();
  
  try {
    await loadTester.initialize();
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--health-check') || args.includes('-h')) {
      await loadTester.quickHealthCheck();
    } else if (args.includes('--quick') || args.includes('-q')) {
      loadTester.config.duration = 30;
      loadTester.config.concurrentUsers = 5;
      await loadTester.runLoadTest();
    } else {
      await loadTester.runLoadTest();
    }
    
  } catch (error) {
    logger.error('❌ Load test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = LoadTester;
