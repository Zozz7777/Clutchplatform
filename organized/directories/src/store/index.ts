import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Notification, Theme, DashboardMetrics, Customer, Deal, Lead, Partner, PartnerOrder, Campaign, Project, Task, Message, CustomerFormData, DealFormData, LeadFormData, PartnerFormData, PartnerOrderFormData, CampaignFormData, ProjectFormData, TaskFormData, MessageFormData, ExecutiveDashboard, DepartmentAnalytics, PredictiveAnalytics, CustomReporting, BusinessAlert, AIRecommendation, CustomReport, CustomDashboard, ReportSchedule } from '@/types'
import { apiClient } from '@/lib/api'

// Auth Store
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // TODO: Implement actual API call
          const mockUser: User = {
            id: '1',
            email,
            firstName: 'John',
            lastName: 'Doe',
            role: 'admin',
            department: 'executive',
            permissions: ['read', 'write', 'admin'],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          set({ user: mockUser, isAuthenticated: true })
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// UI Store
interface UIState {
  sidebarCollapsed: boolean
  theme: Theme
  notifications: Notification[]
  toggleSidebar: () => void
  setTheme: (theme: Theme) => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: {
        mode: 'light',
        primaryColor: '#DC2626',
        borderRadius: 8,
        fontSize: 'medium',
      },
      notifications: [],
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },
      setTheme: (theme: Theme) => {
        set({ theme })
      },
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
      },
      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },
      markNotificationAsRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }))
      },
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
  fetchMetrics: () => Promise<void>
  setMetrics: (metrics: DashboardMetrics) => void
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  metrics: null,
  isLoading: false,
  fetchMetrics: async () => {
    set({ isLoading: true })
    try {
      // TODO: Implement actual API call
      const mockMetrics: DashboardMetrics = {
        totalRevenue: 1250000,
        totalCustomers: 8500,
        totalOrders: 12500,
        averageOrderValue: 100,
        customerSatisfaction: 4.8,
        employeeProductivity: 85,
        partnerPerformance: 92,
        marketingROI: 3.2,
      }
      set({ metrics: mockMetrics })
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  setMetrics: (metrics: DashboardMetrics) => {
    set({ metrics })
  },
}))

// HR Store
interface HRState {
  employees: User[]
  jobPostings: any[]
  isLoading: boolean
  fetchEmployees: () => Promise<void>
  fetchJobPostings: () => Promise<void>
  addEmployee: (employee: Partial<User>) => Promise<void>
  updateEmployee: (id: string, updates: Partial<User>) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
}

