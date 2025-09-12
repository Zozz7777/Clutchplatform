'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Supported locales
export type Locale = 'en' | 'ar'

// Translation interface
export interface Translations {
  [key: string]: string | Translations
}

// Locale configuration
export interface LocaleConfig {
  code: Locale
  name: string
  direction: 'ltr' | 'rtl'
  dateFormat: string
  numberFormat: Intl.NumberFormatOptions
}

// Locale configurations
export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  }
}

// Translation context
interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, any>) => string
  formatDate: (date: Date | string) => string
  formatNumber: (number: number) => string
  formatCurrency: (amount: number, currency?: string) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// English translations
const EN_TRANSLATIONS: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    clear: 'Clear',
    select: 'Select',
    all: 'All',
    none: 'None',
    required: 'Required',
    optional: 'Optional'
  },
  navigation: {
    dashboard: 'Dashboard',
    users: 'Users',
    analytics: 'Analytics',
    content: 'Content',
    system: 'System',
    mobile: 'Mobile',
    revenue: 'Revenue',
    pricing: 'Pricing',
    seo: 'SEO',
    media: 'Media',
    support: 'Support',
    feedback: 'Feedback',
    settings: 'Settings'
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    welcome: 'Welcome',
    sessionExpired: 'Your session has expired. Please log in again.',
    invalidCredentials: 'Invalid email or password.',
    loginSuccess: 'Login successful!'
  },
  dashboard: {
    title: 'Dashboard',
    overview: 'Overview',
    metrics: 'Metrics',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions'
  },
  users: {
    title: 'Users',
    createUser: 'Create User',
    editUser: 'Edit User',
    deleteUser: 'Delete User',
    userDetails: 'User Details',
    role: 'Role',
    permissions: 'Permissions',
    lastLogin: 'Last Login',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive'
  },
  analytics: {
    title: 'Analytics',
    overview: 'Overview',
    reports: 'Reports',
    export: 'Export',
    dateRange: 'Date Range',
    metrics: 'Metrics',
    charts: 'Charts'
  },
  errors: {
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to access this resource.',
    forbidden: 'Access denied.',
    validationError: 'Please check your input and try again.',
    unknownError: 'An unknown error occurred.'
  }
}

// Arabic translations
const AR_TRANSLATIONS: Translations = {
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    search: 'بحث',
    filter: 'تصفية',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    warning: 'تحذير',
    info: 'معلومات',
    confirm: 'تأكيد',
    yes: 'نعم',
    no: 'لا',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    reset: 'إعادة تعيين',
    clear: 'مسح',
    select: 'اختيار',
    all: 'الكل',
    none: 'لا شيء',
    required: 'مطلوب',
    optional: 'اختياري'
  },
  navigation: {
    dashboard: 'لوحة التحكم',
    users: 'المستخدمون',
    analytics: 'التحليلات',
    content: 'المحتوى',
    system: 'النظام',
    mobile: 'الجوال',
    revenue: 'الإيرادات',
    pricing: 'التسعير',
    seo: 'تحسين محركات البحث',
    media: 'الوسائط',
    support: 'الدعم',
    feedback: 'التعليقات',
    settings: 'الإعدادات'
  },
  auth: {
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    forgotPassword: 'نسيت كلمة المرور؟',
    signIn: 'دخول',
    signOut: 'خروج',
    welcome: 'مرحباً',
    sessionExpired: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    invalidCredentials: 'بريد إلكتروني أو كلمة مرور غير صحيحة.',
    loginSuccess: 'تم تسجيل الدخول بنجاح!'
  },
  dashboard: {
    title: 'لوحة التحكم',
    overview: 'نظرة عامة',
    metrics: 'المقاييس',
    recentActivity: 'النشاط الأخير',
    quickActions: 'الإجراءات السريعة'
  },
  users: {
    title: 'المستخدمون',
    createUser: 'إنشاء مستخدم',
    editUser: 'تعديل مستخدم',
    deleteUser: 'حذف مستخدم',
    userDetails: 'تفاصيل المستخدم',
    role: 'الدور',
    permissions: 'الأذونات',
    lastLogin: 'آخر تسجيل دخول',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط'
  },
  analytics: {
    title: 'التحليلات',
    overview: 'نظرة عامة',
    reports: 'التقارير',
    export: 'تصدير',
    dateRange: 'نطاق التاريخ',
    metrics: 'المقاييس',
    charts: 'الرسوم البيانية'
  },
  errors: {
    networkError: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
    serverError: 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
    notFound: 'لم يتم العثور على المورد المطلوب.',
    unauthorized: 'غير مخول للوصول إلى هذا المورد.',
    forbidden: 'تم رفض الوصول.',
    validationError: 'يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
    unknownError: 'حدث خطأ غير معروف.'
  }
}

// Translation storage
const TRANSLATIONS: Record<Locale, Translations> = {
  en: EN_TRANSLATIONS,
  ar: AR_TRANSLATIONS
}

// I18n provider component
interface I18nProviderProps {
  children: React.ReactNode
  defaultLocale?: Locale
}

export function I18nProvider({ children, defaultLocale = 'en' }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && LOCALE_CONFIGS[savedLocale]) {
      setLocale(savedLocale)
    }
  }, [])

  // Save locale to localStorage when changed
  useEffect(() => {
    localStorage.setItem('locale', locale)
    
    // Update document direction and language
    document.documentElement.dir = LOCALE_CONFIGS[locale].direction
    document.documentElement.lang = locale
  }, [locale])

  // Translation function
  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.')
    let value: any = TRANSLATIONS[locale]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to English if translation not found
        value = TRANSLATIONS.en
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if no translation found
          }
        }
        break
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match
      })
    }

    return value
  }

  // Format date according to locale
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const config = LOCALE_CONFIGS[locale]
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj)
  }

  // Format number according to locale
  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat(locale, LOCALE_CONFIGS[locale].numberFormat).format(number)
  }

  // Format currency according to locale
  const formatCurrency = (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...LOCALE_CONFIGS[locale].numberFormat
    }).format(amount)
  }

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    isRTL: LOCALE_CONFIGS[locale].direction === 'rtl'
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Higher-order component for translated components
export function withTranslation<P extends object>(
  Component: React.ComponentType<P>
) {
  return function TranslatedComponent(props: P) {
    const { t } = useI18n()
    return <Component {...props} t={t} />
  }
}

// Language switcher component
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="px-3 py-2 border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {Object.values(LOCALE_CONFIGS).map((config) => (
        <option key={config.code} value={config.code}>
          {config.name}
        </option>
      ))}
    </select>
  )
}
