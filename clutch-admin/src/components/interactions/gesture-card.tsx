'use client'

import React, { forwardRef, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useGestureSupport } from '@/lib/micro-interactions'
import { useAccessibility } from '@/lib/accessibility'

export interface GestureCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Gesture actions
  swipeLeft?: {
    action: () => void
    icon: React.ReactNode
    label: string
    color?: string
  }
  swipeRight?: {
    action: () => void
    icon: React.ReactNode
    label: string
    color?: string
  }
  swipeUp?: {
    action: () => void
    icon: React.ReactNode
    label: string
    color?: string
  }
  swipeDown?: {
    action: () => void
    icon: React.ReactNode
    label: string
    color?: string
  }
  // Pinch actions
  pinchIn?: {
    action: () => void
    label: string
  }
  pinchOut?: {
    action: () => void
    label: string
  }
  // Long press
  longPress?: {
    action: () => void
    label: string
    duration?: number
  }
  // Hover effects
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'rotate' | 'none'
  // Animation
  animated?: boolean
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const GestureCard = forwardRef<HTMLDivElement, GestureCardProps>(
  (
    {
      className,
      children,
      swipeLeft,
      swipeRight,
      swipeUp,
      swipeDown,
      pinchIn,
      pinchOut,
      longPress,
      hoverEffect = 'lift',
      animated = true,
      ariaLabel,
      ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const { gestures, handlers: gestureHandlers } = useGestureSupport()
    const { announce } = useAccessibility()
    
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
    const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 })
    const [scale, setScale] = useState(1)

    // Combine refs
    const combinedRef = (node: HTMLDivElement) => {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
      if (cardRef.current !== node) {
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }
    }

    // Handle swipe gestures
    useEffect(() => {
      if (gestures.swipeLeft && swipeLeft) {
        swipeLeft.action()
        announce(swipeLeft.label)
        setSwipeOffset({ x: -100, y: 0 })
        setTimeout(() => setSwipeOffset({ x: 0, y: 0 }), 300)
      }

      if (gestures.swipeRight && swipeRight) {
        swipeRight.action()
        announce(swipeRight.label)
        setSwipeOffset({ x: 100, y: 0 })
        setTimeout(() => setSwipeOffset({ x: 0, y: 0 }), 300)
      }

      if (gestures.swipeUp && swipeUp) {
        swipeUp.action()
        announce(swipeUp.label)
        setSwipeOffset({ x: 0, y: -100 })
        setTimeout(() => setSwipeOffset({ x: 0, y: 0 }), 300)
      }

      if (gestures.swipeDown && swipeDown) {
        swipeDown.action()
        announce(swipeDown.label)
        setSwipeOffset({ x: 0, y: 100 })
        setTimeout(() => setSwipeOffset({ x: 0, y: 0 }), 300)
      }
    }, [gestures, swipeLeft, swipeRight, swipeUp, swipeDown, announce])

    // Handle long press
    const handleMouseDown = () => {
      if (longPress) {
        const timer = setTimeout(() => {
          longPress.action()
          announce(longPress.label)
        }, longPress.duration || 1000)
        setLongPressTimer(timer)
      }
    }

    const handleMouseUp = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
      }
    }

    // Handle hover effects
    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
    }

    // Handle press effects
    const handlePressStart = () => {
      setIsPressed(true)
    }

    const handlePressEnd = () => {
      setIsPressed(false)
    }

    // Hover effect styles
    const hoverEffectStyles = {
      lift: isHovered ? 'transform -translate-y-2 shadow-lg' : '',
      glow: isHovered ? 'shadow-lg shadow-primary/25' : '',
      scale: isHovered ? 'transform scale-105' : '',
      rotate: isHovered ? 'transform rotate-1' : '',
      none: ''
    }

    // Press effect styles
    const pressEffectStyles = {
      pressed: isPressed ? 'transform scale-95' : ''
    }

    return (
      <div
        ref={combinedRef}
        className={cn(
          // Base styles
          'relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200',
          // Hover effects
          hoverEffectStyles[hoverEffect],
          // Press effects
          pressEffectStyles.pressed,
          // Animation
          animated && 'transform transition-all duration-200',
          className
        )}
        style={{
          transform: `
            translate(${swipeOffset.x}px, ${swipeOffset.y}px)
            scale(${scale})
          `
        }}
        // ARIA attributes
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        // Event handlers
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        {...gestureHandlers}
        {...props}
      >
        {swipeLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-red-500 text-white flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {swipeLeft.icon}
          </div>
        )}
        
        {swipeRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-green-500 text-white flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {swipeRight.icon}
          </div>
        )}

        {swipeUp && (
          <div className="absolute top-0 left-0 right-0 h-16 bg-blue-500 text-white flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {swipeUp.icon}
          </div>
        )}

        {swipeDown && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-yellow-500 text-white flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {swipeDown.icon}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
        {longPress && longPressTimer && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    )
  }
)

