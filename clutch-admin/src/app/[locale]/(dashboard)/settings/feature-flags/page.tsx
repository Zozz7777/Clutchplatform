'use client'

import React, { useState, useEffect } from 'react'
import { useFeatureFlagsDashboard } from '@/hooks/useFeatureFlagsDashboard'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Flag, 
  Users, 
  Globe, 
  Settings, 
  ToggleLeft, 
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Clock,
  BarChart3,
  Sparkles,
  Zap,
  AlertCircle,
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
  RefreshCw,
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
  FileText,
  Folder,
  HardDrive,
  Database,
  Server,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Power,
  Lock,
  Unlock,
  Shield,
  Key,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Users as UsersGroup,
  User as UserIcon,
  UserCog,
  UserSearch
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsFeatureFlagsPage() {
  // Use consolidated feature flags dashboard hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    featureStats,
    userGroups,
    geographicRegions,
    recentActivity,
    featureFlags
  } = useFeatureFlagsDashboard()

  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedFlag, setSelectedFlag] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const router = useRouter()

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load feature flags data</p>
          <SnowButton onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </SnowButton>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      case 'draft': return 'bg-slate-500'
      default: return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'paused': return 'Paused'
      case 'completed': return 'Completed'
      case 'draft': return 'Draft'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'draft': return <FileText className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-slate-600" />
  }

  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch = flag.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'enabled' ? flag.enabled : !flag.enabled)
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalFlags = featureFlags.length
  const activeFlags = featureFlags.filter(f => f.enabled).length
  const totalUsers = userGroups.reduce((sum, g) => sum + g.userCount, 0)
  const avgCoverage = featureFlags.length > 0 ? featureFlags.reduce((sum, f) => sum + f.rolloutPercentage, 0) / featureFlags.length : 0

  const handleViewFlag = (flag: any) => {
    setSelectedFlag(flag)
    setShowViewModal(true)
  }

  const handleEditFlag = (flag: any) => {
    setSelectedFlag(flag)
    setShowEditModal(true)
  }

  const handleViewAnalytics = async (flag: any) => {
    try {
      router.push(`/settings/feature-flags/${flag.id}/analytics`)
    } catch (error: any) {
      console.error('Failed to navigate to analytics:', error)
      toast.error('Failed to open analytics')
    }
  }

  const handleDeleteFlag = async (flag: any) => {
    if (confirm('Are you sure you want to delete this feature flag?')) {
      try {
        const response = await apiClient.delete(`/settings/feature-flags/${flag.id}`)
        if (response.success) {
          toast.success('Feature flag deleted successfully')
          refreshData()
        } else {
          toast.error('Failed to delete feature flag')
        }
      } catch (error: any) {
        console.error('Failed to delete feature flag:', error)
        toast.error('Failed to delete feature flag')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-300">FEATURE FLAGS SYSTEM ACTIVE</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Feature Flags
                </h1>
                <p className="text-indigo-100 max-w-2xl">
                  Manage feature flags and gradual rollouts with precision
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-indigo-500/20 border-indigo-400/30 text-white hover:bg-indigo-500/30">
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
                  Feature Flags
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load feature flags data. Please try again.
                </p>
              </div>
              <SnowButton variant="outline" className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30" onClick={refreshData}>
                <Zap className="h-4 w-4 mr-2" />
                Retry
              </SnowButton>
            </div>
          </div>
        </div>

        <SnowCard variant="dark">
          <SnowCardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Data</h3>
              <p className="text-slate-300 mb-4">{error}</p>
                             <SnowButton onClick={refreshData} variant="default">
                Try Again
               </SnowButton>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-300">FEATURE FLAGS SYSTEM ACTIVE</span>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Feature Flags
              </h1>
              <p className="text-indigo-100 max-w-2xl">
                Manage feature flags and gradual rollouts with precision
              </p>
            </div>
            <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-indigo-500/20 border-indigo-400/30 text-white hover:bg-indigo-500/30">
                <Download className="h-4 w-4 mr-2" />
                Export Config
                </SnowButton>
                <SnowButton variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Create Flag
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
                <p className="text-sm font-medium text-indigo-300">Active Flags</p>
                <p className="text-2xl font-bold text-white">{activeFlags}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-indigo-200">+{totalFlags - activeFlags} inactive</p>
                </div>
              </div>
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <Flag className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Total Users</p>
                <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-200">Feature flag coverage</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Avg Coverage</p>
                <p className="text-2xl font-bold text-white">{avgCoverage.toFixed(1)}%</p>
                <p className="text-xs text-purple-200">User reach</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard variant="dark" >
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300">Rollback Rate</p>
                <p className="text-2xl font-bold text-white">2.3%</p>
                <p className="text-xs text-orange-200">Safety metric</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="flags" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Flags</TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Groups</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SnowCard variant="dark">
              <SnowCardHeader>
                <SnowCardTitle icon={<BarChart3 className="h-5 w-5" />}>
                  Feature Coverage
                </SnowCardTitle>
                <SnowCardDescription>
                  Overall feature flag coverage and distribution
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Users with Flags</span>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {Math.round(totalUsers * 0.87).toLocaleString()}/{totalUsers.toLocaleString()}
                  </Badge>
                </div>
                <Progress value={87} className="h-2 bg-slate-700" />
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-green-300">Global</div>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-blue-300">User Groups</div>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">6</div>
                    <div className="text-sm text-purple-300">Geographic</div>
                  </div>
                </div>
              </SnowCardContent>
            </SnowCard>
            <SnowCard variant="dark">
              <SnowCardHeader>
                <SnowCardTitle icon={<Settings className="h-5 w-5" />}>
                  Quick Actions
                </SnowCardTitle>
                <SnowCardDescription>
                  Common feature flag management tasks
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent className="space-y-3">
                <SnowButton variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Flag
                </SnowButton>
                <SnowButton variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  <ToggleRight className="h-4 w-4 mr-2" />
                  Enable All Flags
                </SnowButton>
                <SnowButton variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  <Eye className="h-4 w-4 mr-2" />
                  View Analytics
                </SnowButton>
                <SnowButton variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Configuration
                </SnowButton>
              </SnowCardContent>
            </SnowCard>
          </div>
        </TabsContent>

        <TabsContent value="flags" className="space-y-6">
          <SnowCard variant="dark">
            <SnowCardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <SnowSearchInput
                    placeholder="Search flags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={() => {}}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                  </select>
                  <SnowButton variant="default" >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Flag
                  </SnowButton>
                </div>
              </div>
            </SnowCardContent>
          </SnowCard>
          <SnowCard variant="dark">
            <SnowCardHeader>
              <SnowCardTitle icon={<Flag className="h-5 w-5" />}>
                Feature Flags
              </SnowCardTitle>
              <SnowCardDescription>
                Manage all feature flags and their configurations
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              {filteredFlags.length > 0 ? (
                <SnowTable>
                  <SnowTableHeader>
                    <tr>
                      <SnowTableHead>Flag</SnowTableHead>
                      <SnowTableHead>Type</SnowTableHead>
                      <SnowTableHead>Users</SnowTableHead>
                      <SnowTableHead>Coverage</SnowTableHead>
                      <SnowTableHead>Status</SnowTableHead>
                      <SnowTableHead>Enabled</SnowTableHead>
                      <SnowTableHead align="center">Actions</SnowTableHead>
                    </tr>
                  </SnowTableHeader>
                  <SnowTableBody>
                    {filteredFlags.map((flag) => (
                      <SnowTableRow key={flag.id}>
                        <SnowTableCell>
                          <div>
                            <div className="font-medium text-white">{flag.name}</div>
                            <div className="text-sm text-slate-400">{flag.description}</div>
                          </div>
                        </SnowTableCell>
                        <SnowTableCell>
                          <div className="text-white capitalize">{flag.name}</div>
                        </SnowTableCell>
                        <SnowTableCell>
                          <div className="text-white">{flag.userGroups?.length || 0}</div>
                        </SnowTableCell>
                        <SnowTableCell>
                          <div className="text-white">{flag.rolloutPercentage}%</div>
                        </SnowTableCell>
                        <SnowTableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded-full ${getStatusColor(flag.enabled ? 'enabled' : 'disabled')}`}>
                              {getStatusIcon(flag.enabled ? 'enabled' : 'disabled')}
                            </div>
                            <span className="text-white">{getStatusText(flag.enabled ? 'enabled' : 'disabled')}</span>
                          </div>
                        </SnowTableCell>
                        <SnowTableCell>
                          <div className="flex items-center space-x-2">
                            {flag.enabled ? (
                              <ToggleRight className="h-4 w-4 text-green-400" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-slate-400" />
                            )}
                            <span className="text-sm font-medium text-white">
                              {flag.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </SnowTableCell>
                        <SnowTableCell>
                          <div className="flex items-center space-x-2">
                            <SnowButton
                              icon={<Eye className="h-4 w-4" />}
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewFlag(flag)}
                            />
                            <SnowButton
                              icon={<Edit className="h-4 w-4" />}
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditFlag(flag)}
                            />
                            <SnowButton
                              icon={<BarChart3 className="h-4 w-4" />}
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAnalytics(flag)}
                            />
                            <SnowButton
                              icon={<Trash2 className="h-4 w-4" />}
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFlag(flag)}
                            />
                          </div>
                        </SnowTableCell>
                      </SnowTableRow>
                    ))}
                  </SnowTableBody>
                </SnowTable>
              ) : (
                <div className="text-center py-12">
                  <Flag className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No Flags Found</p>
                  <p className="text-slate-300 text-sm">No feature flags match your current search criteria. Try adjusting your filters or create a new flag.</p>
                  <SnowButton variant="default"  className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Flag
                  </SnowButton>
                </div>
              )}
            </SnowCardContent>
          </SnowCard>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SnowCard variant="dark">
              <SnowCardHeader>
                <SnowCardTitle icon={<Users className="h-5 w-5" />}>
                  User Groups
                </SnowCardTitle>
                <SnowCardDescription>
                  Feature flag distribution by user groups
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-4">
                  {userGroups.map((group, index) => (
                    <div key={group.name} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                      <div>
                        <h3 className="font-medium text-white">{group.name}</h3>
                        <p className="text-sm text-slate-400">{group.users.length} users</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">{group.userCount}</span>
                          <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">flags</Badge>
                        </div>
                        <Progress value={50} className="w-20 h-2 mt-2 bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </SnowCardContent>
            </SnowCard>

            <SnowCard variant="dark">
              <SnowCardHeader>
                <SnowCardTitle icon={<Globe className="h-5 w-5" />}>
                  Geographic Regions
                </SnowCardTitle>
                <SnowCardDescription>
                  Feature flag distribution by geographic regions
                </SnowCardDescription>
              </SnowCardHeader>
              <SnowCardContent>
                <div className="space-y-4">
                  {geographicRegions.map((region, index) => (
                    <div key={region.name} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                      <div>
                        <h3 className="font-medium text-white">{region.name}</h3>
                        <p className="text-sm text-slate-400">{region.userCount} users</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">{region.enabledFeatures}</span>
                          <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">flags</Badge>
                        </div>
                        <Progress value={50} className="w-20 h-2 mt-2 bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              </SnowCardContent>
            </SnowCard>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <SnowCard variant="dark">
            <SnowCardHeader>
              <SnowCardTitle icon={<Clock className="h-5 w-5" />}>
                Recent Activity
              </SnowCardTitle>
              <SnowCardDescription>
                Latest feature flag changes and modifications
              </SnowCardDescription>
            </SnowCardHeader>
            <SnowCardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.type === 'enable' ? 'bg-green-500' :
                        activity.type === 'disable' ? 'bg-red-500' :
                        activity.type === 'rollback' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <h3 className="font-medium text-white">{activity.featureName}</h3>
                        <p className="text-sm text-slate-400">{activity.type}</p>
                        <p className="text-sm text-slate-400">by {activity.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        activity.type === 'enable' ? 'default' :
                        activity.type === 'disable' ? 'destructive' :
                        activity.type === 'rollback' ? 'secondary' : 'outline'
                      } className="bg-slate-700/50 text-slate-300 border-slate-600">
                        {activity.type}
                      </Badge>
                      <p className="text-sm text-slate-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SnowCardContent>
          </SnowCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}

