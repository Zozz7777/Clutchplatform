import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('Theme Toggle Regression Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      systemTheme: 'light',
      themes: ['light', 'dark'],
      resolvedTheme: 'light',
    });
  });

  test('should render theme toggle button', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /theme/i });
    expect(toggleButton).toBeInTheDocument();
  });

  test('should switch from light to dark theme', async () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      systemTheme: 'light',
      themes: ['light', 'dark'],
      resolvedTheme: 'light',
    });

    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /theme/i });
    fireEvent.click(toggleButton);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  test('should switch from dark to light theme', async () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      systemTheme: 'dark',
      themes: ['light', 'dark'],
      resolvedTheme: 'dark',
    });

    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /theme/i });
    fireEvent.click(toggleButton);
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  test('should display correct icon for light theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      systemTheme: 'light',
      themes: ['light', 'dark'],
      resolvedTheme: 'light',
    });

    render(<ThemeToggle />);
    
    // Should show moon icon for light theme (to switch to dark)
    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
  });

  test('should display correct icon for dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      systemTheme: 'dark',
      themes: ['light', 'dark'],
      resolvedTheme: 'dark',
    });

    render(<ThemeToggle />);
    
    // Should show sun icon for dark theme (to switch to light)
    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
  });

  test('should handle theme switching without errors', async () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      systemTheme: 'light',
      themes: ['light', 'dark'],
      resolvedTheme: 'light',
    });

    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /theme/i });
    
    // Multiple rapid clicks should not cause errors
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
    
    expect(mockSetTheme).toHaveBeenCalledTimes(3);
  });

  test('should maintain accessibility attributes', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /theme/i });
    
    expect(toggleButton).toHaveAttribute('aria-label');
    expect(toggleButton).toHaveAttribute('title');
    expect(toggleButton).toHaveAttribute('type', 'button');
  });

  test('should handle keyboard navigation', () => {
    const mockSetTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      systemTheme: 'light',
      themes: ['light', 'dark'],
      resolvedTheme: 'light',
    });

    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /theme/i });
    
    // Focus the button
    toggleButton.focus();
    expect(toggleButton).toHaveFocus();
    
    // Press Enter key
    fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    
    // Press Space key
    fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space' });
    expect(mockSetTheme).toHaveBeenCalledTimes(2);
  });
});
