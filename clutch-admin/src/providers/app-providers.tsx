'use client'

import React from 'react'
import { ReactQueryProvider } from '@/lib/react-query-setup'
import { ResponsiveProvider } from '@/lib/responsive-system'
import { NavigationProvider } from '@/lib/smart-navigation'
import { AnimationProvider } from '@/lib/animation-system'
import { QueryErrorBoundary } from '@/lib/react-query-setup'
import { PageErrorBoundary } from '@/lib/error-boundaries'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { ClientWrapper } from '@/components/client-wrapper'

/**
 * App Providers - Centralized provider setup
 * Combines all context providers for the application
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryErrorBoundary>
      <ReactQueryProvider>
        <ToastProvider>
          <ResponsiveProvider>
            <NavigationProvider>
              <AnimationProvider>
                <PageErrorBoundary>
                  <ClientWrapper>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                      {children}
                    </ThemeProvider>
                  </ClientWrapper>
                </PageErrorBoundary>
              </AnimationProvider>
            </NavigationProvider>
          </ResponsiveProvider>
        </ToastProvider>
      </ReactQueryProvider>
    </QueryErrorBoundary>
  )
}

export default AppProviders
