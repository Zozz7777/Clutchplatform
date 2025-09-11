'use client'

import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { useTheme } from 'next-themes'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]

  const handleThemeChange = () => {
    const currentIndex = themes.findIndex(t => t.value === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].value)
  }

  return (
    <SnowButton
      variant="ghost"
      size="sm"
      onClick={handleThemeChange}
      className="h-9 w-9 p-0"
      title={`Current theme: ${currentTheme.label}. Click to switch to ${themes[(themes.findIndex(t => t.value === theme) + 1) % themes.length].label}`}
    >
      <currentTheme.icon className="h-4 w-4" />
    </SnowButton>
  )
}

// Theme selector dropdown for more options
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme for daytime use' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme for low-light environments' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preference' }
  ]

  return (
    <div className="space-y-1">
      {themes.map((themeOption) => {
        const Icon = themeOption.icon
        return (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
              theme === themeOption.value
                ? 'bg-clutch-primary text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            <div className="flex-1">
              <div className="text-sm font-medium">{themeOption.label}</div>
              <div className={`text-xs ${
                theme === themeOption.value ? 'text-white/80' : 'text-slate-500'
              }`}>
                {themeOption.description}
              </div>
            </div>
            {theme === themeOption.value && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
