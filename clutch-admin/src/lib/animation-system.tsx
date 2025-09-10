import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

/**
 * Performance-Optimized Animation System
 * Features:
 * - Hardware-accelerated animations
 * - Smooth transitions
 * - Contextual animations
 * - Performance monitoring
 * - Reduced motion support
 * - Animation queuing
 */

// Animation types
export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
  iterations?: number
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
  playState?: 'running' | 'paused'
}

export interface Keyframe {
  [property: string]: string | number
}

export interface AnimationOptions {
  config: AnimationConfig
  keyframes: Keyframe[]
  onStart?: () => void
  onEnd?: () => void
  onIteration?: () => void
  onCancel?: () => void
}

// Animation manager class
export class AnimationManager {
  private static instance: AnimationManager
  private animations = new Map<string, Animation>()
  private queuedAnimations: Array<{ id: string; options: AnimationOptions; element: HTMLElement }> = []
  private isProcessingQueue = false
  private performanceMonitor = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`Animation performance: ${entry.name} took ${entry.duration}ms`)
      }
    }
  })

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager()
    }
    return AnimationManager.instance
  }

  constructor() {
    this.performanceMonitor.observe({ entryTypes: ['measure'] })
  }

  // Create and start animation
  animate(
    element: HTMLElement,
    options: AnimationOptions,
    id?: string
  ): string {
    const animationId = id || `animation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Check for reduced motion preference
    if (this.shouldReduceMotion()) {
      // Apply final state immediately
      const finalKeyframe = options.keyframes[options.keyframes.length - 1]
      Object.assign(element.style, finalKeyframe)
      options.onEnd?.()
      return animationId
    }

    // Create animation
    const animation = element.animate(options.keyframes, {
      duration: options.config.duration,
      easing: options.config.easing,
      delay: options.config.delay || 0,
      iterations: options.config.iterations || 1,
      direction: options.config.direction || 'normal',
      fill: options.config.fillMode || 'both'
    })

    // Store animation
    this.animations.set(animationId, animation)

    // Set up event listeners
    animation.addEventListener('start', () => {
      options.onStart?.()
    })

    animation.addEventListener('finish', () => {
      options.onEnd?.()
      this.animations.delete(animationId)
    })

    animation.addEventListener('iteration', () => {
      options.onIteration?.()
    })

    animation.addEventListener('cancel', () => {
      options.onCancel?.()
      this.animations.delete(animationId)
    })

    return animationId
  }

  // Queue animation for later execution
  queueAnimation(
    element: HTMLElement,
    options: AnimationOptions,
    id?: string
  ): string {
    const animationId = id || `queued-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    this.queuedAnimations.push({ id: animationId, options, element })
    
    if (!this.isProcessingQueue) {
      this.processQueue()
    }
    
    return animationId
  }

  // Process animation queue
  private async processQueue() {
    this.isProcessingQueue = true
    
    while (this.queuedAnimations.length > 0) {
      const { id, options, element } = this.queuedAnimations.shift()!
      
      // Wait for previous animation to complete
      await this.waitForAnimation(id)
      
      // Start next animation
      this.animate(element, options, id)
    }
    
    this.isProcessingQueue = false
  }

  // Wait for animation to complete
  private waitForAnimation(id: string): Promise<void> {
    return new Promise((resolve) => {
      const checkAnimation = () => {
        if (!this.animations.has(id)) {
          resolve()
        } else {
          requestAnimationFrame(checkAnimation)
        }
      }
      checkAnimation()
    })
  }

  // Pause animation
  pauseAnimation(id: string): void {
    const animation = this.animations.get(id)
    if (animation) {
      animation.pause()
    }
  }

  // Resume animation
  resumeAnimation(id: string): void {
    const animation = this.animations.get(id)
    if (animation) {
      animation.play()
    }
  }

  // Cancel animation
  cancelAnimation(id: string): void {
    const animation = this.animations.get(id)
    if (animation) {
      animation.cancel()
      this.animations.delete(id)
    }
  }

  // Cancel all animations
  cancelAllAnimations(): void {
    this.animations.forEach(animation => animation.cancel())
    this.animations.clear()
    this.queuedAnimations = []
  }

  // Check if animation is running
  isAnimationRunning(id: string): boolean {
    const animation = this.animations.get(id)
    return animation ? animation.playState === 'running' : false
  }

  // Get animation progress
  getAnimationProgress(id: string): number {
    const animation = this.animations.get(id)
    if (!animation) return 0
    
    return (animation.currentTime as number) / (animation.effect?.getTiming().duration as number) || 0
  }

  // Check for reduced motion preference
  private shouldReduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Performance monitoring
  measurePerformance(name: string, fn: () => void): void {
    performance.mark(`${name}-start`)
    fn()
    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)
  }
}

