/**
 * App Hooks Tests
 * Testing for custom hooks and their functionality
 */

import { renderHook, act } from '@testing-library/react'
import { useApp, useDashboard, useForm, useNavigation, usePerformance } from '@/hooks/use-app'
import { AppProviders } from '@/providers/app-providers'
import { testUtils } from '../setup'

// Mock the hooks
jest.mock('@/lib/responsive-system', () => ({
  useResponsive: () => ({
    currentBreakpoint: 'lg',
    deviceType: 'desktop',
    orientation: 'landscape',
    windowSize: { width: 1024, height: 768 },
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLargeDesktop: false,
    isPortrait: false,
    isLandscape: true
  })
}))

jest.mock('@/lib/smart-navigation', () => ({
  useSmartNavigation: () => ({
    suggestions: [
      { id: '1', type: 'recent', item: { id: 'dashboard', label: 'Dashboard', path: '/dashboard' }, confidence: 0.8, reason: 'Recently visited' }
    ],
    navigationHistory: [
      { id: '1', path: '/dashboard', timestamp: new Date(), duration: 5000, userAgent: 'test', referrer: '' }
    ],
    currentContext: {
      currentPath: '/dashboard',
      userRole: 'admin',
      userPreferences: {},
      deviceType: 'desktop',
      timeOfDay: 'morning',
      dayOfWeek: 'weekday'
    },
    breadcrumbs: [
      { label: 'Home', path: '/', active: false },
      { label: 'Dashboard', path: '/dashboard', active: true }
    ],
    trackNavigation: jest.fn(),
    updateUserPreferences: jest.fn(),
    getNavigationStats: jest.fn(() => ({
      totalVisits: 10,
      uniquePaths: 5,
      averageSessionDuration: 5000,
      mostVisitedPath: '/dashboard',
      lastVisit: new Date()
    })),
    clearNavigationHistory: jest.fn()
  })
}))

jest.mock('@/lib/animation-system', () => ({
  useAnimation: () => ({
    animate: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn()
  })
}))

jest.mock('@/lib/performance-monitoring', () => ({
  usePerformanceMonitoring: () => ({
    trackEvent: jest.fn(),
    trackError: jest.fn(),
    trackMetric: jest.fn(),
    getMetrics: jest.fn(() => ({
      loadTime: 1200,
      renderTime: 800,
      memoryUsage: 45.6,
      cpuUsage: 23.4
    }))
  })
}))

jest.mock('@/lib/user-analytics', () => ({
  useUserAnalytics: () => ({
    trackEvent: jest.fn(),
    trackPageView: jest.fn(),
    identifyUser: jest.fn(),
    getSession: jest.fn(() => ({ id: 'session-1', startTime: new Date() }))
  })
}))

jest.mock('@/lib/offline-support', () => ({
  useOfflineSupport: () => ({
    isOnline: true,
    isOffline: false,
    syncStatus: 'synced',
    lastSync: new Date(),
    syncData: jest.fn(),
    clearCache: jest.fn()
  })
}))

jest.mock('@/lib/accessibility', () => ({
  useAccessibility: () => ({
    announce: jest.fn(),
    setFocus: jest.fn(),
    getFocusableElements: jest.fn(() => []),
    trapFocus: jest.fn(),
    releaseFocus: jest.fn()
  })
}))

describe('useApp', () => {
  it('returns all app features', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })

    expect(result.current).toHaveProperty('responsive')
    expect(result.current).toHaveProperty('navigation')
    expect(result.current).toHaveProperty('animation')
    expect(result.current).toHaveProperty('performance')
    expect(result.current).toHaveProperty('analytics')
    expect(result.current).toHaveProperty('offline')
    expect(result.current).toHaveProperty('accessibility')
  })

  it('provides responsive data', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })

    expect(result.current.responsive.currentBreakpoint).toBe('lg')
    expect(result.current.responsive.deviceType).toBe('desktop')
    expect(result.current.responsive.isDesktop).toBe(true)
  })

  it('provides navigation data', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })

    expect(result.current.navigation.suggestions).toHaveLength(1)
    expect(result.current.navigation.navigationHistory).toHaveLength(1)
    expect(result.current.navigation.breadcrumbs).toHaveLength(2)
  })

  it('provides performance monitoring', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })

    expect(result.current.performance.trackEvent).toBeDefined()
    expect(result.current.performance.trackError).toBeDefined()
    expect(result.current.performance.trackMetric).toBeDefined()
  })

  it('provides analytics', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })

    expect(result.current.analytics.trackEvent).toBeDefined()
    expect(result.current.analytics.trackPageView).toBeDefined()
    expect(result.current.analytics.identifyUser).toBeDefined()
  })

  it('provides offline support', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })

    expect(result.current.offline.isOnline).toBe(true)
    expect(result.current.offline.isOffline).toBe(false)
    expect(result.current.offline.syncStatus).toBe('synced')
  })

  it('provides accessibility features', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })

    expect(result.current.accessibility.announce).toBeDefined()
    expect(result.current.accessibility.setFocus).toBeDefined()
    expect(result.current.accessibility.trapFocus).toBeDefined()
  })
})

