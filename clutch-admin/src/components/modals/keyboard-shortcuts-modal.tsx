'use client'

import React from 'react'
import { X, Keyboard } from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { useKeyboardShortcutsHelp } from '@/hooks/use-keyboard-shortcuts'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const { getShortcutsByCategory, formatShortcut } = useKeyboardShortcutsHelp()

  if (!isOpen) return null

  const shortcutsByCategory = getShortcutsByCategory()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <SnowCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-clutch-primary" />
            <SnowCardTitle>Keyboard Shortcuts</SnowCardTitle>
          </div>
          <SnowButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </SnowButton>
        </SnowCardHeader>
        
        <SnowCardContent className="overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">
                          {shortcut.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {formatShortcut(shortcut).split(' + ').map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < formatShortcut(shortcut).split(' + ').length - 1 && (
                              <span className="text-slate-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-clutch-primary-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-clutch-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">i</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-clutch-primary-900 mb-1">
                  Pro Tip
                </h4>
                <p className="text-sm text-clutch-primary-800">
                  Press <kbd className="px-1 py-0.5 text-xs font-mono bg-white border border-clutch-primary-300 rounded">?</kbd> anywhere in the app to quickly open this help modal.
                </p>
              </div>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}
