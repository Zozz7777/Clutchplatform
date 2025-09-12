'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type Locale = 'en' | 'ar'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, any>) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translation messages
const messages = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      refresh: 'Refresh',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No'
    },
    navigation: {
      dashboard: 'Dashboard',
      users: 'Users',
      partners: 'Partners',
      fleet: 'Fleet',
      analytics: 'Analytics',
      finance: 'Finance',
      hr: 'HR',
      marketing: 'Marketing',
      security: 'Security',
      settings: 'Settings',
      help: 'Help',
      chat: 'Chat',
      notifications: 'Notifications'
    },
    dashboard: {
      title: 'Clutch Admin Dashboard',
      welcome: 'Welcome back, {name}. Monitor your platform operations and manage your business efficiently.',
      systemOnline: 'SYSTEM ONLINE',
      aiEnabled: 'AI ENABLED',
      realTime: 'REAL-TIME',
      totalUsers: 'Total Users',
      activeDrivers: 'Active Drivers',
      totalPartners: 'Total Partners',
      monthlyRevenue: 'Monthly Revenue',
      vsLastMonth: 'vs last month',
      noDataForPeriod: 'No data for this period',
      good: 'Good',
      stable: 'Stable',
      needsAttention: 'Needs Attention',
      platformServices: 'Platform Services',
      platformServicesDesc: 'Real-time system status monitoring',
      liveActivityFeed: 'Live Activity Feed',
      liveActivityFeedDesc: 'Real-time platform events and system updates',
      noRecentActivity: 'No recent activity',
      activityWillAppear: 'Activity will appear here when available',
      quickActions: 'Quick Actions',
      quickActionsDesc: 'Rapid access to key functions',
      manageUsers: 'Manage Users',
      partnerManagement: 'Partner Management',
      fleetOverview: 'Fleet Overview',
      securityCenter: 'Security Center',
      platformAlerts: 'Platform Alerts',
      platformAlertsDesc: 'Critical system notifications',
      securityAlerts: 'Security Alerts',
      pendingOrders: 'Pending Orders',
      completedToday: 'Completed Today',
      systemHealth: 'System Health',
      systemHealthDesc: 'Platform performance metrics',
      overallHealth: 'Overall Health',
      apiResponse: 'API Response',
      uptime: 'Uptime'
    },
    header: {
      searchPlaceholder: 'Search anything...',
      help: 'Help',
      chat: 'Chat',
      notifications: 'Notifications',
      userMenu: 'User menu',
      accountSettings: 'Account Settings',
      settings: 'Settings',
      logout: 'Logout',
      keyboardShortcuts: 'Keyboard Shortcuts',
      toggleTheme: 'Toggle theme',
      switchToLightMode: 'Switch to light mode',
      switchToDarkMode: 'Switch to dark mode'
    },
    sidebar: {
      core: 'CORE',
      operations: 'OPERATIONS',
      analytics: 'ANALYTICS',
      customers: 'CUSTOMERS',
      fleet: 'FLEET',
      technology: 'TECHNOLOGY',
      business: 'BUSINESS',
      marketing: 'MARKETING',
      enterprise: 'ENTERPRISE',
      communication: 'COMMUNICATION',
      projects: 'PROJECTS',
      settings: 'SETTINGS'
    },
    languages: {
      english: 'English',
      arabic: 'العربية',
      switchLanguage: 'Switch language'
    }
  },
  ar: {
    common: {
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      search: 'بحث',
      filter: 'تصفية',
      export: 'تصدير',
      refresh: 'تحديث',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      submit: 'إرسال',
      reset: 'إعادة تعيين',
      confirm: 'تأكيد',
      yes: 'نعم',
      no: 'لا'
    },
    navigation: {
      dashboard: 'لوحة التحكم',
      users: 'المستخدمون',
      partners: 'الشركاء',
      fleet: 'الأسطول',
      analytics: 'التحليلات',
      finance: 'المالية',
      hr: 'الموارد البشرية',
      marketing: 'التسويق',
      security: 'الأمان',
      settings: 'الإعدادات',
      help: 'المساعدة',
      chat: 'الدردشة',
      notifications: 'الإشعارات'
    },
    dashboard: {
      title: 'لوحة تحكم كلتش الإدارية',
      welcome: 'مرحباً بعودتك، {name}. راقب عمليات المنصة وأدر أعمالك بكفاءة.',
      systemOnline: 'النظام متصل',
      aiEnabled: 'الذكاء الاصطناعي مفعل',
      realTime: 'مباشر',
      totalUsers: 'إجمالي المستخدمين',
      activeDrivers: 'السائقون النشطون',
      totalPartners: 'إجمالي الشركاء',
      monthlyRevenue: 'الإيرادات الشهرية',
      vsLastMonth: 'مقارنة بالشهر الماضي',
      noDataForPeriod: 'لا توجد بيانات لهذه الفترة',
      good: 'جيد',
      stable: 'مستقر',
      needsAttention: 'يحتاج انتباه',
      platformServices: 'خدمات المنصة',
      platformServicesDesc: 'مراقبة حالة النظام في الوقت الفعلي',
      liveActivityFeed: 'تغذية النشاط المباشر',
      liveActivityFeedDesc: 'أحداث المنصة وتحديثات النظام في الوقت الفعلي',
      noRecentActivity: 'لا يوجد نشاط حديث',
      activityWillAppear: 'سيظهر النشاط هنا عند توافره',
      quickActions: 'الإجراءات السريعة',
      quickActionsDesc: 'وصول سريع للوظائف الرئيسية',
      manageUsers: 'إدارة المستخدمين',
      partnerManagement: 'إدارة الشركاء',
      fleetOverview: 'نظرة عامة على الأسطول',
      securityCenter: 'مركز الأمان',
      platformAlerts: 'تنبيهات المنصة',
      platformAlertsDesc: 'إشعارات النظام الحرجة',
      securityAlerts: 'تنبيهات الأمان',
      pendingOrders: 'الطلبات المعلقة',
      completedToday: 'مكتمل اليوم',
      systemHealth: 'صحة النظام',
      systemHealthDesc: 'مقاييس أداء المنصة',
      overallHealth: 'الصحة العامة',
      apiResponse: 'استجابة API',
      uptime: 'وقت التشغيل'
    },
    header: {
      searchPlaceholder: 'ابحث عن أي شيء...',
      help: 'المساعدة',
      chat: 'الدردشة',
      notifications: 'الإشعارات',
      userMenu: 'قائمة المستخدم',
      accountSettings: 'إعدادات الحساب',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      keyboardShortcuts: 'اختصارات لوحة المفاتيح',
      toggleTheme: 'تبديل المظهر',
      switchToLightMode: 'التبديل إلى الوضع الفاتح',
      switchToDarkMode: 'التبديل إلى الوضع الداكن'
    },
    sidebar: {
      core: 'الأساسي',
      operations: 'العمليات',
      analytics: 'التحليلات',
      customers: 'العملاء',
      fleet: 'الأسطول',
      technology: 'التكنولوجيا',
      business: 'الأعمال',
      marketing: 'التسويق',
      enterprise: 'المؤسسة',
      communication: 'التواصل',
      projects: 'المشاريع',
      settings: 'الإعدادات'
    },
    languages: {
      english: 'English',
      arabic: 'العربية',
      switchLanguage: 'تبديل اللغة'
    }
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    // Extract locale from pathname if present
    const pathSegments = pathname.split('/')
    if (pathSegments[1] && (pathSegments[1] === 'en' || pathSegments[1] === 'ar')) {
      setLocaleState(pathSegments[1] as Locale)
    }
  }, [pathname])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = messages[locale]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => params[param] || match)
    }
    
    return value
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
