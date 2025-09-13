'use client'

import React, { useEffect, useState } from 'react'
import { settingsApi, dashboardApi } from '@/lib/real-api-service'
import { toast } from 'sonner'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Building2, 
  Shield, 
  Bell, 
  Globe, 
  Database,
  Server,
  Network,
  Lock,
  Key,
  Users,
  Mail,
  Smartphone,
  Monitor,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Palette,
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  Edit,
  Eye,
  EyeOff,
  PoundSterling,
  BarChart3,
  MessageSquare,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Crown,
  Star,
  Medal,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Type,
  Image,
  Video,
  Music,
  File,
  Folder,
  HardDrive,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Power,
  Unlock,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Users as UsersGroup,
  User as UserIcon,
  UserCog,
  UserSearch,
  AlertTriangle,
  Loader2
} from 'lucide-react'

// Types for settings data
interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  activeUsers: number
  totalRequests: number
  errorRate: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  services: Array<{
    name: string
    status: 'healthy' | 'warning' | 'critical'
    uptime: string
  }>
}

interface CompanySettings {
  name: string
  logo: string
  contact: {
    phone: string
    email: string
    website: string
  }
  address: {
    country: string
    city: string
    address: string
  }
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  failedLoginAttempts: number
  passwordPolicy: 'strong' | 'medium' | 'weak'
  ipWhitelist: string[]
  sslEnabled: boolean
}

interface FeatureSettings {
  aiEnabled: boolean
  analyticsEnabled: boolean
  notificationsEnabled: boolean
  autoScaling: boolean
  maintenanceMode: boolean
  debugMode: boolean
}

