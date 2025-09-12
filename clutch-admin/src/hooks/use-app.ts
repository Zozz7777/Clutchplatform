/**
 * App-wide hooks and utilities
 * Centralized access to all app features
 */

import { useResponsive } from '@/lib/responsive-system'
import { useSmartNavigation } from '@/lib/smart-navigation'
import { useAnimation } from '@/lib/animation-system'
import { usePerformanceMonitoring } from '@/lib/performance-monitoring'
import { useUserAnalytics } from '@/lib/user-analytics'
import { useOfflineSupport } from '@/lib/offline-support'
import { useAccessibility } from '@/lib/accessibility'

/**
 * Main app hook that provides access to all app features
 */
export function useApp() {
  const responsive = useResponsive()
  const navigation = useSmartNavigation()
  const animation = useAnimation()
  const performance = usePerformanceMonitoring()
  const analytics = useUserAnalytics()
  const offline = useOfflineSupport()
  const accessibility = useAccessibility()

  return {
    responsive,
    navigation,
    animation,
    performance,
    analytics,
    offline,
    accessibility
  }
}

/**
 * Hook for dashboard-specific features
 */
export function useDashboard() {
  const app = useApp()
  
  return {
    ...app,
    // Dashboard-specific utilities
    trackDashboardView: (section: string) => {
      app.analytics.trackEvent('dashboard_view', { section })
    },
    trackDashboardInteraction: (action: string, target: string) => {
      app.analytics.trackEvent('dashboard_interaction', { action, target })
    }
  }
}

/**
 * Hook for form-specific features
 */
export function useForm() {
  const app = useApp()
  
  return {
    ...app,
    // Form-specific utilities
    trackFormStart: (formName: string) => {
      app.analytics.trackEvent('form_start', { formName })
    },
    trackFormComplete: (formName: string, duration: number) => {
      app.analytics.trackEvent('form_complete', { formName, duration })
    },
    trackFormError: (formName: string, error: string) => {
      app.analytics.trackEvent('form_error', { formName, error })
    }
  }
}

/**
 * Hook for navigation-specific features
 */
export function useNavigation() {
  const app = useApp()
  
  return {
    ...app,
    // Navigation-specific utilities
    navigateWithTracking: (path: string, source: string) => {
      app.navigation.trackNavigation(path)
      app.analytics.trackEvent('navigation', { path, source })
      // Note: Actual navigation should be handled by the calling component with useRouter
      console.log(`Navigation requested to: ${path}`)
    },
    getSmartSuggestions: (context?: string) => {
      return app.navigation.suggestions.filter(suggestion => 
        !context || suggestion.reason.toLowerCase().includes(context.toLowerCase())
      )
    }
  }
}

/**
 * Hook for performance monitoring
 */
export function usePerformance() {
  const app = useApp()
  
  return {
    ...app,
    // Performance-specific utilities
    measurePageLoad: (pageName: string) => {
      const startTime = performance.now()
      
      return {
        end: () => {
          const loadTime = performance.now() - startTime
          app.performance.trackEvent('page_load', { pageName, loadTime })
          return loadTime
        }
      }
    },
    measureInteraction: (interactionName: string) => {
      const startTime = performance.now()
      
      return {
        end: () => {
          const duration = performance.now() - startTime
          app.performance.trackEvent('interaction', { interactionName, duration })
          return duration
        }
      }
    }
  }
}

const AppHooks = {
  useApp,
  useDashboard,
  useForm,
  useNavigation,
  usePerformance
}

export default AppHooks
