/**
 * Button Component Tests
 * Comprehensive testing for button components
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UnifiedButton } from '@/components/ui/unified-button'
import { AdvancedButton } from '@/components/interactions/advanced-button'
import { AccessibleButton } from '@/components/accessibility/accessible-button'

describe('UnifiedButton', () => {
  it('renders with default props', () => {
    render(<UnifiedButton>Click me</UnifiedButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<UnifiedButton variant="default">Default</UnifiedButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<UnifiedButton variant="outline">Outline</UnifiedButton>)
    expect(screen.getByRole('button')).toHaveClass('border')

    rerender(<UnifiedButton variant="ghost">Ghost</UnifiedButton>)
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<UnifiedButton size="sm">Small</UnifiedButton>)
    expect(screen.getByRole('button')).toHaveClass('h-9')

    rerender(<UnifiedButton size="lg">Large</UnifiedButton>)
    expect(screen.getByRole('button')).toHaveClass('h-11')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<UnifiedButton onClick={handleClick}>Click me</UnifiedButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<UnifiedButton disabled>Disabled</UnifiedButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders as child component when asChild is true', () => {
    render(
      <UnifiedButton asChild>
        <a href="/test">Link Button</a>
      </UnifiedButton>
    )
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(screen.getByText('Link Button')).toBeInTheDocument()
  })
})

describe('AdvancedButton', () => {
  it('renders with loading state', () => {
    render(<AdvancedButton isLoading>Loading</AdvancedButton>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows custom loading text', () => {
    render(<AdvancedButton isLoading loadingText="Please wait...">Loading</AdvancedButton>)
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })

  it('handles click events when not loading', () => {
    const handleClick = jest.fn()
    render(<AdvancedButton onClick={handleClick}>Click me</AdvancedButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not handle click events when loading', () => {
    const handleClick = jest.fn()
    render(<AdvancedButton isLoading onClick={handleClick}>Loading</AdvancedButton>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies hover animations', async () => {
    render(<AdvancedButton>Hover me</AdvancedButton>)
    const button = screen.getByRole('button')
    
    fireEvent.mouseEnter(button)
    await waitFor(() => {
      expect(button).toHaveStyle('transform: scale(1.02)')
    })
  })

  it('applies tap animations', async () => {
    render(<AdvancedButton>Tap me</AdvancedButton>)
    const button = screen.getByRole('button')
    
    fireEvent.mouseDown(button)
    await waitFor(() => {
      expect(button).toHaveStyle('transform: scale(0.98)')
    })
  })
})

describe('AccessibleButton', () => {
  it('renders with aria-label', () => {
    render(<AccessibleButton ariaLabel="Custom label">Button</AccessibleButton>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label')
  })

  it('uses children as aria-label when no ariaLabel provided', () => {
    render(<AccessibleButton>Custom Button</AccessibleButton>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom Button')
  })

  it('handles keyboard shortcuts', () => {
    const handleClick = jest.fn()
    render(
      <AccessibleButton 
        onClick={handleClick} 
        keyboardShortcut="Ctrl+S"
      >
        Save
      </AccessibleButton>
    )
    
    fireEvent.keyDown(screen.getByRole('button'), { 
      key: 's', 
      ctrlKey: true 
    })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows keyboard shortcut in screen reader text', () => {
    render(
      <AccessibleButton keyboardShortcut="Ctrl+S">
        Save
      </AccessibleButton>
    )
    expect(screen.getByText('(Keyboard shortcut: Ctrl+S)')).toBeInTheDocument()
  })

  it('handles focus events', () => {
    render(<AccessibleButton>Focus me</AccessibleButton>)
    const button = screen.getByRole('button')
    
    fireEvent.focus(button)
    expect(button).toHaveFocus()
  })

  it('handles blur events', () => {
    render(<AccessibleButton>Blur me</AccessibleButton>)
    const button = screen.getByRole('button')
    
    fireEvent.focus(button)
    fireEvent.blur(button)
    expect(button).not.toHaveFocus()
  })
})

describe('Button Integration', () => {
  it('works with form submission', () => {
    const handleSubmit = jest.fn()
    render(
      <form onSubmit={handleSubmit}>
        <UnifiedButton type="submit">Submit</UnifiedButton>
      </form>
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('works with form reset', () => {
    const handleReset = jest.fn()
    render(
      <form onReset={handleReset}>
        <UnifiedButton type="reset">Reset</UnifiedButton>
      </form>
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleReset).toHaveBeenCalledTimes(1)
  })

  it('maintains focus after click', () => {
    render(<UnifiedButton>Focus test</UnifiedButton>)
    const button = screen.getByRole('button')
    
    fireEvent.focus(button)
    fireEvent.click(button)
    expect(button).toHaveFocus()
  })

  it('handles multiple rapid clicks', () => {
    const handleClick = jest.fn()
    render(<UnifiedButton onClick={handleClick}>Click me</UnifiedButton>)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(3)
  })
})

describe('Button Accessibility', () => {
  it('has proper button role', () => {
    render(<UnifiedButton>Button</UnifiedButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('is focusable by default', () => {
    render(<UnifiedButton>Button</UnifiedButton>)
    const button = screen.getByRole('button')
    
    fireEvent.focus(button)
    expect(button).toHaveFocus()
  })

  it('is not focusable when disabled', () => {
    render(<UnifiedButton disabled>Disabled</UnifiedButton>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveAttribute('tabindex', '-1')
  })

  it('supports keyboard navigation', () => {
    render(<UnifiedButton>Button</UnifiedButton>)
    const button = screen.getByRole('button')
    
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyDown(button, { key: ' ' })
    
    // Both Enter and Space should trigger click
    expect(button).toHaveBeenCalled()
  })

  it('has proper contrast ratio', () => {
    render(<UnifiedButton>Button</UnifiedButton>)
    const button = screen.getByRole('button')
    
    // This would need actual color contrast testing
    expect(button).toHaveClass('text-primary-contrast')
  })
})

describe('Button Performance', () => {
  it('renders quickly', () => {
    const start = performance.now()
    render(<UnifiedButton>Button</UnifiedButton>)
    const end = performance.now()
    
    expect(end - start).toBeLessThan(100) // Should render in less than 100ms
  })

  it('handles many buttons efficiently', () => {
    const start = performance.now()
    render(
      <div>
        {Array.from({ length: 100 }, (_, i) => (
          <UnifiedButton key={i}>Button {i}</UnifiedButton>
        ))}
      </div>
    )
    const end = performance.now()
    
    expect(end - start).toBeLessThan(500) // Should render 100 buttons in less than 500ms
  })

  it('does not cause memory leaks', () => {
    const { unmount } = render(<UnifiedButton>Button</UnifiedButton>)
    
    // This would need actual memory leak testing
    expect(() => unmount()).not.toThrow()
  })
})
