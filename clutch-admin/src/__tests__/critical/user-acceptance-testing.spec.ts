import { test, expect } from '@playwright/test';

test.describe('Critical User Acceptance Testing - Stakeholder Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('https://clutch-main-nk7x.onrender.com');
  });

  test.describe('Business User Scenarios', () => {
    test('Admin should be able to manage users effectively', async ({ page }) => {
      // Login as admin
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      
      // Wait for dashboard to load
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
      
      // Navigate to users management
      await page.click('[data-testid="nav-users"]');
      await expect(page.locator('[data-testid="users-page"]')).toBeVisible();
      
      // Create a new user
      await page.click('[data-testid="create-user-button"]');
      await page.fill('[data-testid="user-name-input"]', 'John Doe');
      await page.fill('[data-testid="user-email-input"]', 'john.doe@example.com');
      await page.selectOption('[data-testid="user-role-select"]', 'user');
      await page.click('[data-testid="save-user-button"]');
      
      // Verify user was created
      await expect(page.locator('text=John Doe')).toBeVisible();
      await expect(page.locator('text=john.doe@example.com')).toBeVisible();
      
      // Edit the user
      await page.click('[data-testid="edit-user-button"]');
      await page.fill('[data-testid="user-name-input"]', 'John Smith');
      await page.click('[data-testid="save-user-button"]');
      
      // Verify user was updated
      await expect(page.locator('text=John Smith')).toBeVisible();
      
      // Delete the user
      await page.click('[data-testid="delete-user-button"]');
      await page.click('[data-testid="confirm-delete-button"]');
      
      // Verify user was deleted
      await expect(page.locator('text=John Smith')).not.toBeVisible();
    });

    test('Admin should be able to view comprehensive analytics', async ({ page }) => {
      // Login as admin
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to analytics
      await page.click('[data-testid="nav-analytics"]');
      await expect(page.locator('[data-testid="analytics-page"]')).toBeVisible();
      
      // Verify key metrics are displayed
      await expect(page.locator('[data-testid="total-users-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="revenue-metric"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-sessions-metric"]')).toBeVisible();
      
      // Verify charts are rendered
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible();
      
      // Test date range filtering
      await page.click('[data-testid="date-range-button"]');
      await page.click('[data-testid="last-30-days"]');
      
      // Verify data updates
      await expect(page.locator('[data-testid="analytics-data"]')).toBeVisible();
    });

    test('Admin should be able to manage system settings', async ({ page }) => {
      // Login as admin
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to settings
      await page.click('[data-testid="nav-settings"]');
      await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
      
      // Update general settings
      await page.fill('[data-testid="site-name-input"]', 'Clutch Platform Pro');
      await page.fill('[data-testid="site-description-input"]', 'Advanced auto parts management platform');
      await page.click('[data-testid="save-settings-button"]');
      
      // Verify settings were saved
      await expect(page.locator('text=Settings saved successfully')).toBeVisible();
      
      // Test security settings
      await page.click('[data-testid="security-tab"]');
      await page.check('[data-testid="two-factor-auth-checkbox"]');
      await page.fill('[data-testid="session-timeout-input"]', '30');
      await page.click('[data-testid="save-security-settings-button"]');
      
      // Verify security settings were saved
      await expect(page.locator('text=Security settings updated')).toBeVisible();
    });
  });

  test.describe('End User Scenarios', () => {
    test('Regular user should be able to view their profile', async ({ page }) => {
      // Login as regular user
      await page.fill('[data-testid="email-input"]', 'user@clutch.com');
      await page.fill('[data-testid="password-input"]', 'user123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to profile
      await page.click('[data-testid="nav-profile"]');
      await expect(page.locator('[data-testid="profile-page"]')).toBeVisible();
      
      // Verify profile information is displayed
      await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-role"]')).toBeVisible();
      
      // Update profile information
      await page.fill('[data-testid="profile-name-input"]', 'Jane Smith');
      await page.fill('[data-testid="profile-phone-input"]', '+1234567890');
      await page.click('[data-testid="save-profile-button"]');
      
      // Verify profile was updated
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    });

    test('Regular user should be able to change their password', async ({ page }) => {
      // Login as regular user
      await page.fill('[data-testid="email-input"]', 'user@clutch.com');
      await page.fill('[data-testid="password-input"]', 'user123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to security settings
      await page.click('[data-testid="nav-profile"]');
      await page.click('[data-testid="security-tab"]');
      
      // Change password
      await page.fill('[data-testid="current-password-input"]', 'user123');
      await page.fill('[data-testid="new-password-input"]', 'newpassword123');
      await page.fill('[data-testid="confirm-password-input"]', 'newpassword123');
      await page.click('[data-testid="change-password-button"]');
      
      // Verify password was changed
      await expect(page.locator('text=Password changed successfully')).toBeVisible();
    });

    test('Regular user should be able to view notifications', async ({ page }) => {
      // Login as regular user
      await page.fill('[data-testid="email-input"]', 'user@clutch.com');
      await page.fill('[data-testid="password-input"]', 'user123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to notifications
      await page.click('[data-testid="nav-notifications"]');
      await expect(page.locator('[data-testid="notifications-page"]')).toBeVisible();
      
      // Verify notifications are displayed
      await expect(page.locator('[data-testid="notification-list"]')).toBeVisible();
      
      // Mark notification as read
      await page.click('[data-testid="mark-read-button"]');
      
      // Verify notification was marked as read
      await expect(page.locator('[data-testid="notification-read"]')).toBeVisible();
    });
  });

  test.describe('Mobile User Scenarios', () => {
    test('Mobile user should be able to access all features', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Login as mobile user
      await page.fill('[data-testid="email-input"]', 'mobile@clutch.com');
      await page.fill('[data-testid="password-input"]', 'mobile123');
      await page.click('[data-testid="login-button"]');
      
      // Verify mobile navigation
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
      
      // Navigate to dashboard
      await page.click('[data-testid="mobile-nav-dashboard"]');
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-dashboard"]')).toBeVisible();
    });

    test('Mobile user should be able to use touch gestures', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Login as mobile user
      await page.fill('[data-testid="email-input"]', 'mobile@clutch.com');
      await page.fill('[data-testid="password-input"]', 'mobile123');
      await page.click('[data-testid="login-button"]');
      
      // Test swipe gestures
      await page.locator('[data-testid="swipeable-content"]').swipe('left');
      await expect(page.locator('[data-testid="next-content"]')).toBeVisible();
      
      // Test pinch to zoom
      await page.locator('[data-testid="zoomable-content"]').pinch(1.5);
      
      // Test pull to refresh
      await page.locator('[data-testid="refreshable-content"]').pull('down');
    });
  });

  test.describe('Partner User Scenarios', () => {
    test('Partner should be able to manage their inventory', async ({ page }) => {
      // Login as partner
      await page.fill('[data-testid="email-input"]', 'partner@clutch.com');
      await page.fill('[data-testid="password-input"]', 'partner123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to inventory
      await page.click('[data-testid="nav-inventory"]');
      await expect(page.locator('[data-testid="inventory-page"]')).toBeVisible();
      
      // Add new inventory item
      await page.click('[data-testid="add-inventory-button"]');
      await page.fill('[data-testid="part-name-input"]', 'Brake Pad Set');
      await page.fill('[data-testid="part-number-input"]', 'BP001');
      await page.fill('[data-testid="quantity-input"]', '100');
      await page.fill('[data-testid="price-input"]', '50.00');
      await page.click('[data-testid="save-inventory-button"]');
      
      // Verify inventory item was added
      await expect(page.locator('text=Brake Pad Set')).toBeVisible();
      await expect(page.locator('text=BP001')).toBeVisible();
      
      // Update inventory quantity
      await page.click('[data-testid="edit-inventory-button"]');
      await page.fill('[data-testid="quantity-input"]', '150');
      await page.click('[data-testid="save-inventory-button"]');
      
      // Verify quantity was updated
      await expect(page.locator('text=150')).toBeVisible();
    });

    test('Partner should be able to view order history', async ({ page }) => {
      // Login as partner
      await page.fill('[data-testid="email-input"]', 'partner@clutch.com');
      await page.fill('[data-testid="password-input"]', 'partner123');
      await page.click('[data-testid="login-button"]');
      
      // Navigate to orders
      await page.click('[data-testid="nav-orders"]');
      await expect(page.locator('[data-testid="orders-page"]')).toBeVisible();
      
      // Verify order history is displayed
      await expect(page.locator('[data-testid="order-list"]')).toBeVisible();
      
      // Filter orders by date
      await page.click('[data-testid="date-filter-button"]');
      await page.click('[data-testid="last-30-days"]');
      
      // Verify filtered orders
      await expect(page.locator('[data-testid="filtered-orders"]')).toBeVisible();
      
      // View order details
      await page.click('[data-testid="view-order-button"]');
      await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work correctly in Chrome', async ({ page }) => {
      // Test basic functionality in Chrome
      await page.goto('https://clutch-main-nk7x.onrender.com');
      await page.fill('[data-testid="email-input"]', 'test@clutch.com');
      await page.fill('[data-testid="password-input"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });

    test('should work correctly in Firefox', async ({ page }) => {
      // Test basic functionality in Firefox
      await page.goto('https://clutch-main-nk7x.onrender.com');
      await page.fill('[data-testid="email-input"]', 'test@clutch.com');
      await page.fill('[data-testid="password-input"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });

    test('should work correctly in Safari', async ({ page }) => {
      // Test basic functionality in Safari
      await page.goto('https://clutch-main-nk7x.onrender.com');
      await page.fill('[data-testid="email-input"]', 'test@clutch.com');
      await page.fill('[data-testid="password-input"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });
  });

  test.describe('Performance and Usability', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('https://clutch-main-nk7x.onrender.com');
      await page.fill('[data-testid="email-input"]', 'test@clutch.com');
      await page.fill('[data-testid="password-input"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should be responsive on different screen sizes', async ({ page }) => {
      // Test desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('https://clutch-main-nk7x.onrender.com');
      await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
      
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    });

    test('should handle errors gracefully', async ({ page }) => {
      // Test network error
      await page.route('**/api/v1/**', route => route.abort());
      
      await page.goto('https://clutch-main-nk7x.onrender.com');
      await page.fill('[data-testid="email-input"]', 'test@clutch.com');
      await page.fill('[data-testid="password-input"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('https://clutch-main-nk7x.onrender.com');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
      
      // Test Enter key
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('https://clutch-main-nk7x.onrender.com');
      
      // Check for ARIA labels
      await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="login-button"]')).toHaveAttribute('aria-label');
    });

    test('should have proper heading structure', async ({ page }) => {
      await page.goto('https://clutch-main-nk7x.onrender.com');
      
      // Check heading hierarchy
      const h1 = page.locator('h1');
      const h2 = page.locator('h2');
      
      await expect(h1).toHaveCount(1);
      await expect(h2).toHaveCount(0); // No h2 before h1
    });
  });
});
