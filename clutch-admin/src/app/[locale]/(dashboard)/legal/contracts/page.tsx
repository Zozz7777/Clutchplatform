'use client'

import React, { useEffect, useState } from 'react'
import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowInput } from '@/components/ui/snow-input'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Calendar,
  PoundSterling,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function LegalContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/legal/contracts')
      if (response.success && response.data) {
        setContracts(response.data as any[])
      } else {
        setContracts([])
      }
    } catch (error) {
      console.error('Failed to load contracts:', error)
      toast.error('Failed to load contracts')
      setContracts([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || contract.status === filter
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contracts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-slate-900">
            Legal Contracts
          </h1>
          <p className="text-slate-600 text-slate-600">
            Manage and track legal contracts and agreements
          </p>
        </div>
        <SnowButton>
          <Plus className="h-4 w-4 mr-2" />
          Create Contract
        </SnowButton>
      </div>
      <SnowCard>
        <SnowCardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <SnowInput
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
            <SnowButton variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </SnowButton>
          </div>
        </SnowCardContent>
      </SnowCard>
      <SnowCard>
        <SnowCardHeader>
          <SnowCardTitle>Contract Management</SnowCardTitle>
          <SnowCardDescription>Track and manage legal contracts and agreements</SnowCardDescription>
        </SnowCardHeader>
        <SnowCardContent>
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-slate-500">{contract.clientName}</p>
                    <p className="text-xs text-slate-400">Contract #{contract.contractNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-medium">{contract.value ? `$${contract.value.toLocaleString()}` : 'N/A'}</p>
                    <p className="text-sm text-slate-500">{contract.status}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                      {contract.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info(`Viewing contract: ${contract.title}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info(`Editing contract: ${contract.title}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </SnowButton>
                    <SnowButton
                      size="sm"
                      variant="outline"
                      onClick={() => toast.error(`Deleting contract: ${contract.title}`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </SnowButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SnowCardContent>
      </SnowCard>
    </div>
  )
}



