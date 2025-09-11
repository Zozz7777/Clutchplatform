'use client'

import React from 'react'
import { Palette, Bell, Layout } from 'lucide-react'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import DataContext from '@/components/dashboard/data-context'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import ThemeSelector from '@/components/theme/theme-toggle'

export default function SettingsPage() {
  const { preferences } = useUserPreferences()

  return (
    <DataContext
      title="Settings"
      lastUpdated={new Date()}
      timeRange="Current session"
    >
      <div className="space-y-6">
        {/* Theme Settings */}
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-clutch-primary" />
              <span>Appearance</span>
            </SnowCardTitle>
          </SnowCardHeader>
          <SnowCardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                Theme
              </label>
              <ThemeSelector />
            </div>
          </SnowCardContent>
        </SnowCard>

        {/* Dashboard Settings */}
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <Layout className="h-5 w-5 text-clutch-primary" />
              <span>Dashboard</span>
            </SnowCardTitle>
          </SnowCardHeader>
          <SnowCardContent>
            <p className="text-sm text-slate-600">
              Dashboard customization options will be available here.
            </p>
          </SnowCardContent>
        </SnowCard>

        {/* Notification Settings */}
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-clutch-primary" />
              <span>Notifications</span>
            </SnowCardTitle>
          </SnowCardHeader>
          <SnowCardContent>
            <p className="text-sm text-slate-600">
              Notification preferences will be available here.
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
    </DataContext>
  )
}