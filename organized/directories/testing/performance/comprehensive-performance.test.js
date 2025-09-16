/**
 * Comprehensive Performance Testing
 * Tests performance across frontend, backend, database, and network
 */

const { test, expect } = require('@playwright/test');
const { performance } = require('perf_hooks');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      frontend: [],
      backend: [],
      database: [],
      network: []
    };
  }

  async measureFrontendPerformance(page, testName) {
    const startTime = performance.now();
    
    // Measure page load performance
    const navigationStart = await page.evaluate(() => performance.timing.navigationStart);
    const loadEventEnd = await page.evaluate(() => performance.timing.loadEventEnd);
    const domContentLoaded = await page.evaluate(() => performance.timing.domContentLoadedEventEnd);
    
    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            vitals.fid = entry.processingStart - entry.startTime;
          });
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
        
        setTimeout(() => resolve(vitals), 3000);
      });
    });
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    const frontendMetrics = {
      testName,
      totalTime,
      pageLoadTime: loadEventEnd - navigationStart,
      domContentLoadedTime: domContentLoaded - navigationStart,
      webVitals,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.frontend.push(frontendMetrics);
    return frontendMetrics;
  }

  async measureBackendPerformance(request, endpoint, method = 'GET', data = null) {
    const startTime = performance.now();
    
    try {
      const response = await request[method.toLowerCase()](endpoint, {
        data: data,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const backendMetrics = {
        endpoint,
        method,
        responseTime,
        status: response.status(),
        timestamp: new Date().toISOString()
      };
      
      this.metrics.backend.push(backendMetrics);
      return backendMetrics;
      
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      const backendMetrics = {
        endpoint,
        method,
        responseTime,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.metrics.backend.push(backendMetrics);
      return backendMetrics;
    }
  }

  async measureDatabasePerformance(request, operation, query) {
    const startTime = performance.now();
    
    try {
      const response = await request.post('http://localhost:5000/api/test/database', {
        data: { operation, query },
        headers: { 'Content-Type': 'application/json' }
      });
      
      const endTime = performance.now();
      const queryTime = endTime - startTime;
      
      const dbMetrics = {
        operation,
        query,
        queryTime,
        status: response.status(),
        timestamp: new Date().toISOString()
      };
      
      this.metrics.database.push(dbMetrics);
      return dbMetrics;
      
    } catch (error) {
      const endTime = performance.now();
      const queryTime = endTime - startTime;
      
      const dbMetrics = {
        operation,
        query,
        queryTime,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.metrics.database.push(dbMetrics);
      return dbMetrics;
    }
  }

  async measureNetworkPerformance(page, url) {
    const startTime = performance.now();
    
    // Measure network timing
    const networkTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        total: timing.responseEnd - timing.navigationStart
      };
    });
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    const networkMetrics = {
      url,
      totalTime,
      ...networkTiming,
      timestamp: new Date().toISOString()
    };
    
    this.metrics.network.push(networkMetrics);
    return networkMetrics;
  }

  getPerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        frontend: this.calculateFrontendSummary(),
        backend: this.calculateBackendSummary(),
        database: this.calculateDatabaseSummary(),
        network: this.calculateNetworkSummary()
      },
      details: this.metrics
    };
    
    return report;
  }

  calculateFrontendSummary() {
    const frontendMetrics = this.metrics.frontend;
    if (frontendMetrics.length === 0) return null;
    
    return {
      averagePageLoadTime: this.calculateAverage(frontendMetrics.map(m => m.pageLoadTime)),
      averageDomContentLoadedTime: this.calculateAverage(frontendMetrics.map(m => m.domContentLoadedTime)),
      averageLCP: this.calculateAverage(frontendMetrics.map(m => m.webVitals.lcp).filter(v => v)),
      averageFID: this.calculateAverage(frontendMetrics.map(m => m.webVitals.fid).filter(v => v)),
      averageCLS: this.calculateAverage(frontendMetrics.map(m => m.webVitals.cls).filter(v => v))
    };
  }

  calculateBackendSummary() {
    const backendMetrics = this.metrics.backend;
    if (backendMetrics.length === 0) return null;
    
    return {
      averageResponseTime: this.calculateAverage(backendMetrics.map(m => m.responseTime)),
      minResponseTime: Math.min(...backendMetrics.map(m => m.responseTime)),
      maxResponseTime: Math.max(...backendMetrics.map(m => m.responseTime)),
      successRate: (backendMetrics.filter(m => m.status < 400).length / backendMetrics.length) * 100
    };
  }

  calculateDatabaseSummary() {
    const dbMetrics = this.metrics.database;
    if (dbMetrics.length === 0) return null;
    
    return {
      averageQueryTime: this.calculateAverage(dbMetrics.map(m => m.queryTime)),
      minQueryTime: Math.min(...dbMetrics.map(m => m.queryTime)),
      maxQueryTime: Math.max(...dbMetrics.map(m => m.queryTime)),
      successRate: (dbMetrics.filter(m => !m.error).length / dbMetrics.length) * 100
    };
  }

  calculateNetworkSummary() {
    const networkMetrics = this.metrics.network;
    if (networkMetrics.length === 0) return null;
    
    return {
      averageDNSTime: this.calculateAverage(networkMetrics.map(m => m.dns)),
      averageTCPTime: this.calculateAverage(networkMetrics.map(m => m.tcp)),
      averageRequestTime: this.calculateAverage(networkMetrics.map(m => m.request)),
      averageResponseTime: this.calculateAverage(networkMetrics.map(m => m.response)),
      averageTotalTime: this.calculateAverage(networkMetrics.map(m => m.total))
    };
  }

  calculateAverage(numbers) {
    return numbers.length > 0 ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
  }
}

