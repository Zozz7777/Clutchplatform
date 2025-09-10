import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface CommissionCalculations {
  totalCommissions: number
  pendingCommissions: number
  paidCommissions: number
  averageCommission: number
  commissionRate: number
  lastCalculation: string
}

interface PaymentData {
  totalPayments: number
  pendingPayments: number
  completedPayments: number
  paymentMethods: {
    [key: string]: number
  }
  paymentSchedule: {
    period: string
    amount: number
    status: string
  }[]
}

interface PartnersCommissionDashboardData {
  commissionCalculations: CommissionCalculations
  paymentData: PaymentData
  lastUpdated: string
}

export const usePartnersCommissionDashboard = () => {
  const [data, setData] = useState<PartnersCommissionDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadCommissionData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Loading consolidated partners commission dashboard data...')
      
      const response = await apiClient.get<PartnersCommissionDashboardData>('/partners/commission/dashboard')
      
      if (response.success && response.data) {
        setData(response.data)
        setLastUpdated(new Date())
        console.log('✅ Consolidated partners commission dashboard data loaded successfully')
      } else {
        throw new Error(response.message || 'Failed to load partners commission dashboard data')
      }
    } catch (err: any) {
      console.error('❌ Failed to load consolidated partners commission dashboard data:', err)
      setError(err.message || 'Failed to load partners commission dashboard data')
      toast.error('Failed to load partners commission dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    loadCommissionData()
  }, [loadCommissionData])

  // Load data on mount
  useEffect(() => {
    loadCommissionData()
  }, [loadCommissionData])

  // Auto-refresh every 10 minutes (commission data doesn't change frequently)
  useEffect(() => {
    const interval = setInterval(loadCommissionData, 10 * 60 * 1000) // 10 minutes
    return () => clearInterval(interval)
  }, [loadCommissionData])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData,
    // Convenience getters for specific data sections
    commissionCalculations: data?.commissionCalculations || null,
    paymentData: data?.paymentData || null
  }
}

export default usePartnersCommissionDashboard
