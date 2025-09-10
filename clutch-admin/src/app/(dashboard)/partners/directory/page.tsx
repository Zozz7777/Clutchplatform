'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Handshake,
  Building2,
  Star,
  PoundSterling,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import Modal from '@/components/ui/modal'
import { usePartnersStore } from '@/store'
import { Partner, PartnerForm } from '@/types'
import { formatDate, formatCurrency, getStatusColor, getInitials, getAvatarColor } from '@/lib/utils'

export default function PartnersDirectoryPage() {
  const { partners, isLoading, error, fetchPartners, createPartner, updatePartner, deletePartner } = usePartnersStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const handleAddPartner = () => {
    setEditingPartner(null)
    setShowFormModal(true)
  }

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner)
    setShowFormModal(true)
  }

  const handleDeletePartner = (partner: Partner) => {
    setSelectedPartner(partner)
    setShowDeleteModal(true)
  }

  const handleSubmitPartner = async (data: PartnerForm) => {
    try {
      if (editingPartner) {
        await updatePartner(editingPartner.id, data)
      } else {
        await createPartner(data)
      }
      setShowFormModal(false)
    } catch (error) {
      console.error('Error saving partner:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedPartner) {
      try {
        await deletePartner(selectedPartner.id)
        setShowDeleteModal(false)
        setSelectedPartner(null)
      } catch (error) {
        console.error('Error deleting partner:', error)
      }
    }
  }

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || partner.status === selectedStatus
    const matchesType = selectedType === 'all' || partner.type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate stats
  const totalPartners = partners.length
  const activePartners = partners.filter(partner => partner.status === 'active').length
  const totalRevenue = partners.reduce((sum, partner) => sum + (partner.totalRevenue || 0), 0)
  const averageRating = partners.reduce((sum, partner) => sum + (partner.rating || 0), 0) / partners.length || 0

  const statuses = ['active', 'pending', 'suspended', 'inactive']
  const types = ['parts_shop', 'repair_center', 'distributor', 'service_provider']

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span>Loading partners...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading partners: {error}</p>
          <SnowButton onClick={() => fetchPartners()}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Directory</h1>
          <p className="text-muted-foreground">
            Manage your business partners and their performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SnowButton variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </SnowButton>
          <SnowButton variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </SnowButton>
          <SnowButton onClick={handleAddPartner}>
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </SnowButton>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Partners</SnowCardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{totalPartners}</div>
            <p className="text-xs text-muted-foreground">
              All partners
            </p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Active Partners</SnowCardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{activePartners}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Revenue</SnowCardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Generated revenue
            </p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Average Rating</SnowCardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Partner satisfaction
            </p>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Filters</SnowCardTitle>
          <SnowCardDescription>Search and filter partners</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <SnowInput
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <SnowButton variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </SnowButton>
            </div>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Partner Directory</SnowCardTitle>
          <SnowCardDescription>
            {filteredPartners.length} of {totalPartners} partners
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredPartners.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Partner</SnowTableHead>
                <SnowTableHead>Type</SnowTableHead>
                <SnowTableHead>Location</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Rating</SnowTableHead>
                <SnowTableHead>Revenue</SnowTableHead>
                <SnowTableHead>Orders</SnowTableHead>
                <SnowTableHead align="right">Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredPartners.map((partner) => (
                  <SnowTableRow key={partner.id}>
                    <SnowTableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(partner.name)}`}>
                          {getInitials(partner.name)}
                        </div>
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-muted-foreground">{partner.email}</div>
                        </div>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">
                        {partner.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{partner.location || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                        {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                      </span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{partner.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">
                        {partner.totalRevenue ? formatCurrency(partner.totalRevenue) : 'N/A'}
                      </span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{partner.orderCount || 0}</span>
                    </SnowTableCell>
                    <SnowTableCell align="right">
                      <div className="flex items-center space-x-2">
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPartner(partner)}
                        >
                          Edit
                        </SnowButton>
                        <SnowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePartner(partner)}
                        >
                          Delete
                        </SnowButton>
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Try adjusting your filters or add a new partner.
              </p>
              <SnowButton onClick={handleAddPartner} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </SnowButton>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
       <Modal
         isOpen={showFormModal}
         onClose={() => setShowFormModal(false)}
         title={editingPartner ? 'Edit Partner' : 'Add Partner'}
         size="lg"
       >
                    <PartnerFormComponent
              partner={editingPartner}
              onSubmit={handleSubmitPartner}
              onCancel={() => setShowFormModal(false)}
            />
      </Modal>
       <Modal
         isOpen={showDeleteModal}
         onClose={() => setShowDeleteModal(false)}
         title="Delete Partner"
         size="sm"
       >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete <strong>{selectedPartner?.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <SnowButton
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </SnowButton>
            <SnowButton
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </SnowButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Partner Form Component
interface PartnerFormProps {
  partner?: Partner | null
  onSubmit: (data: PartnerForm) => void
  onCancel: () => void
}

function PartnerFormComponent({ partner, onSubmit, onCancel }: PartnerFormProps) {
  const [formData, setFormData] = useState<PartnerForm>({
    name: partner?.name || '',
    email: partner?.email || '',
    phone: partner?.phone || '',
    type: partner?.type || 'parts_shop',
    location: partner?.location || '',
    address: partner?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contactPerson: partner?.contactPerson || {
      name: '',
      email: '',
      phone: '',
      position: ''
    },
    commissionRate: partner?.commissionRate || 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        street: prev.address?.street || '',
        city: prev.address?.city || '',
        state: prev.address?.state || '',
        zipCode: prev.address?.zipCode || '',
        country: prev.address?.country || '',
        [field]: value
      }
    }))
  }

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        name: prev.contactPerson?.name || '',
        email: prev.contactPerson?.email || '',
        phone: prev.contactPerson?.phone || '',
        position: prev.contactPerson?.position || '',
        [field]: value
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Partner Name</label>
          <SnowInput
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <SnowInput
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <SnowInput
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            required
          >
            <option value="parts_shop">Parts Shop</option>
            <option value="repair_center">Repair Center</option>
            <option value="distributor">Distributor</option>
            <option value="service_provider">Service Provider</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <SnowInput
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>
      <div className="space-y-3">
        <h4 className="font-medium">Address</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Street</label>
            <SnowInput
              value={formData.address?.street || ''}
              onChange={(e) => handleAddressChange('street', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <SnowInput
              value={formData.address?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <SnowInput
              value={formData.address?.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ZIP Code</label>
            <SnowInput
              value={formData.address?.zipCode || ''}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <SnowInput
              value={formData.address?.country || ''}
              onChange={(e) => handleAddressChange('country', e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-medium">Contact Person</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <SnowInput
              value={formData.contactPerson?.name || ''}
              onChange={(e) => handleContactChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <SnowInput
              type="email"
              value={formData.contactPerson?.email || ''}
              onChange={(e) => handleContactChange('email', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <SnowInput
              value={formData.contactPerson?.phone || ''}
              onChange={(e) => handleContactChange('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <SnowInput
              value={formData.contactPerson?.position || ''}
              onChange={(e) => handleContactChange('position', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Commission Rate (%)</label>
        <SnowInput
          type="number"
          step="0.1"
          value={formData.commissionRate}
          onChange={(e) => handleChange('commissionRate', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <SnowButton type="button" variant="outline" onClick={onCancel}>
          Cancel
        </SnowButton>
        <SnowButton type="submit">
          {partner ? 'Update Partner' : 'Add Partner'}
        </SnowButton>
      </div>
    </form>
  )
}


