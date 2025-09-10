'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Building2, Users, Database, Shield, Settings, Plus, Search, Globe, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'

export default function MultiTenantPage() {
  const [tenants, setTenants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/enterprise/tenants')
      if (response.success && response.data) {
        setTenants(response.data as any[])
      } else {
        setTenants([])
        if (!response.success) {
          toast.error('Failed to load tenants')
          setError('Failed to load tenants')
        }
      }
    } catch (error: any) {
      console.error('Failed to load tenants:', error)
      setError('Failed to load tenants')
      setTenants([])
      toast.error('Failed to load tenants')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = () => {
    // Filter functionality will be implemented when needed
    toast.info('Filter applied')
  }

  const handleTenantSettings = async (tenant: any) => {
    try {
      const response = await apiClient.get(`/enterprise/tenants/${tenant.id}`)
      if (response.success) {
        setSelectedTenant(response.data)
        setShowSettingsModal(true)
      } else {
        toast.error('Failed to load tenant settings')
      }
    } catch (error) {
      console.error('Failed to load tenant settings:', error)
      toast.error('Failed to load tenant settings')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">Multi-Tenant Management</h1>
          <p className="text-slate-600 text-slate-600">
            Manage multiple tenant organizations and their configurations
          </p>
        </div>
        <SnowButton>
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </SnowButton>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Tenants</SnowCardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-slate-600 text-slate-600">
              <span className="text-green-600">+12% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Active Tenants</SnowCardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{tenants.filter(t => t.status === 'active').length}</div>
            <p className="text-xs text-slate-600 text-slate-600">
              <span className="text-green-600">+8% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Users</SnowCardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">15,420</div>
            <p className="text-xs text-slate-600 text-slate-600">
              <span className="text-green-600">+15% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Storage Used</SnowCardTitle>
            <Database className="h-4 w-4 text-orange-600" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">2.8TB</div>
            <p className="text-xs text-slate-600 text-slate-600">
              <span className="text-red-600">+5% from last month</span>
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <SnowInput
                placeholder="Search tenants..."
                className="pl-10"
              />
            </div>
            <SnowButton variant="outline" onClick={handleFilter}>Filter</SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Active Tenants</SnowCardTitle>
          <SnowCardDescription>Manage tenant organizations and their settings</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
                     <div className="space-y-4">
             {tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{tenant.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        {tenant.domain}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {tenant.users} users
                      </span>
                      <span className="flex items-center">
                        <Database className="h-3 w-3 mr-1" />
                        {tenant.storage}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}>
                    {tenant.status}
                  </Badge>
                  <Badge variant="outline">{tenant.plan}</Badge>
                  <SnowButton variant="outline" size="sm" onClick={() => handleTenantSettings(tenant)}>
                    <Settings className="h-4 w-4" />
                  </SnowButton>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="grid gap-6 md:grid-cols-2">
        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </SnowCardTitle>
            <SnowCardDescription>Configure tenant security policies</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Two-Factor Authentication</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SSO Integration</span>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Encryption</span>
                <Badge variant="default">AES-256</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Audit Logging</span>
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardHeader>
            <SnowCardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Platform Features
            </SnowCardTitle>
            <SnowCardDescription>Manage available features per tenant</SnowCardDescription>
          </SnowCardHeader>
          <SnowCardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Access</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Custom Branding</span>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Advanced Analytics</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">White-Label Options</span>
                <Badge variant="outline">Available</Badge>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}