GestureCard.displayName = 'GestureCard'

// Swipeable List Item
export interface SwipeableListItemProps
  extends Omit<GestureCardProps, 'swipeUp' | 'swipeDown' | 'pinchIn' | 'pinchOut' | 'longPress'> {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: {
    icon: React.ReactNode
    label: string
    color?: string
  }
  rightAction?: {
    icon: React.ReactNode
    label: string
    color?: string
  }
}

export const SwipeableListItem = forwardRef<HTMLDivElement, SwipeableListItemProps>(
  ({ 
    onSwipeLeft, 
    onSwipeRight, 
    leftAction, 
    rightAction, 
    className,
    ...props 
  }, ref) => {
    return (
      <GestureCard
        ref={ref}
        swipeLeft={leftAction ? {
          action: onSwipeLeft || (() => {}),
          icon: leftAction.icon,
          label: leftAction.label,
          color: leftAction.color
        } : undefined}
        swipeRight={rightAction ? {
          action: onSwipeRight || (() => {}),
          icon: rightAction.icon,
          label: rightAction.label,
          color: rightAction.color
        } : undefined}
        hoverEffect="lift"
        className={cn('group', className)}
        {...props}
      />
    )
  }
)

SwipeableListItem.displayName = 'SwipeableListItem'

// Draggable Card
export interface DraggableCardProps
  extends Omit<GestureCardProps, 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown' | 'onDrag' | 'onDragEnd'> {
  onDrag?: (deltaX: number, deltaY: number) => void
  onDragEnd?: (deltaX: number, deltaY: number) => void
  dragHandle?: React.ReactNode
  snapToGrid?: boolean
  gridSize?: number
}

export const DraggableCard = forwardRef<HTMLDivElement, DraggableCardProps>(
  ({ 
    onDrag, 
    onDragEnd, 
    dragHandle, 
    snapToGrid = false, 
    gridSize = 20,
    className,
    ...props 
  }, ref) => {
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })

    const handleMouseDown = (event: React.MouseEvent) => {
      if (dragHandle && !(event.target as Element).closest('[data-drag-handle]')) return
      
      setIsDragging(true)
      setStartPosition({ x: event.clientX, y: event.clientY })
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return

      const deltaX = event.clientX - startPosition.x
      const deltaY = event.clientY - startPosition.y

      let newX = deltaX
      let newY = deltaY

      if (snapToGrid) {
        newX = Math.round(deltaX / gridSize) * gridSize
        newY = Math.round(deltaY / gridSize) * gridSize
      }

      setDragOffset({ x: newX, y: newY })
      onDrag?.(newX, newY)
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        onDragEnd?.(dragOffset.x, dragOffset.y)
        setDragOffset({ x: 0, y: 0 })
      }
    }

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, startPosition])

    return (
      <GestureCard
        ref={ref}
        className={cn(
          'cursor-move',
          isDragging && 'z-50 shadow-2xl',
          className
        )}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`
        }}
        onMouseDown={handleMouseDown}
        {...props}
      >
        {dragHandle && (
          <div data-drag-handle className="absolute top-2 right-2 cursor-grab active:cursor-grabbing">
            {dragHandle}
          </div>
        )}
        {props.children}
      </GestureCard>
    )
  }
)

DraggableCard.displayName = 'DraggableCard'

export default GestureCard
