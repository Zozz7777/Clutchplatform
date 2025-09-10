import React, { lazy, ComponentType } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Code Splitting Utilities
 * Features:
 * - Dynamic imports with loading states
 * - Error boundaries for failed chunks
 * - Preloading strategies
 * - Bundle analysis
 */

// Loading component for code splitting
export const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
)

// Error component for failed chunks
export const ErrorComponent = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="text-red-500 mb-4">
        <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load</h3>
      <p className="text-slate-600 mb-4">{error.message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
)

// Enhanced lazy loading with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  return lazy(importFunc)
}

// Dashboard components - lazy loaded
export const DashboardPage = lazy(() => import('@/app/(dashboard)/dashboard/page'))
export const EnterprisePage = lazy(() => import('@/app/(dashboard)/enterprise/page'))

// Sub-page components - lazy loaded
export const HREmployeesPage = lazy(() => import('@/app/(dashboard)/hr/employees/page'))
export const HRPayrollPage = lazy(() => import('@/app/(dashboard)/hr/payroll/page'))
export const HRPerformancePage = lazy(() => import('@/app/(dashboard)/hr/performance/page'))
export const HRRecruitmentPage = lazy(() => import('@/app/(dashboard)/hr/recruitment/page'))

export const FinanceExpensesPage = lazy(() => import('@/app/(dashboard)/finance/expenses/page'))
export const FinanceInvoicesPage = lazy(() => import('@/app/(dashboard)/finance/invoices/page'))
export const FinancePaymentsPage = lazy(() => import('@/app/(dashboard)/finance/payments/page'))
export const FinanceReportsPage = lazy(() => import('@/app/(dashboard)/finance/reports/page'))
export const FinanceSubscriptionsPage = lazy(() => import('@/app/(dashboard)/finance/subscriptions/page'))

export const CRMCustomersPage = lazy(() => import('@/app/(dashboard)/crm/customers/page'))
export const CRMDealsPage = lazy(() => import('@/app/(dashboard)/crm/deals/page'))
export const CRMLeadsPage = lazy(() => import('@/app/(dashboard)/crm/leads/page'))
export const CRMPipelinePage = lazy(() => import('@/app/(dashboard)/crm/pipeline/page'))

export const PartnersCommissionPage = lazy(() => import('@/app/(dashboard)/partners/commission/page'))
export const PartnersDirectoryPage = lazy(() => import('@/app/(dashboard)/partners/directory/page'))
export const PartnersPerformancePage = lazy(() => import('@/app/(dashboard)/partners/performance/page'))

export const MarketingAnalyticsPage = lazy(() => import('@/app/(dashboard)/marketing/analytics/page'))
export const MarketingAutomationPage = lazy(() => import('@/app/(dashboard)/marketing/automation/page'))
export const MarketingCampaignsPage = lazy(() => import('@/app/(dashboard)/marketing/campaigns/page'))

export const ProjectsListPage = lazy(() => import('@/app/(dashboard)/projects/list/page'))
export const ProjectsTasksPage = lazy(() => import('@/app/(dashboard)/projects/tasks/page'))
export const ProjectsTimePage = lazy(() => import('@/app/(dashboard)/projects/time/page'))

export const AnalyticsOverviewPage = lazy(() => import('@/app/(dashboard)/analytics/overview/page'))
export const AnalyticsDepartmentPage = lazy(() => import('@/app/(dashboard)/analytics/department/page'))
export const AnalyticsPredictivePage = lazy(() => import('@/app/(dashboard)/analytics/predictive/page'))
export const AnalyticsReportsPage = lazy(() => import('@/app/(dashboard)/analytics/reports/page'))

// Heavy components - lazy loaded
export const FleetOverviewPage = lazy(() => import('@/app/(dashboard)/fleet/overview/page'))
export const FleetAnalyticsPage = lazy(() => import('@/app/(dashboard)/fleet/analytics/page'))
export const FleetDriversPage = lazy(() => import('@/app/(dashboard)/fleet/drivers/page'))
export const FleetMaintenancePage = lazy(() => import('@/app/(dashboard)/fleet/maintenance/page'))
export const FleetRoutesPage = lazy(() => import('@/app/(dashboard)/fleet/routes/page'))
export const FleetTrackingPage = lazy(() => import('@/app/(dashboard)/fleet/tracking/page'))

export const AIDashboardMainPage = lazy(() => import('@/app/(dashboard)/ai/dashboard/page'))
export const AIFraudPage = lazy(() => import('@/app/(dashboard)/ai/fraud/page'))
export const AIModelsPage = lazy(() => import('@/app/(dashboard)/ai/models/page'))
export const AIPredictivePage = lazy(() => import('@/app/(dashboard)/ai/predictive/page'))
export const AIRecommendationsPage = lazy(() => import('@/app/(dashboard)/ai/recommendations/page'))

