'use client'

import React, { useState, useEffect } from 'react'
import { SnowCard, SnowCardHeader, SnowCardContent, SnowCardTitle, SnowCardDescription } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput, SnowSearchInput } from '@/components/ui/snow-input'
import { SnowTable, SnowTableHeader, SnowTableBody, SnowTableRow, SnowTableCell, SnowTableHead, SnowTableFooter, SnowTableCaption } from '@/components/ui/snow-table'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PoundSterling, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Star,
  Activity
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function HRRecruitmentPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadCandidatesData()
  }, [])

  const loadCandidatesData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.get<any[]>('/hr/recruitment')
      if (response.success) {
        setCandidates(response.data || [])
      } else {
        setCandidates([])
        setError('Failed to load candidates data')
        toast.error('Failed to load candidates data')
      }
    } catch (error: any) {
      console.error('Failed to load candidates data:', error)
      setCandidates([])
      setError('Failed to load candidates data')
      toast.error('Failed to load candidates data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewCandidate = async (candidate: any) => {
    try {
      const response = await apiClient.get(`/hr/recruitment/${candidate._id || candidate.id}`)
      if (response.success) {
        setSelectedCandidate(response.data)
        setShowViewModal(true)
      } else {
        toast.error('Failed to load candidate details')
      }
    } catch (error) {
      console.error('Failed to load candidate details:', error)
      toast.error('Failed to load candidate details')
    }
  }

  const handleEditCandidate = async (candidate: any) => {
    try {
      const response = await apiClient.get(`/hr/recruitment/${candidate._id || candidate.id}`)
      if (response.success) {
        setSelectedCandidate(response.data)
        setShowEditModal(true)
      } else {
        toast.error('Failed to load candidate for editing')
      }
    } catch (error) {
      console.error('Failed to load candidate for editing:', error)
      toast.error('Failed to load candidate for editing')
    }
  }

  const handleMoreActions = (candidate: any) => {
    // Implement dropdown menu or additional actions
    toast.info(`More actions for candidate: ${candidate.name}`)
  }

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'EGP 0'
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-500'
      case 'screening':
        return 'bg-yellow-500'
      case 'interview':
        return 'bg-orange-500'
      case 'offer':
        return 'bg-purple-500'
      case 'hired':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'applied':
        return 'text-blue-400'
      case 'screening':
        return 'text-yellow-400'
      case 'interview':
        return 'text-orange-400'
      case 'offer':
        return 'text-purple-400'
      case 'hired':
        return 'text-green-400'
      case 'rejected':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || candidate.status === filter
    return matchesSearch && matchesFilter
  })

  // Calculate metrics
  const totalCandidates = candidates.length
  const activeCandidates = candidates.filter(candidate => 
    ['applied', 'screening', 'interview', 'offer'].includes(candidate.status)
  ).length
  const hiredCandidates = candidates.filter(candidate => candidate.status === 'hired').length
  const avgExpectedSalary = candidates.length > 0 ? 
    candidates.reduce((sum, candidate) => sum + (candidate.expectedSalary || 0), 0) / candidates.length : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading candidates data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <SnowButton onClick={loadCandidatesData}>Retry</SnowButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment Management</h1>
          <p className="text-muted-foreground">
            Track and manage job candidates
          </p>
        </div>
        <SnowButton>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </SnowButton>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{totalCandidates}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Candidates</p>
                <p className="text-2xl font-bold">{activeCandidates}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hired</p>
                <p className="text-2xl font-bold">{hiredCandidates}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>

        <SnowCard>
          <SnowCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Expected Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(avgExpectedSalary)}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <PoundSterling className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </SnowCardContent>
        </SnowCard>
      </div>
      <SnowCard>
        <SnowCardContent className="p-6">
          <div className="flex items-center space-x-4">
            <SnowSearchInput
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Candidates Overview</SnowCardTitle>
          <SnowCardDescription>
            All job candidates in the recruitment pipeline
          </SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          {filteredCandidates.length > 0 ? (
            <SnowTable>
              <SnowTableHeader>
                <SnowTableHead>Candidate</SnowTableHead>
                <SnowTableHead>Position</SnowTableHead>
                <SnowTableHead>Contact</SnowTableHead>
                <SnowTableHead>Status</SnowTableHead>
                <SnowTableHead>Experience</SnowTableHead>
                <SnowTableHead>Expected Salary</SnowTableHead>
                <SnowTableHead>Rating</SnowTableHead>
                <SnowTableHead>Applied</SnowTableHead>
                <SnowTableHead>Actions</SnowTableHead>
              </SnowTableHeader>
              <SnowTableBody>
                {filteredCandidates.map((candidate) => (
                  <SnowTableRow key={candidate._id || candidate.id}>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.department || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div>
                        <p className="font-medium">{candidate.position || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.education || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div>
                        <p className="text-sm">{candidate.email || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate.phone || 'N/A'}
                        </p>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <Badge className={`${getStatusColor(candidate.status)} ${getStatusText(candidate.status)}`}>
                        {candidate.status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{candidate.experience || 'N/A'}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="font-medium">{formatCurrency(candidate.expectedSalary || 0)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{candidate.rating || 0}</span>
                      </div>
                    </SnowTableCell>
                    <SnowTableCell>
                      <span className="text-sm">{formatDate(candidate.appliedDate)}</span>
                    </SnowTableCell>
                    <SnowTableCell>
                      <div className="flex items-center space-x-2">
                        <SnowButton 
                          icon={<Eye className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleViewCandidate(candidate)}
                        />
                        <SnowButton 
                          icon={<Edit className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditCandidate(candidate)}
                        />
                        <SnowButton 
                          icon={<MoreHorizontal className="h-4 w-4" />} 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMoreActions(candidate)}
                        />
                      </div>
                    </SnowTableCell>
                  </SnowTableRow>
                ))}
              </SnowTableBody>
            </SnowTable>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No candidates match your current filters.</p>
            </div>
          )}
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}

