'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Mail, 
  Phone, 
  Building,
  Calendar,
  Star,
  TrendingUp,
  UserPlus,
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
import { Lead, LeadFormData } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function LeadsPage() {
  const { leads, fetchLeads, createLead, updateLead, deleteLead } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: '',
    status: 'new',
    score: 0,
    notes: '',
    expectedValue: 0
  })

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    const matchesScore = scoreFilter === 'all' || 
                        (scoreFilter === 'hot' && lead.score >= 80) ||
                        (scoreFilter === 'warm' && lead.score >= 50 && lead.score < 80) ||
                        (scoreFilter === 'cold' && lead.score < 50)
    return matchesSearch && matchesStatus && matchesScore
  })

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    totalValue: leads.reduce((sum, l) => sum + (l.expectedValue || 0), 0)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-blue-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot'
    if (score >= 50) return 'Warm'
    return 'Cold'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-purple-100 text-purple-800'
      case 'converted': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedLead) {
        await updateLead(selectedLead.id, formData)
      } else {
        await createLead(formData)
      }
      setShowAddModal(false)
      setShowEditModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        source: '',
        status: 'new',
        score: 0,
        notes: '',
        expectedValue: 0
      })
      setSelectedLead(null)
    } catch (error) {
      console.error('Error saving lead:', error)
    }
  }

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead)
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      position: lead.position || '',
      source: lead.source || '',
      status: lead.status,
      score: lead.score,
      notes: lead.notes || '',
      expectedValue: lead.expectedValue || 0
    })
    setShowEditModal(true)
  }

  const handleView = (lead: Lead) => {
    setSelectedLead(lead)
    setShowViewModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id)
      } catch (error) {
        console.error('Error deleting lead:', error)
      }
    }
  }

  const handleConvert = async (lead: Lead) => {
    if (confirm('Convert this lead to a customer?')) {
      try {
        await updateLead(lead.id, { ...lead, status: 'converted' })
      } catch (error) {
        console.error('Error converting lead:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your sales leads</p>
        </div>
        <SnowButton onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{leadStats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New</p>
                <p className="text-2xl font-bold text-blue-600">{leadStats.new}</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600">{leadStats.contacted}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Qualified</p>
                <p className="text-2xl font-bold text-purple-600">{leadStats.qualified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Converted</p>
                <p className="text-2xl font-bold text-green-600">{leadStats.converted}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(leadStats.totalValue)}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
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
                  placeholder="Search leads..."
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
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Scores</option>
                <option value="hot">Hot (80+)</option>
                <option value="warm">Warm (50-79)</option>
                <option value="cold">Cold (<50)</option>
              </select>
              <SnowButton variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Leads Table */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Lead Pipeline</SnowCardTitle>
          <SnowCardDescription>
            {filteredLeads.length} leads found
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Value</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {lead.name}
                      </div>
                      {lead.position && (
                        <div className="text-sm text-gray-500">{lead.position}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.company && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {lead.company}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {lead.email && (
                        <Mail className="h-4 w-4 text-gray-400" />
                      )}
                      {lead.phone && (
                        <Phone className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Star className={`h-4 w-4 ${getScoreColor(lead.score)}`} />
                      <span className={`font-medium ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({getScoreLabel(lead.score)})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {lead.expectedValue ? formatCurrency(lead.expectedValue) : '-'}
                  </TableCell>
                  <TableCell>
                    {lead.createdAt ? formatDate(lead.createdAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(lead)}
                      >
                        <Eye className="h-4 w-4" />
                      </SnowButton>
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(lead)}
                      >
                        <Edit className="h-4 w-4" />
                      </SnowButton>
                      {lead.status !== 'converted' && (
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConvert(lead)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </SnowButton>
                      )}
                      <SnowButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </SnowButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SnowCardContent>
      </SnowCard>

      {/* Add/Edit Lead Modal */}
      <Modal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false)
          setShowEditModal(false)
          setSelectedLead(null)
          setFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            position: '',
            source: '',
            status: 'new',
            score: 0,
            notes: '',
            expectedValue: 0
          })
        }}
        title={selectedLead ? 'Edit Lead' : 'Add New Lead'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <SnowInput
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <SnowInput
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <SnowInput
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company
              </label>
              <SnowInput
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position
              </label>
              <SnowInput
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <SnowInput
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
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
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Score (0-100)
              </label>
              <SnowInput
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Value
              </label>
              <SnowInput
                type="number"
                value={formData.expectedValue}
                onChange={(e) => setFormData({ ...formData, expectedValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
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
                setSelectedLead(null)
              }}
            >
              Cancel
            </SnowButton>
            <SnowButton type="submit">
              {selectedLead ? 'Update Lead' : 'Add Lead'}
            </SnowButton>
          </div>
        </form>
      </Modal>

      {/* View Lead Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedLead(null)
        }}
        title="Lead Details"
      >
        {selectedLead && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedLead.name}
                </h3>
                {selectedLead.position && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedLead.position}
                  </p>
                )}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedLead.phone}</span>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedLead.company}</span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Score</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Star className={`h-4 w-4 ${getScoreColor(selectedLead.score)}`} />
                      <span className={`font-medium ${getScoreColor(selectedLead.score)}`}>
                        {selectedLead.score}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({getScoreLabel(selectedLead.score)})
                      </span>
                    </div>
                  </div>
                  {selectedLead.source && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Source</span>
                      <p className="text-gray-900 dark:text-white">{selectedLead.source}</p>
                    </div>
                  )}
                  {selectedLead.expectedValue && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Expected Value</span>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(selectedLead.expectedValue)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selectedLead.notes && (
              <div>
                <span className="text-sm font-medium text-gray-500">Notes</span>
                <p className="text-gray-900 dark:text-white mt-1">{selectedLead.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              {selectedLead.status !== 'converted' && (
                <SnowButton
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false)
                    handleConvert(selectedLead)
                  }}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Convert to Customer
                </SnowButton>
              )}
              <SnowButton
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  handleEdit(selectedLead)
                }}
              >
                Edit Lead
              </SnowButton>
              <SnowButton
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedLead(null)
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

