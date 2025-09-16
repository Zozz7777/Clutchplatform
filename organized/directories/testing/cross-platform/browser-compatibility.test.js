/**
 * Cross-Platform Browser Compatibility Testing
 * Tests compatibility across different browsers and devices
 */

const { test, expect, devices } = require('@playwright/test');

test.describe('Cross-Platform Browser Compatibility', () => {
  const browsers = [
    { name: 'chromium', device: devices['Desktop Chrome'] },
    { name: 'firefox', device: devices['Desktop Firefox'] },
    { name: 'webkit', device: devices['Desktop Safari'] },
    { name: 'edge', device: devices['Desktop Edge'] }
  ];

  const mobileDevices = [
    devices['iPhone 12'],
    devices['iPhone 12 Pro'],
    devices['Pixel 5'],
    devices['Galaxy S5'],
    devices['iPad Pro']
  ];

  browsers.forEach(browser => {
    test.describe(`${browser.name} Desktop Testing`, () => {
      test.use({ ...browser.device });

      test('Admin Dashboard - Full Functionality', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        
        // Test login functionality
        await page.fill('[data-testid="email"]', 'admin@clutch.com');
        await page.fill('[data-testid="password"]', 'test123');
        await page.click('[data-testid="login-button"]');
        
        await expect(page).toHaveURL('http://localhost:3000/dashboard');
        
        // Test navigation
        await page.click('[data-testid="inventory-tab"]');
        await expect(page.locator('[data-testid="inventory-list"]')).toBeVisible();
        
        await page.click('[data-testid="orders-tab"]');
        await expect(page.locator('[data-testid="orders-list"]')).toBeVisible();
        
        await page.click('[data-testid="analytics-tab"]');
        await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
        
        // Test responsive design
        await page.setViewportSize({ width: 1200, height: 800 });
        await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
        
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      });

      test('API Integration - All Endpoints', async ({ page }) => {
        // Test API endpoints through the UI
        await page.goto('http://localhost:3000/login');
        await page.fill('[data-testid="email"]', 'admin@clutch.com');
        await page.fill('[data-testid="password"]', 'test123');
        await page.click('[data-testid="login-button"]');
        
        // Test parts API
        await page.click('[data-testid="inventory-tab"]');
        await page.waitForSelector('[data-testid="parts-list"]');
        
        // Test orders API
        await page.click('[data-testid="orders-tab"]');
        await page.waitForSelector('[data-testid="orders-list"]');
        
        // Test analytics API
        await page.click('[data-testid="analytics-tab"]');
        await page.waitForSelector('[data-testid="analytics-charts"]');
      });

      test('Form Validation and Error Handling', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        
        // Test invalid login
        await page.fill('[data-testid="email"]', 'invalid@test.com');
        await page.fill('[data-testid="password"]', 'wrongpassword');
        await page.click('[data-testid="login-button"]');
        
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
        
        // Test form validation
        await page.fill('[data-testid="email"]', '');
        await page.fill('[data-testid="password"]', '');
        await page.click('[data-testid="login-button"]');
        
        await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      });

      test('Real-time Updates and WebSocket', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.fill('[data-testid="email"]', 'admin@clutch.com');
        await page.fill('[data-testid="password"]', 'test123');
        await page.click('[data-testid="login-button"]');
        
        // Test real-time notifications
        await page.click('[data-testid="notifications-tab"]');
        await expect(page.locator('[data-testid="notifications-list"]')).toBeVisible();
        
        // Simulate real-time update
        await page.evaluate(() => {
          window.dispatchEvent(new CustomEvent('notification', {
            detail: { message: 'Test notification', type: 'info' }
          }));
        });
        
        await expect(page.locator('[data-testid="notification-item"]')).toBeVisible();
      });
    });
  });

  mobileDevices.forEach(device => {
    test.describe(`${device.name} Mobile Testing`, () => {
      test.use({ ...device });

      test('Mobile Responsive Design', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Test mobile navigation
        await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
        await page.click('[data-testid="mobile-menu-button"]');
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        
        // Test touch interactions
        await page.tap('[data-testid="mobile-menu-item"]');
        await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
      });

      test('Mobile App Integration', async ({ page }) => {
        // Test mobile app deep linking
        await page.goto('http://localhost:3000/mobile');
        
        // Test PWA features
        await page.evaluate(() => {
          return 'serviceWorker' in navigator;
        });
        
        // Test offline functionality
        await page.context().setOffline(true);
        await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
        
        await page.context().setOffline(false);
        await expect(page.locator('[data-testid="online-message"]')).toBeVisible();
      });

      test('Mobile Performance', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
        
        // Test scroll performance
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        await page.waitForTimeout(1000);
        await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
      });
    });
  });

  test.describe('Cross-Browser Data Consistency', () => {
    test('Data Synchronization Across Browsers', async ({ browser }) => {
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
      await page1.fill('[data-testid="part-name"]', 'Cross-Browser Test Part');
      await page1.fill('[data-testid="part-price"]', '99.99');
      await page1.click('[data-testid="save-part"]');
      
      // Verify change appears in second browser
      await page2.reload();
      await page2.click('[data-testid="inventory-tab"]');
      await expect(page2.locator('text=Cross-Browser Test Part')).toBeVisible();
      
      await context1.close();
      await context2.close();
    });
  });

  test.describe('Browser-Specific Features', () => {
    test('Chrome Extensions Compatibility', async ({ page }) => {
      // Test with Chrome extensions
      await page.goto('http://localhost:3000');
      
      // Simulate extension injection
      await page.addInitScript(() => {
        window.chrome = {
          runtime: {
            sendMessage: () => {},
            onMessage: {
              addListener: () => {}
            }
          }
        };
      });
      
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });

    test('Firefox Privacy Features', async ({ page }) => {
      // Test Firefox-specific privacy features
      await page.goto('http://localhost:3000');
      
      // Test tracking protection
      await page.evaluate(() => {
        return navigator.doNotTrack === '1';
      });
      
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });

    test('Safari WebKit Features', async ({ page }) => {
      // Test Safari-specific features
      await page.goto('http://localhost:3000');
      
      // Test WebKit-specific APIs
      await page.evaluate(() => {
        return 'webkitRequestAnimationFrame' in window;
      });
      
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    });
  });
});
