'use client'

import { useState, useEffect, useCallback } from 'react'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  defaultPage: string
  notifications: {
    email: boolean
    push: boolean
    sound: boolean
  }
  dashboard: {
    layout: 'grid' | 'list'
    widgets: string[]
    refreshInterval: number
  }
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  defaultPage: '/dashboard-consolidated',
  notifications: {
    email: true,
    push: true,
    sound: false
  },
  dashboard: {
    layout: 'grid',
    widgets: ['metrics', 'activity', 'services', 'status'],
    refreshInterval: 30000
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium'
  }
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('clutch-admin-preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        setPreferences({ ...defaultPreferences, ...parsed })
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('clutch-admin-preferences', JSON.stringify(preferences))
      } catch (error) {
        console.error('Failed to save user preferences:', error)
      }
    }
  }, [preferences, isLoaded])

  // Update a specific preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  // Update nested preferences
  const updateNestedPreference = useCallback(<
    K extends keyof UserPreferences,
    N extends keyof UserPreferences[K]
  >(
    key: K,
    nestedKey: N,
    value: UserPreferences[K][N]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [nestedKey]: value
      }
    }))
  }, [])

  // Reset preferences to default
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences)
  }, [])

  // Export preferences
  const exportPreferences = useCallback(() => {
    const dataStr = JSON.stringify(preferences, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'clutch-admin-preferences.json'
    link.click()
    URL.revokeObjectURL(url)
  }, [preferences])

  // Import preferences
  const importPreferences = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          setPreferences({ ...defaultPreferences, ...imported })
          resolve()
        } catch (error) {
          reject(new Error('Invalid preferences file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }, [])

  return {
    preferences,
    isLoaded,
    updatePreference,
    updateNestedPreference,
    resetPreferences,
    exportPreferences,
    importPreferences
  }
}

// Hook for specific preference categories
export function useThemePreference() {
  const { preferences, updatePreference } = useUserPreferences()
  
  return {
    theme: preferences.theme,
    setTheme: (theme: UserPreferences['theme']) => updatePreference('theme', theme)
  }
}

export function useDashboardPreference() {
  const { preferences, updateNestedPreference } = useUserPreferences()
  
  return {
    layout: preferences.dashboard.layout,
    setLayout: (layout: UserPreferences['dashboard']['layout']) => 
      updateNestedPreference('dashboard', 'layout', layout),
    widgets: preferences.dashboard.widgets,
    setWidgets: (widgets: UserPreferences['dashboard']['widgets']) => 
      updateNestedPreference('dashboard', 'widgets', widgets),
    refreshInterval: preferences.dashboard.refreshInterval,
    setRefreshInterval: (interval: UserPreferences['dashboard']['refreshInterval']) => 
      updateNestedPreference('dashboard', 'refreshInterval', interval)
  }
}

export function useAccessibilityPreference() {
  const { preferences, updateNestedPreference } = useUserPreferences()
  
  return {
    highContrast: preferences.accessibility.highContrast,
    setHighContrast: (enabled: boolean) => 
      updateNestedPreference('accessibility', 'highContrast', enabled),
    reducedMotion: preferences.accessibility.reducedMotion,
    setReducedMotion: (enabled: boolean) => 
      updateNestedPreference('accessibility', 'reducedMotion', enabled),
    fontSize: preferences.accessibility.fontSize,
    setFontSize: (size: UserPreferences['accessibility']['fontSize']) => 
      updateNestedPreference('accessibility', 'fontSize', size)
  }
}
