'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'

export default function TestThemePage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle>Theme Toggle Test</SnowCardTitle>
          </SnowCardHeader>
          <SnowCardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Current Theme:</span>
              <span className="px-2 py-1 bg-primary text-primary-foreground rounded">
                {theme}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <SnowButton onClick={() => setTheme('light')} variant={theme === 'light' ? 'default' : 'outline'}>
                Light
              </SnowButton>
              <SnowButton onClick={() => setTheme('dark')} variant={theme === 'dark' ? 'default' : 'outline'}>
                Dark
              </SnowButton>
              <SnowButton onClick={() => setTheme('system')} variant={theme === 'system' ? 'default' : 'outline'}>
                System
              </SnowButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-card text-card-foreground border rounded-lg">
                <h3 className="font-semibold mb-2">Card Background</h3>
                <p className="text-muted-foreground">This should change with theme</p>
              </div>
              
              <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                <h3 className="font-semibold mb-2">Primary Background</h3>
                <p>This should change with theme</p>
              </div>
              
              <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                <h3 className="font-semibold mb-2">Secondary Background</h3>
                <p>This should change with theme</p>
              </div>
              
              <div className="p-4 bg-muted text-muted-foreground rounded-lg">
                <h3 className="font-semibold mb-2">Muted Background</h3>
                <p>This should change with theme</p>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Border Test</h3>
              <p className="text-foreground">This border should change color with theme</p>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}
