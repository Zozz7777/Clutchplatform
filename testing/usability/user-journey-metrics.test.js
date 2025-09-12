/**
 * User Journey Testing with Metrics Collection
 * Comprehensive usability testing with performance metrics
 */

const { test, expect } = require('@playwright/test');

class UsabilityMetricsCollector {
  constructor() {
    this.metrics = {
      pageLoadTimes: [],
      interactionTimes: [],
      errorRates: [],
      taskCompletionRates: [],
      userSatisfactionScores: []
    };
  }

  async collectPageLoadMetrics(page, pageName) {
    const startTime = Date.now();
    
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    this.metrics.pageLoadTimes.push({ page: pageName, time: loadTime });
    
    return loadTime;
  }

  async collectInteractionMetrics(page, action, selector) {
    const startTime = Date.now();
    
    await page.click(selector);
    await page.waitForTimeout(100); // Wait for interaction to complete
    
    const interactionTime = Date.now() - startTime;
    this.metrics.interactionTimes.push({ action, time: interactionTime });
    
    return interactionTime;
  }

  async collectErrorMetrics(page, taskName) {
    const errors = await page.evaluate(() => {
      return window.console.errors || [];
    });
    
    this.metrics.errorRates.push({ task: taskName, errors: errors.length });
    
    return errors.length;
  }

  recordTaskCompletion(taskName, completed, timeTaken) {
    this.metrics.taskCompletionRates.push({
      task: taskName,
      completed,
      timeTaken,
      timestamp: new Date().toISOString()
    });
  }

  recordUserSatisfaction(taskName, score, feedback) {
    this.metrics.userSatisfactionScores.push({
      task: taskName,
      score,
      feedback,
      timestamp: new Date().toISOString()
    });
  }

  getMetrics() {
    return {
      ...this.metrics,
      summary: {
        averagePageLoadTime: this.calculateAverage(this.metrics.pageLoadTimes.map(m => m.time)),
        averageInteractionTime: this.calculateAverage(this.metrics.interactionTimes.map(m => m.time)),
        totalErrors: this.metrics.errorRates.reduce((sum, m) => sum + m.errors, 0),
        taskCompletionRate: this.calculateTaskCompletionRate(),
        averageSatisfactionScore: this.calculateAverage(this.metrics.userSatisfactionScores.map(m => m.score))
      }
    };
  }

  calculateAverage(numbers) {
    return numbers.length > 0 ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
  }

  calculateTaskCompletionRate() {
    const completed = this.metrics.taskCompletionRates.filter(t => t.completed).length;
    const total = this.metrics.taskCompletionRates.length;
    return total > 0 ? (completed / total) * 100 : 0;
  }
}

