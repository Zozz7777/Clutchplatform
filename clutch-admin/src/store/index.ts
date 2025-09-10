import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  User, 
  Notification, 
  Theme, 
  DashboardMetrics, 
  Employee, 
  Invoice, 
  Customer, 
  Partner, 
  Campaign, 
  Project, 
  Contract,
  Message,
  Announcement,
  Meeting,
  UserProfile,
  UserPreferences,
  CompanySettings,
  SecuritySettings,
  FeatureSettings,
  SystemHealth,
  SystemLog,
  Expense,
  Payment
} from '@/types'
import { apiClient } from '@/lib/api'
import { sessionManager } from '@/utils/sessionManager'
import { debugSession } from '@/utils/debugSession'

// Enhanced error logging utility
const logStoreError = (storeName: string, action: string, error: any, context?: any) => {
  const timestamp = new Date().toISOString()
  const errorDetails = {
    timestamp,
    store: storeName,
    action,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    },
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }
  
  // Only log errors in development or when explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_STORE === 'true') {
    console.error(`🚨 Store Error [${storeName}]:`, JSON.stringify(errorDetails, null, 2))
    
    // Log to browser console with better formatting
    console.group(`🚨 Store Error: ${storeName} - ${action}`)
    console.error('Timestamp:', timestamp)
    console.error('Store:', storeName)
    console.error('Action:', action)
    console.error('Error Message:', error.message)
    console.error('Error Stack:', error.stack)
    console.error('Context:', context)
    console.groupEnd()
  }
}

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.login({ email, password })
          if (response && response.success) {
            // The backend returns { data: { user, token, refreshToken, permissions } }
            const { user, token, refreshToken } = response.data as { user: User; token: string; refreshToken: string }
            
            // Store tokens in localStorage for better security
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth-token', token)
              localStorage.setItem('refresh-token', refreshToken)
              // Set a non-sensitive auth flag cookie for middleware routing only
              document.cookie = `clutch-auth=1; path=/; max-age=${60 * 60 * 8}; SameSite=Strict`
            }
            
            // CRITICAL: Reload tokens in API client to ensure subsequent requests use the new token
            apiClient.reloadTokens()
            
            // Debug: Check if token was properly loaded (production-safe)
            if (process.env.NEXT_PUBLIC_DEBUG_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
              console.log('🔑 CLUTCH_LOGIN_DEBUG', {
                hasUser: !!user,
                hasToken: !!token,
                tokenLength: token?.length || 0,
                apiClientHasToken: apiClient.isAuthenticated(),
                localStorageToken: typeof window !== 'undefined' ? !!localStorage.getItem('auth-token') : 'N/A',
                timestamp: new Date().toISOString()
              })
            }
            
            // Only log debug session info in development
            if (process.env.NODE_ENV === 'development') {
              debugSession.log('Login successful')
              debugSession.logUser(user)
              debugSession.logToken(token)
              debugSession.logStorage()
            }
            
            set({ user, isAuthenticated: true })
            
            // Start session management
            sessionManager.login()
            
            // Small delay to ensure token is properly loaded before any subsequent API calls
            await new Promise(resolve => setTimeout(resolve, 100))
          } else {
            set({ error: response?.message || 'Login failed' })
          }
        } catch (error: any) {
          logStoreError('AuthStore', 'login', error, { email })
          
          // If it's a network error, provide a helpful message
          if (error.message?.includes('Network error') || error.message?.includes('fetch')) {
            set({ error: 'Unable to connect to the server. The service might be temporarily unavailable. Please try again in a few moments.' })
          } else {
            set({ error: error?.message || 'Login failed. Please try again.' })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        try {
          // Clear both localStorage and cookies
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token')
            localStorage.removeItem('refresh-token')
            // Clear middleware auth flag cookie
            document.cookie = 'clutch-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          }
          
          // Stop session management
          sessionManager.logout()
          
          // Reset store state immediately without API call
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          })
          
          // Optionally try to call API logout in background (non-blocking)
          if (typeof window !== 'undefined') {
            // Use a timeout to prevent blocking the UI
            setTimeout(async () => {
              try {
                await apiClient.logout()
              } catch (error) {
                // Silently ignore API logout errors
                console.debug('Background API logout failed:', error)
              }
            }, 100)
          }
        } catch (error: any) {
          logStoreError('AuthStore', 'logout', error)
          
          // Even if logout fails, clear local state
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-token')
            localStorage.removeItem('refresh-token')
            document.cookie = 'clutch-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          }
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          })
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post('/auth/create-employee', userData)
          if (response.success) {
            const { user, token } = response.data as { user: User; token: string }
            if (typeof window !== 'undefined') {
              localStorage.setItem('auth-token', token)
            }
            set({ user, isAuthenticated: true })
          } else {
            set({ error: response.message || 'Registration failed' })
          }
        } catch (error: any) {
          logStoreError('AuthStore', 'register', error, { userData })
          
          // If it's a network error, provide a helpful message
          if (error.message?.includes('Network error') || error.message?.includes('fetch')) {
            set({ error: 'Unable to connect to the server. Please check your internet connection and try again.' })
          } else {
            set({ error: error.message || 'Registration failed' })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      clearError: () => {
        set({ error: null })
      },

      refreshUser: async () => {
        try {
          // Ensure tokens are loaded before making request
          apiClient.reloadTokens()
          
          const response = await apiClient.getCurrentUser()
          if (response.success) {
            set({ user: response.data as User, isAuthenticated: true })
          }
        } catch (error: any) {
          logStoreError('AuthStore', 'refreshUser', error)
          console.error('Failed to refresh user:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('An error occurred during hydration:', error)
          } else {
            // Ensure tokens are loaded after hydration
            apiClient.reloadTokens()
          }
        }
      }
    }
  )
)