// Animation presets
export const animationPresets = {
  // Fade animations
  fadeIn: {
    config: { duration: 300, easing: 'ease-out' },
    keyframes: [
      { opacity: 0 },
      { opacity: 1 }
    ]
  },
  
  fadeOut: {
    config: { duration: 300, easing: 'ease-in' },
    keyframes: [
      { opacity: 1 },
      { opacity: 0 }
    ]
  },

  // Slide animations
  slideInUp: {
    config: { duration: 300, easing: 'ease-out' },
    keyframes: [
      { transform: 'translateY(100%)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ]
  },

  slideInDown: {
    config: { duration: 300, easing: 'ease-out' },
    keyframes: [
      { transform: 'translateY(-100%)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ]
  },

  slideInLeft: {
    config: { duration: 300, easing: 'ease-out' },
    keyframes: [
      { transform: 'translateX(-100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ]
  },

  slideInRight: {
    config: { duration: 300, easing: 'ease-out' },
    keyframes: [
      { transform: 'translateX(100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ]
  },

  // Scale animations
  scaleIn: {
    config: { duration: 300, easing: 'ease-out' },
    keyframes: [
      { transform: 'scale(0.9)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ]
  },

  scaleOut: {
    config: { duration: 300, easing: 'ease-in' },
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(0.9)', opacity: 0 }
    ]
  },

  // Bounce animations
  bounceIn: {
    config: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    keyframes: [
      { transform: 'scale(0.3)', opacity: 0 },
      { transform: 'scale(1.05)', opacity: 1 },
      { transform: 'scale(0.9)', opacity: 1 },
      { transform: 'scale(1)', opacity: 1 }
    ]
  },

  // Rotate animations
  rotateIn: {
    config: { duration: 300, easing: 'ease-out' },
    keyframes: [
      { transform: 'rotate(-180deg)', opacity: 0 },
      { transform: 'rotate(0deg)', opacity: 1 }
    ]
  },

  // Elastic animations
  elasticIn: {
    config: { duration: 800, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    keyframes: [
      { transform: 'scale(0)', opacity: 0 },
      { transform: 'scale(1.2)', opacity: 1 },
      { transform: 'scale(0.9)', opacity: 1 },
      { transform: 'scale(1.05)', opacity: 1 },
      { transform: 'scale(1)', opacity: 1 }
    ]
  }
}

// Animation hooks
export function useAnimation() {
  const manager = useRef(AnimationManager.getInstance())
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationId, setAnimationId] = useState<string | null>(null)

  const animate = useCallback((
    element: HTMLElement,
    options: AnimationOptions,
    id?: string
  ) => {
    setIsAnimating(true)
    const animId = manager.current.animate(element, {
      ...options,
      onStart: () => {
        setIsAnimating(true)
        options.onStart?.()
      },
      onEnd: () => {
        setIsAnimating(false)
        setAnimationId(null)
        options.onEnd?.()
      }
    }, id)
    setAnimationId(animId)
    return animId
  }, [])

  const queueAnimation = useCallback((
    element: HTMLElement,
    options: AnimationOptions,
    id?: string
  ) => {
    return manager.current.queueAnimation(element, options, id)
  }, [])

  const pauseAnimation = useCallback(() => {
    if (animationId) {
      manager.current.pauseAnimation(animationId)
    }
  }, [animationId])

  const resumeAnimation = useCallback(() => {
    if (animationId) {
      manager.current.resumeAnimation(animationId)
    }
  }, [animationId])

  const cancelAnimation = useCallback(() => {
    if (animationId) {
      manager.current.cancelAnimation(animationId)
      setIsAnimating(false)
      setAnimationId(null)
    }
  }, [animationId])

  return {
    animate,
    queueAnimation,
    pauseAnimation,
    resumeAnimation,
    cancelAnimation,
    isAnimating,
    animationId
  }
}

// Transition hook
export function useTransition(
  isVisible: boolean,
  options: AnimationOptions,
  elementRef: React.RefObject<HTMLElement>
) {
  const { animate, cancelAnimation } = useAnimation()

  useEffect(() => {
    if (!elementRef.current) return

    if (isVisible) {
      animate(elementRef.current, options)
    } else {
      cancelAnimation()
    }
  }, [isVisible, options, animate, cancelAnimation, elementRef])
}

// Stagger animation hook
export function useStaggerAnimation(
  elements: HTMLElement[],
  options: AnimationOptions,
  staggerDelay: number = 100
) {
  const { animate } = useAnimation()

  const animateStagger = useCallback(() => {
    elements.forEach((element, index) => {
      if (element) {
        setTimeout(() => {
          animate(element, options)
        }, index * staggerDelay)
      }
    })
  }, [elements, options, staggerDelay, animate])

  return { animateStagger }
}

// Performance monitoring hook
export function useAnimationPerformance() {
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    frameRate: number
    droppedFrames: number
    averageFrameTime: number
  }>({
    frameRate: 60,
    droppedFrames: 0,
    averageFrameTime: 16.67
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let droppedFrames = 0
    const frameTimes: number[] = []

    const measureFrame = () => {
      const currentTime = performance.now()
      const frameTime = currentTime - lastTime
      
      frameTimes.push(frameTime)
      if (frameTimes.length > 60) {
        frameTimes.shift()
      }

      if (frameTime > 16.67) {
        droppedFrames++
      }

      frameCount++
      lastTime = currentTime

      if (frameCount % 60 === 0) {
        const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
        const frameRate = 1000 / averageFrameTime

        setPerformanceMetrics({
          frameRate: Math.round(frameRate),
          droppedFrames,
          averageFrameTime: Math.round(averageFrameTime * 100) / 100
        })

        droppedFrames = 0
      }

      requestAnimationFrame(measureFrame)
    }

    requestAnimationFrame(measureFrame)
  }, [])

  return performanceMetrics
}

// Animation context
export const AnimationContext = React.createContext<{
  manager: AnimationManager
  shouldReduceMotion: boolean
}>({
  manager: AnimationManager.getInstance(),
  shouldReduceMotion: false
})

// Animation provider
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduceMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <AnimationContext.Provider
      value={{
        manager: AnimationManager.getInstance(),
        shouldReduceMotion
      }}
    >
      {children}
    </AnimationContext.Provider>
  )
}

// Animation utilities
export const animationUtils = {
  // Create keyframes from CSS properties
  createKeyframes: (properties: Record<string, any>[]): Keyframe[] => {
    return properties.map(prop => ({ ...prop }))
  },

  // Create easing function
  createEasing: (type: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier' | 'spring', ...params: number[]): string => {
    switch (type) {
      case 'cubic-bezier':
        return `cubic-bezier(${params.join(', ')})`
      case 'spring':
        return `cubic-bezier(0.68, -0.55, 0.265, 1.55)`
      default:
        return type
    }
  },

  // Calculate animation duration based on distance
  calculateDuration: (distance: number, baseDuration: number = 300): number => {
    return Math.min(Math.max(distance * 2, baseDuration), 1000)
  },

  // Create staggered delay
  createStaggerDelay: (index: number, baseDelay: number = 100): number => {
    return index * baseDelay
  }
}

const AnimationSystem = {
  AnimationManager,
  animationPresets,
  useAnimation,
  useTransition,
  useStaggerAnimation,
  useAnimationPerformance,
  AnimationContext,
  AnimationProvider,
  animationUtils
}

export default AnimationSystem
