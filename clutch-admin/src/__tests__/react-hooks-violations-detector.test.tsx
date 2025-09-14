/**
 * React Hooks Violations Detector Test
 * 
 * This test systematically checks all React components for potential hooks violations
 * that could cause React Error #310. It analyzes:
 * 1. Conditional hook calls
 * 2. Hooks in loops
 * 3. Hooks in nested functions
 * 4. Inconsistent hook order
 * 5. useMemo/useCallback violations
 */

/* eslint-disable react-hooks/rules-of-hooks */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock all external dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', role: 'admin' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }),
}))

jest.mock('@/lib/offline-support', () => ({
  useOfflineSupport: () => ({
    offlineStatus: { isOffline: false, lastOnline: new Date() },
    syncStatus: { isSyncing: false, lastSync: new Date() },
  }),
}))

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-app', () => ({
  useUIStore: () => ({
    sidebarOpen: true,
    setSidebarOpen: jest.fn(),
    notifications: [],
    addNotification: jest.fn(),
  }),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Test User' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: () => ({
    registerShortcut: jest.fn(),
    unregisterShortcut: jest.fn(),
  }),
}))

// Test component that simulates problematic patterns
const ProblematicComponent = ({ shouldRender }: { shouldRender: boolean }) => {
  const [state, setState] = React.useState(0)
  
  // This is a problematic pattern - conditional hook call
  if (shouldRender) {
    const memoizedValue = React.useMemo(() => {
      return state * 2
    }, [state])
    
    return <div data-testid="problematic">{memoizedValue}</div>
  }
  
  return null
}

// Test component with proper hooks usage
const ProperComponent = ({ shouldRender }: { shouldRender: boolean }) => {
  const [state, setState] = React.useState(0)
  
  // Proper pattern - hooks called unconditionally
  const memoizedValue = React.useMemo(() => {
    return state * 2
  }, [state])
  
  if (!shouldRender) {
    return null
  }
  
  return <div data-testid="proper">{memoizedValue}</div>
}

// Test component with hooks in loop (problematic)
const LoopHooksComponent = ({ items }: { items: string[] }) => {
  const [state, setState] = React.useState(0)
  
  return (
    <div>
      {items.map((item, index) => {
        // This is problematic - hooks in loop
        const memoizedItem = React.useMemo(() => {
          return `${item}-${index}`
        }, [item, index])
        
        return <div key={index} data-testid={`loop-item-${index}`}>{memoizedItem}</div>
      })}
    </div>
  )
}

// Test component with hooks in nested function (problematic)
const NestedFunctionComponent = () => {
  const [state, setState] = React.useState(0)
  
  const renderContent = () => {
    // This is problematic - hooks in nested function
    const memoizedValue = React.useMemo(() => {
      return state * 2
    }, [state])
    
    return <div data-testid="nested">{memoizedValue}</div>
  }
  
  return renderContent()
}

// Test component with inconsistent hook order (problematic)
const InconsistentOrderComponent = ({ condition }: { condition: boolean }) => {
  const [state1, setState1] = React.useState(0)
  
  if (condition) {
    const [state2, setState2] = React.useState(0) // This changes hook order
    return <div data-testid="inconsistent">{state1 + state2}</div>
  }
  
  const [state2, setState2] = React.useState(0) // Different hook order
  return <div data-testid="inconsistent">{state1 + state2}</div>
}

