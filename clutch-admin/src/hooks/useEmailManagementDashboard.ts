import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface EmailCampaigns {
  totalCampaigns: number
  activeCampaigns: number
  scheduledCampaigns: number
  completedCampaigns: number
  totalRecipients: number
  averageOpenRate: number
  averageClickRate: number
}

interface EmailTemplates {
  totalTemplates: number
  activeTemplates: number
  draftTemplates: number
  mostUsedTemplate: string
  templateCategories: {
    [key: string]: number
  }
}

interface EmailAnalytics {
  totalEmails: number
  deliveredEmails: number
  openedEmails: number
  clickedEmails: number
  bouncedEmails: number
  unsubscribedEmails: number
  deliveryRate: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
}

interface EmailManagementDashboardData {
  emailCampaigns: EmailCampaigns
  emailTemplates: EmailTemplates
  emailAnalytics: EmailAnalytics
  lastUpdated: string
}

export const useEmailManagementDashboard = () => {
  const [data, setData] = useState<EmailManagementDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadEmailData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated email management dashboard data...')
      
      const response = await apiClient.get<EmailManagementDashboardData>('/email/management/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated email management dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load email management dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated email management dashboard data:', err)
      setError(err.message || 'Failed to load email management dashboard data')
      toast.error('Failed to load email management dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadEmailData()
  }, [loadEmailData])

  // Load data on mount
  useEffect(() => {
    loadEmailData()
  }, [loadEmailData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadEmailData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadEmailData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    emailCampaigns: data?.emailCampaigns || null,
    emailTemplates: data?.emailTemplates || null,
    emailAnalytics: data?.emailAnalytics || null
  }
}

export default useEmailManagementDashboard
