'use client'

import React, { forwardRef, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useResponsive, useResponsiveGrid, useContainerQuery, type Breakpoint } from '@/lib/responsive-system'

// Adaptive Container
export interface AdaptiveContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: Partial<Record<Breakpoint, string>>
  padding?: Partial<Record<Breakpoint, string>>
  margin?: Partial<Record<Breakpoint, string>>
  centered?: boolean
  fluid?: boolean
}

export const AdaptiveContainer = forwardRef<HTMLDivElement, AdaptiveContainerProps>(
  ({ 
    className, 
    maxWidth, 
    padding, 
    margin, 
    centered = true, 
    fluid = false,
    children,
    ...props 
  }, ref) => {
    const { currentBreakpoint } = useResponsive()

    // Get responsive values
    const getMaxWidth = () => {
      if (fluid) return '100%'
      if (maxWidth) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (maxWidth[breakpoint] !== undefined) {
            return maxWidth[breakpoint]!
          }
        }
      }
      return '100%'
    }

    const getPadding = () => {
      if (padding) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (padding[breakpoint] !== undefined) {
            return padding[breakpoint]!
          }
        }
      }
      return '1rem'
    }

    const getMargin = () => {
      if (margin) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (margin[breakpoint] !== undefined) {
            return margin[breakpoint]!
          }
        }
      }
      return '0'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          centered && 'mx-auto',
          className
        )}
        style={{
          maxWidth: getMaxWidth(),
          padding: getPadding(),
          margin: getMargin()
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AdaptiveContainer.displayName = 'AdaptiveContainer'

// Adaptive Grid
export interface AdaptiveGridProps
  extends React.HTMLAttributes<HTMLDivElement> {
  columns?: Partial<Record<Breakpoint, number>>
  gap?: Partial<Record<Breakpoint, string>>
  autoFit?: boolean
  autoFill?: boolean
  minItemWidth?: string
  maxItemWidth?: string
}

export const AdaptiveGrid = forwardRef<HTMLDivElement, AdaptiveGridProps>(
  ({ 
    className, 
    columns, 
    gap, 
    autoFit = false, 
    autoFill = false,
    minItemWidth = '250px',
    maxItemWidth = '1fr',
    children,
    ...props 
  }, ref) => {
    const { columns: gridColumns, gap: gridGap } = useResponsiveGrid(columns || {}, gap || {})

    const getGridTemplateColumns = () => {
      if (autoFit) {
        return `repeat(auto-fit, minmax(${minItemWidth}, ${maxItemWidth}))`
      }
      if (autoFill) {
        return `repeat(auto-fill, minmax(${minItemWidth}, ${maxItemWidth}))`
      }
      return `repeat(${gridColumns}, 1fr)`
    }

    return (
      <div
        ref={ref}
        className={cn('grid', className)}
        style={{
          gridTemplateColumns: getGridTemplateColumns(),
          gap: gridGap
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AdaptiveGrid.displayName = 'AdaptiveGrid'

// Adaptive Flex
export interface AdaptiveFlexProps
  extends React.HTMLAttributes<HTMLDivElement> {
  direction?: Partial<Record<Breakpoint, 'row' | 'column' | 'row-reverse' | 'column-reverse'>>
  wrap?: Partial<Record<Breakpoint, 'nowrap' | 'wrap' | 'wrap-reverse'>>
  justify?: Partial<Record<Breakpoint, 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'>>
  align?: Partial<Record<Breakpoint, 'start' | 'end' | 'center' | 'baseline' | 'stretch'>>
  gap?: Partial<Record<Breakpoint, string>>
}

export const AdaptiveFlex = forwardRef<HTMLDivElement, AdaptiveFlexProps>(
  ({ 
    className, 
    direction, 
    wrap, 
    justify, 
    align, 
    gap,
    children,
    ...props 
  }, ref) => {
    const { currentBreakpoint } = useResponsive()

    // Get responsive values
    const getDirection = () => {
      if (direction) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (direction[breakpoint] !== undefined) {
            return direction[breakpoint]!
          }
        }
      }
      return 'row'
    }

    const getWrap = () => {
      if (wrap) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (wrap[breakpoint] !== undefined) {
            return wrap[breakpoint]!
          }
        }
      }
      return 'nowrap'
    }

    const getJustify = () => {
      if (justify) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (justify[breakpoint] !== undefined) {
            return justify[breakpoint]!
          }
        }
      }
      return 'start'
    }

    const getAlign = () => {
      if (align) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (align[breakpoint] !== undefined) {
            return align[breakpoint]!
          }
        }
      }
      return 'start'
    }

    const getGap = () => {
      if (gap) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (gap[breakpoint] !== undefined) {
            return gap[breakpoint]!
          }
        }
      }
      return '0'
    }

    return (
      <div
        ref={ref}
        className={cn('flex', className)}
        style={{
          flexDirection: getDirection(),
          flexWrap: getWrap(),
          justifyContent: getJustify(),
          alignItems: getAlign(),
          gap: getGap()
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AdaptiveFlex.displayName = 'AdaptiveFlex'

// Adaptive Sidebar
export interface AdaptiveSidebarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  onToggle?: () => void
  position?: 'left' | 'right'
  width?: Partial<Record<Breakpoint, string>>
  overlay?: boolean
  persistent?: Partial<Record<Breakpoint, boolean>>
}

export const AdaptiveSidebar = forwardRef<HTMLDivElement, AdaptiveSidebarProps>(
  ({ 
    className, 
    isOpen = false, 
    onToggle, 
    position = 'left',
    width,
    overlay = false,
    persistent,
    children,
    ...props 
  }, ref) => {
    const { currentBreakpoint, isMobile } = useResponsive()

    // Get responsive values
    const getWidth = () => {
      if (width) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (width[breakpoint] !== undefined) {
            return width[breakpoint]!
          }
        }
      }
      return '250px'
    }

    const isPersistent = () => {
      if (persistent) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (persistent[breakpoint] !== undefined) {
            return persistent[breakpoint]!
          }
        }
      }
      return !isMobile
    }

    const sidebarWidth = getWidth()
    const isSidebarPersistent = isPersistent()

    return (
      <>
        {overlay && isOpen && !isSidebarPersistent && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
        )}
        <div
          ref={ref}
          className={cn(
            'bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
            position === 'left' ? 'border-r' : 'border-l',
            isSidebarPersistent ? 'relative' : 'fixed top-0 bottom-0 z-50',
            isSidebarPersistent ? 'w-full' : 'w-full',
            className
          )}
          style={{
            width: sidebarWidth,
            [position]: isSidebarPersistent ? 'auto' : isOpen ? '0' : `-${sidebarWidth}`
          }}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }
)

