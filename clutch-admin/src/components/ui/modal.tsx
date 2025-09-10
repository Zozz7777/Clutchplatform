'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { SnowButton } from './snow-button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocusedRef = useRef<Element | null>(null)

  const getFocusable = useCallback(() => {
    const container = containerRef.current
    if (!container) return [] as HTMLElement[]
    const selectors = [
      'a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])',
      'button:not([disabled])', 'iframe', 'object', 'embed', '[tabindex]:not([tabindex="-1"])', '[contenteditable]'
    ]
    return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(',')))
      .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedRef.current = document.activeElement
    const focusables = getFocusable()
    if (focusables.length > 0) {
      focusables[0].focus()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const els = getFocusable()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, getFocusable])

  useEffect(() => {
    return () => {
      const prev = previouslyFocusedRef.current as HTMLElement | null
      prev?.focus?.()
    }
  }, [])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div ref={containerRef} className={`relative bg-white bg-white rounded-xl shadow-2xl border border-slate-200 border-slate-200 w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 border-slate-200">
          <h2 id="modal-title" className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <SnowButton
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </SnowButton>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {children}
        </div>
      </div>
    </div>
  )
}


