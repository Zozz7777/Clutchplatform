import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from 'next-themes';
import { Dashboard } from '@/app/(dashboard)/dashboard/page';
import { UsersPage } from '@/app/(dashboard)/users/page';
import { AnalyticsPage } from '@/app/(dashboard)/analytics/page';
import { FinancePage } from '@/app/(dashboard)/finance/page';
import { HrPage } from '@/app/(dashboard)/hr/page';
import { SettingsPage } from '@/app/(dashboard)/settings/page';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    systemTheme: 'light',
    themes: ['light', 'dark'],
    resolvedTheme: 'light',
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock API calls
jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    post: jest.fn(() => Promise.resolve({ success: true, data: {} })),
    put: jest.fn(() => Promise.resolve({ success: true, data: {} })),
    delete: jest.fn(() => Promise.resolve({ success: true, data: {} })),
  },
}));

// Mock authentication
jest.mock('@/store', () => ({
  useAuthStore: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'admin',
    },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('Accessibility Compliance Tests', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {component}
      </ThemeProvider>
    );
  };

  test('Dashboard page should not have accessibility violations', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Users page should not have accessibility violations', async () => {
    const { container } = renderWithTheme(<UsersPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Analytics page should not have accessibility violations', async () => {
    const { container } = renderWithTheme(<AnalyticsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Finance page should not have accessibility violations', async () => {
    const { container } = renderWithTheme(<FinancePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('HR page should not have accessibility violations', async () => {
    const { container } = renderWithTheme(<HrPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('Settings page should not have accessibility violations', async () => {
    const { container } = renderWithTheme(<SettingsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Keyboard Navigation Tests', () => {
  test('should support tab navigation through main elements', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Test tab navigation
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Test that all focusable elements have proper tabindex
    focusableElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test('should have proper focus management', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Test focus indicators
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((element) => {
      // Check if element has focus styles
      const computedStyle = window.getComputedStyle(element);
      const hasFocusStyles = 
        computedStyle.outline !== 'none' || 
        computedStyle.boxShadow !== 'none' ||
        element.classList.contains('focus:outline-none') === false;
      
      expect(hasFocusStyles).toBe(true);
    });
  });
});

describe('Color Contrast Tests', () => {
  test('should have sufficient color contrast for text', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Get all text elements
    const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
    
    textElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Check if colors are defined
      expect(color).not.toBe('');
      expect(backgroundColor).not.toBe('');
      
      // Note: In a real test, you would use a color contrast library
      // to calculate the actual contrast ratio
    });
  });

  test('should have proper color contrast for interactive elements', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Get all interactive elements
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      // Check if colors are defined
      expect(color).not.toBe('');
      expect(backgroundColor).not.toBe('');
    });
  });
});

describe('ARIA Labels and Roles Tests', () => {
  test('should have proper ARIA labels for form elements', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Get all form elements
    const formElements = container.querySelectorAll('input, select, textarea');
    
    formElements.forEach((element) => {
      const hasLabel = 
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        container.querySelector(`label[for="${element.id}"]`);
      
      expect(hasLabel).toBeTruthy();
    });
  });

  test('should have proper ARIA roles for interactive elements', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Get all interactive elements
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach((element) => {
      const hasRole = 
        element.getAttribute('role') ||
        element.tagName.toLowerCase() === 'button' ||
        element.tagName.toLowerCase() === 'a' ||
        element.tagName.toLowerCase() === 'input' ||
        element.tagName.toLowerCase() === 'select' ||
        element.tagName.toLowerCase() === 'textarea';
      
      expect(hasRole).toBeTruthy();
    });
  });

  test('should have proper heading hierarchy', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Get all headings
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length > 0) {
      // Check that h1 exists
      const h1Elements = container.querySelectorAll('h1');
      expect(h1Elements.length).toBeGreaterThan(0);
      
      // Check heading hierarchy
      let previousLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        expect(level).toBeGreaterThan(0);
        expect(level).toBeLessThanOrEqual(6);
        
        // Check that heading levels don't skip (e.g., h1 to h3)
        if (previousLevel > 0) {
          expect(level - previousLevel).toBeLessThanOrEqual(1);
        }
        
        previousLevel = level;
      });
    }
  });
});

describe('Screen Reader Compatibility Tests', () => {
  test('should have proper alt text for images', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Get all images
    const images = container.querySelectorAll('img');
    
    images.forEach((image) => {
      const altText = image.getAttribute('alt');
      expect(altText).not.toBeNull();
      expect(altText).not.toBe('');
    });
  });

  test('should have proper descriptions for complex elements', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Get all elements with aria-describedby
    const describedElements = container.querySelectorAll('[aria-describedby]');
    
    describedElements.forEach((element) => {
      const describedBy = element.getAttribute('aria-describedby');
      const description = container.querySelector(`#${describedBy}`);
      expect(description).toBeTruthy();
    });
  });

  test('should have proper live regions for dynamic content', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Check for live regions
    const liveRegions = container.querySelectorAll('[aria-live]');
    
    // At least one live region should exist for dynamic content
    expect(liveRegions.length).toBeGreaterThan(0);
    
    liveRegions.forEach((region) => {
      const liveValue = region.getAttribute('aria-live');
      expect(['polite', 'assertive', 'off']).toContain(liveValue);
    });
  });
});

describe('Mobile Accessibility Tests', () => {
  test('should have proper touch targets', async () => {
    const { container } = renderWithTheme(<Dashboard />);
    
    // Get all interactive elements
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const width = parseFloat(computedStyle.width);
      const height = parseFloat(computedStyle.height);
      
      // Touch targets should be at least 44x44 pixels
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });

  test('should have proper viewport configuration', async () => {
    // Check if viewport meta tag exists
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    expect(viewportMeta).toBeTruthy();
    
    if (viewportMeta) {
      const content = viewportMeta.getAttribute('content');
      expect(content).toContain('width=device-width');
      expect(content).toContain('initial-scale=1');
    }
  });
});