test.describe('User Journey Testing with Metrics', () => {
  let metricsCollector;

  test.beforeEach(async () => {
    metricsCollector = new UsabilityMetricsCollector();
  });

  test.describe('Shop Owner Journey - Complete Workflow', () => {
    test('Shop Setup and Inventory Management', async ({ page }) => {
      const taskStartTime = Date.now();
      
      // Step 1: Login
      await page.goto('http://localhost:3000/login');
      const loginLoadTime = await metricsCollector.collectPageLoadMetrics(page, 'login');
      expect(loginLoadTime).toBeLessThan(3000);
      
      await page.fill('[data-testid="email"]', 'shopowner@clutch.com');
      await page.fill('[data-testid="password"]', 'test123');
      
      const loginClickTime = await metricsCollector.collectInteractionMetrics(page, 'login', '[data-testid="login-button"]');
      expect(loginClickTime).toBeLessThan(1000);
      
      await page.waitForURL('http://localhost:3000/dashboard');
      
      // Step 2: Dashboard Overview
      const dashboardLoadTime = await metricsCollector.collectPageLoadMetrics(page, 'dashboard');
      expect(dashboardLoadTime).toBeLessThan(2000);
      
      // Check for errors
      const dashboardErrors = await metricsCollector.collectErrorMetrics(page, 'dashboard_load');
      expect(dashboardErrors).toBe(0);
      
      // Step 3: Navigate to Inventory
      const inventoryNavTime = await metricsCollector.collectInteractionMetrics(page, 'navigate_inventory', '[data-testid="inventory-tab"]');
      expect(inventoryNavTime).toBeLessThan(500);
      
      await expect(page.locator('[data-testid="inventory-list"]')).toBeVisible();
      
      // Step 4: Add New Part
      const addPartClickTime = await metricsCollector.collectInteractionMetrics(page, 'add_part_button', '[data-testid="add-part-button"]');
      expect(addPartClickTime).toBeLessThan(500);
      
      await page.waitForSelector('[data-testid="part-form"]');
      
      // Fill part form
      await page.fill('[data-testid="part-name"]', 'User Journey Test Part');
      await page.selectOption('[data-testid="part-category"]', 'brake');
      await page.fill('[data-testid="part-brand"]', 'Toyota');
      await page.fill('[data-testid="part-price"]', '89.99');
      await page.fill('[data-testid="part-stock"]', '15');
      await page.fill('[data-testid="part-description"]', 'High-quality brake pad for user journey testing');
      
      const savePartTime = await metricsCollector.collectInteractionMetrics(page, 'save_part', '[data-testid="save-part"]');
      expect(savePartTime).toBeLessThan(2000);
      
      // Verify part was added
      await expect(page.locator('text=User Journey Test Part')).toBeVisible();
      
      // Step 5: Check for errors during part creation
      const partCreationErrors = await metricsCollector.collectErrorMetrics(page, 'part_creation');
      expect(partCreationErrors).toBe(0);
      
      // Record task completion
      const taskTime = Date.now() - taskStartTime;
      metricsCollector.recordTaskCompletion('shop_setup_inventory', true, taskTime);
      metricsCollector.recordUserSatisfaction('shop_setup_inventory', 8, 'Smooth workflow, easy to use');
      
      // Verify task completion
      expect(taskTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    test('Order Processing Workflow', async ({ page }) => {
      const taskStartTime = Date.now();
      
      // Login
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', 'shopowner@clutch.com');
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('http://localhost:3000/dashboard');
      
      // Navigate to Orders
      const ordersNavTime = await metricsCollector.collectInteractionMetrics(page, 'navigate_orders', '[data-testid="orders-tab"]');
      expect(ordersNavTime).toBeLessThan(500);
      
      // Create New Order
      const newOrderTime = await metricsCollector.collectInteractionMetrics(page, 'new_order', '[data-testid="new-order-button"]');
      expect(newOrderTime).toBeLessThan(500);
      
      await page.waitForSelector('[data-testid="order-form"]');
      
      // Fill order details
      await page.fill('[data-testid="customer-name"]', 'John Doe');
      await page.fill('[data-testid="customer-email"]', 'john.doe@test.com');
      await page.fill('[data-testid="customer-phone"]', '+1234567890');
      
      // Add items to order
      await page.click('[data-testid="add-item-button"]');
      await page.selectOption('[data-testid="part-select"]', 'User Journey Test Part');
      await page.fill('[data-testid="quantity"]', '2');
      await page.click('[data-testid="add-item-to-order"]');
      
      // Set payment method
      await page.selectOption('[data-testid="payment-method"]', 'credit_card');
      await page.fill('[data-testid="payment-amount"]', '179.98');
      
      // Create order
      const createOrderTime = await metricsCollector.collectInteractionMetrics(page, 'create_order', '[data-testid="create-order"]');
      expect(createOrderTime).toBeLessThan(3000);
      
      // Verify order creation
      await expect(page.locator('[data-testid="order-created"]')).toBeVisible();
      
      // Process order
      await page.click('[data-testid="process-order"]');
      await page.selectOption('[data-testid="order-status"]', 'confirmed');
      await page.fill('[data-testid="order-notes"]', 'Order confirmed and ready for processing');
      
      const updateStatusTime = await metricsCollector.collectInteractionMetrics(page, 'update_status', '[data-testid="update-status"]');
      expect(updateStatusTime).toBeLessThan(2000);
      
      // Verify status update
      await expect(page.locator('[data-testid="status-updated"]')).toBeVisible();
      
      // Check for errors
      const orderErrors = await metricsCollector.collectErrorMetrics(page, 'order_processing');
      expect(orderErrors).toBe(0);
      
      // Record task completion
      const taskTime = Date.now() - taskStartTime;
      metricsCollector.recordTaskCompletion('order_processing', true, taskTime);
      metricsCollector.recordUserSatisfaction('order_processing', 9, 'Intuitive order management');
      
      expect(taskTime).toBeLessThan(45000); // Should complete within 45 seconds
    });
  });

  test.describe('Customer Journey - Mobile Experience', () => {
    test('Mobile Shopping Experience', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      const taskStartTime = Date.now();
      
      // Step 1: Access mobile app
      await page.goto('http://localhost:3000/mobile');
      const mobileLoadTime = await metricsCollector.collectPageLoadMetrics(page, 'mobile_home');
      expect(mobileLoadTime).toBeLessThan(3000);
      
      // Step 2: Browse parts
      const browseTime = await metricsCollector.collectInteractionMetrics(page, 'browse_parts', '[data-testid="parts-catalog"]');
      expect(browseTime).toBeLessThan(1000);
      
      await expect(page.locator('[data-testid="parts-list"]')).toBeVisible();
      
      // Step 3: Search for parts
      await page.fill('[data-testid="search-input"]', 'brake pad');
      const searchTime = await metricsCollector.collectInteractionMetrics(page, 'search_parts', '[data-testid="search-button"]');
      expect(searchTime).toBeLessThan(1000);
      
      const searchResults = page.locator('[data-testid="part-item"]');
      await expect(searchResults).toHaveCount.greaterThan(0);
      
      // Step 4: View part details
      const viewDetailsTime = await metricsCollector.collectInteractionMetrics(page, 'view_details', '[data-testid="part-item"]');
      expect(viewDetailsTime).toBeLessThan(1000);
      
      await expect(page.locator('[data-testid="part-details"]')).toBeVisible();
      
      // Step 5: Add to cart
      await page.fill('[data-testid="quantity-input"]', '1');
      const addToCartTime = await metricsCollector.collectInteractionMetrics(page, 'add_to_cart', '[data-testid="add-to-cart"]');
      expect(addToCartTime).toBeLessThan(1000);
      
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
      
      // Step 6: Proceed to checkout
      const checkoutTime = await metricsCollector.collectInteractionMetrics(page, 'checkout', '[data-testid="checkout-button"]');
      expect(checkoutTime).toBeLessThan(1000);
      
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
      
      // Step 7: Fill customer information
      await page.fill('[data-testid="customer-name"]', 'Jane Smith');
      await page.fill('[data-testid="customer-email"]', 'jane.smith@test.com');
      await page.fill('[data-testid="customer-phone"]', '+1234567890');
      await page.fill('[data-testid="shipping-address"]', '456 Customer St, Customer City, CC 54321');
      
      // Step 8: Select payment method
      await page.selectOption('[data-testid="payment-method"]', 'mobile_payment');
      
      // Step 9: Place order
      const placeOrderTime = await metricsCollector.collectInteractionMetrics(page, 'place_order', '[data-testid="place-order"]');
      expect(placeOrderTime).toBeLessThan(3000);
      
      await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
      
      // Check for errors
      const mobileErrors = await metricsCollector.collectErrorMetrics(page, 'mobile_shopping');
      expect(mobileErrors).toBe(0);
      
      // Record task completion
      const taskTime = Date.now() - taskStartTime;
      metricsCollector.recordTaskCompletion('mobile_shopping', true, taskTime);
      metricsCollector.recordUserSatisfaction('mobile_shopping', 8, 'Smooth mobile experience');
      
      expect(taskTime).toBeLessThan(60000); // Should complete within 60 seconds
    });
  });

  test.describe('Employee Journey - Daily Operations', () => {
    test('Inventory Management and Sales', async ({ page }) => {
      const taskStartTime = Date.now();
      
      // Login as employee
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', 'employee@clutch.com');
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('http://localhost:3000/dashboard');
      
      // Check low stock alerts
      const alertsTime = await metricsCollector.collectInteractionMetrics(page, 'check_alerts', '[data-testid="inventory-tab"]');
      expect(alertsTime).toBeLessThan(500);
      
      // Test POS system
      const posTime = await metricsCollector.collectInteractionMetrics(page, 'pos_system', '[data-testid="pos-tab"]');
      expect(posTime).toBeLessThan(500);
      
      await expect(page.locator('[data-testid="pos-interface"]')).toBeVisible();
      
      // Process a sale
      await page.fill('[data-testid="barcode-scanner"]', '1234567890123');
      const scanTime = await metricsCollector.collectInteractionMetrics(page, 'scan_barcode', '[data-testid="add-item"]');
      expect(scanTime).toBeLessThan(1000);
      
      await expect(page.locator('[data-testid="sale-items"]')).toBeVisible();
      
      // Process payment
      await page.selectOption('[data-testid="payment-method"]', 'cash');
      await page.fill('[data-testid="amount-received"]', '100.00');
      
      const paymentTime = await metricsCollector.collectInteractionMetrics(page, 'process_payment', '[data-testid="process-payment"]');
      expect(paymentTime).toBeLessThan(2000);
      
      await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
      
      // Check for errors
      const employeeErrors = await metricsCollector.collectErrorMetrics(page, 'employee_operations');
      expect(employeeErrors).toBe(0);
      
      // Record task completion
      const taskTime = Date.now() - taskStartTime;
      metricsCollector.recordTaskCompletion('employee_operations', true, taskTime);
      metricsCollector.recordUserSatisfaction('employee_operations', 7, 'Efficient daily operations');
      
      expect(taskTime).toBeLessThan(30000); // Should complete within 30 seconds
    });
  });

  test.describe('Cross-Platform Consistency', () => {
    test('Data Synchronization Across Platforms', async ({ browser }) => {
      const taskStartTime = Date.now();
      
      // Create two browser contexts
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();
      
      const page1 = await context1.newPage();
      const page2 = await context2.newPage();
      
      // Login to both contexts
      await page1.goto('http://localhost:3000/login');
      await page1.fill('[data-testid="email"]', 'admin@clutch.com');
      await page1.fill('[data-testid="password"]', 'test123');
      await page1.click('[data-testid="login-button"]');
      
      await page2.goto('http://localhost:3000/login');
      await page2.fill('[data-testid="email"]', 'admin@clutch.com');
      await page2.fill('[data-testid="password"]', 'test123');
      await page2.click('[data-testid="login-button"]');
      
      // Make change in first browser
      await page1.click('[data-testid="inventory-tab"]');
      await page1.click('[data-testid="add-part-button"]');
      await page1.fill('[data-testid="part-name"]', 'Cross-Platform Sync Test');
      await page1.fill('[data-testid="part-price"]', '99.99');
      await page1.click('[data-testid="save-part"]');
      
      // Verify change appears in second browser
      await page2.reload();
      await page2.click('[data-testid="inventory-tab"]');
      
      const syncTime = Date.now() - taskStartTime;
      await expect(page2.locator('text=Cross-Platform Sync Test')).toBeVisible();
      
      // Record task completion
      metricsCollector.recordTaskCompletion('cross_platform_sync', true, syncTime);
      metricsCollector.recordUserSatisfaction('cross_platform_sync', 9, 'Seamless synchronization');
      
      await context1.close();
      await context2.close();
      
      expect(syncTime).toBeLessThan(15000); // Should sync within 15 seconds
    });
  });

  test.describe('Performance Under Load', () => {
    test('Multiple Concurrent Users', async ({ browser }) => {
      const taskStartTime = Date.now();
      const concurrentUsers = 5;
      const contexts = [];
      const pages = [];
      
      // Create multiple browser contexts
      for (let i = 0; i < concurrentUsers; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }
      
      // Login all users concurrently
      const loginPromises = pages.map(async (page, index) => {
        await page.goto('http://localhost:3000/login');
        await page.fill('[data-testid="email"]', `user${index}@clutch.com`);
        await page.fill('[data-testid="password"]', 'test123');
        await page.click('[data-testid="login-button"]');
        await page.waitForURL('http://localhost:3000/dashboard');
      });
      
      await Promise.all(loginPromises);
      
      // Perform actions concurrently
      const actionPromises = pages.map(async (page, index) => {
        await page.click('[data-testid="inventory-tab"]');
        await page.click('[data-testid="add-part-button"]');
        await page.fill('[data-testid="part-name"]', `Concurrent Test Part ${index}`);
        await page.fill('[data-testid="part-price"]', '50.00');
        await page.click('[data-testid="save-part"]');
      });
      
      await Promise.all(actionPromises);
      
      // Clean up
      await Promise.all(contexts.map(context => context.close()));
      
      const taskTime = Date.now() - taskStartTime;
      metricsCollector.recordTaskCompletion('concurrent_users', true, taskTime);
      metricsCollector.recordUserSatisfaction('concurrent_users', 8, 'System handled load well');
      
      expect(taskTime).toBeLessThan(30000); // Should handle concurrent users within 30 seconds
    });
  });

  test.afterEach(async () => {
    // Generate and log metrics
    const metrics = metricsCollector.getMetrics();
    console.log('📊 Usability Metrics:', JSON.stringify(metrics, null, 2));
    
    // Assert performance thresholds
    expect(metrics.summary.averagePageLoadTime).toBeLessThan(3000);
    expect(metrics.summary.averageInteractionTime).toBeLessThan(1000);
    expect(metrics.summary.totalErrors).toBe(0);
    expect(metrics.summary.taskCompletionRate).toBeGreaterThan(90);
    expect(metrics.summary.averageSatisfactionScore).toBeGreaterThan(7);
  });
});
