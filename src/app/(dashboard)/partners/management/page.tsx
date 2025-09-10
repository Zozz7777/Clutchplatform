'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { usePartnersStore } from '@/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Building2, Plus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Calendar, DollarSign, Star, TrendingUp, CheckCircle, Clock, XCircle, Car, Wrench, Settings, Users,
} from 'lucide-react'

export default function PartnersManagementPage() {
  const { partners, isLoading, fetchPartners } = usePartnersStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')

  React.useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || partner.type === typeFilter
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'parts_shop':
        return <Car className="h-4 w-4" />
      case 'repair_center':
        return <Wrench className="h-4 w-4" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const totalPartners = filteredPartners.length
  const activePartners = filteredPartners.filter(partner => partner.status === 'active').length
  const partsShops = filteredPartners.filter(partner => partner.type === 'parts_shop').length
  const repairCenters = filteredPartners.filter(partner => partner.type === 'repair_center').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Management</h1>
          <p className="text-muted-foreground">Manage parts shops and car repair centers</p>
        </div>
        <SnowButton className="bg-gradient-to-r from-clutch-red to-clutch-red-dark">
          <Plus className="h-4 w-4 mr-2" />
          Onboard Partner
        </SnowButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Total Partners</SnowCardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{totalPartners}</div>
            <p className="text-xs text-muted-foreground">All partners</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Active Partners</SnowCardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{activePartners}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Parts Shops</SnowCardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{partsShops}</div>
            <p className="text-xs text-muted-foreground">Parts suppliers</p>
          </SnowCardContent>
        </SnowCard>
        <SnowCard>
          <SnowCardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SnowCardTitle className="text-sm font-medium">Repair Centers</SnowCardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </SnowCardHeader>
          <SnowCardContent>
            <div className="text-2xl font-bold">{repairCenters}</div>
            <p className="text-xs text-muted-foreground">Service providers</p>
          </SnowCardContent>
        </SnowCard>
      </div>

      {/* Filters */}
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Filters</SnowCardTitle>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SnowInput
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Types</option>
              <option value="parts_shop">Parts Shop</option>
              <option value="repair_center">Repair Center</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>

      {/* Partners Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPartners.map((partner) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <SnowCard className="h-full hover:shadow-lg transition-shadow">
              <SnowCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getTypeIcon(partner.type)}
                    </div>
                    <div>
                      <SnowCardTitle className="text-lg">{partner.name}</SnowCardTitle>
                      <SnowCardDescription className="capitalize">
                        {partner.type.replace('_', ' ')}
                      </SnowCardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                      {partner.status}
                    </span>
                    {getStatusIcon(partner.status)}
                  </div>
                </div>
              </SnowCardHeader>
              <SnowCardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{partner.email}</span>
                  </div>
                  {partner.phone && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                  {partner.location && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{partner.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined: {formatDate(partner.createdAt)}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{partner.rating || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Orders:</span>
                    <span className="font-medium">{partner.orderCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">{formatCurrency(partner.totalRevenue || 0)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <SnowButton variant="outline" size="sm" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </SnowButton>
                  <SnowButton variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </SnowButton>
                  <SnowButton variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </SnowButton>
                </div>
              </SnowCardContent>
            </SnowCard>
          </motion.div>
        ))}
        
        {filteredPartners.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No partners found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

