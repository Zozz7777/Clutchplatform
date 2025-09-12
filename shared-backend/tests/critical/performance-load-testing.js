const { performance } = require('perf_hooks');
const request = require('supertest');
const app = require('../../server');
const cluster = require('cluster');
const os = require('os');

describe('Critical Performance Testing - Load Testing and Optimization', () => {
  let testResults = {
    apiResponseTimes: [],
    concurrentUsers: [],
    memoryUsage: [],
    cpuUsage: [],
    databasePerformance: [],
    errorRates: []
  };

  beforeAll(() => {
    // Setup performance monitoring
    process.on('SIGUSR2', () => {
      console.log('Performance test results:', testResults);
    });
  });

  describe('API Response Time Testing', () => {
    test('should respond to login endpoint within 200ms', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      testResults.apiResponseTimes.push({
        endpoint: '/api/v1/auth/login',
        method: 'POST',
        responseTime: responseTime,
        status: response.status
      });
      
      expect(responseTime).toBeLessThan(200);
      expect(response.status).toBe(200);
    });

    test('should respond to dashboard endpoint within 150ms', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/v1/admin/dashboard/consolidated')
        .set('Authorization', 'Bearer test-token');
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      testResults.apiResponseTimes.push({
        endpoint: '/api/v1/admin/dashboard/consolidated',
        method: 'GET',
        responseTime: responseTime,
        status: response.status
      });
      
      expect(responseTime).toBeLessThan(150);
    });

    test('should respond to users endpoint within 100ms', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', 'Bearer test-token');
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      testResults.apiResponseTimes.push({
        endpoint: '/api/v1/admin/users',
        method: 'GET',
        responseTime: responseTime,
        status: response.status
      });
      
      expect(responseTime).toBeLessThan(100);
    });

    test('should handle database queries efficiently', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', 'Bearer test-token');
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      testResults.databasePerformance.push({
        endpoint: '/api/v1/admin/analytics',
        responseTime: responseTime,
        status: response.status
      });
      
      expect(responseTime).toBeLessThan(300);
    });
  });

  describe('Concurrent User Load Testing', () => {
    test('should handle 100 concurrent users', async () => {
      const concurrentUsers = 100;
      const promises = [];
      
      const startTime = performance.now();
      
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(
          request(app)
            .get('/api/v1/admin/dashboard/consolidated')
            .set('Authorization', 'Bearer test-token')
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      const successfulResponses = responses.filter(r => r.status === 200);
      const errorResponses = responses.filter(r => r.status !== 200);
      
      testResults.concurrentUsers.push({
        concurrentUsers: concurrentUsers,
        totalTime: totalTime,
        successfulResponses: successfulResponses.length,
        errorResponses: errorResponses.length,
        averageResponseTime: totalTime / concurrentUsers
      });
      
      expect(successfulResponses.length).toBeGreaterThanOrEqual(95);
      expect(errorResponses.length).toBeLessThan(5);
      expect(totalTime).toBeLessThan(5000);
    });

    test('should handle 500 concurrent users', async () => {
      const concurrentUsers = 500;
      const promises = [];
      
      const startTime = performance.now();
      
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(
          request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', 'Bearer test-token')
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      const successfulResponses = responses.filter(r => r.status === 200);
      const errorResponses = responses.filter(r => r.status !== 200);
      
      testResults.concurrentUsers.push({
        concurrentUsers: concurrentUsers,
        totalTime: totalTime,
        successfulResponses: successfulResponses.length,
        errorResponses: errorResponses.length,
        averageResponseTime: totalTime / concurrentUsers
      });
      
      expect(successfulResponses.length).toBeGreaterThanOrEqual(450);
      expect(errorResponses.length).toBeLessThan(50);
      expect(totalTime).toBeLessThan(10000);
    });

    test('should handle 1000 concurrent users', async () => {
      const concurrentUsers = 1000;
      const promises = [];
      
      const startTime = performance.now();
      
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(
          request(app)
            .get('/api/v1/admin/analytics')
            .set('Authorization', 'Bearer test-token')
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      const successfulResponses = responses.filter(r => r.status === 200);
      const errorResponses = responses.filter(r => r.status !== 200);
      
      testResults.concurrentUsers.push({
        concurrentUsers: concurrentUsers,
        totalTime: totalTime,
        successfulResponses: successfulResponses.length,
        errorResponses: errorResponses.length,
        averageResponseTime: totalTime / concurrentUsers
      });
      
      expect(successfulResponses.length).toBeGreaterThanOrEqual(900);
      expect(errorResponses.length).toBeLessThan(100);
      expect(totalTime).toBeLessThan(15000);
    });
  });

  describe('Memory Usage Testing', () => {
    test('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate load
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/api/v1/admin/dashboard/consolidated')
            .set('Authorization', 'Bearer test-token')
        );
      }
      
      await Promise.all(promises);
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      testResults.memoryUsage.push({
        initialMemory: initialMemory.heapUsed,
        finalMemory: finalMemory.heapUsed,
        memoryIncrease: memoryIncrease,
        memoryIncreasePercent: (memoryIncrease / initialMemory.heapUsed) * 100
      });
      
      // Memory increase should be less than 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should handle memory leaks', async () => {
      const initialMemory = process.memoryUsage();
      
      // Simulate repeated requests
      for (let i = 0; i < 10; i++) {
        const promises = [];
        for (let j = 0; j < 50; j++) {
          promises.push(
            request(app)
              .get('/api/v1/admin/users')
              .set('Authorization', 'Bearer test-token')
          );
        }
        await Promise.all(promises);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      testResults.memoryUsage.push({
        test: 'memory_leak_test',
        initialMemory: initialMemory.heapUsed,
        finalMemory: finalMemory.heapUsed,
        memoryIncrease: memoryIncrease
      });
      
      // Memory increase should be less than 100MB
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('CPU Usage Testing', () => {
    test('should maintain reasonable CPU usage under load', async () => {
      const startTime = performance.now();
      const startCpuUsage = process.cpuUsage();
      
      // Simulate CPU-intensive load
      const promises = [];
      for (let i = 0; i < 200; i++) {
        promises.push(
          request(app)
            .get('/api/v1/admin/analytics')
            .set('Authorization', 'Bearer test-token')
        );
      }
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const endCpuUsage = process.cpuUsage(startCpuUsage);
      const totalTime = endTime - startTime;
      
      const cpuUsagePercent = (endCpuUsage.user + endCpuUsage.system) / (totalTime * 1000) * 100;
      
      testResults.cpuUsage.push({
        totalTime: totalTime,
        cpuUsage: cpuUsagePercent,
        userCpu: endCpuUsage.user,
        systemCpu: endCpuUsage.system
      });
      
      // CPU usage should be less than 80%
      expect(cpuUsagePercent).toBeLessThan(80);
    });
  });

  describe('Database Performance Testing', () => {
    test('should handle complex database queries efficiently', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', 'Bearer test-token');
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      testResults.databasePerformance.push({
        endpoint: '/api/v1/admin/analytics',
        responseTime: responseTime,
        status: response.status
      });
      
      expect(responseTime).toBeLessThan(500);
    });

    test('should handle database connection pooling', async () => {
      const startTime = performance.now();
      
      // Simulate multiple database connections
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .get('/api/v1/admin/users')
            .set('Authorization', 'Bearer test-token')
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      const successfulResponses = responses.filter(r => r.status === 200);
      
      testResults.databasePerformance.push({
        test: 'connection_pooling',
        totalTime: totalTime,
        successfulResponses: successfulResponses.length,
        averageResponseTime: totalTime / 50
      });
      
      expect(successfulResponses.length).toBe(50);
      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('Error Rate Testing', () => {
    test('should maintain low error rate under load', async () => {
      const promises = [];
      const totalRequests = 1000;
      
      for (let i = 0; i < totalRequests; i++) {
        promises.push(
          request(app)
            .get('/api/v1/admin/dashboard/consolidated')
            .set('Authorization', 'Bearer test-token')
        );
      }
      
      const responses = await Promise.all(promises);
      
      const successfulResponses = responses.filter(r => r.status === 200);
      const errorResponses = responses.filter(r => r.status !== 200);
      
      const errorRate = (errorResponses.length / totalRequests) * 100;
      
      testResults.errorRates.push({
        totalRequests: totalRequests,
        successfulResponses: successfulResponses.length,
        errorResponses: errorResponses.length,
        errorRate: errorRate
      });
      
      // Error rate should be less than 1%
      expect(errorRate).toBeLessThan(1);
    });

    test('should handle rate limiting gracefully', async () => {
      const promises = [];
      const totalRequests = 100;
      
      // Make rapid requests to trigger rate limiting
      for (let i = 0; i < totalRequests; i++) {
        promises.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'test@example.com', password: 'password123' })
        );
      }
      
      const responses = await Promise.all(promises);
      
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      const successfulResponses = responses.filter(r => r.status === 200);
      
      testResults.errorRates.push({
        test: 'rate_limiting',
        totalRequests: totalRequests,
        rateLimitedResponses: rateLimitedResponses.length,
        successfulResponses: successfulResponses.length
      });
      
      // Should have some rate limited responses
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Stress Testing', () => {
    test('should handle stress load without crashing', async () => {
      const promises = [];
      const totalRequests = 2000;
      
      const startTime = performance.now();
      
      for (let i = 0; i < totalRequests; i++) {
        promises.push(
          request(app)
            .get('/api/v1/admin/dashboard/consolidated')
            .set('Authorization', 'Bearer test-token')
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      const successfulResponses = responses.filter(r => r.status === 200);
      const errorResponses = responses.filter(r => r.status !== 200);
      
      testResults.concurrentUsers.push({
        test: 'stress_test',
        totalRequests: totalRequests,
        totalTime: totalTime,
        successfulResponses: successfulResponses.length,
        errorResponses: errorResponses.length,
        averageResponseTime: totalTime / totalRequests
      });
      
      // Should handle at least 90% of requests successfully
      expect(successfulResponses.length).toBeGreaterThanOrEqual(totalRequests * 0.9);
    });
  });

  describe('Performance Optimization Testing', () => {
    test('should have efficient caching', async () => {
      const startTime = performance.now();
      
      // First request
      await request(app)
        .get('/api/v1/admin/dashboard/consolidated')
        .set('Authorization', 'Bearer test-token');
      
      const firstRequestTime = performance.now() - startTime;
      
      // Second request (should be cached)
      const secondStartTime = performance.now();
      await request(app)
        .get('/api/v1/admin/dashboard/consolidated')
        .set('Authorization', 'Bearer test-token');
      
      const secondRequestTime = performance.now() - secondStartTime;
      
      // Cached request should be faster
      expect(secondRequestTime).toBeLessThan(firstRequestTime);
    });

    test('should have efficient compression', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/consolidated')
        .set('Authorization', 'Bearer test-token')
        .set('Accept-Encoding', 'gzip');
      
      expect(response.headers['content-encoding']).toBe('gzip');
    });
  });

  afterAll(() => {
    // Generate performance report
    console.log('\n=== PERFORMANCE TEST RESULTS ===');
    console.log('API Response Times:', testResults.apiResponseTimes);
    console.log('Concurrent Users:', testResults.concurrentUsers);
    console.log('Memory Usage:', testResults.memoryUsage);
    console.log('CPU Usage:', testResults.cpuUsage);
    console.log('Database Performance:', testResults.databasePerformance);
    console.log('Error Rates:', testResults.errorRates);
    
    // Calculate averages
    const avgResponseTime = testResults.apiResponseTimes.reduce((sum, result) => sum + result.responseTime, 0) / testResults.apiResponseTimes.length;
    const avgErrorRate = testResults.errorRates.reduce((sum, result) => sum + result.errorRate, 0) / testResults.errorRates.length;
    
    console.log('\n=== PERFORMANCE SUMMARY ===');
    console.log(`Average API Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Average Error Rate: ${avgErrorRate.toFixed(2)}%`);
    console.log(`Total Tests Run: ${testResults.apiResponseTimes.length + testResults.concurrentUsers.length + testResults.memoryUsage.length + testResults.cpuUsage.length + testResults.databasePerformance.length + testResults.errorRates.length}`);
  });
});
