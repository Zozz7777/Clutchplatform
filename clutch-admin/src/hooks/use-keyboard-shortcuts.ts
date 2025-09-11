'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  category: string
}

export function useKeyboardShortcuts() {
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'd',
      ctrlKey: true,
      action: () => router.push('/dashboard-consolidated'),
      description: 'Go to Dashboard',
      category: 'Navigation'
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => router.push('/autonomous-dashboard'),
      description: 'Go to Autonomous Dashboard',
      category: 'Navigation'
    },
    {
      key: 'u',
      ctrlKey: true,
      action: () => router.push('/users'),
      description: 'Go to Users',
      category: 'Navigation'
    },
    {
      key: 'o',
      ctrlKey: true,
      action: () => router.push('/operations'),
      description: 'Go to Operations',
      category: 'Navigation'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => router.push('/settings'),
      description: 'Go to Settings',
      category: 'Navigation'
    },

    // UI shortcuts
    {
      key: 'b',
      ctrlKey: true,
      action: toggleSidebar,
      description: 'Toggle Sidebar',
      category: 'Interface'
    },
    {
      key: '/',
      action: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus Search',
      category: 'Interface'
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals or dropdowns
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.blur) {
          activeElement.blur()
        }
      },
      description: 'Close Modal/Dropdown',
      category: 'Interface'
    },

    // Help shortcuts
    {
      key: '?',
      ctrlKey: true,
      action: () => {
        // This will be handled by the component that uses this hook
        const event = new CustomEvent('open-keyboard-shortcuts')
        window.dispatchEvent(event)
      },
      description: 'Show Keyboard Shortcuts',
      category: 'Help'
    },

    // Browser shortcuts
    {
      key: 'r',
      ctrlKey: true,
      action: () => window.location.reload(),
      description: 'Refresh Page',
      category: 'Browser'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => {
        // Let browser handle find
      },
      description: 'Find in Page',
      category: 'Browser'
    }
  ]

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return
    }

    const pressedShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.metaKey === event.metaKey
      )
    })

    if (pressedShortcut) {
      event.preventDefault()
      pressedShortcut.action()
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcuts,
    registerShortcut: (shortcut: Omit<KeyboardShortcut, 'id'>) => {
      shortcuts.push(shortcut as KeyboardShortcut)
    }
  }
}

// Hook to show keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const { shortcuts } = useKeyboardShortcuts()

  const getShortcutsByCategory = () => {
    return shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category].push(shortcut)
      return acc
    }, {} as Record<string, KeyboardShortcut[]>)
  }

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = []
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.metaKey) parts.push('Cmd')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  return {
    shortcuts,
    getShortcutsByCategory,
    formatShortcut
  }
}
