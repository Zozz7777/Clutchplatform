'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Download,
  Upload,
  History,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useAutoSave, AutoSaveIndicator } from './enhanced-validation'

// Auto-save form interface
interface AutoSaveFormProps<T> {
  initialData: T
  onSave: (data: T) => Promise<void>
  onLoad?: () => Promise<T>
  saveInterval?: number
  storageKey?: string
  children: (props: AutoSaveFormRenderProps<T>) => React.ReactNode
  className?: string
}

// Auto-save form render props
interface AutoSaveFormRenderProps<T> {
  data: T
  setData: (data: T | ((prev: T) => T)) => void
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  save: () => Promise<void>
  load: () => Promise<void>
  reset: () => void
  version: number
  history: T[]
  restoreVersion: (version: number) => void
}

// Auto-save form component
export function AutoSaveForm<T extends Record<string, any>>({
  initialData,
  onSave,
  onLoad,
  saveInterval = 30000, // 30 seconds
  storageKey,
  children,
  className = ''
}: AutoSaveFormProps<T>) {
  const [data, setData] = useState<T>(initialData)
  const [version, setVersion] = useState(0)
  const [history, setHistory] = useState<T[]>([initialData])
  const [isLoading, setIsLoading] = useState(false)
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null)
  
  const toast = useToast()
  const dataRef = useRef(data)
  const versionRef = useRef(0)

  // Update refs when data changes
  useEffect(() => {
    dataRef.current = data
  }, [data])

  // Auto-save functionality
  const {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    markAsChanged,
    manualSave
  } = useAutoSave(data, onSave, saveInterval)

  // Load data from storage or API
  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      let loadedData: T

      if (onLoad) {
        // Load from API
        loadedData = await onLoad()
      } else if (storageKey) {
        // Load from localStorage
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          loadedData = JSON.parse(stored)
        } else {
          loadedData = initialData
        }
      } else {
        loadedData = initialData
      }

      setData(loadedData)
      setLastLoaded(new Date())
      setVersion(prev => prev + 1)
      setHistory(prev => [loadedData, ...prev.slice(0, 9)]) // Keep last 10 versions
      
      toast.success('Data loaded successfully')
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data', 'Please try again')
    } finally {
      setIsLoading(false)
    }
  }, [onLoad, storageKey, initialData, toast])

  // Save data
  const save = useCallback(async () => {
    try {
      await manualSave()
      
      // Save to localStorage if storageKey is provided
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(data))
      }
      
      // Update version and history
      setVersion(prev => prev + 1)
      setHistory(prev => [data, ...prev.slice(0, 9)])
      
      toast.success('Data saved successfully')
    } catch (error) {
      console.error('Failed to save data:', error)
      toast.error('Failed to save data', 'Please try again')
    }
  }, [manualSave, storageKey, data, toast])

  // Reset data to initial state
  const reset = useCallback(() => {
    setData(initialData)
    setVersion(prev => prev + 1)
    setHistory(prev => [initialData, ...prev.slice(0, 9)])
    toast.info('Data reset to initial state')
  }, [initialData, toast])

  // Restore from history
  const restoreVersion = useCallback((versionIndex: number) => {
    if (versionIndex >= 0 && versionIndex < history.length) {
      const restoredData = history[versionIndex]
      setData(restoredData)
      setVersion(prev => prev + 1)
      toast.info(`Restored to version ${versionIndex + 1}`)
    }
  }, [history, toast])

  // Handle data changes
  const handleDataChange = useCallback((newData: T | ((prev: T) => T)) => {
    setData(newData)
    markAsChanged()
  }, [markAsChanged])

  // Load data on mount
  useEffect(() => {
    if (onLoad || storageKey) {
      load()
    }
  }, [load, onLoad, storageKey])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const renderProps: AutoSaveFormRenderProps<T> = {
    data,
    setData: handleDataChange,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    save,
    load,
    reset,
    version,
    history,
    restoreVersion
  }

  return (
    <div className={className}>
      {children(renderProps)}
    </div>
  )
}

// Auto-save form toolbar
export function AutoSaveFormToolbar({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  onSave,
  onLoad,
  onReset,
  version,
  history,
  onRestoreVersion,
  className = ''
}: {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  onSave: () => Promise<void>
  onLoad: () => Promise<void>
  onReset: () => void
  version: number
  history: any[]
  onRestoreVersion: (version: number) => void
  className?: string
}) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AutoSaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
            />
            
            <Badge variant="outline" className="text-xs">
              Version {version}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoad}
              disabled={isSaving}
            >
              <Upload className="h-4 w-4 mr-2" />
              Load
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isSaving}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* History panel */}
        {showHistory && (
          <div className="mt-4 p-4 border-t">
            <h4 className="font-medium mb-3">Version History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Version {index + 1}</span>
                    {index === 0 && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRestoreVersion(index)}
                    disabled={index === 0}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Form analytics and completion tracking
export function useFormAnalytics<T>(formName: string) {
  const [analytics, setAnalytics] = useState({
    startTime: Date.now(),
    fieldInteractions: new Map<string, number>(),
    completionPercentage: 0,
    timeSpent: 0,
    errors: 0,
    saves: 0
  })

  const trackFieldInteraction = useCallback((fieldName: string) => {
    setAnalytics(prev => {
      const newInteractions = new Map(prev.fieldInteractions)
      newInteractions.set(fieldName, (newInteractions.get(fieldName) || 0) + 1)
      return {
        ...prev,
        fieldInteractions: newInteractions
      }
    })
  }, [])

  const trackCompletion = useCallback((percentage: number) => {
    setAnalytics(prev => ({
      ...prev,
      completionPercentage: percentage
    }))
  }, [])

  const trackError = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      errors: prev.errors + 1
    }))
  }, [])

  const trackSave = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      saves: prev.saves + 1
    }))
  }, [])

  const getAnalytics = useCallback(() => {
    const timeSpent = Date.now() - analytics.startTime
    return {
      ...analytics,
      timeSpent,
      mostInteractedField: Array.from(analytics.fieldInteractions.entries())
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'
    }
  }, [analytics])

  return {
    analytics: getAnalytics(),
    trackFieldInteraction,
    trackCompletion,
    trackError,
    trackSave
  }
}

// Form completion tracking component
export function FormCompletionTracker({
  completionPercentage,
  timeSpent,
  errors,
  saves,
  className = ''
}: {
  completionPercentage: number
  timeSpent: number
  errors: number
  saves: number
  className?: string
}) {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Form Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
              <div className="text-xs text-slate-500">Time Spent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{errors}</div>
              <div className="text-xs text-slate-500">Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{saves}</div>
              <div className="text-xs text-slate-500">Saves</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Export form data functionality
export function useFormExport<T>(data: T, formName: string) {
  const exportToJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formName}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [data, formName])

  const exportToCSV = useCallback(() => {
    if (typeof data === 'object' && data !== null) {
      const csv = Object.entries(data)
        .map(([key, value]) => `${key},${value}`)
        .join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${formName}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [data, formName])

  return {
    exportToJSON,
    exportToCSV
  }
}
