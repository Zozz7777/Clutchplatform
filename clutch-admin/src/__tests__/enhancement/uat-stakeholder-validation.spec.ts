import { test, expect } from '@playwright/test';

test.describe('User Acceptance Testing - Stakeholder Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test environment
    await page.goto('/login');
    await page.fill('input[name="email"]', 'stakeholder@example.com');
    await page.fill('input[name="password"]', 'stakeholder123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard-consolidated');
  });

  describe('Business Stakeholder Scenarios', () => {
    test('UAT-001: Business Analyst - Dashboard Overview Validation', async ({ page }) => {
      // Business Analyst needs to see key business metrics
      await expect(page.locator('h1')).toContainText('Dashboard');
      
      // Verify key business metrics are displayed
      await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
      await expect(page.locator('[data-testid="active-sessions"]')).toBeVisible();
      await expect(page.locator('[data-testid="system-health"]')).toBeVisible();
      
      // Verify metrics are numeric and meaningful
      const totalUsers = await page.locator('[data-testid="total-users"]').textContent();
      expect(parseInt(totalUsers || '0')).toBeGreaterThan(0);
      
      const totalRevenue = await page.locator('[data-testid="total-revenue"]').textContent();
      expect(totalRevenue).toMatch(/\$[\d,]+/);
      
      // Verify charts are interactive
      await page.locator('[data-testid="revenue-chart"]').click();
      await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
    });

    test('UAT-002: Product Owner - User Management Workflow', async ({ page }) => {
      // Navigate to user management
      await page.click('text=Users');
      await expect(page).toHaveURL('/dashboard/users');
      
      // Verify user list is displayed
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-user-button"]')).toBeVisible();
      
      // Test user creation workflow
      await page.click('[data-testid="add-user-button"]');
      await expect(page.locator('[data-testid="user-form"]')).toBeVisible();
      
      // Fill user form
      await page.fill('input[name="name"]', 'UAT Test User');
      await page.fill('input[name="email"]', 'uat-test@example.com');
      await page.selectOption('select[name="role"]', 'user');
      
      // Submit form
      await page.click('button[type="submit"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      
      // Verify user appears in list
      await expect(page.locator('text=UAT Test User')).toBeVisible();
    });

    test('UAT-003: End User Representative - Mobile App Experience', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Verify mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Test mobile navigation items
      await page.click('[data-testid="mobile-menu-item-users"]');
      await expect(page).toHaveURL('/dashboard/users');
      
      // Verify mobile table responsiveness
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      
      // Test mobile form interaction
      await page.click('[data-testid="add-user-button"]');
      await expect(page.locator('[data-testid="user-form"]')).toBeVisible();
      
      // Verify form is mobile-friendly
      const formInputs = page.locator('[data-testid="user-form"] input');
      const inputCount = await formInputs.count();
      expect(inputCount).toBeGreaterThan(0);
    });

    test('UAT-004: Technical Lead - System Performance Validation', async ({ page }) => {
      // Test page load performance
      const startTime = Date.now();
      await page.goto('/dashboard/analytics');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
      
      // Verify analytics data loads
      await expect(page.locator('[data-testid="analytics-charts"]')).toBeVisible();
      
      // Test data refresh performance
      const refreshStartTime = Date.now();
      await page.click('[data-testid="refresh-data-button"]');
      await expect(page.locator('[data-testid="data-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="data-loading"]')).toBeHidden();
      const refreshTime = Date.now() - refreshStartTime;
      
      // Data refresh should complete within 1 second
      expect(refreshTime).toBeLessThan(1000);
    });

    test('UAT-005: Quality Assurance Lead - Error Handling Validation', async ({ page }) => {
      // Test form validation
      await page.click('text=Users');
      await page.click('[data-testid="add-user-button"]');
      
      // Submit empty form
      await page.click('button[type="submit"]');
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
      
      // Test invalid email
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      
      // Test network error handling
      await page.route('**/api/v1/admin/users', route => route.abort());
      await page.fill('input[name="email"]', 'test@example.com');
      await page.click('button[type="submit"]');
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    });
  });

  describe('User Journey Validation', () => {
    test('UAT-006: Complete User Onboarding Journey', async ({ page }) => {
      // Start from login
      await page.goto('/login');
      
      // Login process
      await page.fill('input[name="email"]', 'newuser@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Verify dashboard access
      await expect(page).toHaveURL('/dashboard-consolidated');
      await expect(page.locator('h1')).toContainText('Dashboard');
      
      // Navigate through main sections
      await page.click('text=Users');
      await expect(page).toHaveURL('/dashboard/users');
      
      await page.click('text=Analytics');
      await expect(page).toHaveURL('/dashboard/analytics');
      
      await page.click('text=Settings');
      await expect(page).toHaveURL('/dashboard/settings');
      
      // Verify user can access profile
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="profile-link"]');
      await expect(page.locator('[data-testid="profile-page"]')).toBeVisible();
    });

    test('UAT-007: Data Management Workflow', async ({ page }) => {
      // Navigate to users
      await page.click('text=Users');
      
      // Test search functionality
      await page.fill('[data-testid="search-input"]', 'test');
      await page.click('[data-testid="search-button"]');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      
      // Test filtering
      await page.selectOption('[data-testid="role-filter"]', 'admin');
      await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
      
      // Test sorting
      await page.click('[data-testid="sort-name"]');
      await expect(page.locator('[data-testid="sorted-results"]')).toBeVisible();
      
      // Test pagination
      await page.click('[data-testid="next-page"]');
      await expect(page.locator('[data-testid="page-2"]')).toBeVisible();
    });

    test('UAT-008: Reporting and Export Workflow', async ({ page }) => {
      // Navigate to analytics
      await page.click('text=Analytics');
      
      // Test report generation
      await page.click('[data-testid="generate-report-button"]');
      await expect(page.locator('[data-testid="report-modal"]')).toBeVisible();
      
      // Select report parameters
      await page.selectOption('[data-testid="report-type"]', 'user-activity');
      await page.fill('[data-testid="date-from"]', '2024-01-01');
      await page.fill('[data-testid="date-to"]', '2024-12-31');
      
      // Generate report
      await page.click('[data-testid="generate-button"]');
      await expect(page.locator('[data-testid="report-loading"]')).toBeVisible();
      await expect(page.locator('[data-testid="report-results"]')).toBeVisible();
      
      // Test export functionality
      await page.click('[data-testid="export-pdf-button"]');
      await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
      
      await page.click('[data-testid="export-csv-button"]');
      await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
    });
  });

  describe('Accessibility and Usability Validation', () => {
    test('UAT-009: Keyboard Navigation', async ({ page }) => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Navigate through main menu
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      // Verify navigation worked
      await expect(page.locator('[data-testid="users-page"]')).toBeVisible();
    });

    test('UAT-010: Screen Reader Compatibility', async ({ page }) => {
      // Verify ARIA labels
      await expect(page.locator('[aria-label="Main navigation"]')).toBeVisible();
      await expect(page.locator('[aria-label="User menu"]')).toBeVisible();
      
      // Verify heading structure
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h2')).toBeVisible();
      
      // Verify form labels
      await page.click('text=Users');
      await page.click('[data-testid="add-user-button"]');
      
      await expect(page.locator('label[for="name"]')).toBeVisible();
      await expect(page.locator('label[for="email"]')).toBeVisible();
    });

    test('UAT-011: Color and Contrast', async ({ page }) => {
      // Test theme toggle
      await page.click('[data-testid="theme-toggle"]');
      await expect(page.locator('html')).toHaveClass(/dark/);
      
      // Verify text is still readable
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('p')).toBeVisible();
      
      // Switch back to light theme
      await page.click('[data-testid="theme-toggle"]');
      await expect(page.locator('html')).toHaveClass(/light/);
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('UAT-012: Network Interruption Recovery', async ({ page }) => {
      // Start a form submission
      await page.click('text=Users');
      await page.click('[data-testid="add-user-button"]');
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      
      // Simulate network interruption
      await page.route('**/api/v1/admin/users', route => route.abort());
      await page.click('button[type="submit"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      
      // Restore network and retry
      await page.unroute('**/api/v1/admin/users');
      await page.click('[data-testid="retry-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    test('UAT-013: Session Timeout Handling', async ({ page }) => {
      // Simulate session timeout
      await page.evaluate(() => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('userSession');
      });
      
      // Try to access protected page
      await page.goto('/dashboard/users');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });

    test('UAT-014: Large Dataset Handling', async ({ page }) => {
      // Navigate to users page
      await page.click('text=Users');
      
      // Test with large dataset
      await page.selectOption('[data-testid="page-size"]', '100');
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
      
      // Verify pagination works
      await page.click('[data-testid="next-page"]');
      await expect(page.locator('[data-testid="page-2"]')).toBeVisible();
      
      // Test search with large dataset
      await page.fill('[data-testid="search-input"]', 'a');
      await page.click('[data-testid="search-button"]');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });
  });

  describe('Performance and Responsiveness', () => {
    test('UAT-015: Mobile Responsiveness', async ({ page }) => {
      // Test various mobile viewports
      const viewports = [
        { width: 375, height: 667 }, // iPhone SE
        { width: 414, height: 896 }, // iPhone 11 Pro Max
        { width: 360, height: 640 }, // Android
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        // Verify main navigation is accessible
        await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
        
        // Verify content is readable
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('p')).toBeVisible();
        
        // Verify forms are usable
        await page.click('text=Users');
        await page.click('[data-testid="add-user-button"]');
        await expect(page.locator('[data-testid="user-form"]')).toBeVisible();
        
        // Reset for next iteration
        await page.goBack();
        await page.goBack();
      }
    });

    test('UAT-016: Cross-Browser Compatibility', async ({ page }) => {
      // Test basic functionality across browsers
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();
      
      // Test form functionality
      await page.click('text=Users');
      await page.click('[data-testid="add-user-button"]');
      await expect(page.locator('[data-testid="user-form"]')).toBeVisible();
      
      // Test JavaScript functionality
      await page.click('[data-testid="theme-toggle"]');
      await expect(page.locator('html')).toHaveClass(/dark/);
    });
  });

  describe('Business Logic Validation', () => {
    test('UAT-017: User Role Management', async ({ page }) => {
      // Test role-based access
      await page.click('text=Users');
      
      // Create user with specific role
      await page.click('[data-testid="add-user-button"]');
      await page.fill('input[name="name"]', 'Role Test User');
      await page.fill('input[name="email"]', 'role-test@example.com');
      await page.selectOption('select[name="role"]', 'manager');
      await page.click('button[type="submit"]');
      
      // Verify user was created with correct role
      await expect(page.locator('text=Role Test User')).toBeVisible();
      await expect(page.locator('text=manager')).toBeVisible();
      
      // Test role change
      await page.click('[data-testid="edit-user-button"]');
      await page.selectOption('select[name="role"]', 'admin');
      await page.click('button[type="submit"]');
      
      // Verify role was updated
      await expect(page.locator('text=admin')).toBeVisible();
    });

    test('UAT-018: Data Validation and Business Rules', async ({ page }) => {
      // Test business rule validation
      await page.click('text=Users');
      await page.click('[data-testid="add-user-button"]');
      
      // Test duplicate email prevention
      await page.fill('input[name="name"]', 'Duplicate Test');
      await page.fill('input[name="email"]', 'existing@example.com');
      await page.click('button[type="submit"]');
      await expect(page.locator('[data-testid="duplicate-email-error"]')).toBeVisible();
      
      // Test required field validation
      await page.fill('input[name="email"]', '');
      await page.click('button[type="submit"]');
      await expect(page.locator('[data-testid="required-field-error"]')).toBeVisible();
    });
  });
});