export default function SettingsSystemPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: '',
    logo: '',
    contact: { phone: '', email: '', website: '' },
    address: { country: '', city: '', address: '' }
  })
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    failedLoginAttempts: 3,
    passwordPolicy: 'strong',
    ipWhitelist: [],
    sslEnabled: true
  })
  const [featureSettings, setFeatureSettings] = useState<FeatureSettings>({
    aiEnabled: true,
    analyticsEnabled: true,
    notificationsEnabled: true,
    autoScaling: false,
    maintenanceMode: false,
    debugMode: false
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Load all settings data
  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Load all settings in parallel
      const [healthResponse, companyResponse, securityResponse, featuresResponse] = await Promise.all([
        dashboardApi.getSystemHealth(),
        settingsApi.getCompanySettings(),
        settingsApi.getSecuritySettings(),
        settingsApi.getSettings()
      ])
      
      // Handle system health
      if (healthResponse.success && healthResponse.data) {
        setSystemHealth(healthResponse.data as any)
      } else {
        console.error('Failed to load system health:', healthResponse.message)
      }
      
      // Handle company settings
      if (companyResponse.success && companyResponse.data) {
        setCompanySettings(companyResponse.data as any)
      } else {
        console.error('Failed to load company settings:', companyResponse.message)
      }
      
      // Handle security settings
      if (securityResponse.success && securityResponse.data) {
        setSecuritySettings(securityResponse.data as any)
      } else {
        console.error('Failed to load security settings:', securityResponse.message)
      }
      
      // Handle feature settings
      if (featuresResponse.success && featuresResponse.data) {
        setFeatureSettings((featuresResponse.data as any).features || featureSettings)
      } else {
        console.error('Failed to load feature settings:', featuresResponse.message)
      }
      
    } catch (error: any) {
      console.error('Failed to load system settings:', error)
      setError('Failed to load system settings. Please try again.')
      toast.error('Loading Error', {
        description: 'Failed to load system settings. Please refresh the page.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Save company settings
  const saveCompanySettings = async () => {
    setIsSaving(true)
    try {
      const response = await settingsApi.updateCompanySettings(companySettings)
      
      if (response.success) {
        toast.success('Company Settings Saved', {
          description: 'Your company settings have been updated successfully.'
        })
      } else {
        toast.error('Save Failed', {
          description: response.message || 'Failed to save company settings.'
        })
      }
    } catch (error) {
      console.error('Failed to save company settings:', error)
      toast.error('Save Error', {
        description: 'Failed to save company settings. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Save security settings
  const saveSecuritySettings = async () => {
    setIsSaving(true)
    try {
      const response = await settingsApi.updateSecuritySettings(securitySettings)
      
      if (response.success) {
        toast.success('Security Settings Saved', {
          description: 'Your security settings have been updated successfully.'
        })
      } else {
        toast.error('Save Failed', {
          description: response.message || 'Failed to save security settings.'
        })
      }
    } catch (error) {
      console.error('Failed to save security settings:', error)
      toast.error('Save Error', {
        description: 'Failed to save security settings. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Save feature settings
  const saveFeatureSettings = async () => {
    setIsSaving(true)
    try {
      const response = await settingsApi.updateSettings({ features: featureSettings })
      
      if (response.success) {
        toast.success('Feature Settings Saved', {
          description: 'Your feature settings have been updated successfully.'
        })
      } else {
        toast.error('Save Failed', {
          description: response.message || 'Failed to save feature settings.'
        })
      }
    } catch (error) {
      console.error('Failed to save feature settings:', error)
      toast.error('Save Error', {
        description: 'Failed to save feature settings. Please try again.'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle company settings change
  const handleCompanyChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setCompanySettings(prev => {
        const currentParent = prev?.[parent as keyof CompanySettings] || {}
        return {
          ...prev,
          [parent]: {
            ...currentParent,
            [child]: value
          }
        }
      })
    } else {
      setCompanySettings(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Handle security settings change
  const handleSecurityChange = (field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle feature settings change
  const handleFeatureChange = (field: string, value: any) => {
    setFeatureSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Get health status styling
  const getHealthStatus = (status: string) => {
    switch (status) {
      case 'healthy': return { color: 'bg-green-500', text: 'Healthy', icon: CheckCircle }
      case 'warning': return { color: 'bg-yellow-500', text: 'Warning', icon: AlertCircle }
      case 'critical': return { color: 'bg-red-500', text: 'Critical', icon: AlertCircle }
      default: return { color: 'bg-slate-500', text: 'Unknown', icon: AlertCircle }
    }
  }

  // Initial data load
  useEffect(() => {
    loadData()
  }, [])

  const healthStatus = systemHealth ? getHealthStatus(systemHealth.status) : { color: 'bg-slate-500', text: 'Unknown', icon: AlertCircle }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-300">SYSTEM ACTIVE</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  System Settings
                </h1>
                <p className="text-slate-100 max-w-2xl">
                  Manage system configuration and monitor health
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-slate-500/20 border-slate-400/30 text-white hover:bg-slate-500/30">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings Dashboard
                </SnowButton>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SnowCard key={i} variant="dark" className="animate-pulse">
              <SnowCardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/3"></div>
              </SnowCardContent>
            </SnowCard>
          ))}
        </div>
        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-300">SYSTEM ERROR</span>
                  </div>
                  <AlertCircle className="h-5 w-5 text-red-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  System Settings
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load system settings. Please try again.
                </p>
              </div>
              <SnowButton variant="outline" className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30" onClick={loadData}>
                <Zap className="h-4 w-4 mr-2" />
                Retry
              </SnowButton>
            </div>
          </div>
        </div>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Data</h3>
              <p className="text-slate-300 mb-4">{error}</p>
              <SnowButton onClick={loadData} variant="default">
                Try Again
              </SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-900/20 dark:via-slate-900/10 dark:to-slate-800/20 p-8 border border-slate-200 border-slate-200">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/[0.03] to-transparent"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                  <div className={`h-2.5 w-2.5 ${healthStatus.color} rounded-full animate-pulse`}></div>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">SYSTEM {healthStatus.text.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">ADMIN</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  System Settings
                </h1>
                <p className="text-slate-600 text-slate-600 max-w-2xl">
                  Manage system configuration and monitor health across all platform services.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" onClick={loadData} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </SnowButton>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">System Status</p>
                <p className="text-2xl font-bold text-white">{healthStatus.text}</p>
                <p className="text-blue-100 text-xs">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${healthStatus.color}`}>
                <healthStatus.icon className="h-4 w-4" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Active Users</p>
                <p className="text-2xl font-bold text-white">{systemHealth?.activeUsers?.toLocaleString() || 0}</p>
                <p className="text-green-100 text-xs">
                  Currently online
                </p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">API Requests</p>
                <p className="text-2xl font-bold text-white">{systemHealth?.totalRequests || 0}</p>
                <p className="text-purple-100 text-xs">
                  Per minute
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-200" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300">Error Rate</p>
                <p className="text-2xl font-bold text-white">{((systemHealth?.errorRate || 0) * 100).toFixed(2)}%</p>
                <p className="text-orange-100 text-xs">
                  Last 24 hours
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-200" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Company</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Security</TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SnowCard variant="dark">
              <SnowCardHeader>
                <SnowCardTitle icon={<BarChart3 className="h-5 w-5" />}>
                  System Health
                </SnowCardTitle>
                <SnowCardDescription>
                  Real-time system performance metrics
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">CPU Usage</span>
                      <span className="text-white">{systemHealth?.cpuUsage || 0}%</span>
                    </div>
                    <Progress value={systemHealth?.cpuUsage || 0} className="h-2 bg-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Memory</span>
                      <span className="text-white">{systemHealth?.memoryUsage || 0}%</span>
                    </div>
                    <Progress value={systemHealth?.memoryUsage || 0} className="h-2 bg-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Disk</span>
                      <span className="text-white">{systemHealth?.diskUsage || 0}%</span>
                    </div>
                    <Progress value={systemHealth?.diskUsage || 0} className="h-2 bg-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Network</span>
                      <span className="text-white">98%</span>
                    </div>
                    <Progress value={98} className="h-2 bg-slate-700" />
                  </div>
                </div>
              </SnowCardContent>
            </SnowCard>
            <SnowCard variant="dark">
              <SnowCardHeader>
                <SnowCardTitle icon={<Server className="h-5 w-5" />}>
                  Services Status
                </SnowCardTitle>
                <SnowCardDescription>
                  Monitor all system services
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-3">
                  {systemHealth?.services?.map((service, index) => {
                    const status = getHealthStatus(service.status)
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg bg-slate-800/50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                          <div>
                            <h4 className="font-medium text-white">{service.name}</h4>
                            <p className="text-sm text-slate-400">{service.uptime} uptime</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${
                          service.status === 'healthy' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          service.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                          'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {service.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <SnowCard variant="dark">
            <SnowCardHeader>
              <SnowCardTitle icon={<Building2 className="h-5 w-5" />}>
                Company Information
              </SnowCardTitle>
              <SnowCardDescription>
                Update your company details and contact information
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Company Name</label>
                    <SnowInput
                      value={companySettings.name}
                      onChange={(e) => handleCompanyChange('name', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Logo URL</label>
                    <SnowInput
                      value={companySettings.logo}
                      onChange={(e) => handleCompanyChange('logo', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Phone</label>
                    <SnowInput
                      value={companySettings.contact.phone}
                      onChange={(e) => handleCompanyChange('contact.phone', e.target.value)}
                      placeholder="+20 2 1234 5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Email</label>
                    <SnowInput
                      value={companySettings.contact.email}
                      onChange={(e) => handleCompanyChange('contact.email', e.target.value)}
                      placeholder="info@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Website</label>
                    <SnowInput
                      value={companySettings.contact.website}
                      onChange={(e) => handleCompanyChange('contact.website', e.target.value)}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Country</label>
                    <SnowInput
                      value={companySettings.address.country}
                      onChange={(e) => handleCompanyChange('address.country', e.target.value)}
                      placeholder="Egypt"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <SnowButton variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    Cancel
                  </SnowButton>
                  <SnowButton 
                    variant="default" 
                    onClick={saveCompanySettings}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </SnowButton>
                </div>
              </form>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SnowCard variant="dark">
            <SnowCardHeader>
              <SnowCardTitle icon={<Shield className="h-5 w-5" />}>
                Security Settings
              </SnowCardTitle>
              <SnowCardDescription>
                Configure security policies and authentication
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Two-Factor Authentication</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">Enable 2FA for all users</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Password Policy</label>
                    <select 
                      value={securitySettings.passwordPolicy}
                      onChange={(e) => handleSecurityChange('passwordPolicy', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="strong">Strong</option>
                      <option value="medium">Medium</option>
                      <option value="weak">Weak</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Session Timeout (minutes)</label>
                    <SnowInput
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                      type="number"
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Failed Login Attempts</label>
                    <SnowInput
                      value={securitySettings.failedLoginAttempts}
                      onChange={(e) => handleSecurityChange('failedLoginAttempts', parseInt(e.target.value))}
                      type="number"
                      placeholder="3"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <SnowButton variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    Cancel
                  </SnowButton>
                  <SnowButton 
                    variant="default" 
                    onClick={saveSecuritySettings}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </SnowButton>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <SnowCard variant="dark">
            <SnowCardHeader>
              <SnowCardTitle icon={<Settings className="h-5 w-5" />}>
                Feature Settings
              </SnowCardTitle>
              <SnowCardDescription>
                Enable or disable system features
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">AI Features</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={featureSettings.aiEnabled}
                        onChange={(e) => handleFeatureChange('aiEnabled', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">Enable AI-powered features</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Analytics</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={featureSettings.analyticsEnabled}
                        onChange={(e) => handleFeatureChange('analyticsEnabled', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">Enable analytics tracking</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Notifications</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={featureSettings.notificationsEnabled}
                        onChange={(e) => handleFeatureChange('notificationsEnabled', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">Enable system notifications</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Auto Scaling</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={featureSettings.autoScaling}
                        onChange={(e) => handleFeatureChange('autoScaling', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">Enable automatic scaling</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Maintenance Mode</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={featureSettings.maintenanceMode}
                        onChange={(e) => handleFeatureChange('maintenanceMode', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">Enable maintenance mode</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Debug Mode</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={featureSettings.debugMode}
                        onChange={(e) => handleFeatureChange('debugMode', e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">Enable debug logging</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <SnowButton variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    Cancel
                  </SnowButton>
                  <SnowButton 
                    variant="default" 
                    onClick={saveFeatureSettings}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </SnowButton>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}