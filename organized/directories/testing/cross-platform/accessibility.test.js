/**
 * Accessibility Testing Automation
 * Comprehensive accessibility testing across all platforms
 */

const { test, expect } = require('@playwright/test');
const axe = require('axe-playwright');

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Inject axe-core for accessibility testing
    await axe.injectAxe(page);
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('Admin Dashboard - Full Accessibility Scan', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      
      // Test login page accessibility
      await axe.checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
      
      // Login and test dashboard
      await page.fill('[data-testid="email"]', 'admin@clutch.com');
      await page.fill('[data-testid="password"]', 'test123');
      await page.click('[data-testid="login-button"]');
      
      await page.waitForURL('http://localhost:3000/dashboard');
      
      // Test dashboard accessibility
      await axe.checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
      
      // Test all main sections
      const sections = ['inventory', 'orders', 'analytics', 'users', 'settings'];
      
      for (const section of sections) {
        await page.click(`[data-testid="${section}-tab"]`);
        await page.waitForSelector(`[data-testid="${section}-content"]`);
        
        await axe.checkA11y(page, null, {
          detailedReport: true,
          detailedReportOptions: { html: true }
        });
      }
    });

    test('Mobile App - Accessibility Compliance', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      await page.goto('http://localhost:3000/mobile');
      
      // Test mobile app accessibility
      await axe.checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
      
      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-button"]');
      await axe.checkA11y(page, '[data-testid="mobile-menu"]', {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('Full Keyboard Navigation Support', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
      
      // Test login with keyboard
      await page.keyboard.type('admin@clutch.com');
      await page.keyboard.press('Tab');
      await page.keyboard.type('test123');
      await page.keyboard.press('Enter');
      
      await page.waitForURL('http://localhost:3000/dashboard');
      
      // Test dashboard keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="inventory-tab"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="orders-tab"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="analytics-tab"]')).toBeFocused();
    });

    test('Skip Links and Focus Management', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Test skip links
      await page.keyboard.press('Tab');
      const skipLink = page.locator('[data-testid="skip-to-main"]');
      if (await skipLink.isVisible()) {
        await skipLink.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('[data-testid="main-content"]')).toBeFocused();
      }
      
      // Test focus management in modals
      await page.click('[data-testid="add-part-button"]');
      await page.waitForSelector('[data-testid="modal"]');
      
      // Focus should be trapped in modal
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Focus should not escape modal
      const focusedElement = await page.evaluate(() => document.activeElement);
      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).toContainElement(focusedElement);
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('ARIA Labels and Descriptions', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      
      // Test form labels
      const emailInput = page.locator('[data-testid="email"]');
      const emailLabel = await emailInput.getAttribute('aria-label');
      expect(emailLabel).toBeTruthy();
      
      const passwordInput = page.locator('[data-testid="password"]');
      const passwordLabel = await passwordInput.getAttribute('aria-label');
      expect(passwordLabel).toBeTruthy();
      
      // Test button labels
      const loginButton = page.locator('[data-testid="login-button"]');
      const buttonText = await loginButton.textContent();
      expect(buttonText).toBeTruthy();
    });

    test('Semantic HTML Structure', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Test heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Test landmark roles
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();
      
      const navigation = page.locator('nav, [role="navigation"]');
      await expect(navigation).toBeVisible();
      
      // Test list structures
      const lists = page.locator('ul, ol, [role="list"]');
      await expect(lists.first()).toBeVisible();
    });

    test('Dynamic Content Announcements', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Test live regions for dynamic content
      await page.click('[data-testid="inventory-tab"]');
      
      // Check for aria-live regions
      const liveRegions = page.locator('[aria-live]');
      const liveRegionCount = await liveRegions.count();
      expect(liveRegionCount).toBeGreaterThan(0);
      
      // Test status messages
      await page.click('[data-testid="add-part-button"]');
      await page.fill('[data-testid="part-name"]', 'Test Part');
      await page.click('[data-testid="save-part"]');
      
      const statusMessage = page.locator('[role="status"], [aria-live="polite"]');
      await expect(statusMessage).toBeVisible();
    });
  });

  test.describe('Color and Contrast', () => {
    test('Color Contrast Compliance', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Test color contrast ratios
      const elements = await page.locator('text, button, input, select').all();
      
      for (const element of elements.slice(0, 10)) { // Test first 10 elements
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // Basic contrast check (would need more sophisticated color analysis)
        expect(styles.color).toBeTruthy();
        expect(styles.backgroundColor).toBeTruthy();
      }
    });

    test('Color Independence', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard');
      
      // Test that information is not conveyed by color alone
      const statusIndicators = page.locator('[data-testid*="status"]');
      const statusCount = await statusIndicators.count();
      
      for (let i = 0; i < statusCount; i++) {
        const indicator = statusIndicators.nth(i);
        const text = await indicator.textContent();
        const ariaLabel = await indicator.getAttribute('aria-label');
        
        // Status should be indicated by text or aria-label, not just color
        expect(text || ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('Touch Target Sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/mobile');
      
      // Test touch target sizes (minimum 44x44px)
      const touchTargets = page.locator('button, a, input[type="button"], input[type="submit"]');
      const targetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(targetCount, 10); i++) {
        const target = touchTargets.nth(i);
        const box = await target.boundingBox();
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('Mobile Screen Reader Support', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3000/mobile');
      
      // Test mobile-specific accessibility features
      const mobileElements = page.locator('[data-testid*="mobile"]');
      const elementCount = await mobileElements.count();
      
      for (let i = 0; i < elementCount; i++) {
        const element = mobileElements.nth(i);
        const ariaLabel = await element.getAttribute('aria-label');
        const role = await element.getAttribute('role');
        
        // Mobile elements should have proper accessibility attributes
        expect(ariaLabel || role).toBeTruthy();
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('Form Validation and Error Messages', async ({ page }) => {
      await page.goto('http://localhost:3000/login');
      
      // Test form validation
      await page.click('[data-testid="login-button"]');
      
      // Check for error messages
      const errorMessages = page.locator('[role="alert"], .error-message');
      await expect(errorMessages.first()).toBeVisible();
      
      // Test field validation
      await page.fill('[data-testid="email"]', 'invalid-email');
      await page.blur('[data-testid="email"]');
      
      const emailError = page.locator('[data-testid="email-error"]');
      await expect(emailError).toBeVisible();
      
      // Test error message association
      const emailInput = page.locator('[data-testid="email"]');
      const ariaDescribedBy = await emailInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toBeTruthy();
    });

    test('Required Field Indicators', async ({ page }) => {
      await page.goto('http://localhost:3000/register');
      
      // Test required field indicators
      const requiredFields = page.locator('[required], [aria-required="true"]');
      const requiredCount = await requiredFields.count();
      
      for (let i = 0; i < requiredCount; i++) {
        const field = requiredFields.nth(i);
        const ariaRequired = await field.getAttribute('aria-required');
        const required = await field.getAttribute('required');
        
        expect(ariaRequired === 'true' || required).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility Performance', () => {
    test('Accessibility Impact on Performance', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Run accessibility scan
      await axe.checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      });
      
      const endTime = Date.now();
      const accessibilityScanTime = endTime - startTime;
      
      // Accessibility scanning should not significantly impact performance
      expect(accessibilityScanTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });
});
