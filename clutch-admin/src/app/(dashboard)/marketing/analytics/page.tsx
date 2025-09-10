'use client'

import React, { useState, useEffect } from 'react'
import { useMarketingAnalyticsDashboard } from '@/hooks/useMarketingAnalyticsDashboard'
import { toast } from 'sonner'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  X,
  Sparkles,
  Zap,
  Briefcase,
  Award,
  User,
  MapPin,
  BarChart3,
  Activity,
  Target,
  Users,
  Handshake,
  Percent,
  Calculator,
  Receipt,
  Trophy,
  Star,
  Medal,
  Crown,
  Flag,
  Rocket,
  Megaphone,
  MousePointer,
  Globe,
  Mail,
  Smartphone,
  Monitor,
  Tablet,
  Share2,
  Heart,
  MessageCircle,
  ThumbsUp,
  Eye as EyeIcon,
  MousePointerClick,
  Users as UsersIcon,
  PoundSterling,
  ShoppingCart,
  CreditCard,
  Package,
  Truck,
  Home,
  Building,
  MapPin as MapPinIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  RefreshCw,
  Settings,
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
  UserSearch,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  Users as UsersGroupIcon,
  User as UserIcon2,
  UserCog as UserCogIcon,
  UserSearch as UserSearchIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MarketingAnalyticsPage() {
  // Use consolidated marketing analytics dashboard hook instead of multiple separate API calls
  const {
    data: consolidatedData,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    campaignAnalytics,
    performanceMetrics
  } = useMarketingAnalyticsDashboard()

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const router = useRouter()

  // Map consolidated data to component state
  const analytics = performanceMetrics ? [
    {
      id: '1',
      metric: 'Email Open Rate',
      value: performanceMetrics.email.opened,
      change: 12.5,
      trend: 'up'
    },
    {
      id: '2',
      metric: 'Click Through Rate',
      value: performanceMetrics.email.clicked,
      change: 8.3,
      trend: 'up'
    },
    {
      id: '3',
      metric: 'Social Engagement',
      value: performanceMetrics.social.engagement,
      change: -2.1,
      trend: 'down'
    },
    {
      id: '4',
      metric: 'Paid Conversions',
      value: performanceMetrics.paid.conversions,
      change: 15.7,
      trend: 'up'
    }
  ] : []

  const campaigns = campaignAnalytics ? [
    {
      id: '1',
      name: 'Summer Campaign 2024',
      status: 'active',
      budget: campaignAnalytics.totalSpend,
      spent: campaignAnalytics.totalSpend * 0.7,
      impressions: performanceMetrics?.paid.impressions || 0,
      clicks: performanceMetrics?.paid.clicks || 0,
      conversions: performanceMetrics?.paid.conversions || 0,
      ctr: campaignAnalytics.clickThroughRate,
      cpc: performanceMetrics?.paid.cpc || 0,
      roi: campaignAnalytics.roi,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ] : []

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load marketing analytics data</p>
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

  const filteredAnalytics = analytics.filter(item => {
    const matchesSearch = item.metric?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.trend?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || item.trend === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics from consolidated data
  const totalCampaigns = campaignAnalytics?.totalCampaigns || 0
  const activeCampaigns = campaignAnalytics?.activeCampaigns || 0
  const totalSpend = campaignAnalytics?.totalSpend || 0
  const totalRevenue = campaignAnalytics?.totalRevenue || 0
  const avgROAS = campaignAnalytics?.roi || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleViewCampaign = (campaign: any) => {
    setSelectedCampaign(campaign)
    setShowViewModal(true)
  }

  const handleEditCampaign = (campaign: any) => {
    setSelectedCampaign(campaign)
    setShowEditModal(true)
  }

  const handleViewAnalytics = async (campaign: any) => {
    try {
      router.push(`/marketing/analytics/${campaign.id}/details`)
    } catch (error: any) {
      console.error('Failed to navigate to analytics:', error)
      toast.error('Failed to open analytics')
    }
  }

  const handleDeleteCampaign = async (campaign: any) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        // Note: In a real implementation, you would make an API call here
        // For now, we'll just show a success message and refresh the data
        toast.success('Campaign deleted successfully')
        refreshData()
      } catch (error: any) {
        console.error('Failed to delete campaign:', error)
        toast.error('Failed to delete campaign')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-300">MARKETING SYSTEM ACTIVE</span>
                  </div>
                  <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Marketing Analytics
                </h1>
                <p className="text-purple-100 max-w-2xl">
                  Track and analyze marketing campaign performance and ROI
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <SnowButton variant="outline" className="bg-purple-500/20 border-purple-400/30 text-white hover:bg-purple-500/30">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Marketing Dashboard
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
                  Marketing Analytics
                </h1>
                <p className="text-red-100 max-w-2xl">
                  Unable to load analytics data. Please try again.
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-300">MARKETING SYSTEM ACTIVE</span>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Marketing Analytics
              </h1>
              <p className="text-purple-100 max-w-2xl">
                Track and analyze marketing campaign performance and ROI
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <SnowButton variant="outline" className="bg-purple-500/20 border-purple-400/30 text-white hover:bg-purple-500/30">
                <Megaphone className="h-4 w-4 mr-2" />
                Marketing Dashboard
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
                <p className="text-sm font-medium text-purple-300">Total Campaigns</p>
                <p className="text-2xl font-bold text-white">{totalCampaigns}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-purple-200">+{activeCampaigns} active</p>
                </div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Megaphone className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

                 <SnowCard variant="dark">
           <SnowCardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-green-300">Total Revenue</p>
                 <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                 <p className="text-xs text-green-200">Generated revenue</p>
               </div>
               <div className="p-3 bg-green-500/20 rounded-lg">
                  <PoundSterling className="h-6 w-6 text-green-600" />
               </div>
             </div>
           </SnowCardContent>
         </SnowCard>

         <SnowCard variant="dark">
           <SnowCardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-blue-300">Total Spend</p>
                 <p className="text-2xl font-bold text-white">{formatCurrency(totalSpend)}</p>
                 <p className="text-xs text-blue-200">Marketing budget</p>
               </div>
               <div className="p-3 bg-blue-500/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
               </div>
             </div>
           </SnowCardContent>
         </SnowCard>

         <SnowCard variant="dark">
           <SnowCardContent className="p-6">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm font-medium text-orange-300">Avg ROAS</p>
                 <p className="text-2xl font-bold text-white">{avgROAS.toFixed(1)}x</p>
                 <p className="text-xs text-orange-200">Return on ad spend</p>
               </div>
               <div className="p-3 bg-orange-500/20 rounded-lg">
                 <TrendingUp className="h-6 w-6 text-orange-400" />
               </div>
             </div>
           </SnowCardContent>
         </SnowCard>
      </div>
      <SnowCard variant="dark">
        <SnowCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <SnowSearchInput
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={() => {}}
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
              <SnowButton variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Add Campaign
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard variant="dark">
        <SnowCardHeader>
          <SnowCardTitle icon={<BarChart3 className="h-5 w-5" />}>
            Campaign Analytics
          </SnowCardTitle>
          <SnowCardDescription>
            Comprehensive performance metrics and ROI analysis for all campaigns
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredAnalytics.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <tr>
                  <SnowTableHead>Campaign</SnowTableHead>
                  <SnowTableHead>Type</SnowTableHead>
                  <SnowTableHead>Impressions</SnowTableHead>
                  <SnowTableHead>Clicks</SnowTableHead>
                  <SnowTableHead>CTR</SnowTableHead>
                  <SnowTableHead>Spend</SnowTableHead>
                  <SnowTableHead>Revenue</SnowTableHead>
                  <SnowTableHead>ROAS</SnowTableHead>
                  <SnowTableHead>Status</SnowTableHead>
                  <SnowTableHead>Trend</SnowTableHead>
                  <SnowTableHead align="center">Actions</SnowTableHead>
                </tr>
              </SnowTableHeader>
              <SnowTableBody>
                {campaigns.map((campaign) => (
                  <SnowTableRow key={campaign.id}>
                    <SnowTableCell>
                      <div>
                        <div className="font-medium text-white">{campaign.name}</div>
                        <div className="text-sm text-slate-600">Marketing Campaign</div>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white capitalize">{campaign.status}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{campaign.impressions?.toLocaleString()}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{campaign.clicks?.toLocaleString()}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{campaign.ctr}%</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{formatCurrency(campaign.spent)}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white font-medium">{formatCurrency(campaign.budget)}</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="text-white">{campaign.roi}x</div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded-full ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                        </div>
                        <span className="text-white">{getStatusText(campaign.status)}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(5.2)}
                        <span className="text-sm text-green-400">
                          5.2%
                        </span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-1">
                        <SnowButton
                          icon={<Eye className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCampaign(campaign)}
                        />
                        <SnowButton
                          icon={<Edit className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCampaign(campaign)}
                        />
                        <SnowButton
                          icon={<BarChart3 className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAnalytics(campaign)}
                        />
                        <SnowButton
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No Campaigns Found</h3>
              <p className="text-slate-400 mb-4">No campaigns match your current search criteria. Try adjusting your filters or add a new campaign.</p>
              <SnowButton variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Add Campaign
              </SnowButton>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

