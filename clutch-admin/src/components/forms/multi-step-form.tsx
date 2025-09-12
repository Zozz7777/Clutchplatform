'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Save, 
  AlertCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

// Form step interface
export interface FormStep {
  id: string
  title: string
  description?: string
  component: React.ComponentType<FormStepProps>
  validation?: (data: any) => { isValid: boolean; errors: string[] }
  isOptional?: boolean
}

// Form step props
export interface FormStepProps {
  data: any
  onChange: (data: any) => void
  errors: string[]
  isVisible: boolean
}

// Multi-step form props
interface MultiStepFormProps {
  steps: FormStep[]
  initialData?: any
  onComplete?: (data: any) => void
  onSave?: (data: any) => void
  autoSave?: boolean
  autoSaveInterval?: number
  className?: string
}

export function MultiStepForm({
  steps,
  initialData = {},
  onComplete,
  onSave,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  className = ''
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialData)
  const [stepErrors, setStepErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const toast = useToast()

  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave || !isDirty) return

    const interval = setInterval(() => {
      handleAutoSave()
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [autoSave, isDirty, autoSaveInterval])

  // Validate current step
  const validateCurrentStep = useCallback(() => {
    const step = steps[currentStep]
    if (!step.validation) return true

    const validation = step.validation(formData)
    if (!validation.isValid) {
      setStepErrors(prev => ({
        ...prev,
        [step.id]: validation.errors
      }))
      return false
    }

    // Clear errors for this step
    setStepErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[step.id]
      return newErrors
    })

    return true
  }, [currentStep, steps, formData])

  // Handle data change
  const handleDataChange = useCallback((newData: any) => {
    setFormData(prev => ({ ...prev, ...newData }))
    setIsDirty(true)
  }, [])

  // Auto-save
  const handleAutoSave = useCallback(async () => {
    if (!onSave || !isDirty) return

    try {
      await onSave(formData)
      setLastSaved(new Date())
      setIsDirty(false)
      toast.success('Form auto-saved')
    } catch (error) {
      console.error('Auto-save failed:', error)
      toast.error('Auto-save failed', 'Your changes may not be saved')
    }
  }, [formData, isDirty, onSave, toast])

  // Manual save
  const handleSave = useCallback(async () => {
    if (!onSave) return

    setIsSubmitting(true)
    try {
      await onSave(formData)
      setLastSaved(new Date())
      setIsDirty(false)
      toast.success('Form saved successfully')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Save failed', 'Please try again')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSave, toast])

  // Go to next step
  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) return

    const currentStepData = steps[currentStep]
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]))

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Form completed
      handleComplete()
    }
  }, [currentStep, steps, validateCurrentStep])

  // Go to previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Complete form
  const handleComplete = useCallback(async () => {
    setIsSubmitting(true)
    try {
      if (onComplete) {
        await onComplete(formData)
      }
      toast.success('Form completed successfully')
    } catch (error) {
      console.error('Form completion failed:', error)
      toast.error('Form completion failed', 'Please try again')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onComplete, toast])

  // Go to specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    }
  }, [steps.length])

  // Progress calculation
  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100
  }, [currentStep, steps.length])

  // Current step data
  const currentStepData = steps[currentStep]
  const currentErrors = stepErrors[currentStepData.id] || []

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Form Progress</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {steps.length}: {currentStepData.title}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Saved {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
              {isDirty && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600 text-white'
                      : completedSteps.has(step.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  disabled={isSubmitting}
                >
                  {completedSteps.has(step.id) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {completedSteps.size} of {steps.length} steps completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData.title}
            {currentStepData.isOptional && (
              <Badge variant="outline" className="text-xs">Optional</Badge>
            )}
          </CardTitle>
          {currentStepData.description && (
            <CardDescription>{currentStepData.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {/* Step Errors */}
          {currentErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Please fix the following errors:</span>
              </div>
              <ul className="mt-2 text-sm text-red-700">
                {currentErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step Component */}
          <currentStepData.component
            data={formData}
            onChange={handleDataChange}
            errors={currentErrors}
            isVisible={true}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {onSave && (
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!isDirty || isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Form step wrapper component
export function FormStepWrapper({ 
  children, 
  title, 
  description 
}: { 
  children: React.ReactNode
  title?: string
  description?: string
}) {
  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// Form field wrapper with validation
export function FormField({ 
  label, 
  error, 
  required = false, 
  children 
}: { 
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// Form validation utilities
export const formValidators = {
  required: (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required'
    }
    return null
  },
  
  email: (value: string) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },
  
  minLength: (min: number) => (value: string) => {
    if (!value) return null
    if (value.length < min) {
      return `Must be at least ${min} characters long`
    }
    return null
  },
  
  maxLength: (max: number) => (value: string) => {
    if (!value) return null
    if (value.length > max) {
      return `Must be no more than ${max} characters long`
    }
    return null
  },
  
  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (!value) return null
    if (!regex.test(value)) {
      return message
    }
    return null
  },
  
  custom: (validator: (value: any) => string | null) => validator
}

// Form data persistence utilities
export const formPersistence = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`form-${key}`, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save form data:', error)
    }
  },
  
  load: (key: string) => {
    try {
      const data = localStorage.getItem(`form-${key}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to load form data:', error)
      return null
    }
  },
  
  clear: (key: string) => {
    try {
      localStorage.removeItem(`form-${key}`)
    } catch (error) {
      console.error('Failed to clear form data:', error)
    }
  }
}