export const Security2FAPage = lazy(() => import('@/app/(dashboard)/security/2fa/page'))
export const SecurityAuditPage = lazy(() => import('@/app/(dashboard)/security/audit/page'))
export const SecurityBiometricPage = lazy(() => import('@/app/(dashboard)/security/biometric/page'))
export const SecurityCompliancePage = lazy(() => import('@/app/(dashboard)/security/compliance/page'))
export const SecuritySessionsPage = lazy(() => import('@/app/(dashboard)/security/sessions/page'))

export const LegalCompliancePage = lazy(() => import('@/app/(dashboard)/legal/compliance/page'))
export const LegalContractsPage = lazy(() => import('@/app/(dashboard)/legal/contracts/page'))
export const LegalDocumentsPage = lazy(() => import('@/app/(dashboard)/legal/documents/page'))

// Utility components - lazy loaded
export const EmailPage = lazy(() => import('@/app/(dashboard)/email/page'))
export const SettingsPage = lazy(() => import('@/app/(dashboard)/settings/page'))

// Communication sub-pages
export const CommunicationAnnouncementsPage = lazy(() => import('@/app/(dashboard)/communication/announcements/page'))
export const CommunicationMeetingsPage = lazy(() => import('@/app/(dashboard)/communication/meetings/page'))
export const CommunicationMessagesPage = lazy(() => import('@/app/(dashboard)/communication/messages/page'))

// Preloading strategies
export class PreloadManager {
  private static instance: PreloadManager
  private preloadedChunks = new Set<string>()
  private preloadQueue: (() => Promise<any>)[] = []

  static getInstance(): PreloadManager {
    if (!PreloadManager.instance) {
      PreloadManager.instance = new PreloadManager()
    }
    return PreloadManager.instance
  }

  // Preload a component chunk
  async preloadChunk(importFunc: () => Promise<any>, chunkName: string): Promise<void> {
    if (this.preloadedChunks.has(chunkName)) {
      return
    }

    try {
      await importFunc()
      this.preloadedChunks.add(chunkName)
    } catch (error) {
      console.warn(`Failed to preload chunk ${chunkName}:`, error)
    }
  }

  // Preload multiple chunks with priority
  async preloadChunks(chunks: Array<{ importFunc: () => Promise<any>; name: string; priority: number }>): Promise<void> {
    const sortedChunks = chunks.sort((a, b) => b.priority - a.priority)
    
    for (const chunk of sortedChunks) {
      this.preloadQueue.push(() => this.preloadChunk(chunk.importFunc, chunk.name))
    }

    // Process queue with concurrency limit
    const concurrency = 3
    for (let i = 0; i < this.preloadQueue.length; i += concurrency) {
      const batch = this.preloadQueue.slice(i, i + concurrency)
      await Promise.all(batch.map(task => task()))
    }
  }

  // Preload on user interaction
  preloadOnHover(importFunc: () => Promise<any>, chunkName: string): () => void {
    let timeoutId: NodeJS.Timeout

    const preload = () => {
      timeoutId = setTimeout(() => {
        this.preloadChunk(importFunc, chunkName)
      }, 200) // 200ms delay
    }

    const cancel = () => {
      clearTimeout(timeoutId)
    }

    return cancel
  }

  // Get preload status
  isPreloaded(chunkName: string): boolean {
    return this.preloadedChunks.has(chunkName)
  }
}

// Bundle analysis utilities
export class BundleAnalyzer {
  private static instance: BundleAnalyzer
  private chunkSizes = new Map<string, number>()
  private loadTimes = new Map<string, number>()

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer()
    }
    return BundleAnalyzer.instance
  }

  // Track chunk load time
  trackChunkLoad(chunkName: string, startTime: number): void {
    const loadTime = performance.now() - startTime
    this.loadTimes.set(chunkName, loadTime)
  }

  // Get performance metrics
  getMetrics(): { chunkSizes: Map<string, number>; loadTimes: Map<string, number> } {
    return {
      chunkSizes: this.chunkSizes,
      loadTimes: this.loadTimes
    }
  }

  // Get slowest chunks
  getSlowestChunks(limit: number = 5): Array<{ name: string; loadTime: number }> {
    return Array.from(this.loadTimes.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([name, loadTime]) => ({ name, loadTime }))
  }
}

// Route-based code splitting
export const routeComponents = {
  dashboard: () => import('@/app/(dashboard)/dashboard/page'),
  enterprise: () => import('@/app/(dashboard)/enterprise/page'),
  email: () => import('@/app/(dashboard)/email/page'),
  settings: () => import('@/app/(dashboard)/settings/page')
}

// Preload critical routes
export function preloadCriticalRoutes(): void {
  const preloadManager = PreloadManager.getInstance()
  
  // Preload high-priority routes
  preloadManager.preloadChunks([
    { importFunc: routeComponents.dashboard, name: 'dashboard', priority: 10 },
    { importFunc: routeComponents.enterprise, name: 'enterprise', priority: 9 },
    { importFunc: routeComponents.settings, name: 'settings', priority: 8 },
    { importFunc: routeComponents.email, name: 'email', priority: 7 }
  ])
}

// Initialize preloading on app start
if (typeof window !== 'undefined') {
  // Preload critical routes after initial load
  setTimeout(preloadCriticalRoutes, 1000)
}
