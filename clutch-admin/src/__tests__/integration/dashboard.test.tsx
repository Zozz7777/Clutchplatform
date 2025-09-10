/**
 * Dashboard Integration Tests
 * End-to-end testing for dashboard functionality
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProviders } from '@/providers/app-providers'
import EnhancedDashboard from '@/app/(dashboard)/enhanced-dashboard/page'
import { testUtils } from '../setup'

// Mock the enhanced layout
jest.mock('@/app/(dashboard)/enhanced-layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="enhanced-layout">{children}</div>
  )
}))

// Mock the app hooks
jest.mock('@/hooks/use-app', () => ({
  useApp: () => ({
    responsive: {
      currentBreakpoint: 'lg',
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true
    },
    navigation: {
      trackNavigation: jest.fn(),
      suggestions: [],
      navigationHistory: [],
      breadcrumbs: []
    },
    analytics: {
      trackPageView: jest.fn(),
      trackEvent: jest.fn()
    },
    performance: {
      trackEvent: jest.fn(),
      now: () => Date.now()
    }
  })
}))

// Mock the responsive components
jest.mock('@/components/responsive/adaptive-layout', () => ({
  AdaptiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="adaptive-container">{children}</div>
  ),
  AdaptiveGrid: ({ children, ...props }: any) => (
    <div data-testid="adaptive-grid" {...props}>{children}</div>
  ),
  AdaptiveFlex: ({ children, ...props }: any) => (
    <div data-testid="adaptive-flex" {...props}>{children}</div>
  )
}))

// Mock the animation components
jest.mock('@/components/animations/animated-card', () => ({
  AnimatedCard: ({ children, ...props }: any) => (
    <div data-testid="animated-card" {...props}>{children}</div>
  )
}))

// Mock the interaction components
jest.mock('@/components/interactions/advanced-button', () => ({
  AdvancedButton: ({ children, onClick, ...props }: any) => (
    <button data-testid="advanced-button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/interactions/gesture-card', () => ({
  GestureCard: ({ children, onDismiss, ...props }: any) => (
    <div data-testid="gesture-card" {...props}>
      {children}
      <button data-testid="dismiss-button" onClick={onDismiss}>Dismiss</button>
    </div>
  )
}))

jest.mock('@/components/interactions/loading-states', () => ({
  SkeletonLoader: ({ count, ...props }: any) => (
    <div data-testid="skeleton-loader" {...props}>
      {Array.from({ length: count || 1 }, (_, i) => (
        <div key={i} data-testid="skeleton-item">Loading...</div>
      ))}
    </div>
  ),
  ShimmerLoader: (props: any) => (
    <div data-testid="shimmer-loader" {...props}>Shimmer...</div>
  ),
  ProgressiveImage: ({ src, alt, ...props }: any) => (
    <img data-testid="progressive-image" src={src} alt={alt} {...props} />
  )
}))

// Mock the virtual scroll table
jest.mock('@/components/ui/virtual-scroll-table', () => ({
  VirtualScrollTable: ({ data, renderRow, header, ...props }: any) => (
    <div data-testid="virtual-scroll-table" {...props}>
      {header}
      <div data-testid="table-body">
        {data.slice(0, 10).map((item: any, index: number) => (
          <div key={item.id} data-testid={`table-row-${index}`}>
            {renderRow(item)}
          </div>
        ))}
      </div>
    </div>
  )
}))

// Mock the accessibility components
jest.mock('@/components/accessibility/accessible-button', () => ({
  AccessibleButton: ({ children, onClick, ...props }: any) => (
    <button data-testid="accessible-button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/accessibility/accessible-modal', () => ({
  AccessibleModal: ({ children, isOpen, onClose, title, ...props }: any) => (
    isOpen ? (
      <div data-testid="accessible-modal" {...props}>
        <h2>{title}</h2>
        {children}
        <button data-testid="close-modal" onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}))

describe('Enhanced Dashboard Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <EnhancedDashboard />
        </AppProviders>
      </QueryClientProvider>
    )
  }

  it('renders the dashboard layout', () => {
    renderDashboard()
    expect(screen.getByTestId('enhanced-layout')).toBeInTheDocument()
  })

  it('renders the adaptive container', () => {
    renderDashboard()
    expect(screen.getByTestId('adaptive-container')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    renderDashboard()
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument()
  })

  it('renders dashboard content after loading', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Enhanced Dashboard')).toBeInTheDocument()
    })
  })

  it('renders metrics cards', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Revenue')).toBeInTheDocument()
      expect(screen.getByText('Active Sessions')).toBeInTheDocument()
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
    })
  })

  it('renders recent activity section', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Created new project')).toBeInTheDocument()
    })
  })

  it('renders alerts section', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Alerts')).toBeInTheDocument()
      expect(screen.getByText('System Update Available')).toBeInTheDocument()
      expect(screen.getByText('High CPU Usage')).toBeInTheDocument()
    })
  })

  it('renders users table', async () => {
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument()
      expect(screen.getByTestId('virtual-scroll-table')).toBeInTheDocument()
    })
  })

  it('handles metric card clicks', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const metricCard = screen.getByText('Total Users').closest('[data-testid="animated-card"]')
      expect(metricCard).toBeInTheDocument()
      
      fireEvent.click(metricCard!)
    })
  })

  it('handles new item button click', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const newItemButton = screen.getByTestId('advanced-button')
      expect(newItemButton).toBeInTheDocument()
      
      fireEvent.click(newItemButton)
    })
  })

  it('handles settings button click', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const settingsButton = screen.getByTestId('accessible-button')
      expect(settingsButton).toBeInTheDocument()
      
      fireEvent.click(settingsButton)
    })
  })

  it('opens and closes settings modal', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const settingsButton = screen.getByTestId('accessible-button')
      fireEvent.click(settingsButton)
      
      expect(screen.getByTestId('accessible-modal')).toBeInTheDocument()
      expect(screen.getByText('Dashboard Settings')).toBeInTheDocument()
      
      const closeButton = screen.getByTestId('close-modal')
      fireEvent.click(closeButton)
      
      expect(screen.queryByTestId('accessible-modal')).not.toBeInTheDocument()
    })
  })

  it('handles alert dismissal', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const dismissButton = screen.getByTestId('dismiss-button')
      expect(dismissButton).toBeInTheDocument()
      
      fireEvent.click(dismissButton)
    })
  })

  it('handles table row clicks', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const tableRow = screen.getByTestId('table-row-0')
      expect(tableRow).toBeInTheDocument()
      
      fireEvent.click(tableRow)
    })
  })

  it('handles search input', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search users...')
      expect(searchInput).toBeInTheDocument()
      
      fireEvent.change(searchInput, { target: { value: 'test search' } })
      expect(searchInput).toHaveValue('test search')
    })
  })

  it('handles filter button click', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const filterButton = screen.getByRole('button', { name: /filter/i })
      expect(filterButton).toBeInTheDocument()
      
      fireEvent.click(filterButton)
    })
  })

  it('handles download button click', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const downloadButton = screen.getByRole('button', { name: /download/i })
      expect(downloadButton).toBeInTheDocument()
      
      fireEvent.click(downloadButton)
    })
  })

  it('renders responsive grid correctly', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const adaptiveGrids = screen.getAllByTestId('adaptive-grid')
      expect(adaptiveGrids.length).toBeGreaterThan(0)
    })
  })

  it('renders animated cards correctly', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const animatedCards = screen.getAllByTestId('animated-card')
      expect(animatedCards.length).toBeGreaterThan(0)
    })
  })

  it('renders gesture cards correctly', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const gestureCards = screen.getAllByTestId('gesture-card')
      expect(gestureCards.length).toBeGreaterThan(0)
    })
  })

  it('handles keyboard navigation', async () => {
    renderDashboard()
    
    await waitFor(() => {
      const firstButton = screen.getByTestId('accessible-button')
      firstButton.focus()
      
      fireEvent.keyDown(firstButton, { key: 'Tab' })
      fireEvent.keyDown(firstButton, { key: 'Enter' })
    })
  })

  it('maintains accessibility standards', async () => {
    renderDashboard()
    
    await waitFor(() => {
      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Check for proper table structure
      expect(screen.getByTestId('virtual-scroll-table')).toBeInTheDocument()
    })
  })

  it('handles error states gracefully', async () => {
    // Mock an error in the data fetching
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    renderDashboard()
    
    await waitFor(() => {
      // Should still render the dashboard even if some data fails
      expect(screen.getByText('Enhanced Dashboard')).toBeInTheDocument()
    })
    
    jest.restoreAllMocks()
  })

  it('performs well with large datasets', async () => {
    const start = performance.now()
    
    renderDashboard()
    
    await waitFor(() => {
      expect(screen.getByTestId('virtual-scroll-table')).toBeInTheDocument()
    })
    
    const end = performance.now()
    expect(end - start).toBeLessThan(1000) // Should render in less than 1 second
  })
})