export const useHRStore = create<HRState>()((set, get) => ({
  employees: [],
  jobPostings: [],
  isLoading: false,
  fetchEmployees: async () => {
    set({ isLoading: true })
    try {
      // TODO: Implement actual API call
      const mockEmployees: User[] = [
        {
          id: '1',
          email: 'john.doe@clutch.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'admin',
          department: 'executive',
          permissions: ['read', 'write', 'admin'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'jane.smith@clutch.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'hr_manager',
          department: 'hr',
          permissions: ['read', 'write', 'hr_manage'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      set({ employees: mockEmployees })
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  fetchJobPostings: async () => {
    set({ isLoading: true })
    try {
      // TODO: Implement actual API call
      set({ jobPostings: [] })
    } catch (error) {
      console.error('Failed to fetch job postings:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  addEmployee: async (employee: Partial<User>) => {
    // TODO: Implement actual API call
    const newEmployee: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: employee.email || '',
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      role: employee.role || 'employee',
      department: employee.department || 'operations',
      permissions: employee.permissions || ['read'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({ employees: [...state.employees, newEmployee] }))
  },
  updateEmployee: async (id: string, updates: Partial<User>) => {
    set((state) => ({
      employees: state.employees.map((emp) =>
        emp.id === id ? { ...emp, ...updates, updatedAt: new Date() } : emp
      ),
    }))
  },
  deleteEmployee: async (id: string) => {
    set((state) => ({
      employees: state.employees.filter((emp) => emp.id !== id),
    }))
  },
}))

// Finance Store
interface FinanceState {
  invoices: any[]
  expenses: any[]
  payments: any[]
  isLoading: boolean
  fetchInvoices: () => Promise<void>
  fetchExpenses: () => Promise<void>
  fetchPayments: () => Promise<void>
}

export const useFinanceStore = create<FinanceState>()((set) => ({
  invoices: [],
  expenses: [],
  payments: [],
  isLoading: false,
  fetchInvoices: async () => {
    set({ isLoading: true })
    try {
      // TODO: Implement actual API call
      set({ invoices: [] })
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  fetchExpenses: async () => {
    set({ isLoading: true })
    try {
      // TODO: Implement actual API call
      set({ expenses: [] })
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  fetchPayments: async () => {
    set({ isLoading: true })
    try {
      // TODO: Implement actual API call
      set({ payments: [] })
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      set({ isLoading: false })
    }
  },
}))

// CRM Store
interface CRMState {
  customers: Customer[]
  deals: Deal[]
  leads: Lead[]
  isLoading: boolean
  error: string | null
  fetchCustomers: () => Promise<void>
  createCustomer: (customerData: CustomerFormData) => Promise<void>
  updateCustomer: (id: string, customerData: CustomerFormData) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  fetchDeals: () => Promise<void>
  createDeal: (dealData: DealFormData) => Promise<void>
  updateDeal: (id: string, dealData: DealFormData) => Promise<void>
  deleteDeal: (id: string) => Promise<void>
  fetchLeads: () => Promise<void>
  createLead: (leadData: LeadFormData) => Promise<void>
  updateLead: (id: string, leadData: LeadFormData) => Promise<void>
  deleteLead: (id: string) => Promise<void>
}

export const useCRMStore = create<CRMState>()((set, get) => ({
  customers: [],
  deals: [],
  leads: [],
  isLoading: false,
  error: null,

  // Customer actions
  fetchCustomers: async () => {
    set({ isLoading: true, error: null })
    try {
      const customers = await apiClient.getCustomers()
      set({ customers, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createCustomer: async (customerData: CustomerFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newCustomer = await apiClient.createCustomer(customerData)
      set(state => ({
        customers: [...state.customers, newCustomer],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateCustomer: async (id: string, customerData: CustomerFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCustomer = await apiClient.updateCustomer(id, customerData)
      set(state => ({
        customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteCustomer: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteCustomer(id)
      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  // Deal actions
  fetchDeals: async () => {
    set({ isLoading: true, error: null })
    try {
      const deals = await apiClient.getDeals()
      set({ deals, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createDeal: async (dealData: DealFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newDeal = await apiClient.createDeal(dealData)
      set(state => ({
        deals: [...state.deals, newDeal],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateDeal: async (id: string, dealData: DealFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedDeal = await apiClient.updateDeal(id, dealData)
      set(state => ({
        deals: state.deals.map(d => d.id === id ? updatedDeal : d),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteDeal: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteDeal(id)
      set(state => ({
        deals: state.deals.filter(d => d.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  // Lead actions
  fetchLeads: async () => {
    set({ isLoading: true, error: null })
    try {
      const leads = await apiClient.getLeads()
      set({ leads, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createLead: async (leadData: LeadFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newLead = await apiClient.createLead(leadData)
      set(state => ({
        leads: [...state.leads, newLead],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateLead: async (id: string, leadData: LeadFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedLead = await apiClient.updateLead(id, leadData)
      set(state => ({
        leads: state.leads.map(l => l.id === id ? updatedLead : l),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteLead: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteLead(id)
      set(state => ({
        leads: state.leads.filter(l => l.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  }
}))

// Partners Store
interface PartnersState {
  partners: Partner[]
  partnerOrders: PartnerOrder[]
  isLoading: boolean
  error: string | null
  fetchPartners: () => Promise<void>
  createPartner: (partnerData: PartnerFormData) => Promise<void>
  updatePartner: (id: string, partnerData: PartnerFormData) => Promise<void>
  deletePartner: (id: string) => Promise<void>
  fetchPartnerOrders: () => Promise<void>
  createPartnerOrder: (orderData: PartnerOrderFormData) => Promise<void>
  updatePartnerOrder: (id: string, orderData: PartnerOrderFormData) => Promise<void>
  deletePartnerOrder: (id: string) => Promise<void>
}

export const usePartnersStore = create<PartnersState>()((set, get) => ({
  partners: [],
  partnerOrders: [],
  isLoading: false,
  error: null,

  // Partner actions
  fetchPartners: async () => {
    set({ isLoading: true, error: null })
    try {
      const partners = await apiClient.getPartners()
      set({ partners, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createPartner: async (partnerData: PartnerFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newPartner = await apiClient.createPartner(partnerData)
      set(state => ({
        partners: [...state.partners, newPartner],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updatePartner: async (id: string, partnerData: PartnerFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedPartner = await apiClient.updatePartner(id, partnerData)
      set(state => ({
        partners: state.partners.map(p => p.id === id ? updatedPartner : p),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deletePartner: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deletePartner(id)
      set(state => ({
        partners: state.partners.filter(p => p.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  // Partner Order actions
  fetchPartnerOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const partnerOrders = await apiClient.getPartnerOrders()
      set({ partnerOrders, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createPartnerOrder: async (orderData: PartnerOrderFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newOrder = await apiClient.createPartnerOrder(orderData)
      set(state => ({
        partnerOrders: [...state.partnerOrders, newOrder],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updatePartnerOrder: async (id: string, orderData: PartnerOrderFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedOrder = await apiClient.updatePartnerOrder(id, orderData)
      set(state => ({
        partnerOrders: state.partnerOrders.map(o => o.id === id ? updatedOrder : o),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deletePartnerOrder: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deletePartnerOrder(id)
      set(state => ({
        partnerOrders: state.partnerOrders.filter(o => o.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  }
}))

// Marketing Store
interface MarketingState {
  campaigns: Campaign[]
  isLoading: boolean
  error: string | null
  fetchCampaigns: () => Promise<void>
  createCampaign: (campaignData: CampaignFormData) => Promise<void>
  updateCampaign: (id: string, campaignData: CampaignFormData) => Promise<void>
  deleteCampaign: (id: string) => Promise<void>
}

export const useMarketingStore = create<MarketingState>()((set, get) => ({
  campaigns: [],
  isLoading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ isLoading: true, error: null })
    try {
      const campaigns = await apiClient.getCampaigns()
      set({ campaigns, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createCampaign: async (campaignData: CampaignFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newCampaign = await apiClient.createCampaign(campaignData)
      set(state => ({
        campaigns: [...state.campaigns, newCampaign],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateCampaign: async (id: string, campaignData: CampaignFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedCampaign = await apiClient.updateCampaign(id, campaignData)
      set(state => ({
        campaigns: state.campaigns.map(c => c.id === id ? updatedCampaign : c),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteCampaign: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteCampaign(id)
      set(state => ({
        campaigns: state.campaigns.filter(c => c.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  }
}))

// Projects Store
interface ProjectsState {
  projects: Project[]
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  createProject: (projectData: ProjectFormData) => Promise<void>
  updateProject: (id: string, projectData: ProjectFormData) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  fetchTasks: () => Promise<void>
  createTask: (taskData: TaskFormData) => Promise<void>
  updateTask: (id: string, taskData: TaskFormData) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

export const useProjectsStore = create<ProjectsState>()((set, get) => ({
  projects: [],
  tasks: [],
  isLoading: false,
  error: null,

  // Project actions
  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const projects = await apiClient.getProjects()
      set({ projects, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createProject: async (projectData: ProjectFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newProject = await apiClient.createProject(projectData)
      set(state => ({
        projects: [...state.projects, newProject],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateProject: async (id: string, projectData: ProjectFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedProject = await apiClient.updateProject(id, projectData)
      set(state => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteProject(id)
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  // Task actions
  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const tasks = await apiClient.getTasks()
      set({ tasks, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createTask: async (taskData: TaskFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newTask = await apiClient.createTask(taskData)
      set(state => ({
        tasks: [...state.tasks, newTask],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateTask: async (id: string, taskData: TaskFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTask = await apiClient.updateTask(id, taskData)
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteTask(id)
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  }
}))

// Communication Store
interface CommunicationState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  fetchMessages: () => Promise<void>
  createMessage: (messageData: MessageFormData) => Promise<void>
  updateMessage: (id: string, messageData: MessageFormData) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  sendMessage: (id: string) => Promise<void>
  markMessageAsRead: (id: string) => Promise<void>
}

export const useCommunicationStore = create<CommunicationState>()((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  fetchMessages: async () => {
    set({ isLoading: true, error: null })
    try {
      const messages = await apiClient.getMessages()
      set({ messages, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createMessage: async (messageData: MessageFormData) => {
    set({ isLoading: true, error: null })
    try {
      const newMessage = await apiClient.createMessage(messageData)
      set(state => ({
        messages: [...state.messages, newMessage],
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateMessage: async (id: string, messageData: MessageFormData) => {
    set({ isLoading: true, error: null })
    try {
      const updatedMessage = await apiClient.updateMessage(id, messageData)
      set(state => ({
        messages: state.messages.map(m => m.id === id ? updatedMessage : m),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteMessage: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteMessage(id)
      set(state => ({
        messages: state.messages.filter(m => m.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  sendMessage: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.sendMessage(id)
      set(state => ({
        messages: state.messages.map(m => 
          m.id === id ? { ...m, status: 'sent' as const } : m
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  markMessageAsRead: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.markMessageAsRead(id)
      set(state => ({
        messages: state.messages.map(m => 
          m.id === id ? { ...m, status: 'read' as const } : m
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  }
}))

// Analytics Store
interface AnalyticsState {
  executiveDashboard: ExecutiveDashboard | null
  departmentAnalytics: DepartmentAnalytics | null
  predictiveAnalytics: PredictiveAnalytics | null
  customReporting: CustomReporting | null
  businessAlerts: BusinessAlert[]
  isLoading: boolean
  error: string | null
  
  // Executive Dashboard
  fetchExecutiveDashboard: () => Promise<void>
  fetchKeyPerformanceIndicators: () => Promise<void>
  fetchBusinessTrends: (period?: string) => Promise<void>
  fetchBusinessAlerts: () => Promise<void>
  markAlertAsRead: (id: string) => Promise<void>
  
  // Department Analytics
  fetchHRAnalytics: () => Promise<void>
  fetchFinanceAnalytics: () => Promise<void>
  fetchSalesAnalytics: () => Promise<void>
  fetchMarketingAnalytics: () => Promise<void>
  fetchOperationsAnalytics: () => Promise<void>
  
  // Predictive Analytics
  fetchPredictiveAnalytics: () => Promise<void>
  fetchBusinessForecasting: () => Promise<void>
  fetchPredictiveInsights: () => Promise<void>
  fetchAIRecommendations: () => Promise<void>
  fetchRiskAssessment: () => Promise<void>
  updateRecommendationStatus: (id: string, status: 'implemented' | 'rejected') => Promise<void>
  
  // Custom Reporting
  fetchCustomReports: () => Promise<void>
  fetchReportTemplates: () => Promise<void>
  createCustomReport: (reportData: any) => Promise<void>
  updateCustomReport: (id: string, reportData: any) => Promise<void>
  deleteCustomReport: (id: string) => Promise<void>
  fetchCustomDashboards: () => Promise<void>
  createCustomDashboard: (dashboardData: any) => Promise<void>
  updateCustomDashboard: (id: string, dashboardData: any) => Promise<void>
  deleteCustomDashboard: (id: string) => Promise<void>
  fetchReportSchedules: () => Promise<void>
  createReportSchedule: (scheduleData: any) => Promise<void>
  updateReportSchedule: (id: string, scheduleData: any) => Promise<void>
  deleteReportSchedule: (id: string) => Promise<void>
  fetchDataSources: () => Promise<void>
  fetchVisualizationTypes: () => Promise<void>
  exportReport: (id: string, format: 'pdf' | 'excel' | 'csv') => Promise<void>
  generateReport: (reportData: any) => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>()((set, get) => ({
  executiveDashboard: null,
  departmentAnalytics: null,
  predictiveAnalytics: null,
  customReporting: null,
  businessAlerts: [],
  isLoading: false,
  error: null,

  // Executive Dashboard
  fetchExecutiveDashboard: async () => {
    set({ isLoading: true, error: null })
    try {
      const dashboard = await apiClient.getExecutiveDashboard()
      set({ executiveDashboard: dashboard, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchKeyPerformanceIndicators: async () => {
    set({ isLoading: true, error: null })
    try {
      const kpis = await apiClient.getKeyPerformanceIndicators()
      set(state => ({
        executiveDashboard: state.executiveDashboard ? {
          ...state.executiveDashboard,
          kpis
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchBusinessTrends: async (period = '12months') => {
    set({ isLoading: true, error: null })
    try {
      const trends = await apiClient.getBusinessTrends(period)
      set(state => ({
        executiveDashboard: state.executiveDashboard ? {
          ...state.executiveDashboard,
          trends
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchBusinessAlerts: async () => {
    set({ isLoading: true, error: null })
    try {
      const alerts = await apiClient.getBusinessAlerts()
      set({ businessAlerts: alerts, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  markAlertAsRead: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.markAlertAsRead(id)
      set(state => ({
        businessAlerts: state.businessAlerts.map(alert =>
          alert.id === id ? { ...alert, isRead: true } : alert
        ),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  // Department Analytics
  fetchHRAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const hrAnalytics = await apiClient.getHRAnalytics()
      set(state => ({
        departmentAnalytics: state.departmentAnalytics ? {
          ...state.departmentAnalytics,
          hr: hrAnalytics
        } : { hr: hrAnalytics } as DepartmentAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchFinanceAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const financeAnalytics = await apiClient.getFinanceAnalytics()
      set(state => ({
        departmentAnalytics: state.departmentAnalytics ? {
          ...state.departmentAnalytics,
          finance: financeAnalytics
        } : { finance: financeAnalytics } as DepartmentAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchSalesAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const salesAnalytics = await apiClient.getSalesAnalytics()
      set(state => ({
        departmentAnalytics: state.departmentAnalytics ? {
          ...state.departmentAnalytics,
          sales: salesAnalytics
        } : { sales: salesAnalytics } as DepartmentAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchMarketingAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const marketingAnalytics = await apiClient.getMarketingAnalytics()
      set(state => ({
        departmentAnalytics: state.departmentAnalytics ? {
          ...state.departmentAnalytics,
          marketing: marketingAnalytics
        } : { marketing: marketingAnalytics } as DepartmentAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchOperationsAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const operationsAnalytics = await apiClient.getOperationsAnalytics()
      set(state => ({
        departmentAnalytics: state.departmentAnalytics ? {
          ...state.departmentAnalytics,
          operations: operationsAnalytics
        } : { operations: operationsAnalytics } as DepartmentAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  // Predictive Analytics
  fetchPredictiveAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const predictiveAnalytics = await apiClient.getPredictiveAnalytics()
      set({ predictiveAnalytics, isLoading: false })
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchBusinessForecasting: async () => {
    set({ isLoading: true, error: null })
    try {
      const forecasting = await apiClient.getBusinessForecasting()
      set(state => ({
        predictiveAnalytics: state.predictiveAnalytics ? {
          ...state.predictiveAnalytics,
          forecasting
        } : { forecasting } as PredictiveAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchPredictiveInsights: async () => {
    set({ isLoading: true, error: null })
    try {
      const insights = await apiClient.getPredictiveInsights()
      set(state => ({
        predictiveAnalytics: state.predictiveAnalytics ? {
          ...state.predictiveAnalytics,
          insights
        } : { insights } as PredictiveAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchAIRecommendations: async () => {
    set({ isLoading: true, error: null })
    try {
      const recommendations = await apiClient.getAIRecommendations()
      set(state => ({
        predictiveAnalytics: state.predictiveAnalytics ? {
          ...state.predictiveAnalytics,
          recommendations
        } : { recommendations } as PredictiveAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchRiskAssessment: async () => {
    set({ isLoading: true, error: null })
    try {
      const riskAssessment = await apiClient.getRiskAssessment()
      set(state => ({
        predictiveAnalytics: state.predictiveAnalytics ? {
          ...state.predictiveAnalytics,
          riskAssessment
        } : { riskAssessment } as PredictiveAnalytics,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateRecommendationStatus: async (id: string, status: 'implemented' | 'rejected') => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.updateRecommendationStatus(id, status)
      set(state => ({
        predictiveAnalytics: state.predictiveAnalytics ? {
          ...state.predictiveAnalytics,
          recommendations: state.predictiveAnalytics.recommendations.map(rec =>
            rec.id === id ? { ...rec, status } : rec
          )
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  // Custom Reporting
  fetchCustomReports: async () => {
    set({ isLoading: true, error: null })
    try {
      const reports = await apiClient.getCustomReports()
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          reportBuilder: {
            ...state.customReporting.reportBuilder,
            templates: reports
          }
        } : { reportBuilder: { templates: reports } } as CustomReporting,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchReportTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const templates = await apiClient.getReportTemplates()
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          reportBuilder: {
            ...state.customReporting.reportBuilder,
            templates
          }
        } : { reportBuilder: { templates } } as CustomReporting,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createCustomReport: async (reportData: any) => {
    set({ isLoading: true, error: null })
    try {
      const newReport = await apiClient.createCustomReport(reportData)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          reportBuilder: {
            ...state.customReporting.reportBuilder,
            templates: [...state.customReporting.reportBuilder.templates, newReport]
          }
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateCustomReport: async (id: string, reportData: any) => {
    set({ isLoading: true, error: null })
    try {
      const updatedReport = await apiClient.updateCustomReport(id, reportData)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          reportBuilder: {
            ...state.customReporting.reportBuilder,
            templates: state.customReporting.reportBuilder.templates.map(t => 
              t.id === id ? updatedReport : t
            )
          }
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteCustomReport: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteCustomReport(id)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          reportBuilder: {
            ...state.customReporting.reportBuilder,
            templates: state.customReporting.reportBuilder.templates.filter(t => t.id !== id)
          }
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchCustomDashboards: async () => {
    set({ isLoading: true, error: null })
    try {
      const dashboards = await apiClient.getCustomDashboards()
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          dashboards
        } : { dashboards } as CustomReporting,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createCustomDashboard: async (dashboardData: any) => {
    set({ isLoading: true, error: null })
    try {
      const newDashboard = await apiClient.createCustomDashboard(dashboardData)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          dashboards: [...state.customReporting.dashboards, newDashboard]
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateCustomDashboard: async (id: string, dashboardData: any) => {
    set({ isLoading: true, error: null })
    try {
      const updatedDashboard = await apiClient.updateCustomDashboard(id, dashboardData)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          dashboards: state.customReporting.dashboards.map(d => 
            d.id === id ? updatedDashboard : d
          )
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteCustomDashboard: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteCustomDashboard(id)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          dashboards: state.customReporting.dashboards.filter(d => d.id !== id)
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchReportSchedules: async () => {
    set({ isLoading: true, error: null })
    try {
      const schedules = await apiClient.getReportSchedules()
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          scheduling: schedules
        } : { scheduling: schedules } as CustomReporting,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  createReportSchedule: async (scheduleData: any) => {
    set({ isLoading: true, error: null })
    try {
      const newSchedule = await apiClient.createReportSchedule(scheduleData)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          scheduling: [...state.customReporting.scheduling, newSchedule]
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  updateReportSchedule: async (id: string, scheduleData: any) => {
    set({ isLoading: true, error: null })
    try {
      const updatedSchedule = await apiClient.updateReportSchedule(id, scheduleData)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          scheduling: state.customReporting.scheduling.map(s => 
            s.id === id ? updatedSchedule : s
          )
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  deleteReportSchedule: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.deleteReportSchedule(id)
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          scheduling: state.customReporting.scheduling.filter(s => s.id !== id)
        } : null,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchDataSources: async () => {
    set({ isLoading: true, error: null })
    try {
      const dataSources = await apiClient.getDataSources()
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          reportBuilder: {
            ...state.customReporting.reportBuilder,
            dataSources
          }
        } : { reportBuilder: { dataSources } } as CustomReporting,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  fetchVisualizationTypes: async () => {
    set({ isLoading: true, error: null })
    try {
      const visualizationTypes = await apiClient.getVisualizationTypes()
      set(state => ({
        customReporting: state.customReporting ? {
          ...state.customReporting,
          reportBuilder: {
            ...state.customReporting.reportBuilder,
            visualizations: visualizationTypes
          }
        } : { reportBuilder: { visualizations: visualizationTypes } } as CustomReporting,
        isLoading: false
      }))
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  exportReport: async (id: string, format: 'pdf' | 'excel' | 'csv') => {
    set({ isLoading: true, error: null })
    try {
      const exportData = await apiClient.exportReport(id, format)
      set({ isLoading: false })
      return exportData
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  },

  generateReport: async (reportData: any) => {
    set({ isLoading: true, error: null })
    try {
      const report = await apiClient.generateReport(reportData)
      set({ isLoading: false })
      return report
    } catch (error) {
      set({ error: error as string, isLoading: false })
    }
  }
}))

// Combined store hook for easier access to all stores
export const useStore = () => {
  const auth = useAuthStore()
  const ui = useUIStore()
  const dashboard = useDashboardStore()
  const hr = useHRStore()
  const finance = useFinanceStore()
  const crm = useCRMStore()
  const partners = usePartnersStore()
  const marketing = useMarketingStore()
  const projects = useProjectsStore()
  const communication = useCommunicationStore()
  const analytics = useAnalyticsStore()

  return {
    // Auth
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    setUser: auth.setUser,
    
    // UI
    sidebarCollapsed: ui.sidebarCollapsed,
    theme: ui.theme,
    notifications: ui.notifications,
    toggleSidebar: ui.toggleSidebar,
    setTheme: ui.setTheme,
    addNotification: ui.addNotification,
    removeNotification: ui.removeNotification,
    markNotificationAsRead: ui.markNotificationAsRead,
    
    // Dashboard
    metrics: dashboard.metrics,
    fetchMetrics: dashboard.fetchMetrics,
    
    // HR
    employees: hr.employees,
    jobPostings: hr.jobPostings,
    fetchEmployees: hr.fetchEmployees,
    fetchJobPostings: hr.fetchJobPostings,
    addEmployee: hr.addEmployee,
    updateEmployee: hr.updateEmployee,
    deleteEmployee: hr.deleteEmployee,
    
    // Finance
    invoices: finance.invoices,
    expenses: finance.expenses,
    payments: finance.payments,
    fetchInvoices: finance.fetchInvoices,
    fetchExpenses: finance.fetchExpenses,
    fetchPayments: finance.fetchPayments,
    
    // CRM
    customers: crm.customers,
    deals: crm.deals,
    leads: crm.leads,
    fetchCustomers: crm.fetchCustomers,
    createCustomer: crm.createCustomer,
    updateCustomer: crm.updateCustomer,
    deleteCustomer: crm.deleteCustomer,
    fetchDeals: crm.fetchDeals,
    createDeal: crm.createDeal,
    updateDeal: crm.updateDeal,
    deleteDeal: crm.deleteDeal,
    fetchLeads: crm.fetchLeads,
    createLead: crm.createLead,
    updateLead: crm.updateLead,
    deleteLead: crm.deleteLead,
    
    // Partners
    partners: partners.partners,
    partnerOrders: partners.partnerOrders,
    fetchPartners: partners.fetchPartners,
    createPartner: partners.createPartner,
    updatePartner: partners.updatePartner,
    deletePartner: partners.deletePartner,
    fetchPartnerOrders: partners.fetchPartnerOrders,
    createPartnerOrder: partners.createPartnerOrder,
    updatePartnerOrder: partners.updatePartnerOrder,
    deletePartnerOrder: partners.deletePartnerOrder,
    
    // Marketing
    campaigns: marketing.campaigns,
    fetchCampaigns: marketing.fetchCampaigns,
    createCampaign: marketing.createCampaign,
    updateCampaign: marketing.updateCampaign,
    deleteCampaign: marketing.deleteCampaign,
    
    // Projects
    projects: projects.projects,
    tasks: projects.tasks,
    fetchProjects: projects.fetchProjects,
    createProject: projects.createProject,
    updateProject: projects.updateProject,
    deleteProject: projects.deleteProject,
    fetchTasks: projects.fetchTasks,
    createTask: projects.createTask,
    updateTask: projects.updateTask,
    deleteTask: projects.deleteTask,
    
    // Communication
    messages: communication.messages,
    fetchMessages: communication.fetchMessages,
    createMessage: communication.createMessage,
    updateMessage: communication.updateMessage,
    deleteMessage: communication.deleteMessage,
    sendMessage: communication.sendMessage,
    markMessageAsRead: communication.markMessageAsRead,
    
    // Analytics
    executiveDashboard: analytics.executiveDashboard,
    departmentAnalytics: analytics.departmentAnalytics,
    predictiveAnalytics: analytics.predictiveAnalytics,
    customReporting: analytics.customReporting,
    businessAlerts: analytics.businessAlerts,
    fetchExecutiveDashboard: analytics.fetchExecutiveDashboard,
    fetchKeyPerformanceIndicators: analytics.fetchKeyPerformanceIndicators,
    fetchBusinessTrends: analytics.fetchBusinessTrends,
    fetchBusinessAlerts: analytics.fetchBusinessAlerts,
    markAlertAsRead: analytics.markAlertAsRead,
    fetchHRAnalytics: analytics.fetchHRAnalytics,
    fetchFinanceAnalytics: analytics.fetchFinanceAnalytics,
    fetchSalesAnalytics: analytics.fetchSalesAnalytics,
    fetchMarketingAnalytics: analytics.fetchMarketingAnalytics,
    fetchOperationsAnalytics: analytics.fetchOperationsAnalytics,
    fetchPredictiveAnalytics: analytics.fetchPredictiveAnalytics,
    fetchBusinessForecasting: analytics.fetchBusinessForecasting,
    fetchPredictiveInsights: analytics.fetchPredictiveInsights,
    fetchAIRecommendations: analytics.fetchAIRecommendations,
    fetchRiskAssessment: analytics.fetchRiskAssessment,
    updateRecommendationStatus: analytics.updateRecommendationStatus,
    fetchCustomReports: analytics.fetchCustomReports,
    fetchReportTemplates: analytics.fetchReportTemplates,
    createCustomReport: analytics.createCustomReport,
    updateCustomReport: analytics.updateCustomReport,
    deleteCustomReport: analytics.deleteCustomReport,
    fetchCustomDashboards: analytics.fetchCustomDashboards,
    createCustomDashboard: analytics.createCustomDashboard,
    updateCustomDashboard: analytics.updateCustomDashboard,
    deleteCustomDashboard: analytics.deleteCustomDashboard,
    fetchReportSchedules: analytics.fetchReportSchedules,
    createReportSchedule: analytics.createReportSchedule,
    updateReportSchedule: analytics.updateReportSchedule,
    deleteReportSchedule: analytics.deleteReportSchedule,
    fetchDataSources: analytics.fetchDataSources,
    fetchVisualizationTypes: analytics.fetchVisualizationTypes,
    exportReport: analytics.exportReport,
    generateReport: analytics.generateReport,
    
    // Loading states
    isLoading: auth.isLoading || dashboard.isLoading || hr.isLoading || finance.isLoading || crm.isLoading || partners.isLoading || marketing.isLoading || projects.isLoading || communication.isLoading || analytics.isLoading,
    error: crm.error || partners.error || marketing.error || projects.error || communication.error || analytics.error // Aggregate errors
  }
}
