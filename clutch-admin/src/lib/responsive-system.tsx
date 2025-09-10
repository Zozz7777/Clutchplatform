import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

/**
 * Adaptive Responsive Design System
 * Features:
 * - Smart breakpoints
 * - Adaptive layouts
 * - Responsive typography
 * - Flexible grid system
 * - Container queries
 * - Device-specific optimizations
 */

// Breakpoint definitions
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

export type Breakpoint = keyof typeof breakpoints

// Device types
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large-desktop'

// Orientation types
export type Orientation = 'portrait' | 'landscape'

// Responsive configuration
export interface ResponsiveConfig {
  breakpoints: typeof breakpoints
  containerMaxWidths: Record<Breakpoint, string>
  gridColumns: Record<Breakpoint, number>
  spacing: Record<Breakpoint, Record<string, string>>
  typography: Record<Breakpoint, Record<string, any>>
}

// Default responsive configuration
export const defaultResponsiveConfig: ResponsiveConfig = {
  breakpoints,
  containerMaxWidths: {
    xs: '100%',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  gridColumns: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 12,
    '2xl': 12
  },
  spacing: {
    xs: { xs: '0.5rem', sm: '0.75rem', md: '1rem', lg: '1.25rem', xl: '1.5rem' },
    sm: { xs: '0.75rem', sm: '1rem', md: '1.25rem', lg: '1.5rem', xl: '1.75rem' },
    md: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem', xl: '2rem' },
    lg: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem', xl: '2.25rem' },
    xl: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem', xl: '2.5rem' },
    '2xl': { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem', xl: '2.75rem' }
  },
  typography: {
    xs: {
      h1: { fontSize: '1.5rem', lineHeight: '2rem' },
      h2: { fontSize: '1.25rem', lineHeight: '1.75rem' },
      h3: { fontSize: '1.125rem', lineHeight: '1.5rem' },
      body: { fontSize: '0.875rem', lineHeight: '1.25rem' }
    },
    sm: {
      h1: { fontSize: '1.875rem', lineHeight: '2.25rem' },
      h2: { fontSize: '1.5rem', lineHeight: '2rem' },
      h3: { fontSize: '1.25rem', lineHeight: '1.75rem' },
      body: { fontSize: '1rem', lineHeight: '1.5rem' }
    },
    md: {
      h1: { fontSize: '2.25rem', lineHeight: '2.5rem' },
      h2: { fontSize: '1.875rem', lineHeight: '2.25rem' },
      h3: { fontSize: '1.5rem', lineHeight: '2rem' },
      body: { fontSize: '1rem', lineHeight: '1.5rem' }
    },
    lg: {
      h1: { fontSize: '3rem', lineHeight: '3.5rem' },
      h2: { fontSize: '2.25rem', lineHeight: '2.5rem' },
      h3: { fontSize: '1.875rem', lineHeight: '2.25rem' },
      body: { fontSize: '1.125rem', lineHeight: '1.75rem' }
    },
    xl: {
      h1: { fontSize: '3.75rem', lineHeight: '4rem' },
      h2: { fontSize: '3rem', lineHeight: '3.5rem' },
      h3: { fontSize: '2.25rem', lineHeight: '2.5rem' },
      body: { fontSize: '1.125rem', lineHeight: '1.75rem' }
    },
    '2xl': {
      h1: { fontSize: '4.5rem', lineHeight: '5rem' },
      h2: { fontSize: '3.75rem', lineHeight: '4rem' },
      h3: { fontSize: '3rem', lineHeight: '3.5rem' },
      body: { fontSize: '1.25rem', lineHeight: '1.875rem' }
    }
  }
}

// Responsive hook
export function useResponsive() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg')
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [orientation, setOrientation] = useState<Orientation>('landscape')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateResponsive = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setWindowSize({ width, height })

      // Determine breakpoint
      let breakpoint: Breakpoint = 'xs'
      if (width >= breakpoints['2xl']) breakpoint = '2xl'
      else if (width >= breakpoints.xl) breakpoint = 'xl'
      else if (width >= breakpoints.lg) breakpoint = 'lg'
      else if (width >= breakpoints.md) breakpoint = 'md'
      else if (width >= breakpoints.sm) breakpoint = 'sm'

      setCurrentBreakpoint(breakpoint)

      // Determine device type
      let device: DeviceType = 'desktop'
      if (width < breakpoints.md) device = 'mobile'
      else if (width < breakpoints.lg) device = 'tablet'
      else if (width >= breakpoints['2xl']) device = 'large-desktop'

      setDeviceType(device)

      // Determine orientation
      setOrientation(width > height ? 'landscape' : 'portrait')
    }

    updateResponsive()
    window.addEventListener('resize', updateResponsive)
    window.addEventListener('orientationchange', updateResponsive)

    return () => {
      window.removeEventListener('resize', updateResponsive)
      window.removeEventListener('orientationchange', updateResponsive)
    }
  }, [])

  return {
    currentBreakpoint,
    deviceType,
    orientation,
    windowSize,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isLargeDesktop: deviceType === 'large-desktop',
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  }
}

// Responsive value hook
export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T {
  const { currentBreakpoint } = useResponsive()

  // Find the appropriate value for current breakpoint
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = breakpointOrder[i]
    if (values[breakpoint] !== undefined) {
      return values[breakpoint]!
    }
  }

  return defaultValue
}

