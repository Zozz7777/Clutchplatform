import { test, expect } from '@playwright/test';

/**
 * 🧪 User Acceptance Testing (UAT) Suite for Clutch Platform
 * Comprehensive user journey testing and acceptance criteria validation
 */

test.describe('User Acceptance Testing - Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test.describe('UAT-001: User Registration and Onboarding', () => {
    test('should complete user registration flow successfully', async ({ page }) => {
      // Step 1: Navigate to registration page
      await page.click('[data-testid="register-link"]');
      await expect(page).toHaveURL('/register');

      // Step 2: Fill registration form with valid data
      await page.fill('[data-testid="email-input"]', 'newuser@clutch.com');
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!');
      await page.fill('[data-testid="full-name-input"]', 'New User');
      await page.fill('[data-testid="phone-input"]', '+1234567890');
      await page.selectOption('[data-testid="user-type-select"]', 'individual');

      // Step 3: Accept terms and conditions
      await page.check('[data-testid="terms-checkbox"]');
      await page.check('[data-testid="privacy-checkbox"]');

      // Step 4: Submit registration
      await page.click('[data-testid="register-button"]');
      
      // Step 5: Verify successful registration
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');

      // Step 6: Verify email verification prompt
      await expect(page.locator('[data-testid="email-verification-prompt"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-verification-prompt"]')).toContainText('Please check your email');

      // Step 7: Verify redirect to login page
      await page.click('[data-testid="go-to-login-button"]');
      await expect(page).toHaveURL('/login');
    });

    test('should handle registration validation errors', async ({ page }) => {
      await page.click('[data-testid="register-link"]');
      await expect(page).toHaveURL('/register');

      // Test empty form submission
      await page.click('[data-testid="register-button"]');
      
      // Verify validation errors
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');
      await expect(page.locator('[data-testid="name-error"]')).toContainText('Full name is required');

      // Test invalid email format
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="register-button"]');
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');

      // Test weak password
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', '123');
      await page.click('[data-testid="register-button"]');
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters');

      // Test password mismatch
      await page.fill('[data-testid="password-input"]', 'SecurePass123!');
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPass123!');
      await page.click('[data-testid="register-button"]');
      await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('Passwords do not match');
    });
  });

  test.describe('UAT-002: User Authentication and Session Management', () => {
    test('should complete login flow successfully', async ({ page }) => {
      // Step 1: Navigate to login page
      await page.click('[data-testid="login-link"]');
      await expect(page).toHaveURL('/login');

      // Step 2: Fill login form
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');

      // Step 3: Submit login
      await page.click('[data-testid="login-button"]');

      // Step 4: Verify successful login and redirect
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

      // Step 5: Verify user information is displayed
      await expect(page.locator('[data-testid="user-name"]')).toContainText('Admin User');
      await expect(page.locator('[data-testid="user-email"]')).toContainText('admin@clutch.com');

      // Step 6: Verify navigation menu is accessible
      await expect(page.locator('[data-testid="navigation-menu"]')).toBeVisible();
    });

    test('should handle login validation errors', async ({ page }) => {
      await page.click('[data-testid="login-link"]');
      await expect(page).toHaveURL('/login');

      // Test empty form submission
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');

      // Test invalid credentials
      await page.fill('[data-testid="email-input"]', 'wrong@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    });

    test('should handle session timeout', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');

      // Wait for dashboard to load
      await expect(page).toHaveURL('/dashboard');

      // Simulate session timeout (in real test, this would be configured)
      await page.waitForTimeout(30000); // 30 seconds

      // Try to access protected page
      await page.goto('/dashboard/users');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });
  });

  test.describe('UAT-003: Dashboard Navigation and User Experience', () => {
    test('should navigate through all main dashboard sections', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');

      // Wait for dashboard to load
      await expect(page).toHaveURL('/dashboard');

      // Test navigation to different sections
      const navigationItems = [
        { testId: 'nav-dashboard', expectedUrl: '/dashboard', expectedTitle: 'Dashboard' },
        { testId: 'nav-users', expectedUrl: '/dashboard/users', expectedTitle: 'Users Management' },
        { testId: 'nav-analytics', expectedUrl: '/dashboard/analytics', expectedTitle: 'Analytics' },
        { testId: 'nav-finance', expectedUrl: '/dashboard/finance', expectedTitle: 'Finance' },
        { testId: 'nav-hr', expectedUrl: '/dashboard/hr', expectedTitle: 'HR Management' },
        { testId: 'nav-settings', expectedUrl: '/dashboard/settings', expectedTitle: 'Settings' }
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
        
        // Verify loading states are handled
        await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
      }
    });

    test('should maintain user preferences and state', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');

      // Wait for dashboard to load
      await expect(page).toHaveURL('/dashboard');

      // Test theme switching
      await page.click('[data-testid="theme-toggle"]');
      await expect(page.locator('html')).toHaveClass(/dark/);

      // Navigate to another page
      await page.click('[data-testid="nav-users"]');
      await expect(page).toHaveURL('/dashboard/users');

      // Verify theme is maintained
      await expect(page.locator('html')).toHaveClass(/dark/);

      // Test language switching
      await page.click('[data-testid="language-toggle"]');
      await expect(page.locator('[data-testid="page-title"]')).toContainText('إدارة المستخدمين');

      // Navigate back to dashboard
      await page.click('[data-testid="nav-dashboard"]');
      await expect(page).toHaveURL('/dashboard');

      // Verify language is maintained
      await expect(page.locator('[data-testid="page-title"]')).toContainText('لوحة التحكم');
    });
  });

  test.describe('UAT-004: Data Management and CRUD Operations', () => {
    test('should complete user creation workflow', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');

      // Navigate to users page
      await page.click('[data-testid="nav-users"]');
      await expect(page).toHaveURL('/dashboard/users');

      // Click add new user button
      await page.click('[data-testid="add-user-button"]');
      await expect(page.locator('[data-testid="user-form-modal"]')).toBeVisible();

      // Fill user form
      await page.fill('[data-testid="user-name-input"]', 'John Doe');
      await page.fill('[data-testid="user-email-input"]', 'john.doe@example.com');
      await page.fill('[data-testid="user-phone-input"]', '+1234567890');
      await page.selectOption('[data-testid="user-role-select"]', 'manager');
      await page.selectOption('[data-testid="user-department-select"]', 'engineering');
      await page.fill('[data-testid="user-salary-input"]', '75000');

      // Submit form
      await page.click('[data-testid="submit-user-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('User created successfully');

      // Verify user appears in table
      await expect(page.locator('[data-testid="users-table"]')).toContainText('John Doe');
      await expect(page.locator('[data-testid="users-table"]')).toContainText('john.doe@example.com');
      await expect(page.locator('[data-testid="users-table"]')).toContainText('manager');
    });

    test('should complete user editing workflow', async ({ page }) => {
      // Login and navigate to users page
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-users"]');

      // Click edit button for first user
      await page.click('[data-testid="edit-user-button-1"]');
      await expect(page.locator('[data-testid="user-form-modal"]')).toBeVisible();

      // Update user information
      await page.fill('[data-testid="user-name-input"]', 'Jane Smith');
      await page.selectOption('[data-testid="user-role-select"]', 'admin');
      await page.fill('[data-testid="user-salary-input"]', '85000');

      // Submit form
      await page.click('[data-testid="submit-user-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('User updated successfully');

      // Verify changes in table
      await expect(page.locator('[data-testid="users-table"]')).toContainText('Jane Smith');
      await expect(page.locator('[data-testid="users-table"]')).toContainText('admin');
    });

    test('should complete user deletion workflow', async ({ page }) => {
      // Login and navigate to users page
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-users"]');

      // Click delete button for first user
      await page.click('[data-testid="delete-user-button-1"]');
      await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible();

      // Confirm deletion
      await page.click('[data-testid="confirm-delete-button"]');

      // Verify success message
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-toast"]')).toContainText('User deleted successfully');

      // Verify user is removed from table
      await expect(page.locator('[data-testid="users-table"]')).not.toContainText('User 1');
    });
  });

  test.describe('UAT-005: Search and Filtering Functionality', () => {
    test('should perform search operations successfully', async ({ page }) => {
      // Login and navigate to users page
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-users"]');

      // Test search by name
      await page.fill('[data-testid="search-input"]', 'John');
      await page.click('[data-testid="search-button"]');

      // Verify search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="users-table"]')).toContainText('John');

      // Test search by email
      await page.fill('[data-testid="search-input"]', 'john@example.com');
      await page.click('[data-testid="search-button"]');

      // Verify search results
      await expect(page.locator('[data-testid="users-table"]')).toContainText('john@example.com');

      // Test clear search
      await page.click('[data-testid="clear-search-button"]');
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    });

    test('should perform filtering operations successfully', async ({ page }) => {
      // Login and navigate to users page
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-users"]');

      // Test filter by role
      await page.selectOption('[data-testid="role-filter"]', 'admin');
      await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();

      // Test filter by department
      await page.selectOption('[data-testid="department-filter"]', 'engineering');
      await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();

      // Test filter by status
      await page.selectOption('[data-testid="status-filter"]', 'active');
      await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();

      // Test clear filters
      await page.click('[data-testid="clear-filters-button"]');
      await expect(page.locator('[data-testid="role-filter"]')).toHaveValue('');
      await expect(page.locator('[data-testid="department-filter"]')).toHaveValue('');
      await expect(page.locator('[data-testid="status-filter"]')).toHaveValue('');
    });
  });

  test.describe('UAT-006: Data Export and Reporting', () => {
    test('should export user data successfully', async ({ page }) => {
      // Login and navigate to users page
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-users"]');

      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-users-button"]');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/users-export-\d{4}-\d{2}-\d{2}\.(csv|xlsx)/);
    });

    test('should generate analytics reports successfully', async ({ page }) => {
      // Login and navigate to analytics page
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-analytics"]');

      // Select date range
      await page.click('[data-testid="date-range-button"]');
      await page.fill('[data-testid="start-date-input"]', '2024-01-01');
      await page.fill('[data-testid="end-date-input"]', '2024-12-31');
      await page.click('[data-testid="apply-date-filter"]');

      // Generate report
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="generate-report-button"]');
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/analytics-report-\d{4}-\d{2}-\d{2}\.(pdf|xlsx)/);
    });
  });

  test.describe('UAT-007: Mobile Responsiveness', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Login
      await page.click('[data-testid="login-link"]');
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
      await expect(page).toHaveURL('/dashboard/users');

      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-content"]')).toBeVisible();

      // Test mobile form interaction
      await page.click('[data-testid="add-user-button"]');
      await expect(page.locator('[data-testid="user-form-modal"]')).toBeVisible();

      // Verify mobile form is usable
      await page.fill('[data-testid="user-name-input"]', 'Mobile User');
      await page.fill('[data-testid="user-email-input"]', 'mobile@example.com');
      await page.selectOption('[data-testid="user-role-select"]', 'user');

      // Submit form
      await page.click('[data-testid="submit-user-button"]');

      // Verify success
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    });
  });

  test.describe('UAT-008: Error Handling and Recovery', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');

      // Simulate network error
      await page.route('**/api/v1/admin/users', route => route.abort());

      // Navigate to users page
      await page.click('[data-testid="nav-users"]');

      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load users');

      // Verify retry button is available
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

      // Test retry functionality
      await page.unroute('**/api/v1/admin/users');
      await page.click('[data-testid="retry-button"]');

      // Verify data loads after retry
      await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    });

    test('should handle form validation errors gracefully', async ({ page }) => {
      // Login and navigate to users page
      await page.click('[data-testid="login-link"]');
      await page.fill('[data-testid="email-input"]', 'admin@clutch.com');
      await page.fill('[data-testid="password-input"]', 'admin123');
      await page.click('[data-testid="login-button"]');
      await page.click('[data-testid="nav-users"]');

      // Click add user button
      await page.click('[data-testid="add-user-button"]');

      // Try to submit empty form
      await page.click('[data-testid="submit-user-button"]');

      // Verify validation errors
      await expect(page.locator('[data-testid="user-name-error"]')).toContainText('Name is required');
      await expect(page.locator('[data-testid="user-email-error"]')).toContainText('Email is required');
      await expect(page.locator('[data-testid="user-role-error"]')).toContainText('Role is required');

      // Fill form with invalid data
      await page.fill('[data-testid="user-name-input"]', 'a'); // Too short
      await page.fill('[data-testid="user-email-input"]', 'invalid-email');
      await page.click('[data-testid="submit-user-button"]');

      // Verify validation errors
      await expect(page.locator('[data-testid="user-name-error"]')).toContainText('Name must be at least 2 characters');
      await expect(page.locator('[data-testid="user-email-error"]')).toContainText('Invalid email format');
    });
  });
});
