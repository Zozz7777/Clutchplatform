'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  DollarSign,
  Calendar,
  User,
  Building,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { useStore } from '@/store'
import { Deal, DealFormData } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DealsPage() {
  const { deals, fetchDeals, createDeal, updateDeal, deleteDeal, customers } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    customerId: '',
    amount: 0,
    stage: 'prospecting',
    probability: 0,
    expectedCloseDate: '',
    description: '',
    notes: ''
  })

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter
    return matchesSearch && matchesStage
  })

  const dealStats = {
    total: deals.length,
    totalValue: deals.reduce((sum, d) => sum + d.amount, 0),
    won: deals.filter(d => d.stage === 'won').length,
    lost: deals.filter(d => d.stage === 'lost').length,
    inProgress: deals.filter(d => ['prospecting', 'qualification', 'proposal', 'negotiation'].includes(d.stage)).length
  }

  const stageConfig = {
    prospecting: { color: 'bg-blue-100 text-blue-800', icon: Target },
    qualification: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    proposal: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle },
    negotiation: { color: 'bg-orange-100 text-orange-800', icon: ArrowRight },
    won: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    lost: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedDeal) {
        await updateDeal(selectedDeal.id, formData)
      } else {
        await createDeal(formData)
      }
      setShowAddModal(false)
      setShowEditModal(false)
      setFormData({
        title: '',
        customerId: '',
        amount: 0,
        stage: 'prospecting',
        probability: 0,
        expectedCloseDate: '',
        description: '',
        notes: ''
      })
      setSelectedDeal(null)
    } catch (error) {
      console.error('Error saving deal:', error)
    }
  }

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal)
    setFormData({
      title: deal.title,
      customerId: deal.customerId,
      amount: deal.amount,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate || '',
      description: deal.description || '',
      notes: deal.notes || ''
    })
    setShowEditModal(true)
  }

  const handleView = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowViewModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteDeal(id)
      } catch (error) {
        console.error('Error deleting deal:', error)
      }
    }
  }

  const getStageConfig = (stage: string) => {
    return stageConfig[stage as keyof typeof stageConfig] || stageConfig.prospecting
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deals</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your sales pipeline and opportunities</p>
        </div>
        <SnowButton onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Deal
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dealStats.total}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(dealStats.totalValue)}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{dealStats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Won</p>
                <p className="text-2xl font-bold text-green-600">{dealStats.won}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lost</p>
                <p className="text-2xl font-bold text-red-600">{dealStats.lost}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
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
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stages</option>
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
              <SnowButton variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Deals Table */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Deal Pipeline</SnowCardTitle>
          <SnowCardDescription>
            {filteredDeals.length} deals found
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Close</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeals.map((deal) => {
                const stageConfig = getStageConfig(deal.stage)
                const StageIcon = stageConfig.icon
                return (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {deal.title}
                        </div>
                        {deal.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {deal.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {deal.customer && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {deal.customer.name}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(deal.amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StageIcon className="h-4 w-4" />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageConfig.color}`}>
                          {deal.stage}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {deal.probability}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(deal)}
                        >
                          <Eye className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(deal)}
                        >
                          <Edit className="h-4 w-4" />
                        </SnowButton>
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(deal.id)}
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

      {/* Add/Edit Deal Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedDeal(null)
          setFormData({
            title: '',
            customerId: '',
            amount: 0,
            stage: 'prospecting',
            probability: 0,
            expectedCloseDate: '',
            description: '',
            notes: ''
          })
        }}
        title={selectedDeal ? 'Edit Deal' : 'Add New Deal'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deal Title *
              </label>
              <SnowInput
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount *
              </label>
              <SnowInput
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="prospecting">Prospecting</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Probability (%)
              </label>
              <SnowInput
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Close Date
              </label>
              <SnowInput
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
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
                setSelectedDeal(null)
              }}
            >
              Cancel
            </SnowButton>
            <SnowButton type="submit">
              {selectedDeal ? 'Update Deal' : 'Add Deal'}
            </SnowButton>
          </div>
        </form>
      </Modal>

      {/* View Deal Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedDeal(null)
        }}
        title="Deal Details"
      >
        {selectedDeal && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedDeal.title}
                </h3>
                {selectedDeal.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedDeal.description}
                  </p>
                )}
                <div className="space-y-3">
                  {selectedDeal.customer && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedDeal.customer.name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(selectedDeal.amount)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Stage</span>
                    <div className="mt-1">
                      {(() => {
                        const stageConfig = getStageConfig(selectedDeal.stage)
                        const StageIcon = stageConfig.icon
                        return (
                          <div className="flex items-center gap-2">
                            <StageIcon className="h-4 w-4" />
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageConfig.color}`}>
                              {selectedDeal.stage}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Probability</span>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${selectedDeal.probability}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedDeal.probability}%
                      </span>
                    </div>
                  </div>
                  {selectedDeal.expectedCloseDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Expected Close Date</span>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(selectedDeal.expectedCloseDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selectedDeal.notes && (
              <div>
                <span className="text-sm font-medium text-gray-500">Notes</span>
                <p className="text-gray-900 dark:text-white mt-1">{selectedDeal.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <SnowButton
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedDeal)
                }}
              >
                Edit Deal
              </SnowButton>
              <SnowButton
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedDeal(null)
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