AdaptiveSidebar.displayName = 'AdaptiveSidebar'

// Adaptive Navigation
export interface AdaptiveNavigationProps
  extends React.HTMLAttributes<HTMLElement> {
  items: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    href?: string
    onClick?: () => void
    children?: Array<{
      id: string
      label: string
      href?: string
      onClick?: () => void
    }>
  }>
  variant?: 'horizontal' | 'vertical' | 'adaptive'
  collapsed?: Partial<Record<Breakpoint, boolean>>
}

export const AdaptiveNavigation = forwardRef<HTMLElement, AdaptiveNavigationProps>(
  ({ 
    className, 
    items, 
    variant = 'adaptive',
    collapsed,
    ...props 
  }, ref) => {
    const { currentBreakpoint, isMobile } = useResponsive()

    // Get responsive values
    const isCollapsed = () => {
      if (collapsed) {
        const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
        const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
        
        for (let i = currentIndex; i >= 0; i--) {
          const breakpoint = breakpointOrder[i]
          if (collapsed[breakpoint] !== undefined) {
            return collapsed[breakpoint]!
          }
        }
      }
      return isMobile
    }

    const getVariant = () => {
      if (variant === 'adaptive') {
        return isMobile ? 'vertical' : 'horizontal'
      }
      return variant
    }

    const navigationVariant = getVariant()
    const isNavigationCollapsed = isCollapsed()

    return (
      <nav
        ref={ref}
        className={cn(
          'flex',
          navigationVariant === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2',
          isNavigationCollapsed && 'flex-col space-y-1',
          className
        )}
        {...props}
      >
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <a
              href={item.href}
              onClick={item.onClick}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors',
                isNavigationCollapsed && 'justify-center'
              )}
            >
              {item.icon && (
                <span className={cn('flex-shrink-0', !isNavigationCollapsed && 'mr-2')}>
                  {item.icon}
                </span>
              )}
              {!isNavigationCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </a>
            {item.children && item.children.length > 0 && !isNavigationCollapsed && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {item.children.map((child) => (
                  <a
                    key={child.id}
                    href={child.href}
                    onClick={child.onClick}
                    className="block px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    )
  }
)

AdaptiveNavigation.displayName = 'AdaptiveNavigation'

const AdaptiveLayout = {
  AdaptiveContainer,
  AdaptiveGrid,
  AdaptiveFlex,
  AdaptiveSidebar,
  AdaptiveNavigation
}

export default AdaptiveLayout
