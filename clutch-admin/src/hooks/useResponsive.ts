'use client'

import { useState, useEffect } from 'react'

export interface BreakpointConfig {
  sm: number  // 640px
  md: number  // 768px
  lg: number  // 1024px
  xl: number  // 1280px
  '2xl': number // 1536px
}

const defaultBreakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export type Breakpoint = keyof BreakpointConfig

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm')

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })

      // Determine current breakpoint
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else {
        setCurrentBreakpoint('sm')
      }
    }

    // Set initial size
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoints])

  // Helper functions
  const isSmAndUp = windowSize.width >= breakpoints.sm
  const isMdAndUp = windowSize.width >= breakpoints.md
  const isLgAndUp = windowSize.width >= breakpoints.lg
  const isXlAndUp = windowSize.width >= breakpoints.xl
  const is2XlAndUp = windowSize.width >= breakpoints['2xl']

  const isSmOnly = windowSize.width >= breakpoints.sm && windowSize.width < breakpoints.md
  const isMdOnly = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
  const isLgOnly = windowSize.width >= breakpoints.lg && windowSize.width < breakpoints.xl
  const isXlOnly = windowSize.width >= breakpoints.xl && windowSize.width < breakpoints['2xl']

  const isMobile = windowSize.width < breakpoints.md
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
  const isDesktop = windowSize.width >= breakpoints.lg

  const getGridCols = (sm = 1, md = 2, lg = 3, xl = 4) => {
    if (is2XlAndUp || isXlAndUp) return xl
    if (isLgAndUp) return lg
    if (isMdAndUp) return md
    return sm
  }

  const getSpacing = (sm = 4, md = 6, lg = 8) => {
    if (isLgAndUp) return lg
    if (isMdAndUp) return md
    return sm
  }

  const getSidebarWidth = () => {
    if (isMobile) return 'w-0' // Hidden on mobile
    if (isTablet) return 'w-16' // Collapsed on tablet
    return 'w-64' // Full width on desktop
  }

  const getContainerPadding = () => {
    if (isMobile) return 'px-4'
    if (isTablet) return 'px-6'
    return 'px-8'
  }

  const getCardPadding = () => {
    if (isMobile) return 'p-4'
    if (isTablet) return 'p-5'
    return 'p-6'
  }

  const getFontSize = (sm = 'text-sm', md = 'text-base', lg = 'text-lg') => {
    if (isLgAndUp) return lg
    if (isMdAndUp) return md
    return sm
  }

  return {
    windowSize,
    currentBreakpoint,
    
    // Breakpoint checks
    isSmAndUp,
    isMdAndUp,
    isLgAndUp,
    isXlAndUp,
    is2XlAndUp,
    
    // Range checks
    isSmOnly,
    isMdOnly,
    isLgOnly,
    isXlOnly,
    
    // Device types
    isMobile,
    isTablet,
    isDesktop,
    
    // Helper functions
    getGridCols,
    getSpacing,
    getSidebarWidth,
    getContainerPadding,
    getCardPadding,
    getFontSize,
  }
}

// Hook for orientation detection
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    function handleOrientationChange() {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange)
    
    return () => window.removeEventListener('resize', handleOrientationChange)
  }, [])

  return orientation
}

// Hook for checking if device supports touch
export function useTouch() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}

// Hook for checking if device is in standalone mode (PWA)
export function useStandalone() {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')

    setIsStandalone(isStandaloneMode)
  }, [])

  return isStandalone
}

// Combined device info hook
export function useDeviceInfo() {
  const responsive = useResponsive()
  const orientation = useOrientation()
  const isTouch = useTouch()
  const isStandalone = useStandalone()

  return {
    ...responsive,
    orientation,
    isTouch,
    isStandalone,
  }
}