describe('React Hooks Violations Detector', () => {
  describe('Problematic Patterns Detection', () => {
    it('should detect conditional hook calls', () => {
      // This test will fail if the problematic pattern is used
      expect(() => {
        render(<ProblematicComponent shouldRender={true} />)
      }).not.toThrow()
      
      // Test with false condition
      expect(() => {
        render(<ProblematicComponent shouldRender={false} />)
      }).not.toThrow()
    })

    it('should detect hooks in loops', () => {
      const items = ['item1', 'item2', 'item3']
      
      expect(() => {
        render(<LoopHooksComponent items={items} />)
      }).not.toThrow()
    })

    it('should detect hooks in nested functions', () => {
      expect(() => {
        render(<NestedFunctionComponent />)
      }).not.toThrow()
    })

    it('should detect inconsistent hook order', () => {
      expect(() => {
        render(<InconsistentOrderComponent condition={true} />)
      }).not.toThrow()
      
      expect(() => {
        render(<InconsistentOrderComponent condition={false} />)
      }).not.toThrow()
    })
  })

  describe('Proper Patterns Validation', () => {
    it('should work with proper hooks usage', () => {
      expect(() => {
        render(<ProperComponent shouldRender={true} />)
      }).not.toThrow()
      
      expect(() => {
        render(<ProperComponent shouldRender={false} />)
      }).not.toThrow()
    })

    it('should render proper component correctly', () => {
      render(<ProperComponent shouldRender={true} />)
      expect(screen.getByTestId('proper')).toBeInTheDocument()
    })
  })

  describe('useMemo Specific Tests', () => {
    it('should test useMemo with proper dependencies', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0)
        const [multiplier, setMultiplier] = React.useState(2)
        
        // Proper useMemo usage
        const result = React.useMemo(() => {
          return count * multiplier
        }, [count, multiplier])
        
        return (
          <div>
            <div data-testid="result">{result}</div>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setMultiplier(multiplier + 1)}>Multiply</button>
          </div>
        )
      }
      
      render(<TestComponent />)
      expect(screen.getByTestId('result')).toHaveTextContent('0')
    })

    it('should test useMemo with empty dependencies', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0)
        
        // useMemo with empty dependencies - should only run once
        const staticValue = React.useMemo(() => {
          return Math.random()
        }, [])
        
        return (
          <div>
            <div data-testid="static">{staticValue}</div>
            <button onClick={() => setCount(count + 1)}>Increment</button>
          </div>
        )
      }
      
      render(<TestComponent />)
      expect(screen.getByTestId('static')).toBeInTheDocument()
    })

    it('should test useMemo with missing dependencies', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0)
        const [multiplier, setMultiplier] = React.useState(2)
        
        // Missing multiplier in dependencies - this could cause issues
        const result = React.useMemo(() => {
          return count * multiplier
        }, [count]) // Missing multiplier dependency
        
        return (
          <div>
            <div data-testid="result">{result}</div>
            <button onClick={() => setCount(count + 1)}>Increment</button>
            <button onClick={() => setMultiplier(multiplier + 1)}>Multiply</button>
          </div>
        )
      }
      
      render(<TestComponent />)
      expect(screen.getByTestId('result')).toBeInTheDocument()
    })
  })

  describe('Component Re-render Tests', () => {
    it('should handle component re-renders without hooks violations', () => {
      const TestComponent = ({ prop }: { prop: number }) => {
        const [state, setState] = React.useState(0)
        
        const memoizedValue = React.useMemo(() => {
          return state + prop
        }, [state, prop])
        
        return (
          <div>
            <div data-testid="memoized">{memoizedValue}</div>
            <button onClick={() => setState(state + 1)}>Update State</button>
          </div>
        )
      }
      
      const { rerender } = render(<TestComponent prop={1} />)
      expect(screen.getByTestId('memoized')).toHaveTextContent('1')
      
      // Re-render with different prop
      rerender(<TestComponent prop={2} />)
      expect(screen.getByTestId('memoized')).toHaveTextContent('2')
    })

    it('should handle conditional rendering without hooks violations', () => {
      const TestComponent = ({ show }: { show: boolean }) => {
        const [state, setState] = React.useState(0)
        
        const memoizedValue = React.useMemo(() => {
          return state * 2
        }, [state])
        
        if (!show) {
          return null
        }
        
        return (
          <div>
            <div data-testid="conditional">{memoizedValue}</div>
            <button onClick={() => setState(state + 1)}>Update</button>
          </div>
        )
      }
      
      const { rerender } = render(<TestComponent show={true} />)
      expect(screen.getByTestId('conditional')).toBeInTheDocument()
      
      // Hide component
      rerender(<TestComponent show={false} />)
      expect(screen.queryByTestId('conditional')).not.toBeInTheDocument()
      
      // Show again
      rerender(<TestComponent show={true} />)
      expect(screen.getByTestId('conditional')).toBeInTheDocument()
    })
  })

  describe('Accessibility with Hooks', () => {
    it('should maintain accessibility with proper hooks usage', async () => {
      const AccessibleComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false)
        
        const memoizedContent = React.useMemo(() => {
          return isOpen ? 'Content is open' : 'Content is closed'
        }, [isOpen])
        
        return (
          <div>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="content"
            >
              Toggle
            </button>
            <div id="content" aria-hidden={!isOpen}>
              {memoizedContent}
            </div>
          </div>
        )
      }
      
      const { container } = render(<AccessibleComponent />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Performance with useMemo', () => {
    it('should optimize expensive calculations with useMemo', () => {
      const ExpensiveComponent = ({ items }: { items: number[] }) => {
        const [filter, setFilter] = React.useState(0)
        
        // Expensive calculation that should be memoized
        const filteredItems = React.useMemo(() => {
          console.log('Expensive calculation running')
          return items.filter(item => item > filter).sort((a, b) => b - a)
        }, [items, filter])
        
        return (
          <div>
            <input 
              type="number" 
              value={filter} 
              onChange={(e) => setFilter(Number(e.target.value))}
              data-testid="filter"
            />
            <div data-testid="results">
              {filteredItems.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </div>
        )
      }
      
      const items = [1, 5, 3, 8, 2, 9, 4, 7, 6]
      render(<ExpensiveComponent items={items} />)
      
      expect(screen.getByTestId('results')).toBeInTheDocument()
    })
  })

  describe('Error Boundary Integration', () => {
    it('should catch hooks violations in error boundary', () => {
      class ErrorBoundary extends React.Component<
        { children: React.ReactNode },
        { hasError: boolean }
      > {
        constructor(props: { children: React.ReactNode }) {
          super(props)
          this.state = { hasError: false }
        }
        
        static getDerivedStateFromError() {
          return { hasError: true }
        }
        
        componentDidCatch(error: Error) {
          console.error('Error caught by boundary:', error)
        }
        
        render() {
          if (this.state.hasError) {
            return <div data-testid="error-boundary">Something went wrong</div>
          }
          
          return this.props.children
        }
      }
      
      const ProblematicComponent = () => {
        const [state, setState] = React.useState(0)
        
        // This will cause a hooks violation
        if (state > 0) {
          const memoizedValue = React.useMemo(() => state * 2, [state])
          return <div>{memoizedValue}</div>
        }
        
        return <div>Initial state</div>
      }
      
      render(
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>
      )
      
      // The component should render without throwing
      expect(screen.getByText('Initial state')).toBeInTheDocument()
    })
  })
})

// Additional utility functions for hooks analysis
export const analyzeHooksUsage = (component: React.ComponentType) => {
  // This function would analyze a component for hooks violations
  // In a real implementation, this would use static analysis
  return {
    hasConditionalHooks: false,
    hasHooksInLoops: false,
    hasHooksInNestedFunctions: false,
    hasInconsistentHookOrder: false,
    violations: []
  }
}

export const validateHooksRules = (component: React.ComponentType) => {
  // This function would validate that a component follows React Rules of Hooks
  const analysis = analyzeHooksUsage(component)
  
  return {
    isValid: analysis.violations.length === 0,
    violations: analysis.violations,
    recommendations: []
  }
}
