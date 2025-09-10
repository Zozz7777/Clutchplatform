'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Megaphone, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Mail,
  Share2,
  Globe
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { useStore } from '@/store'
import { Campaign, CampaignFormData } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function CampaignsPage() {
  const { campaigns, fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    type: 'email',
    status: 'draft',
    budget: 0,
    startDate: '',
    endDate: '',
    targetAudience: '',
    goals: '',
    notes: ''
  })

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const campaignStats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
    totalSpent: campaigns.reduce((sum, c) => sum + (c.spent || 0), 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'social': return 'bg-purple-100 text-purple-800'
      case 'digital': return 'bg-green-100 text-green-800'
      case 'print': return 'bg-orange-100 text-orange-800'
      case 'event': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'social': return Share2
      case 'digital': return Globe
      case 'print': return BarChart3
      case 'event': return Users
      default: return Megaphone
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedCampaign) {
        await updateCampaign(selectedCampaign.id, formData)
      } else {
        await createCampaign(formData)
      }
      setShowAddModal(false)
      setShowEditModal(false)
      setFormData({
        name: '',
        description: '',
        type: 'email',
        status: 'draft',
        budget: 0,
        startDate: '',
        endDate: '',
        targetAudience: '',
        goals: '',
        notes: ''
      })
      setSelectedCampaign(null)
    } catch (error) {
      console.error('Error saving campaign:', error)
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      type: campaign.type,
      status: campaign.status,
      budget: campaign.budget || 0,
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
      targetAudience: campaign.targetAudience || '',
      goals: campaign.goals || '',
      notes: campaign.notes || ''
    })
    setShowEditModal(true)
  }

  const handleView = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowViewModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id)
      } catch (error) {
        console.error('Error deleting campaign:', error)
      }
    }
  }

  const calculateROI = (revenue: number, spent: number) => {
    if (spent === 0) return 0
    return ((revenue - spent) / spent) * 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your marketing campaigns and track performance</p>
        </div>
        <SnowButton onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Campaign
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaignStats.total}</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{campaignStats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{campaignStats.completed}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{campaignStats.draft}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(campaignStats.totalBudget)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(campaignStats.totalSpent)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(campaignStats.totalRevenue)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg ROI</p>
                <p className="text-2xl font-bold text-purple-600">
                  {campaignStats.totalSpent > 0 
                    ? `${calculateROI(campaignStats.totalRevenue, campaignStats.totalSpent).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>

      {/* Filters */}
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <SnowInput
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="social">Social Media</option>
                <option value="digital">Digital Ads</option>
                <option value="print">Print</option>
                <option value="event">Event</option>
              </select>
              <SnowButton variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Campaigns Table */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Marketing Campaigns</SnowCardTitle>
          <SnowCardDescription>
            {filteredCampaigns.length} campaigns found
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => {
                const TypeIcon = getTypeIcon(campaign.type)
                const roi = calculateROI(campaign.revenue || 0, campaign.spent || 0)
                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                        {campaign.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {campaign.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(campaign.type)}`}>
                          {campaign.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {campaign.budget ? formatCurrency(campaign.budget) : '-'}
                    </TableCell>
                    <TableCell>
                      {campaign.spent ? formatCurrency(campaign.spent) : '-'}
                    </TableCell>
                    <TableCell>
                      {campaign.revenue ? formatCurrency(campaign.revenue) : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roi.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {campaign.startDate && campaign.endDate ? (
                        <div className="text-sm text-gray-500">
                          {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(campaign)}
                        >
                          <Eye className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </SnowButton>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </SnowCardContent>
      </SnowCard>

      {/* Add/Edit Campaign Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedCampaign(null)
          setFormData({
            name: '',
            description: '',
            type: 'email',
            status: 'draft',
            budget: 0,
            startDate: '',
            endDate: '',
            targetAudience: '',
            goals: '',
            notes: ''
          })
        }}
        title={selectedCampaign ? 'Edit Campaign' : 'Add New Campaign'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campaign Name *
              </label>
              <SnowInput
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campaign Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Email Marketing</option>
                <option value="social">Social Media</option>
                <option value="digital">Digital Advertising</option>
                <option value="print">Print Media</option>
                <option value="event">Event Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Budget
              </label>
              <SnowInput
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <SnowInput
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <SnowInput
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Audience
            </label>
            <SnowInput
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Goals
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <SnowButton
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false)
                setShowEditModal(false)
                setSelectedCampaign(null)
              }}
            >
              Cancel
            </SnowButton>
            <SnowButton type="submit">
              {selectedCampaign ? 'Update Campaign' : 'Add Campaign'}
            </SnowButton>
          </div>
        </form>
      </Modal>

      {/* View Campaign Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedCampaign(null)
        }}
        title="Campaign Details"
      >
        {selectedCampaign && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedCampaign.name}
                </h3>
                {selectedCampaign.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedCampaign.description}
                  </p>
                )}
                <div className="space-y-3">
                  {selectedCampaign.targetAudience && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Target Audience</span>
                      <p className="text-gray-900 dark:text-white">{selectedCampaign.targetAudience}</p>
                    </div>
                  )}
                  {selectedCampaign.goals && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Goals</span>
                      <p className="text-gray-900 dark:text-white">{selectedCampaign.goals}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                        {selectedCampaign.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type</span>
                    <div className="mt-1">
                      {(() => {
                        const TypeIcon = getTypeIcon(selectedCampaign.type)
                        return (
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4" />
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedCampaign.type)}`}>
                              {selectedCampaign.type}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  {selectedCampaign.budget && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Budget</span>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(selectedCampaign.budget)}
                      </p>
                    </div>
                  )}
                  {selectedCampaign.spent && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Spent</span>
                      <p className="text-lg font-semibold text-orange-600">
                        {formatCurrency(selectedCampaign.spent)}
                      </p>
                    </div>
                  )}
                  {selectedCampaign.revenue && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Revenue</span>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(selectedCampaign.revenue)}
                      </p>
                    </div>
                  )}
                  {selectedCampaign.spent && selectedCampaign.revenue && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">ROI</span>
                      <p className={`text-lg font-semibold ${calculateROI(selectedCampaign.revenue, selectedCampaign.spent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calculateROI(selectedCampaign.revenue, selectedCampaign.spent).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {(selectedCampaign.startDate || selectedCampaign.endDate) && (
              <div>
                <span className="text-sm font-medium text-gray-500">Campaign Duration</span>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">
                    {selectedCampaign.startDate ? formatDate(selectedCampaign.startDate) : 'TBD'} - {selectedCampaign.endDate ? formatDate(selectedCampaign.endDate) : 'TBD'}
                  </span>
                </div>
              </div>
            )}
            {selectedCampaign.notes && (
              <div>
                <span className="text-sm font-medium text-gray-500">Notes</span>
                <p className="text-gray-900 dark:text-white mt-1">{selectedCampaign.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <SnowButton
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedCampaign)
                }}
              >
                Edit Campaign
              </SnowButton>
              <SnowButton
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedCampaign(null)
                }}
              >
                Close
              </SnowButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

