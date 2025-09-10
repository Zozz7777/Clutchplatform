'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '@/hooks/use-app'
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  MousePointer,
  Keyboard,
  Eye,
  Zap
} from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'type' | 'scroll' | 'wait'
  actionTarget?: string
  actionValue?: string
  highlight?: boolean
  skipable?: boolean
}

interface InteractiveTourProps {
  isOpen: boolean
  onClose: () => void
  tourId: string
  steps: TourStep[]
  onComplete?: () => void
}

export function InteractiveTour({ 
  isOpen, 
  onClose, 
  tourId, 
  steps, 
  onComplete 
}: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [tourProgress, setTourProgress] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  
  const { analytics } = useApp()
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      analytics.trackEvent('tour_started', { tourId })
      startTour()
    }
  }, [isOpen, tourId])

  useEffect(() => {
    if (isOpen && steps.length > 0) {
      updateTourProgress()
      highlightCurrentStep()
    }
  }, [currentStep, isOpen])

  const startTour = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setTourProgress(0)
    highlightCurrentStep()
  }

  const updateTourProgress = () => {
    const progress = ((currentStep + 1) / steps.length) * 100
    setTourProgress(progress)
  }

  const highlightCurrentStep = () => {
    if (currentStep >= steps.length) return

    const step = steps[currentStep]
    const element = document.querySelector(step.target) as HTMLElement
    
    if (element) {
      setHighlightedElement(element)
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      })
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(prev => prev + 1)
      analytics.trackEvent('tour_step_completed', { 
        tourId, 
        step: currentStep,
        stepId: steps[currentStep].id
      })
    } else {
      completeTour()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      completeTour()
    }
  }

  const completeTour = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    analytics.trackEvent('tour_completed', { tourId })
    onComplete?.()
    onClose()
  }

  const resetTour = () => {
    startTour()
    analytics.trackEvent('tour_reset', { tourId })
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    analytics.trackEvent('tour_play_pause', { 
      tourId, 
      action: isPlaying ? 'pause' : 'play' 
    })
  }

  const getStepPosition = (step: TourStep) => {
    if (!highlightedElement) return { top: 0, left: 0 }

    const rect = highlightedElement.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 200
    const offset = 10

    switch (step.position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - offset,
          left: rect.left + (rect.width - tooltipWidth) / 2
        }
      case 'bottom':
        return {
          top: rect.bottom + offset,
          left: rect.left + (rect.width - tooltipWidth) / 2
        }
      case 'left':
        return {
          top: rect.top + (rect.height - tooltipHeight) / 2,
          left: rect.left - tooltipWidth - offset
        }
      case 'right':
        return {
          top: rect.top + (rect.height - tooltipHeight) / 2,
          left: rect.right + offset
        }
      default:
        return {
          top: rect.bottom + offset,
          left: rect.left + (rect.width - tooltipWidth) / 2
        }
    }
  }

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'click': return <MousePointer className="h-4 w-4" />
      case 'type': return <Keyboard className="h-4 w-4" />
      case 'scroll': return <ArrowRight className="h-4 w-4" />
      case 'wait': return <Circle className="h-4 w-4" />
      default: return <ArrowRight className="h-4 w-4" />
    }
  }

  if (!isOpen || steps.length === 0) return null

  const currentStepData = steps[currentStep]
  const position = getStepPosition(currentStepData)

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {highlightedElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: highlightedElement.offsetTop - 4,
            left: highlightedElement.offsetLeft - 4,
            width: highlightedElement.offsetWidth + 8,
            height: highlightedElement.offsetHeight + 8,
            border: '2px solid #3B82F6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm"
        style={{
          top: Math.max(10, position.top),
          left: Math.max(10, Math.min(position.left, window.innerWidth - 340))
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{currentStep + 1}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentStepData.title}
              </h3>
              <p className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(tourProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${tourProgress}%` }}
            />
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 mb-4">{currentStepData.description}</p>
          
          {currentStepData.action && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              {getActionIcon(currentStepData.action)}
              <span className="text-sm text-blue-800">
                {currentStepData.action === 'click' && 'Click the highlighted element'}
                {currentStepData.action === 'type' && `Type: ${currentStepData.actionValue}`}
                {currentStepData.action === 'scroll' && 'Scroll to see more content'}
                {currentStepData.action === 'wait' && 'Wait for the action to complete'}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep
                  ? 'bg-primary'
                  : completedSteps.has(index)
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={resetTour}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Reset tour"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlayPause}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title={isPlaying ? 'Pause tour' : 'Play tour'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={previousStep}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}
            
            {currentStepData.skipable && (
              <button
                onClick={skipStep}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
              {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      {isPlaying && (
        <AutoPlayTour
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={nextStep}
          onComplete={completeTour}
        />
      )}
    </>
  )
}

// Auto-play component
function AutoPlayTour({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onComplete 
}: {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onComplete: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        onNext()
      } else {
        onComplete()
      }
    }, 3000) // Auto-advance every 3 seconds

    return () => clearTimeout(timer)
  }, [currentStep, totalSteps, onNext, onComplete])

  return null
}

// Predefined tours
export const tours = {
  welcome: [
    {
      id: 'welcome-1',
      title: 'Welcome to Clutch Admin v2.0!',
      description: 'Welcome to the enhanced Clutch Admin platform. This tour will show you the new features and improvements.',
      target: 'body',
      position: 'bottom' as const,
      skipable: true
    },
    {
      id: 'navigation-1',
      title: 'Smart Navigation Bar',
      description: 'The new navigation bar includes intelligent search, quick actions, and theme switching.',
      target: '[data-testid="smart-navigation-bar"]',
      position: 'bottom' as const,
      action: 'click' as const
    },
    {
      id: 'sidebar-1',
      title: 'Smart Sidebar',
      description: 'The enhanced sidebar shows your navigation items, smart suggestions, and recent pages.',
      target: '[data-testid="smart-sidebar"]',
      position: 'right' as const,
      action: 'click' as const
    },
    {
      id: 'search-1',
      title: 'Intelligent Search',
      description: 'Use the smart search to find anything quickly. It understands context and provides suggestions.',
      target: '[data-testid="search-input"]',
      position: 'bottom' as const,
      action: 'click' as const
    },
    {
      id: 'feedback-1',
      title: 'Feedback System',
      description: 'Submit feedback, report bugs, or request features using the feedback widget.',
      target: '[data-testid="feedback-widget"]',
      position: 'left' as const,
      action: 'click' as const
    }
  ],
  
  performance: [
    {
      id: 'performance-1',
      title: 'Performance Dashboard',
      description: 'Monitor system performance and Core Web Vitals in real-time.',
      target: '[data-testid="performance-dashboard"]',
      position: 'left' as const,
      action: 'click' as const
    },
    {
      id: 'performance-2',
      title: 'Performance Metrics',
      description: 'View detailed performance metrics including load times, memory usage, and optimization scores.',
      target: '[data-testid="performance-metrics"]',
      position: 'top' as const
    }
  ],
  
  accessibility: [
    {
      id: 'accessibility-1',
      title: 'Keyboard Navigation',
      description: 'Navigate the entire application using only your keyboard. Press Tab to move between elements.',
      target: 'body',
      position: 'bottom' as const,
      action: 'type' as const,
      actionValue: 'Tab'
    },
    {
      id: 'accessibility-2',
      title: 'Screen Reader Support',
      description: 'The application is fully compatible with screen readers and includes proper ARIA labels.',
      target: 'body',
      position: 'bottom' as const
    }
  ]
}

export default InteractiveTour