test.describe('Comprehensive Performance Testing', () => {
  let performanceMonitor;

  test.beforeEach(async () => {
    performanceMonitor = new PerformanceMonitor();
  });

  test.describe('Frontend Performance Testing', () => {
    test('Page Load Performance', async ({ page }) => {
      // Test main pages
      const pages = [
        { name: 'login', url: 'http://localhost:3000/login' },
        { name: 'dashboard', url: 'http://localhost:3000/dashboard' },
        { name: 'inventory', url: 'http://localhost:3000/inventory' },
        { name: 'orders', url: 'http://localhost:3000/orders' },
        { name: 'analytics', url: 'http://localhost:3000/analytics' }
      ];

      for (const pageInfo of pages) {
        await page.goto(pageInfo.url);
        const metrics = await performanceMonitor.measureFrontendPerformance(page, pageInfo.name);
        
        // Assert performance thresholds
        expect(metrics.pageLoadTime).toBeLessThan(3000); // 3 seconds
        expect(metrics.domContentLoadedTime).toBeLessThan(2000); // 2 seconds
        expect(metrics.webVitals.lcp).toBeLessThan(2500); // 2.5 seconds
        expect(metrics.webVitals.cls).toBeLessThan(0.1); // 0.1
      }
    });

    test('Mobile Performance', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      
      await page.goto('http://localhost:3000/mobile');
      const metrics = await performanceMonitor.measureFrontendPerformance(page, 'mobile_home');
      
      // Mobile should be optimized
      expect(metrics.pageLoadTime).toBeLessThan(4000); // 4 seconds for mobile
      expect(metrics.webVitals.lcp).toBeLessThan(3000); // 3 seconds for mobile
    });

    test('Large Dataset Performance', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', 'admin@clutch.com');
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('http://localhost:3000/dashboard');
      
      // Test with large dataset
      await page.click('[data-testid="inventory-tab"]');
      
      const startTime = performance.now();
      await page.waitForSelector('[data-testid="parts-list"]');
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('Memory Usage Performance', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Measure memory usage
      const memoryUsage = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (memoryUsage) {
        const memoryUsageMB = memoryUsage.usedJSHeapSize / 1024 / 1024;
        expect(memoryUsageMB).toBeLessThan(100); // Less than 100MB
      }
    });
  });

  test.describe('Backend Performance Testing', () => {
    test('API Response Times', async ({ request }) => {
      const endpoints = [
        { url: 'http://localhost:5000/api/users', method: 'GET' },
        { url: 'http://localhost:5000/api/parts', method: 'GET' },
        { url: 'http://localhost:5000/api/orders', method: 'GET' },
        { url: 'http://localhost:5000/api/analytics/sales', method: 'GET' }
      ];

      for (const endpoint of endpoints) {
        const metrics = await performanceMonitor.measureBackendPerformance(
          request, 
          endpoint.url, 
          endpoint.method
        );
        
        expect(metrics.responseTime).toBeLessThan(1000); // 1 second
        expect(metrics.status).toBeLessThan(500); // No server errors
      }
    });

    test('Database Query Performance', async ({ request }) => {
      const queries = [
        { operation: 'find', query: 'SELECT * FROM parts LIMIT 10' },
        { operation: 'aggregate', query: 'SELECT category, COUNT(*) FROM parts GROUP BY category' },
        { operation: 'join', query: 'SELECT p.*, o.total FROM parts p JOIN orders o ON p.id = o.part_id' },
        { operation: 'insert', query: 'INSERT INTO parts (name, price) VALUES (?, ?)' },
        { operation: 'update', query: 'UPDATE parts SET stock = ? WHERE id = ?' }
      ];

      for (const query of queries) {
        const metrics = await performanceMonitor.measureDatabasePerformance(
          request,
          query.operation,
          query.query
        );
        
        expect(metrics.queryTime).toBeLessThan(500); // 500ms
      }
    });

    test('Concurrent Request Performance', async ({ request }) => {
      const concurrentRequests = 10;
      const requests = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        requests.push(
          performanceMonitor.measureBackendPerformance(
            request,
            'http://localhost:5000/api/parts',
            'GET'
          )
        );
      }
      
      const results = await Promise.all(requests);
      
      // All requests should complete successfully
      for (const result of results) {
        expect(result.responseTime).toBeLessThan(2000); // 2 seconds under load
        expect(result.status).toBeLessThan(500);
      }
      
      // Calculate average response time
      const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      expect(averageResponseTime).toBeLessThan(1000); // Average under 1 second
    });
  });

  test.describe('Network Performance Testing', () => {
    test('Network Timing Analysis', async ({ page }) => {
      const urls = [
        'http://localhost:3000',
        'http://localhost:3000/login',
        'http://localhost:3000/dashboard',
        'http://localhost:5000/api/health'
      ];

      for (const url of urls) {
        await page.goto(url);
        const metrics = await performanceMonitor.measureNetworkPerformance(page, url);
        
        expect(metrics.dns).toBeLessThan(100); // DNS lookup under 100ms
        expect(metrics.tcp).toBeLessThan(200); // TCP connection under 200ms
        expect(metrics.request).toBeLessThan(500); // Request time under 500ms
        expect(metrics.response).toBeLessThan(1000); // Response time under 1 second
        expect(metrics.total).toBeLessThan(3000); // Total time under 3 seconds
      }
    });

    test('Slow Network Simulation', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        await route.continue();
      });
      
      const startTime = performance.now();
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(10000); // Should still load within 10 seconds on slow network
    });

    test('Offline/Online Performance', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Go offline
      await page.context().setOffline(true);
      
      const offlineStartTime = performance.now();
      await page.reload();
      const offlineEndTime = performance.now();
      
      // Should handle offline gracefully
      expect(offlineEndTime - offlineStartTime).toBeLessThan(5000);
      
      // Go back online
      await page.context().setOffline(false);
      
      const onlineStartTime = performance.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const onlineEndTime = performance.now();
      
      // Should recover quickly
      expect(onlineEndTime - onlineStartTime).toBeLessThan(3000);
    });
  });

  test.describe('End-to-End Performance Testing', () => {
    test('Complete User Journey Performance', async ({ page }) => {
      const journeyStartTime = performance.now();
      
      // Login
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', 'admin@clutch.com');
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('http://localhost:3000/dashboard');
      
      // Navigate to inventory
      await page.click('[data-testid="inventory-tab"]');
      await page.waitForSelector('[data-testid="parts-list"]');
      
      // Add a part
      await page.click('[data-testid="add-part-button"]');
      await page.fill('[data-testid="part-name"]', 'Performance Test Part');
      await page.fill('[data-testid="part-price"]', '99.99');
      await page.click('[data-testid="save-part"]');
      
      // Navigate to orders
      await page.click('[data-testid="orders-tab"]');
      await page.waitForSelector('[data-testid="orders-list"]');
      
      // Create an order
      await page.click('[data-testid="new-order-button"]');
      await page.fill('[data-testid="customer-name"]', 'Performance Test Customer');
      await page.click('[data-testid="create-order"]');
      
      const journeyEndTime = performance.now();
      const totalJourneyTime = journeyEndTime - journeyStartTime;
      
      expect(totalJourneyTime).toBeLessThan(30000); // Complete journey under 30 seconds
    });

    test('Cross-Platform Performance', async ({ browser }) => {
      const contexts = [];
      const pages = [];
      
      // Create multiple browser contexts
      for (let i = 0; i < 3; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }
      
      const startTime = performance.now();
      
      // Perform actions on all platforms simultaneously
      const actions = pages.map(async (page, index) => {
        await page.goto('http://localhost:3000/login');
        await page.fill('[data-testid="email"]', `user${index}@clutch.com`);
        await page.fill('[data-testid="password"]', 'test123');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('http://localhost:3000/dashboard');
      });
      
      await Promise.all(actions);
      
      const endTime = performance.now();
      const crossPlatformTime = endTime - startTime;
      
      // Clean up
      await Promise.all(contexts.map(context => context.close()));
      
      expect(crossPlatformTime).toBeLessThan(15000); // All platforms should load within 15 seconds
    });
  });

  test.afterEach(async () => {
    // Generate performance report
    const report = performanceMonitor.getPerformanceReport();
    console.log('📊 Performance Report:', JSON.stringify(report, null, 2));
    
    // Assert overall performance thresholds
    if (report.summary.frontend) {
      expect(report.summary.frontend.averagePageLoadTime).toBeLessThan(3000);
      expect(report.summary.frontend.averageLCP).toBeLessThan(2500);
    }
    
    if (report.summary.backend) {
      expect(report.summary.backend.averageResponseTime).toBeLessThan(1000);
      expect(report.summary.backend.successRate).toBeGreaterThan(95);
    }
    
    if (report.summary.database) {
      expect(report.summary.database.averageQueryTime).toBeLessThan(500);
      expect(report.summary.database.successRate).toBeGreaterThan(95);
    }
    
    if (report.summary.network) {
      expect(report.summary.network.averageTotalTime).toBeLessThan(3000);
    }
  });
});
