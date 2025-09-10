'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { useAuthStore, useUIStore } from '@/store'
import { Logo } from '@/components/ui/logo'
import {
  Settings, User, Bell, Shield, Palette, Globe, Database, Key, Mail, Smartphone, Monitor, Moon, Sun, Save, RefreshCw, Download, Upload, Trash2, Eye, EyeOff,
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { theme, setTheme } = useUIStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)

  const settingsSections = [
    {
      title: 'Profile Settings',
      icon: <User className="h-5 w-5" />,
      description: 'Manage your personal information and preferences',
      items: [
        { label: 'First Name', value: user?.firstName || '', type: 'text' },
        { label: 'Last Name', value: user?.lastName || '', type: 'text' },
        { label: 'Email', value: user?.email || '', type: 'email' },
        { label: 'Phone', value: '', type: 'tel' },
        { label: 'Department', value: user?.department || '', type: 'text', disabled: true },
        { label: 'Role', value: user?.role || '', type: 'text', disabled: true },
      ]
    },
    {
      title: 'Security Settings',
      icon: <Shield className="h-5 w-5" />,
      description: 'Manage your account security and privacy',
      items: [
        { label: 'Current Password', value: '', type: 'password', showToggle: true },
        { label: 'New Password', value: '', type: 'password', showToggle: true },
        { label: 'Confirm New Password', value: '', type: 'password', showToggle: true },
        { label: 'Two-Factor Authentication', value: 'Disabled', type: 'toggle' },
        { label: 'Session Timeout', value: '30 minutes', type: 'select' },
      ]
    },
    {
      title: 'Notification Settings',
      icon: <Bell className="h-5 w-5" />,
      description: 'Configure how you receive notifications',
      items: [
        { label: 'Email Notifications', value: 'Enabled', type: 'toggle' },
        { label: 'Push Notifications', value: 'Enabled', type: 'toggle' },
        { label: 'SMS Notifications', value: 'Disabled', type: 'toggle' },
        { label: 'Marketing Emails', value: 'Disabled', type: 'toggle' },
        { label: 'System Updates', value: 'Enabled', type: 'toggle' },
      ]
    },
    {
      title: 'Appearance Settings',
      icon: <Palette className="h-5 w-5" />,
      description: 'Customize the look and feel of your dashboard',
      items: [
        { label: 'Theme', value: theme, type: 'theme' },
        { label: 'Language', value: 'English', type: 'select' },
        { label: 'Time Zone', value: 'UTC-5 (Eastern Time)', type: 'select' },
        { label: 'Date Format', value: 'MM/DD/YYYY', type: 'select' },
        { label: 'Compact Mode', value: 'Disabled', type: 'toggle' },
      ]
    },
    {
      title: 'System Settings',
      icon: <Settings className="h-5 w-5" />,
      description: 'Advanced system configuration options',
      items: [
        { label: 'Auto Save', value: 'Enabled', type: 'toggle' },
        { label: 'Data Export', value: 'Monthly', type: 'select' },
        { label: 'Backup Frequency', value: 'Daily', type: 'select' },
        { label: 'Cache Clear', value: 'Manual', type: 'button' },
        { label: 'Reset Settings', value: 'Reset to Default', type: 'button' },
      ]
    }
  ]

  const renderInput = (item: any) => {
    switch (item.type) {
      case 'password':
        return (
          <div className="relative">
            <SnowInput
              type={item.showToggle && item.label === 'Current Password' && showPassword ? 'text' : 
                    item.showToggle && item.label === 'New Password' && showNewPassword ? 'text' : 'password'}
              placeholder={`Enter ${item.label.toLowerCase()}`}
              className="pr-10"
            />
            {item.showToggle && (
              <SnowButton
                type="button"
                onClick={() => {
                  if (item.label === 'Current Password') setShowPassword(!showPassword)
                  if (item.label === 'New Password') setShowNewPassword(!showNewPassword)
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {item.label === 'Current Password' ? 
                  (showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />) :
                  (showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />)
                }
              </SnowButton>
            )}
          </div>
        )
      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <div className={`w-12 h-6 rounded-full transition-colors ${item.value === 'Enabled' ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${item.value === 'Enabled' ? 'translate-x-6' : 'translate-x-1'} mt-0.5`} />
            </div>
            <span className="text-sm text-muted-foreground">{item.value}</span>
          </div>
        )
      case 'theme':
        return (
          <div className="flex items-center space-x-2">
            <SnowButton
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center space-x-2"
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </SnowButton>
            <SnowButton
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center space-x-2"
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </SnowButton>
          </div>
        )
      case 'select':
        return (
          <select className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option>{item.value}</option>
          </select>
        )
      case 'button':
        return (
          <SnowButton variant="outline" size="sm">
            {item.value}
          </SnowButton>
        )
      default:
        return (
          <SnowInput
            type={item.type}
            placeholder={`Enter ${item.label.toLowerCase()}`}
            defaultValue={item.value}
            disabled={item.disabled}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <SnowButton variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </SnowButton>
          <SnowButton className="bg-gradient-to-r from-clutch-red to-clutch-red-dark">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </SnowButton>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SnowCard>
              <SnowCardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    {section.icon}
                  </div>
                  <div>
                    <SnowCardTitle>{section.title}</SnowCardTitle>
                    <SnowCardDescription>{section.description}</SnowCardDescription>
                  </div>
                </div>
              </SnowCardHeader>
              <SnowCardContent className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="space-y-2">
                    <label className="text-sm font-medium">{item.label}</label>
                    {renderInput(item)}
                  </div>
                ))}
              </SnowCardContent>
            </SnowCard>
          </motion.div>
        ))}
      </div>

      {/* Additional Settings */}
      <div className="grid gap-6 md:grid-cols-3">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Management</span>
            </SnowCardTitle>
          </SnowCardHeader>
          <SnowCardContent className="space-y-3">
            <SnowButton variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </SnowButton>
            <SnowButton variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </SnowButton>
            <SnowButton variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </SnowButton>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Integrations</span>
            </SnowCardTitle>
          </SnowCardHeader>
          <SnowCardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Google Calendar</span>
              <div className="w-12 h-6 rounded-full bg-green-500">
                <div className="w-5 h-5 bg-white rounded-full translate-x-6 mt-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Slack</span>
              <div className="w-12 h-6 rounded-full bg-gray-300">
                <div className="w-5 h-5 bg-white rounded-full translate-x-1 mt-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Zapier</span>
              <div className="w-12 h-6 rounded-full bg-gray-300">
                <div className="w-5 h-5 bg-white rounded-full translate-x-1 mt-0.5" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>System Info</span>
            </SnowCardTitle>
          </SnowCardHeader>
          <SnowCardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>Today</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Storage Used:</span>
              <span>2.4 GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-green-600">Online</span>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}

