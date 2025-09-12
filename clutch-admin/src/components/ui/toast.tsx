'use client'

import React from 'react'
import { toast, Toaster } from 'sonner'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

// Toast variants
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

// Toast component with custom styling
export function Toast() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      duration={4000}
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
        className: 'toast',
      }}
    />
  )
}

// Custom toast functions with icons
export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      className: 'border-green-200 bg-green-50 dark:bg-green-900/20',
    })
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      className: 'border-red-200 bg-red-50 dark:bg-red-900/20',
    })
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      className: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20',
    })
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="h-4 w-4 text-blue-600" />,
      className: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20',
    })
  },

  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
      className: 'border-slate-200 bg-slate-50 dark:bg-slate-900/20',
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },

  dismissAll: () => {
    toast.dismiss()
  },
}

// Hook for using toast notifications
export function useToast() {
  return showToast
}

// Toast context for global toast management
export interface ToastContextType {
  showToast: typeof showToast
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast />
    </ToastContext.Provider>
  )
}

// Hook to use toast context
export function useToastContext() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}
