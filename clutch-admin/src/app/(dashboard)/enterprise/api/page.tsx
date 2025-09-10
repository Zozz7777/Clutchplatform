'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { Badge } from '@/components/ui/badge'
import { SnowInput } from '@/components/ui/snow-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Code, 
  Key, 
  Activity,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Edit
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function EnterpriseApiPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedApiKey, setSelectedApiKey] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [showSecret, setShowSecret] = useState<{[key: number]: boolean}>({})
  const [newKeyName, setNewKeyName] = useState('')

  useEffect(() => {
    loadAPIKeys()
  }, [])

  const loadAPIKeys = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/enterprise/api-keys')
      if (response.success && response.data) {
        setApiKeys(response.data as any[])
      } else {
        setApiKeys([])
      }
    } catch (error: any) {
      console.error('Failed to load API keys:', error)
      setApiKeys([])
      toast.error('Failed to load API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAPIKey = async (apiKey: any) => {
    try {
      const response = await apiClient.get(`/enterprise/api/keys/${apiKey._id}`)
      if (response.success) {
        setSelectedApiKey(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load API key details')
      }
    } catch (error) {
      console.error('Failed to load API key details:', error)
      toast.error('Failed to load API key details')
    }
  }

  const handleEditAPIKey = async (apiKey: any) => {
    try {
      const response = await apiClient.get(`/enterprise/api/keys/${apiKey._id}`)
      if (response.success) {
        setSelectedApiKey(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load API key for editing')
      }
    } catch (error) {
      console.error('Failed to load API key for editing:', error)
      toast.error('Failed to load API key for editing')
    }
  }

  const handleDeleteAPIKey = async (apiKey: any) => {
    if (confirm(`Are you sure you want to delete the API key "${apiKey.name}"?`)) {
      try {
        const response = await apiClient.delete(`/enterprise/api/keys/${apiKey._id}`)
        if (response.success) {
          toast.success('API key deleted successfully')
          loadAPIKeys() // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete API key')
        }
      } catch (error) {
        console.error('Failed to delete API key:', error)
        toast.error('Failed to delete API key')
      }
    }
  }

  const handleRegenerateAPIKey = async (apiKey: any) => {
    try {
      const response = await apiClient.put(`/enterprise/api/keys/${apiKey._id}/regenerate`, {})
      if (response.success) {
        toast.success('API key regenerated successfully')
        loadAPIKeys() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to regenerate API key')
      }
    } catch (error) {
      console.error('Failed to regenerate API key:', error)
      toast.error('Failed to regenerate API key')
    }
  }

  const handleCopyAPIKey = async (apiKey: any, type: 'key' | 'secret') => {
    try {
      const textToCopy = type === 'key' ? apiKey.key : apiKey.secret
      await navigator.clipboard.writeText(textToCopy)
      toast.success(`${type === 'key' ? 'API Key' : 'Secret'} copied to clipboard`)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleCreateAPIKey = async (apiKeyData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.post('/enterprise/api/keys', apiKeyData)
      if (response.success) {
        toast.success('API key created successfully')
        setShowAddModal(false)
        loadAPIKeys()
      } else {
        toast.error(response.message || 'Failed to create API key')
      }
    } catch (error: any) {
      console.error('Failed to create API key:', error)
      toast.error('Failed to create API key')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleUpdateAPIKey = async (apiKeyData: any) => {
    setIsFormLoading(true)
    try {
      const response = await apiClient.put(`/enterprise/api/keys/${selectedApiKey._id}`, apiKeyData)
      if (response.success) {
        toast.success('API key updated successfully')
        setShowEditModal(false)
        setSelectedApiKey(null)
        loadAPIKeys()
      } else {
        toast.error(response.message || 'Failed to update API key')
      }
    } catch (error: any) {
      console.error('Failed to update API key:', error)
      toast.error('Failed to update API key')
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleToggleSecret = (id: number) => {
    setShowSecret(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getUsagePercentage = (usage: any) => {
    return ((usage.requests / usage.rateLimit) * 100).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            API Management
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage your enterprise API keys and access
          </p>
        </div>
        <div className="flex gap-2">
          <SnowButton
            variant="outline"
            onClick={loadAPIKeys}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total API Keys</p>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Active Keys</p>
                <p className="text-2xl font-bold">
                  {apiKeys.filter(key => key.status === 'active').length}
                </p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Total Requests</p>
                <p className="text-2xl font-bold">
                  {apiKeys.reduce((sum, key) => sum + key.usage.requests, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Usage</p>
                <p className="text-2xl font-bold">
                  {(apiKeys.reduce((sum, key) => sum + parseFloat(getUsagePercentage(key.usage)), 0) / apiKeys.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Create New API Key
          </SnowCardTitle>
          <SnowCardDescription>Generate a new API key for your applications</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="keyName">API Key Name</Label>
              <SnowInput
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter a descriptive name for this API key"
              />
            </div>
            <div className="flex items-end">
              <SnowButton onClick={handleCreateAPIKey}>
                <Plus className="h-4 w-4 mr-2" />
                Create Key
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <SnowCard key={apiKey.id} className="hover:shadow-md transition-shadow">
            <SnowCardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">{apiKey.name}</h3>
                    <Badge className={getStatusColor(apiKey.status)}>
                      {apiKey.status}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <SnowInput
                          value={apiKey.key}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <SnowButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyToClipboard(apiKey.key, 'API Key')}
                        >
                          <Copy className="h-4 w-4" />
                        </SnowButton>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Secret Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <SnowInput
                          type={showSecret[apiKey.id] ? 'text' : 'password'}
                          value={apiKey.secret}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <SnowButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleSecret(apiKey.id)}
                        >
                          {showSecret[apiKey.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </SnowButton>
                        <SnowButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyToClipboard(apiKey.secret, 'Secret Key')}
                        >
                          <Copy className="h-4 w-4" />
                        </SnowButton>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div>
                      <Label className="text-sm font-medium">Permissions</Label>
                      <div className="flex gap-1 mt-1">
                        {apiKey.permissions.map((permission: string) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Usage</Label>
                      <div className="text-sm mt-1">
                        <div className="flex justify-between">
                          <span>Requests: {apiKey.usage.requests.toLocaleString()}</span>
                          <span>{getUsagePercentage(apiKey.usage)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${getUsagePercentage(apiKey.usage)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Last Used</Label>
                      <div className="text-sm text-slate-600 mt-1">
                        {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <SnowButton size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </SnowButton>
                    <SnowButton size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAPIKey(apiKey)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </SnowButton>
                  </div>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <SnowCard>
          <SnowCardContent className="p-8 text-center">
            <Key className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 text-slate-900 mb-2">
              No API keys found
            </h3>
            <p className="text-slate-600 text-slate-600">
              Create your first API key to start integrating with the Clutch platform.
            </p>
          </SnowCardContent>
        </SnowCard>
      )}
    </div>
  )
}