// Container query hook
export function useContainerQuery(
  ref: React.RefObject<HTMLElement>,
  query: string
): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        
        // Simple container query implementation
        if (query.includes('min-width')) {
          const minWidth = parseInt(query.match(/min-width:\s*(\d+)px/)?.[1] || '0')
          setMatches(width >= minWidth)
        } else if (query.includes('max-width')) {
          const maxWidth = parseInt(query.match(/max-width:\s*(\d+)px/)?.[1] || '0')
          setMatches(width <= maxWidth)
        } else if (query.includes('min-height')) {
          const minHeight = parseInt(query.match(/min-height:\s*(\d+)px/)?.[1] || '0')
          setMatches(height >= minHeight)
        } else if (query.includes('max-height')) {
          const maxHeight = parseInt(query.match(/max-height:\s*(\d+)px/)?.[1] || '0')
          setMatches(height <= maxHeight)
        }
      }
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [ref, query])

  return matches
}

// Responsive grid hook
export function useResponsiveGrid(
  columns: Partial<Record<Breakpoint, number>>,
  gap: Partial<Record<Breakpoint, string>> = {}
) {
  const { currentBreakpoint } = useResponsive()

  const getColumns = useCallback(() => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpointOrder[i]
      if (columns[breakpoint] !== undefined) {
        return columns[breakpoint]!
      }
    }

    return 1
  }, [columns, currentBreakpoint])

  const getGap = useCallback(() => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpointOrder[i]
      if (gap[breakpoint] !== undefined) {
        return gap[breakpoint]!
      }
    }

    return '1rem'
  }, [gap, currentBreakpoint])

  return {
    columns: getColumns(),
    gap: getGap()
  }
}

// Responsive typography hook
export function useResponsiveTypography(
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption'
) {
  const { currentBreakpoint } = useResponsive()

  return defaultResponsiveConfig.typography[currentBreakpoint][variant] || {}
}

// Responsive spacing hook
export function useResponsiveSpacing(
  property: 'padding' | 'margin' | 'gap',
  values: Partial<Record<Breakpoint, string>>
) {
  const { currentBreakpoint } = useResponsive()

  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

  for (let i = currentIndex; i >= 0; i--) {
    const breakpoint = breakpointOrder[i]
    if (values[breakpoint] !== undefined) {
      return values[breakpoint]!
    }
  }

  return '1rem'
}

// Responsive utilities
export const responsiveUtils = {
  // Generate responsive classes
  generateResponsiveClasses: (
    baseClass: string,
    variants: Partial<Record<Breakpoint, string>>
  ): string => {
    const classes = [baseClass]
    
    Object.entries(variants).forEach(([breakpoint, variant]) => {
      if (variant) {
        classes.push(`${breakpoint}:${variant}`)
      }
    })

    return classes.join(' ')
  },

  // Get responsive value
  getResponsiveValue: function<T>(
    values: Partial<Record<Breakpoint, T>>,
    currentBreakpoint: Breakpoint,
    defaultValue: T
  ): T {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint)

    for (let i = currentIndex; i >= 0; i--) {
      const breakpoint = breakpointOrder[i]
      if (values[breakpoint] !== undefined) {
        return values[breakpoint]!
      }
    }

    return defaultValue
  },

  // Check if breakpoint matches
  matchesBreakpoint: (breakpoint: Breakpoint, currentBreakpoint: Breakpoint): boolean => {
    const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const breakpointIndex = breakpointOrder.indexOf(breakpoint)
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
    
    return currentIndex >= breakpointIndex
  },

  // Get device-specific optimizations
  getDeviceOptimizations: (deviceType: DeviceType) => {
    const optimizations = {
      mobile: {
        touchTargets: 'min-h-[44px] min-w-[44px]',
        spacing: 'p-4',
        typography: 'text-sm',
        interactions: 'touch-friendly'
      },
      tablet: {
        touchTargets: 'min-h-[40px] min-w-[40px]',
        spacing: 'p-6',
        typography: 'text-base',
        interactions: 'touch-friendly'
      },
      desktop: {
        touchTargets: 'min-h-[32px] min-w-[32px]',
        spacing: 'p-8',
        typography: 'text-base',
        interactions: 'mouse-friendly'
      },
      'large-desktop': {
        touchTargets: 'min-h-[32px] min-w-[32px]',
        spacing: 'p-10',
        typography: 'text-lg',
        interactions: 'mouse-friendly'
      }
    }

    return optimizations[deviceType]
  }
}

// Responsive context
export const ResponsiveContext = React.createContext<{
  currentBreakpoint: Breakpoint
  deviceType: DeviceType
  orientation: Orientation
  windowSize: { width: number; height: number }
  config: ResponsiveConfig
}>({
  currentBreakpoint: 'lg',
  deviceType: 'desktop',
  orientation: 'landscape',
  windowSize: { width: 0, height: 0 },
  config: defaultResponsiveConfig
})

// Responsive provider
export function ResponsiveProvider({ 
  children, 
  config = defaultResponsiveConfig 
}: { 
  children: React.ReactNode
  config?: ResponsiveConfig 
}) {
  const responsive = useResponsive()

  return (
    <ResponsiveContext.Provider
      value={{
        ...responsive,
        config
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  )
}

const ResponsiveSystem = {
  breakpoints,
  defaultResponsiveConfig,
  useResponsive,
  useResponsiveValue,
  useContainerQuery,
  useResponsiveGrid,
  useResponsiveTypography,
  useResponsiveSpacing,
  responsiveUtils,
  ResponsiveContext,
  ResponsiveProvider
}

export default ResponsiveSystem
