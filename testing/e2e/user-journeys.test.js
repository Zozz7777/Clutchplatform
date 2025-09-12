/**
 * End-to-End User Journey Tests
 * Tests complete user workflows across all platforms
 */

const { test, expect } = require('@playwright/test');

test.describe('User Journey Tests', () => {
  let testData;

  test.beforeAll(async () => {
    // Set up test data
    testData = await setupTestData();
  });

  test.describe('Shop Owner Journey', () => {
    test('Complete shop setup and inventory management', async ({ page }) => {
      // Step 1: Login to admin dashboard
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', testData.shopOwner.email);
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL('http://localhost:3000/dashboard');
      await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome back');

      // Step 2: Set up shop profile
      await page.click('[data-testid="shop-settings"]');
      await page.fill('[data-testid="shop-name"]', 'Test Auto Parts Shop');
      await page.selectOption('[data-testid="shop-type"]', 'auto_parts');
      await page.fill('[data-testid="shop-address"]', '123 Test Street, Test City, TS 12345');
      await page.fill('[data-testid="shop-phone"]', '+1234567890');
      await page.click('[data-testid="save-shop-settings"]');
      
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Shop settings updated');

      // Step 3: Add inventory items
      await page.click('[data-testid="inventory-tab"]');
      await page.click('[data-testid="add-part-button"]');
      
      await page.fill('[data-testid="part-name"]', 'Brake Pad Set');
      await page.selectOption('[data-testid="part-category"]', 'brake');
      await page.fill('[data-testid="part-brand"]', 'Toyota');
      await page.fill('[data-testid="part-number"]', 'BP001');
      await page.fill('[data-testid="part-price"]', '75.00');
      await page.fill('[data-testid="part-cost"]', '50.00');
      await page.fill('[data-testid="part-stock"]', '25');
      await page.fill('[data-testid="part-description"]', 'High-quality brake pad set for Toyota vehicles');
      await page.click('[data-testid="save-part"]');
      
      await expect(page.locator('[data-testid="part-added-success"]')).toContainText('Part added successfully');

      // Step 4: Verify inventory in desktop app
      // This would require launching the desktop app and checking inventory
      // For now, we'll verify via API
      const inventoryResponse = await page.request.get('http://localhost:5000/api/parts');
      expect(inventoryResponse.status()).toBe(200);
      
      const inventoryData = await inventoryResponse.json();
      const addedPart = inventoryData.parts.find(part => part.name === 'Brake Pad Set');
      expect(addedPart).toBeDefined();
      expect(addedPart.stock).toBe(25);
    });

    test('Order processing workflow', async ({ page }) => {
      // Step 1: Login as shop owner
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', testData.shopOwner.email);
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');

      // Step 2: Create new order
      await page.click('[data-testid="orders-tab"]');
      await page.click('[data-testid="new-order-button"]');
      
      // Add customer
      await page.fill('[data-testid="customer-name"]', 'John Doe');
      await page.fill('[data-testid="customer-email"]', 'john.doe@test.com');
      await page.fill('[data-testid="customer-phone"]', '+1234567890');
      
      // Add items to order
      await page.click('[data-testid="add-item-button"]');
      await page.selectOption('[data-testid="part-select"]', testData.partId);
      await page.fill('[data-testid="quantity"]', '2');
      await page.click('[data-testid="add-item-to-order"]');
      
      // Set payment method
      await page.selectOption('[data-testid="payment-method"]', 'credit_card');
      await page.fill('[data-testid="payment-amount"]', '150.00');
      
      // Create order
      await page.click('[data-testid="create-order"]');
      
      await expect(page.locator('[data-testid="order-created"]')).toContainText('Order created successfully');

      // Step 3: Process order
      await page.click('[data-testid="process-order"]');
      await page.selectOption('[data-testid="order-status"]', 'confirmed');
      await page.fill('[data-testid="order-notes"]', 'Order confirmed and ready for processing');
      await page.click('[data-testid="update-status"]');
      
      await expect(page.locator('[data-testid="status-updated"]')).toContainText('Order status updated');

      // Step 4: Complete order
      await page.selectOption('[data-testid="order-status"]', 'delivered');
      await page.fill('[data-testid="delivery-notes"]', 'Order delivered successfully');
      await page.click('[data-testid="complete-order"]');
      
      await expect(page.locator('[data-testid="order-completed"]')).toContainText('Order completed');
    });
  });

  test.describe('Customer Journey', () => {
    test('Mobile app shopping experience', async ({ page }) => {
      // Step 1: Open mobile app (simulated in browser)
      await page.goto('http://localhost:3000/mobile');
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size

      // Step 2: Browse parts
      await page.click('[data-testid="parts-catalog"]');
      await expect(page.locator('[data-testid="parts-list"]')).toBeVisible();
      
      // Search for specific part
      await page.fill('[data-testid="search-input"]', 'brake pad');
      await page.click('[data-testid="search-button"]');
      
      const searchResults = page.locator('[data-testid="part-item"]');
      await expect(searchResults).toHaveCount.greaterThan(0);

      // Step 3: View part details
      await searchResults.first().click();
      await expect(page.locator('[data-testid="part-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="part-name"]')).toContainText('Brake Pad');
      await expect(page.locator('[data-testid="part-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="part-stock"]')).toBeVisible();

      // Step 4: Add to cart
      await page.fill('[data-testid="quantity-input"]', '1');
      await page.click('[data-testid="add-to-cart"]');
      
      await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
      await expect(page.locator('[data-testid="add-to-cart-success"]')).toContainText('Added to cart');

      // Step 5: Proceed to checkout
      await page.click('[data-testid="cart-icon"]');
      await expect(page.locator('[data-testid="cart-items"]')).toBeVisible();
      
      await page.click('[data-testid="checkout-button"]');
      await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();

      // Step 6: Fill customer information
      await page.fill('[data-testid="customer-name"]', 'Jane Smith');
      await page.fill('[data-testid="customer-email"]', 'jane.smith@test.com');
      await page.fill('[data-testid="customer-phone"]', '+1234567890');
      await page.fill('[data-testid="shipping-address"]', '456 Customer St, Customer City, CC 54321');
      
      // Step 7: Select payment method
      await page.selectOption('[data-testid="payment-method"]', 'mobile_payment');
      
      // Step 8: Place order
      await page.click('[data-testid="place-order"]');
      
      await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
    });

    test('Order tracking and updates', async ({ page }) => {
      // Step 1: Login to mobile app
      await page.goto('http://localhost:3000/mobile/login');
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.fill('[data-testid="email"]', testData.customer.email);
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');

      // Step 2: View order history
      await page.click('[data-testid="orders-tab"]');
      await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
      
      const orderItems = page.locator('[data-testid="order-item"]');
      await expect(orderItems).toHaveCount.greaterThan(0);

      // Step 3: Track specific order
      await orderItems.first().click();
      await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-timeline"]')).toBeVisible();

      // Step 4: Receive notification (simulated)
      await page.click('[data-testid="notifications-tab"]');
      await expect(page.locator('[data-testid="notifications-list"]')).toBeVisible();
      
      const notifications = page.locator('[data-testid="notification-item"]');
      await expect(notifications).toHaveCount.greaterThan(0);
      
      // Check for order update notification
      const orderNotification = notifications.filter({ hasText: 'order' }).first();
      await expect(orderNotification).toBeVisible();
    });
  });

  test.describe('Employee Journey', () => {
    test('Inventory management and sales', async ({ page }) => {
      // Step 1: Login as employee
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', testData.employee.email);
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');

      // Step 2: Check low stock alerts
      await page.click('[data-testid="inventory-tab"]');
      await expect(page.locator('[data-testid="low-stock-alerts"]')).toBeVisible();
      
      const lowStockItems = page.locator('[data-testid="low-stock-item"]');
      if (await lowStockItems.count() > 0) {
        await lowStockItems.first().click();
        await expect(page.locator('[data-testid="reorder-form"]')).toBeVisible();
        
        // Place reorder
        await page.fill('[data-testid="reorder-quantity"]', '50');
        await page.click('[data-testid="place-reorder"]');
        await expect(page.locator('[data-testid="reorder-success"]')).toContainText('Reorder placed');
      }

      // Step 3: Process sales transaction
      await page.click('[data-testid="pos-tab"]');
      await expect(page.locator('[data-testid="pos-interface"]')).toBeVisible();
      
      // Add items to sale
      await page.fill('[data-testid="barcode-scanner"]', testData.partBarcode);
      await page.click('[data-testid="add-item"]');
      
      await expect(page.locator('[data-testid="sale-items"]')).toBeVisible();
      await expect(page.locator('[data-testid="sale-total"]')).toBeVisible();

      // Process payment
      await page.selectOption('[data-testid="payment-method"]', 'cash');
      await page.fill('[data-testid="amount-received"]', '100.00');
      await page.click('[data-testid="process-payment"]');
      
      await expect(page.locator('[data-testid="payment-success"]')).toContainText('Payment processed');
      await expect(page.locator('[data-testid="receipt"]')).toBeVisible();
    });
  });

  test.describe('Cross-Platform Synchronization', () => {
    test('Real-time data sync between platforms', async ({ page }) => {
      // Step 1: Make change in admin dashboard
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', testData.shopOwner.email);
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');

      await page.click('[data-testid="inventory-tab"]');
      await page.click('[data-testid="part-item"]');
      await page.fill('[data-testid="part-price"]', '85.00');
      await page.click('[data-testid="save-changes"]');

      // Step 2: Verify change in mobile app
      await page.goto('http://localhost:3000/mobile');
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('[data-testid="parts-catalog"]');
      await page.fill('[data-testid="search-input"]', testData.partName);
      await page.click('[data-testid="search-button"]');
      
      const updatedPrice = page.locator('[data-testid="part-price"]');
      await expect(updatedPrice).toContainText('85.00');

      // Step 3: Verify change in desktop app (via API)
      const apiResponse = await page.request.get(`http://localhost:5000/api/parts/${testData.partId}`);
      expect(apiResponse.status()).toBe(200);
      
      const partData = await apiResponse.json();
      expect(partData.part.price).toBe(85.00);
    });

    test('Order status updates across all platforms', async ({ page }) => {
      // Step 1: Create order in mobile app
      await page.goto('http://localhost:3000/mobile');
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('[data-testid="parts-catalog"]');
      await page.click('[data-testid="part-item"]');
      await page.click('[data-testid="add-to-cart"]');
      await page.click('[data-testid="checkout-button"]');
      
      // Fill order details
      await page.fill('[data-testid="customer-name"]', 'Test Customer');
      await page.fill('[data-testid="customer-email"]', 'test@customer.com');
      await page.selectOption('[data-testid="payment-method"]', 'credit_card');
      await page.click('[data-testid="place-order"]');
      
      const orderNumber = await page.locator('[data-testid="order-number"]').textContent();

      // Step 2: Update order status in admin dashboard
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', testData.shopOwner.email);
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');

      await page.click('[data-testid="orders-tab"]');
      await page.fill('[data-testid="order-search"]', orderNumber);
      await page.click('[data-testid="search-orders"]');
      
      await page.click('[data-testid="order-item"]');
      await page.selectOption('[data-testid="order-status"]', 'shipped');
      await page.fill('[data-testid="tracking-number"]', 'TRK123456789');
      await page.click('[data-testid="update-status"]');

      // Step 3: Verify status update in mobile app
      await page.goto('http://localhost:3000/mobile');
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.click('[data-testid="orders-tab"]');
      await page.fill('[data-testid="order-search"]', orderNumber);
      
      const orderStatus = page.locator('[data-testid="order-status"]');
      await expect(orderStatus).toContainText('shipped');
      
      const trackingNumber = page.locator('[data-testid="tracking-number"]');
      await expect(trackingNumber).toContainText('TRK123456789');
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('Network interruption recovery', async ({ page }) => {
      // Step 1: Start normal workflow
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', testData.shopOwner.email);
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');

      // Step 2: Simulate network interruption
      await page.context().setOffline(true);
      
      // Try to perform action
      await page.click('[data-testid="inventory-tab"]');
      await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

      // Step 3: Restore network connection
      await page.context().setOffline(false);
      
      // Verify recovery
      await page.reload();
      await expect(page.locator('[data-testid="inventory-list"]')).toBeVisible();
    });

    test('Data validation and error messages', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      await page.fill('[data-testid="email"]', testData.shopOwner.email);
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');

      // Test invalid data submission
      await page.click('[data-testid="add-part-button"]');
      await page.fill('[data-testid="part-name"]', ''); // Empty name
      await page.fill('[data-testid="part-price"]', '-10'); // Negative price
      await page.click('[data-testid="save-part"]');
      
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('Name is required');
      await expect(page.locator('[data-testid="validation-error"]')).toContainText('Price must be positive');
    });
  });
});

// Helper function to set up test data
async function setupTestData() {
  return {
    shopOwner: {
      email: 'shopowner@clutch.com',
      password: 'test123'
    },
    customer: {
      email: 'customer@clutch.com',
      password: 'test123'
    },
    employee: {
      email: 'employee@clutch.com',
      password: 'test123'
    },
    partId: 'mock_part_id',
    partName: 'Brake Pad Set',
    partBarcode: '1234567890123'
  };
}
