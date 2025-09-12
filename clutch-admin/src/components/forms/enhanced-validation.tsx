'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Loader2,
  Zap,
  Shield,
  Clock
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

// Validation rule types
export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
  async?: boolean
  validator?: (value: any) => boolean | Promise<boolean>
}

// Field validation state
export interface FieldValidation {
  isValid: boolean
  isDirty: boolean
  isTouched: boolean
  isPending: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule[]>>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [validation, setValidation] = useState<Partial<Record<keyof T, FieldValidation>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValid, setIsValid] = useState(false)
  
  const validationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Initialize validation state
  useEffect(() => {
    const initialValidation: Partial<Record<keyof T, FieldValidation>> = {}
    Object.keys(validationRules).forEach(key => {
      initialValidation[key as keyof T] = {
        isValid: true,
        isDirty: false,
        isTouched: false,
        isPending: false,
        errors: [],
        warnings: [],
        suggestions: []
      }
    })
    setValidation(initialValidation)
  }, [validationRules])

  // Validate single field
  const validateField = useCallback(async (fieldName: keyof T, value: any): Promise<FieldValidation> => {
    const rules = validationRules[fieldName] || []
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []
    let isValid = true
    let isPending = false

    for (const rule of rules) {
      try {
        if (rule.async && rule.validator) {
          isPending = true
          const result = await rule.validator(value)
          isPending = false
          if (!result) {
            errors.push(rule.message)
            isValid = false
          }
        } else {
          const result = validateRule(rule, value)
          if (!result.isValid) {
            if (rule.type === 'required') {
              errors.push(rule.message)
              isValid = false
            } else {
              warnings.push(rule.message)
            }
          }
        }
      } catch (error) {
        errors.push(`Validation error: ${error}`)
        isValid = false
        isPending = false
      }
    }

    // Generate suggestions based on common patterns
    if (fieldName === 'email' && value && !value.includes('@')) {
      suggestions.push('Email should contain @ symbol')
    }
    if (fieldName === 'password' && value && value.length < 8) {
      suggestions.push('Password should be at least 8 characters long')
    }

    return {
      isValid,
      isDirty: true,
      isTouched: true,
      isPending,
      errors,
      warnings,
      suggestions
    }
  }, [validationRules])

  // Validate rule
  const validateRule = useCallback((rule: ValidationRule, value: any) => {
    switch (rule.type) {
      case 'required':
        return { isValid: value !== null && value !== undefined && value !== '' }
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return { isValid: emailRegex.test(value) }
      case 'minLength':
        return { isValid: value && value.length >= rule.value }
      case 'maxLength':
        return { isValid: !value || value.length <= rule.value }
      case 'pattern':
        return { isValid: new RegExp(rule.value).test(value) }
      case 'custom':
        return { isValid: rule.validator ? rule.validator(value) : true }
      default:
        return { isValid: true }
    }
  }, [])

  // Debounced validation
  const debouncedValidate = useCallback((fieldName: keyof T, value: any) => {
    // Clear existing timeout
    const existingTimeout = validationTimeouts.current.get(fieldName as string)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(async () => {
      const result = await validateField(fieldName, value)
      setValidation(prev => ({
        ...prev,
        [fieldName]: result
      }))
    }, 300)

    validationTimeouts.current.set(fieldName as string, timeout)
  }, [validateField])

  // Handle field change
  const handleFieldChange = useCallback((fieldName: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
    
    // Immediate validation for required fields
    const rules = validationRules[fieldName] || []
    const hasRequiredRule = rules.some(rule => rule.type === 'required')
    
    if (hasRequiredRule) {
      debouncedValidate(fieldName, value)
    } else {
      // Debounced validation for other rules
      debouncedValidate(fieldName, value)
    }
  }, [validationRules, debouncedValidate])

  // Handle field blur
  const handleFieldBlur = useCallback(async (fieldName: keyof T) => {
    const value = values[fieldName]
    const result = await validateField(fieldName, value)
    setValidation(prev => ({
      ...prev,
      [fieldName]: { ...result, isTouched: true }
    }))
  }, [values, validateField])

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const results: Partial<Record<keyof T, FieldValidation>> = {}
    let formIsValid = true

    for (const fieldName of Object.keys(validationRules) as (keyof T)[]) {
      const value = values[fieldName]
      const result = await validateField(fieldName, value)
      results[fieldName] = result
      if (!result.isValid) {
        formIsValid = false
      }
    }

    setValidation(results)
    setIsValid(formIsValid)
    return formIsValid
  }, [values, validationRules, validateField])

  // Submit form
  const handleSubmit = useCallback(async (onSubmit: (values: T) => Promise<void>) => {
    setIsSubmitting(true)
    try {
      const isValid = await validateForm()
      if (isValid) {
        await onSubmit(values)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateForm])

  return {
    values,
    validation,
    isSubmitting,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    handleSubmit,
    setValues
  }
}

// Enhanced input component with real-time validation
export function EnhancedInput({
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  validation,
  placeholder,
  className = '',
  showPasswordToggle = false,
  autoComplete,
  disabled = false
}: {
  name: string
  label: string
  type?: string
  value: any
  onChange: (value: any) => void
  onBlur?: () => void
  validation?: FieldValidation
  placeholder?: string
  className?: string
  showPasswordToggle?: boolean
  autoComplete?: string
  disabled?: boolean
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type

  const hasError = validation?.errors && validation.errors.length > 0
  const hasWarning = validation?.warnings && validation.warnings.length > 0
  const hasSuggestion = validation?.suggestions && validation.suggestions.length > 0

  const inputClasses = `
    w-full px-3 py-2 border rounded-md transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${hasError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${hasWarning ? 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500' : ''}
    ${!hasError && !hasWarning ? 'border-slate-300 dark:border-slate-600' : ''}
    ${disabled ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : ''}
    ${className}
  `

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {validation?.isPending && (
          <Loader2 className="inline h-4 w-4 ml-2 animate-spin text-blue-500" />
        )}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type={inputType}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => {
            onBlur?.()
            setIsFocused(false)
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={inputClasses}
          autoComplete={autoComplete}
          disabled={disabled}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        
        {/* Validation status icon */}
        {validation && !validation.isPending && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Validation messages */}
      {validation && (isFocused || validation.isTouched) && (
        <div className="space-y-1">
          {/* Errors */}
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
          
          {/* Warnings */}
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-yellow-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
          
          {/* Suggestions */}
          {validation.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
              <Zap className="h-4 w-4 flex-shrink-0" />
              <span>{suggestion}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Password strength indicator
export function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = useCallback((pwd: string) => {
    let score = 0
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }

    score = Object.values(checks).filter(Boolean).length

    return {
      score,
      checks,
      level: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
      percentage: (score / 5) * 100
    }
  }, [])

  const strength = getStrength(password)

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Password strength:</span>
        <Badge variant={strength.level === 'strong' ? 'default' : strength.level === 'medium' ? 'secondary' : 'destructive'}>
          {strength.level}
        </Badge>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            strength.level === 'strong' ? 'bg-green-500' :
            strength.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Object.entries(strength.checks).map(([check, passed]) => (
          <div key={check} className={`flex items-center gap-1 ${passed ? 'text-green-600' : 'text-slate-400'}`}>
            {passed ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            <span className="capitalize">{check}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Form progress indicator
export function FormProgressIndicator({ 
  currentStep, 
  totalSteps, 
  completedSteps = [] 
}: { 
  currentStep: number
  totalSteps: number
  completedSteps?: number[]
}) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Progress</span>
        <span>{currentStep} of {totalSteps} steps</span>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-500">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < currentStep ? 'bg-blue-500' :
              completedSteps.includes(i) ? 'bg-green-500' : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Auto-save functionality
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  interval = 30000 // 30 seconds
) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  const save = useCallback(async () => {
    if (!hasUnsavedChanges) return

    setIsSaving(true)
    try {
      await saveFunction(data)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [data, saveFunction, hasUnsavedChanges])

  // Auto-save on interval
  useEffect(() => {
    if (hasUnsavedChanges) {
      saveTimeoutRef.current = setTimeout(save, interval)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [hasUnsavedChanges, save, interval])

  // Mark as having unsaved changes
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  // Manual save
  const manualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await save()
  }, [save])

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    markAsChanged,
    manualSave
  }
}

// Auto-save indicator component
export function AutoSaveIndicator({ 
  isSaving, 
  lastSaved, 
  hasUnsavedChanges 
}: { 
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : hasUnsavedChanges ? (
        <>
          <Clock className="h-4 w-4" />
          <span>Unsaved changes</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Saved {lastSaved.toLocaleTimeString()}</span>
        </>
      ) : null}
    </div>
  )
}
