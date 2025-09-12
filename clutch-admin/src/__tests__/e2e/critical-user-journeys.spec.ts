import { test, expect } from '@playwright/test';

/**
 * Critical User Journey Tests
 * Tests the most important user workflows in the Clutch Admin platform
 */

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should complete user registration and login flow', async ({ page }) => {
    // 1. Navigate to registration page
    await page.click('[data-testid="register-link"]');
    await expect(page).toHaveURL('/register');

    // 2. Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@clutch.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="full-name-input"]', 'Test User');
    await page.fill('[data-testid="phone-input"]', '+1234567890');

    // 3. Submit registration
    await page.click('[data-testid="register-button"]');
    
    // 4. Verify successful registration
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');

    // 5. Navigate to login
    await page.click('[data-testid="login-link"]');
    await expect(page).toHaveURL('/login');

    // 6. Fill login form
    await page.fill('[data-testid="email-input"]', 'test@clutch.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');

    // 7. Submit login
    await page.click('[data-testid="login-button"]');

    // 8. Verify successful login and redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should navigate through main dashboard sections', async ({ page }) => {
    // Login first (assuming user is already registered)
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();

    // Test navigation to different sections
    const navigationItems = [
      { testId: 'nav-users', expectedUrl: '/users', expectedTitle: 'Users Management' },
      { testId: 'nav-analytics', expectedUrl: '/analytics', expectedTitle: 'Analytics' },
      { testId: 'nav-finance', expectedUrl: '/finance', expectedTitle: 'Finance' },
      { testId: 'nav-hr', expectedUrl: '/hr', expectedTitle: 'HR Management' },
      { testId: 'nav-settings', expectedUrl: '/settings', expectedTitle: 'Settings' }
    ];

    for (const item of navigationItems) {
      // Click navigation item
      await page.click(`[data-testid="${item.testId}"]`);
      
      // Verify URL change
      await expect(page).toHaveURL(item.expectedUrl);
      
      // Verify page content loads
      await expect(page.locator('[data-testid="page-title"]')).toContainText(item.expectedTitle);
      
      // Verify main content is visible
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    }
  });

  test('should perform data entry and form submission', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Navigate to users management
    await page.click('[data-testid="nav-users"]');
    await expect(page).toHaveURL('/users');

    // Click add new user button
    await page.click('[data-testid="add-user-button"]');
    await expect(page.locator('[data-testid="user-form-modal"]')).toBeVisible();

    // Fill user form
    await page.fill('[data-testid="user-name-input"]', 'John Doe');
    await page.fill('[data-testid="user-email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="user-phone-input"]', '+1234567890');
    await page.selectOption('[data-testid="user-role-select"]', 'manager');
    await page.selectOption('[data-testid="user-department-select"]', 'engineering');

    // Submit form
    await page.click('[data-testid="submit-user-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('User created successfully');

    // Verify user appears in table
    await expect(page.locator('[data-testid="users-table"]')).toContainText('John Doe');
    await expect(page.locator('[data-testid="users-table"]')).toContainText('john.doe@example.com');
  });

  test('should perform search and filtering operations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Navigate to analytics
    await page.click('[data-testid="nav-analytics"]');
    await expect(page).toHaveURL('/analytics');

    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'revenue');
    await page.click('[data-testid="search-button"]');

    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-results"]')).toContainText('revenue');

    // Test date range filter
    await page.click('[data-testid="date-filter-button"]');
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-12-31');
    await page.click('[data-testid="apply-filter-button"]');

    // Verify filtered results
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
  });

  test('should export data successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Navigate to finance
    await page.click('[data-testid="nav-finance"]');
    await expect(page).toHaveURL('/finance');

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toMatch(/finance-report-\d{4}-\d{2}-\d{2}\.(csv|xlsx)/);
  });

  test('should handle theme switching', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');

    // Test theme toggle
    await page.click('[data-testid="theme-toggle"]');
    
    // Verify dark theme is applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle back to light theme
    await page.click('[data-testid="theme-toggle"]');
    
    // Verify light theme is applied
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');

    // Verify mobile navigation is visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();

    // Test mobile navigation
    await page.click('[data-testid="mobile-nav-users"]');
    await expect(page).toHaveURL('/users');

    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-content"]')).toBeVisible();
  });
});
