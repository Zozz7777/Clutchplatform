import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface DocumentContracts {
  totalContracts: number
  activeContracts: number
  expiredContracts: number
  pendingContracts: number
  renewalDue: number
  totalValue: number
}

interface DocumentCompliance {
  complianceScore: number
  pendingReviews: number
  overdueDocuments: number
  complianceStatus: {
    [key: string]: string
  }
  auditHistory: {
    date: string
    score: number
    status: string
  }[]
}

interface LegalDocumentsDashboardData {
  documentContracts: DocumentContracts
  documentCompliance: DocumentCompliance
  lastUpdated: string
}

export const useLegalDocumentsDashboard = () => {
  const [data, setData] = useState<LegalDocumentsDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadDocumentsData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated legal documents dashboard data...')
      
      const response = await apiClient.get<LegalDocumentsDashboardData>('/legal/documents/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated legal documents dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load legal documents dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated legal documents dashboard data:', err)
      setError(err.message || 'Failed to load legal documents dashboard data')
      toast.error('Failed to load legal documents dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadDocumentsData()
  }, [loadDocumentsData])

  // Load data on mount
  useEffect(() => {
    loadDocumentsData()
  }, [loadDocumentsData])

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(loadDocumentsData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadDocumentsData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    documentContracts: data?.documentContracts || null,
    documentCompliance: data?.documentCompliance || null
  }
}

export default useLegalDocumentsDashboard