// UI Store
interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: 'light',
      notifications: [],
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      addNotification: (notification: Notification) =>
        set((state) => ({ notifications: [...state.notifications, notification] })),
      removeNotification: (id: string) =>
        set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
      markNotificationAsRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
    }
  )
)

// Dashboard Store
interface DashboardState {
  metrics: DashboardMetrics | null
  isLoading: boolean
  error: string | null
  fetchMetrics: () => Promise<void>
  fetchAnalytics: (period: string) => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  metrics: null,
  isLoading: false,
  error: null,
  fetchMetrics: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getDashboardMetrics()
      if (response.success) {
        set({ metrics: response.data as DashboardMetrics })
      } else {
        set({ error: response.message || 'Failed to fetch metrics' })
      }
    } catch (error: any) {
      logStoreError('DashboardStore', 'fetchMetrics', error)
      set({ error: error.message || 'Failed to fetch metrics' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchAnalytics: async (period: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getDashboardAnalytics()
      if (response.success) {
        // Update metrics with analytics data
        const analyticsData = response.data as any
        set((state) => ({
          metrics: state.metrics ? { 
            ...state.metrics, 
            analytics: {
              revenueChart: analyticsData?.revenueChart || [],
              userChart: analyticsData?.userChart || [],
              orderChart: analyticsData?.orderChart || []
            }
          } : null,
        }))
      } else {
        set({ error: response.message || 'Failed to fetch analytics' })
      }
    } catch (error: any) {
      logStoreError('DashboardStore', 'fetchAnalytics', error, { period })
      set({ error: error.message || 'Failed to fetch analytics' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// HR Store
interface HRState {
  employees: Employee[]
  isLoading: boolean
  error: string | null
  fetchEmployees: () => Promise<void>
  createEmployee: (employeeData: any) => Promise<void>
  updateEmployee: (id: string, employeeData: any) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
}

export const useHRStore = create<HRState>((set, get) => ({
  employees: [],
  isLoading: false,
  error: null,
  fetchEmployees: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getEmployees()
      if (response.success) {
        set({ employees: response.data as Employee[] })
      } else {
        set({ error: response.message || 'Failed to fetch employees' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch employees' })
    } finally {
      set({ isLoading: false })
    }
  },
  createEmployee: async (employeeData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createEmployee(employeeData)
      if (response.success) {
        // Refresh employees list
        get().fetchEmployees()
      } else {
        set({ error: response.message || 'Failed to create employee' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create employee' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateEmployee: async (id: string, employeeData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateEmployee(id, employeeData)
      if (response.success) {
        // Refresh employees list
        get().fetchEmployees()
      } else {
        set({ error: response.message || 'Failed to update employee' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update employee' })
    } finally {
      set({ isLoading: false })
    }
  },
  deleteEmployee: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.deleteEmployee(id)
      if (response.success) {
        // Refresh employees list
        get().fetchEmployees()
      } else {
        set({ error: response.message || 'Failed to delete employee' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete employee' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Finance Store
interface FinanceState {
  invoices: Invoice[]
  expenses: Expense[]
  payments: Payment[]
  isLoading: boolean
  error: string | null
  fetchInvoices: () => Promise<void>
  fetchExpenses: () => Promise<void>
  fetchPayments: () => Promise<void>
  createInvoice: (invoiceData: any) => Promise<void>
  updateInvoice: (id: string, invoiceData: any) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  invoices: [],
  expenses: [],
  payments: [],
  isLoading: false,
  error: null,
  fetchInvoices: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getInvoices()
      if (response.success) {
        set({ invoices: response.data as Invoice[] })
      } else {
        set({ error: response.message || 'Failed to fetch invoices' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch invoices' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchExpenses: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/finance/expenses')
      if (response.success) {
        set({ expenses: response.data as Expense[] })
      } else {
        set({ error: response.message || 'Failed to fetch expenses' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch expenses' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchPayments: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getPayments()
      if (response.success) {
        set({ payments: response.data as Payment[] })
      } else {
        set({ error: response.message || 'Failed to fetch payments' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch payments' })
    } finally {
      set({ isLoading: false })
    }
  },
  createInvoice: async (invoiceData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createInvoice(invoiceData)
      if (response.success) {
        // Refresh invoices list
        get().fetchInvoices()
      } else {
        set({ error: response.message || 'Failed to create invoice' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create invoice' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateInvoice: async (id: string, invoiceData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.put(`/finance/invoices/${id}`, invoiceData)
      if (response.success) {
        // Refresh invoices list
        get().fetchInvoices()
      } else {
        set({ error: response.message || 'Failed to update invoice' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update invoice' })
    } finally {
      set({ isLoading: false })
    }
  },
  deleteInvoice: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.deleteInvoice(id)
      if (response.success) {
        // Refresh invoices list
        get().fetchInvoices()
      } else {
        set({ error: response.message || 'Failed to delete invoice' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete invoice' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// CRM Store
interface CRMState {
  customers: Customer[]
  deals: any[]
  leads: any[]
  isLoading: boolean
  error: string | null
  fetchCustomers: (params?: any) => Promise<void>
  createCustomer: (customerData: any) => Promise<void>
  updateCustomer: (id: string, customerData: any) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  fetchDeals: (params?: any) => Promise<void>
  fetchLeads: (params?: any) => Promise<void>
}

export const useCRMStore = create<CRMState>((set, get) => ({
  customers: [],
  deals: [],
  leads: [],
  isLoading: false,
  error: null,
  fetchCustomers: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getCustomers(params)
      if (response.success) {
        set({ customers: response.data as Customer[] })
      } else {
        set({ error: response.message || 'Failed to fetch customers' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch customers' })
    } finally {
      set({ isLoading: false })
    }
  },
  createCustomer: async (customerData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createCustomer(customerData)
      if (response.success) {
        // Refresh customers list
        get().fetchCustomers()
      } else {
        set({ error: response.message || 'Failed to create customer' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create customer' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateCustomer: async (id: string, customerData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateCustomer(id, customerData)
      if (response.success) {
        // Refresh customers list
        get().fetchCustomers()
      } else {
        set({ error: response.message || 'Failed to update customer' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update customer' })
    } finally {
      set({ isLoading: false })
    }
  },
  deleteCustomer: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.deleteCustomer(id)
      if (response.success) {
        // Refresh customers list
        get().fetchCustomers()
      } else {
        set({ error: response.message || 'Failed to delete customer' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete customer' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchDeals: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getDeals(params)
      if (response.success) {
        set({ deals: response.data as any[] })
      } else {
        set({ error: response.message || 'Failed to fetch deals' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch deals' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchLeads: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/crm/leads', { params })
      if (response.success) {
        set({ leads: response.data as any[] })
      } else {
        set({ error: response.message || 'Failed to fetch leads' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch leads' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Partners Store
interface PartnersState {
  partners: Partner[]
  partnerOrders: any[]
  isLoading: boolean
  error: string | null
  fetchPartners: () => Promise<void>
  createPartner: (partnerData: any) => Promise<void>
  updatePartner: (id: string, partnerData: any) => Promise<void>
  deletePartner: (id: string) => Promise<void>
  fetchPartnerOrders: (params?: any) => Promise<void>
}

export const usePartnersStore = create<PartnersState>((set, get) => ({
  partners: [],
  partnerOrders: [],
  isLoading: false,
  error: null,
  fetchPartners: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getPartners()
      if (response.success) {
        set({ partners: response.data as Partner[] })
      } else {
        set({ error: response.message || 'Failed to fetch partners' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch partners' })
    } finally {
      set({ isLoading: false })
    }
  },
  createPartner: async (partnerData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createPartner(partnerData)
      if (response.success) {
        // Refresh partners list
        get().fetchPartners()
      } else {
        set({ error: response.message || 'Failed to create partner' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create partner' })
    } finally {
      set({ isLoading: false })
    }
  },
  updatePartner: async (id: string, partnerData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updatePartner(id, partnerData)
      if (response.success) {
        // Refresh partners list
        get().fetchPartners()
      } else {
        set({ error: response.message || 'Failed to update partner' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update partner' })
    } finally {
      set({ isLoading: false })
    }
  },
  deletePartner: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.deletePartner(id)
      if (response.success) {
        // Refresh partners list
        get().fetchPartners()
      } else {
        set({ error: response.message || 'Failed to delete partner' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete partner' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchPartnerOrders: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getPartnerOrders(params)
      if (response.success) {
        set({ partnerOrders: response.data as any[] })
      } else {
        set({ error: response.message || 'Failed to fetch partner orders' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch partner orders' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Marketing Store
interface MarketingState {
  campaigns: Campaign[]
  analytics: any
  isLoading: boolean
  error: string | null
  fetchCampaigns: (params?: any) => Promise<void>
  createCampaign: (campaignData: any) => Promise<void>
  updateCampaign: (id: string, campaignData: any) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
  fetchAnalytics: (period: string) => Promise<void>
}

export const useMarketingStore = create<MarketingState>((set, get) => ({
  campaigns: [],
  analytics: null,
  isLoading: false,
  error: null,
  fetchCampaigns: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getCampaigns(params)
      if (response.success) {
        set({ campaigns: response.data as Campaign[] })
      } else {
        set({ error: response.message || 'Failed to fetch campaigns' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch campaigns' })
    } finally {
      set({ isLoading: false })
    }
  },
  createCampaign: async (campaignData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createCampaign(campaignData)
      if (response.success) {
        // Refresh campaigns list
        get().fetchCampaigns()
      } else {
        set({ error: response.message || 'Failed to create campaign' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create campaign' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateCampaign: async (id: string, campaignData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateCampaign(id, campaignData)
      if (response.success) {
        // Refresh campaigns list
        get().fetchCampaigns()
      } else {
        set({ error: response.message || 'Failed to update campaign' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update campaign' })
    } finally {
      set({ isLoading: false })
    }
  },
  deleteCampaign: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.deleteCampaign(id)
      if (response.success) {
        // Refresh campaigns list
        get().fetchCampaigns()
      } else {
        set({ error: response.message || 'Failed to delete campaign' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete campaign' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchAnalytics: async (period: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getMarketingAnalytics(period)
      if (response.success) {
        set({ analytics: response.data })
      } else {
        set({ error: response.message || 'Failed to fetch analytics' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch analytics' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Projects Store
interface ProjectsState {
  projects: Project[]
  tasks: any[]
  isLoading: boolean
  error: string | null
  fetchProjects: (params?: any) => Promise<void>
  createProject: (projectData: any) => Promise<void>
  updateProject: (id: string, projectData: any) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  fetchProjectTasks: (projectId: string, params?: any) => Promise<void>
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  tasks: [],
  isLoading: false,
  error: null,
  fetchProjects: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getProjects(params)
      if (response.success) {
        set({ projects: response.data as Project[] })
      } else {
        set({ error: response.message || 'Failed to fetch projects' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch projects' })
    } finally {
      set({ isLoading: false })
    }
  },
  createProject: async (projectData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createProject(projectData)
      if (response.success) {
        // Refresh projects list
        get().fetchProjects()
      } else {
        set({ error: response.message || 'Failed to create project' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create project' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateProject: async (id: string, projectData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateProject(id, projectData)
      if (response.success) {
        // Refresh projects list
        get().fetchProjects()
      } else {
        set({ error: response.message || 'Failed to update project' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update project' })
    } finally {
      set({ isLoading: false })
    }
  },
  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.deleteProject(id)
      if (response.success) {
        // Refresh projects list
        get().fetchProjects()
      } else {
        set({ error: response.message || 'Failed to delete project' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete project' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchProjectTasks: async (projectId: string, params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getProjectTasks(projectId, params)
      if (response.success) {
        set({ tasks: response.data as any[] })
      } else {
        set({ error: response.message || 'Failed to fetch project tasks' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch project tasks' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Legal Store
interface LegalState {
  contracts: Contract[]
  policies: any[]
  documents: any[]
  isLoading: boolean
  error: string | null
  fetchContracts: (params?: any) => Promise<void>
  createContract: (contractData: any) => Promise<void>
  updateContract: (id: string, contractData: any) => Promise<void>
  deleteContract: (id: string) => Promise<void>
  fetchPolicies: (params?: any) => Promise<void>
  fetchDocuments: (params?: any) => Promise<void>
}

export const useLegalStore = create<LegalState>((set, get) => ({
  contracts: [],
  policies: [],
  documents: [],
  isLoading: false,
  error: null,
  fetchContracts: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getContracts()
      if (response.success) {
        set({ contracts: response.data as Contract[] })
      } else {
        set({ error: response.message || 'Failed to fetch contracts' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch contracts' })
    } finally {
      set({ isLoading: false })
    }
  },
  createContract: async (contractData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createContract(contractData)
      if (response.success) {
        // Refresh contracts list
        get().fetchContracts()
      } else {
        set({ error: response.message || 'Failed to create contract' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create contract' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateContract: async (id: string, contractData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateContract(id, contractData)
      if (response.success) {
        // Refresh contracts list
        get().fetchContracts()
      } else {
        set({ error: response.message || 'Failed to update contract' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update contract' })
    } finally {
      set({ isLoading: false })
    }
  },
  deleteContract: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.deleteContract(id)
      if (response.success) {
        // Refresh contracts list
        get().fetchContracts()
      } else {
        set({ error: response.message || 'Failed to delete contract' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete contract' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchPolicies: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getPolicies(params)
      if (response.success) {
        set({ policies: response.data as any[] })
      } else {
        set({ error: response.message || 'Failed to fetch policies' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch policies' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchDocuments: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getDocuments(params)
      if (response.success) {
        set({ documents: response.data as any[] })
      } else {
        set({ error: response.message || 'Failed to fetch documents' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch documents' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Communication Store
interface CommunicationState {
  messages: Message[]
  announcements: Announcement[]
  meetings: Meeting[]
  isLoading: boolean
  error: string | null
  fetchMessages: (params?: any) => Promise<void>
  sendMessage: (messageData: any) => Promise<void>
  updateMessage: (id: string, messageData: any) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  markMessageAsRead: (id: string) => Promise<void>
  starMessage: (id: string) => Promise<void>
  archiveMessage: (id: string) => Promise<void>
  fetchAnnouncements: (params?: any) => Promise<void>
  createAnnouncement: (announcementData: any) => Promise<void>
  fetchMeetings: (params?: any) => Promise<void>
  createMeeting: (meetingData: any) => Promise<void>
}

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  messages: [],
  announcements: [],
  meetings: [],
  isLoading: false,
  error: null,
  fetchMessages: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getMessages(params)
      if (response.success) {
        set({ messages: response.data as Message[] })
      } else {
        set({ error: response.message || 'Failed to fetch messages' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch messages' })
    } finally {
      set({ isLoading: false })
    }
  },
  sendMessage: async (messageData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.sendMessage(messageData)
      if (response.success) {
        // Refresh messages list
        get().fetchMessages()
      } else {
        set({ error: response.message || 'Failed to send message' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateMessage: async (id: string, messageData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateMessage(id, messageData)
      if (response.success) {
        // Refresh messages list
        get().fetchMessages()
      } else {
        set({ error: response.message || 'Failed to update message' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update message' })
    } finally {
      set({ isLoading: false })
    }
  },
  deleteMessage: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.deleteMessage(id)
      if (response.success) {
        // Refresh messages list
        get().fetchMessages()
      } else {
        set({ error: response.message || 'Failed to delete message' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete message' })
    } finally {
      set({ isLoading: false })
    }
  },
  markMessageAsRead: async (id: string) => {
    try {
      const response = await apiClient.markMessageAsRead(id)
      if (response.success) {
        // Update message in local state
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, status: 'read', readAt: new Date() } : msg
          ),
        }))
      }
    } catch (error: any) {
      console.error('Failed to mark message as read:', error)
    }
  },
  starMessage: async (id: string) => {
    try {
      const response = await apiClient.starMessage(id)
      if (response.success) {
        // Update message in local state
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, isStarred: !msg.isStarred } : msg
          ),
        }))
      }
    } catch (error: any) {
      console.error('Failed to star message:', error)
    }
  },
  archiveMessage: async (id: string) => {
    try {
      const response = await apiClient.archiveMessage(id)
      if (response.success) {
        // Update message in local state
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, isArchived: !msg.isArchived } : msg
          ),
        }))
      }
    } catch (error: any) {
      console.error('Failed to archive message:', error)
    }
  },
  fetchAnnouncements: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getAnnouncements(params)
      if (response.success) {
        set({ announcements: response.data as Announcement[] })
      } else {
        set({ error: response.message || 'Failed to fetch announcements' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch announcements' })
    } finally {
      set({ isLoading: false })
    }
  },
  createAnnouncement: async (announcementData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createAnnouncement(announcementData)
      if (response.success) {
        // Refresh announcements list
        get().fetchAnnouncements()
      } else {
        set({ error: response.message || 'Failed to create announcement' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create announcement' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchMeetings: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getMeetings(params)
      if (response.success) {
        set({ meetings: response.data as Meeting[] })
      } else {
        set({ error: response.message || 'Failed to fetch meetings' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch meetings' })
    } finally {
      set({ isLoading: false })
    }
  },
  createMeeting: async (meetingData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.createMeeting(meetingData)
      if (response.success) {
        // Refresh meetings list
        get().fetchMeetings()
      } else {
        set({ error: response.message || 'Failed to create meeting' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create meeting' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Settings Store
interface SettingsState {
  userProfile: UserProfile | null
  userPreferences: UserPreferences | null
  companySettings: CompanySettings | null
  securitySettings: SecuritySettings | null
  featureSettings: FeatureSettings | null
  systemHealth: SystemHealth | null
  systemLogs: SystemLog[]
  isLoading: boolean
  error: string | null
  fetchUserProfile: () => Promise<void>
  updateUserProfile: (profileData: any) => Promise<void>
  changePassword: (passwordData: any) => Promise<void>
  fetchUserPreferences: () => Promise<void>
  updateUserPreferences: (preferences: any) => Promise<void>
  fetchCompanySettings: () => Promise<void>
  updateCompanySettings: (companyData: any) => Promise<void>
  fetchSecuritySettings: () => Promise<void>
  updateSecuritySettings: (securityData: any) => Promise<void>
  fetchFeatureSettings: () => Promise<void>
  updateFeatureSettings: (featureData: any) => Promise<void>
  fetchSystemHealth: () => Promise<void>
  fetchSystemLogs: (params?: any) => Promise<void>
  backupSystem: () => Promise<void>
  restoreSystem: (backupData: any) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  userProfile: null,
  userPreferences: null,
  companySettings: null,
  securitySettings: null,
  featureSettings: null,
  systemHealth: null,
  systemLogs: [],
  isLoading: false,
  error: null,
  fetchUserProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getUserProfile()
      if (response.success) {
        set({ userProfile: response.data as UserProfile })
      } else {
        set({ error: response.message || 'Failed to fetch user profile' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch user profile' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateUserProfile: async (profileData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateUserProfile(profileData)
      if (response.success) {
        set({ userProfile: response.data as UserProfile })
      } else {
        set({ error: response.message || 'Failed to update user profile' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update user profile' })
    } finally {
      set({ isLoading: false })
    }
  },
  changePassword: async (passwordData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.changePassword(passwordData)
      if (response.success) {
        // Password changed successfully
      } else {
        set({ error: response.message || 'Failed to change password' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to change password' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchUserPreferences: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getUserPreferences()
      if (response.success) {
        set({ userPreferences: response.data as UserPreferences })
      } else {
        set({ error: response.message || 'Failed to fetch user preferences' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch user preferences' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateUserPreferences: async (preferences: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateUserPreferences(preferences)
      if (response.success) {
        set({ userPreferences: response.data as UserPreferences })
      } else {
        set({ error: response.message || 'Failed to update user preferences' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update user preferences' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchCompanySettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getCompanySettings()
      if (response.success) {
        set({ companySettings: response.data as CompanySettings })
      } else {
        set({ error: response.message || 'Failed to fetch company settings' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch company settings' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateCompanySettings: async (companyData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateCompanySettings(companyData)
      if (response.success) {
        set({ companySettings: response.data as CompanySettings })
      } else {
        set({ error: response.message || 'Failed to update company settings' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update company settings' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchSecuritySettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getSecuritySettings()
      if (response.success) {
        set({ securitySettings: response.data as SecuritySettings })
      } else {
        set({ error: response.message || 'Failed to fetch security settings' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch security settings' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateSecuritySettings: async (securityData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateSecuritySettings(securityData)
      if (response.success) {
        set({ securitySettings: response.data as SecuritySettings })
      } else {
        set({ error: response.message || 'Failed to update security settings' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update security settings' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchFeatureSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getFeatureSettings()
      if (response.success) {
        set({ featureSettings: response.data as FeatureSettings })
      } else {
        set({ error: response.message || 'Failed to fetch feature settings' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch feature settings' })
    } finally {
      set({ isLoading: false })
    }
  },
  updateFeatureSettings: async (featureData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.updateFeatureSettings(featureData)
      if (response.success) {
        set({ featureSettings: response.data as FeatureSettings })
      } else {
        set({ error: response.message || 'Failed to update feature settings' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update feature settings' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchSystemHealth: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getSystemHealth()
      if (response.success) {
        set({ systemHealth: response.data as SystemHealth })
      } else {
        set({ error: response.message || 'Failed to fetch system health' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch system health' })
    } finally {
      set({ isLoading: false })
    }
  },
  fetchSystemLogs: async (params?: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.getSystemLogs(params)
      if (response.success) {
        set({ systemLogs: response.data as SystemLog[] })
      } else {
        set({ error: response.message || 'Failed to fetch system logs' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch system logs' })
    } finally {
      set({ isLoading: false })
    }
  },
  backupSystem: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.backupSystem()
      if (response.success) {
        // Backup completed successfully
      } else {
        set({ error: response.message || 'Failed to backup system' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to backup system' })
    } finally {
      set({ isLoading: false })
    }
  },
  restoreSystem: async (backupData: any) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.restoreSystem(backupData)
      if (response.success) {
        // System restored successfully
      } else {
        set({ error: response.message || 'Failed to restore system' })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to restore system' })
    } finally {
      set({ isLoading: false })
    }
  },
}))