describe('useDashboard', () => {
  it('extends useApp with dashboard-specific features', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: AppProviders
    })

    expect(result.current).toHaveProperty('trackDashboardView')
    expect(result.current).toHaveProperty('trackDashboardInteraction')
    expect(result.current).toHaveProperty('responsive')
    expect(result.current).toHaveProperty('navigation')
  })

  it('tracks dashboard views', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: AppProviders
    })

    act(() => {
      result.current.trackDashboardView('metrics')
    })

    expect(result.current.analytics.trackEvent).toHaveBeenCalledWith('dashboard_view', { section: 'metrics' })
  })

  it('tracks dashboard interactions', () => {
    const { result } = renderHook(() => useDashboard(), {
      wrapper: AppProviders
    })

    act(() => {
      result.current.trackDashboardInteraction('click', 'metric-card')
    })

    expect(result.current.analytics.trackEvent).toHaveBeenCalledWith('dashboard_interaction', { 
      action: 'click', 
      target: 'metric-card' 
    })
  })
})

describe('useForm', () => {
  it('extends useApp with form-specific features', () => {
    const { result } = renderHook(() => useForm(), {
      wrapper: AppProviders
    })

    expect(result.current).toHaveProperty('trackFormStart')
    expect(result.current).toHaveProperty('trackFormComplete')
    expect(result.current).toHaveProperty('trackFormError')
  })

  it('tracks form start', () => {
    const { result } = renderHook(() => useForm(), {
      wrapper: AppProviders
    })

    act(() => {
      result.current.trackFormStart('user-registration')
    })

    expect(result.current.analytics.trackEvent).toHaveBeenCalledWith('form_start', { formName: 'user-registration' })
  })

  it('tracks form completion', () => {
    const { result } = renderHook(() => useForm(), {
      wrapper: AppProviders
    })

    act(() => {
      result.current.trackFormComplete('user-registration', 5000)
    })

    expect(result.current.analytics.trackEvent).toHaveBeenCalledWith('form_complete', { 
      formName: 'user-registration', 
      duration: 5000 
    })
  })

  it('tracks form errors', () => {
    const { result } = renderHook(() => useForm(), {
      wrapper: AppProviders
    })

    act(() => {
      result.current.trackFormError('user-registration', 'Validation failed')
    })

    expect(result.current.analytics.trackEvent).toHaveBeenCalledWith('form_error', { 
      formName: 'user-registration', 
      error: 'Validation failed' 
    })
  })
})

describe('useNavigation', () => {
  it('extends useApp with navigation-specific features', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: AppProviders
    })

    expect(result.current).toHaveProperty('navigateWithTracking')
    expect(result.current).toHaveProperty('getSmartSuggestions')
  })

  it('navigates with tracking', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: AppProviders
    })

    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any

    act(() => {
      result.current.navigateWithTracking('/users', 'sidebar')
    })

    expect(result.current.navigation.trackNavigation).toHaveBeenCalledWith('/users')
    expect(result.current.analytics.trackEvent).toHaveBeenCalledWith('navigation', { 
      path: '/users', 
      source: 'sidebar' 
    })
  })

  it('gets smart suggestions', () => {
    const { result } = renderHook(() => useNavigation(), {
      wrapper: AppProviders
    })

    const suggestions = result.current.getSmartSuggestions('dashboard')
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0].item.label).toBe('Dashboard')
  })
})

describe('usePerformance', () => {
  it('extends useApp with performance-specific features', () => {
    const { result } = renderHook(() => usePerformance(), {
      wrapper: AppProviders
    })

    expect(result.current).toHaveProperty('measurePageLoad')
    expect(result.current).toHaveProperty('measureInteraction')
  })

  it('measures page load time', () => {
    const { result } = renderHook(() => usePerformance(), {
      wrapper: AppProviders
    })

    const measurement = result.current.measurePageLoad('dashboard')
    
    act(() => {
      measurement.end()
    })

    expect(result.current.performance.trackEvent).toHaveBeenCalledWith('page_load', { 
      pageName: 'dashboard', 
      loadTime: expect.any(Number) 
    })
  })

  it('measures interaction time', () => {
    const { result } = renderHook(() => usePerformance(), {
      wrapper: AppProviders
    })

    const measurement = result.current.measureInteraction('button-click')
    
    act(() => {
      measurement.end()
    })

    expect(result.current.performance.trackEvent).toHaveBeenCalledWith('interaction', { 
      interactionName: 'button-click', 
      duration: expect.any(Number) 
    })
  })
})

describe('Hook Integration', () => {
  it('works with multiple hooks simultaneously', () => {
    const { result: appResult } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })
    const { result: dashboardResult } = renderHook(() => useDashboard(), {
      wrapper: AppProviders
    })

    expect(appResult.current.responsive).toBe(dashboardResult.current.responsive)
    expect(appResult.current.navigation).toBe(dashboardResult.current.navigation)
    expect(appResult.current.analytics).toBe(dashboardResult.current.analytics)
  })

  it('maintains state consistency across hooks', () => {
    const { result: appResult } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })
    const { result: formResult } = renderHook(() => useForm(), {
      wrapper: AppProviders
    })

    act(() => {
      appResult.current.analytics.trackEvent('test-event', { data: 'test' })
    })

    expect(appResult.current.analytics.trackEvent).toHaveBeenCalledWith('test-event', { data: 'test' })
    expect(formResult.current.analytics.trackEvent).toHaveBeenCalledWith('test-event', { data: 'test' })
  })

  it('handles errors gracefully', () => {
    const { result } = renderHook(() => useApp(), {
      wrapper: AppProviders
    })

    expect(() => {
      result.current.performance.trackError(new Error('Test error'))
    }).not.toThrow()
  })
})
