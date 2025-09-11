'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, HelpCircle, Mail, Phone } from 'lucide-react'
import { SnowButton } from '@/components/ui/snow-button'
import { SnowCard, SnowCardContent, SnowCardHeader, SnowCardTitle } from '@/components/ui/snow-card'
import Link from 'next/link'

interface EnhancedErrorPageProps {
  error?: Error
  title?: string
  description?: string
  showRetry?: boolean
  showHome?: boolean
  showSupport?: boolean
  onRetry?: () => void
  errorCode?: string
  suggestions?: string[]
}

export default function EnhancedErrorPage({
  error,
  title = "Something went wrong",
  description = "We encountered an unexpected error while processing your request.",
  showRetry = true,
  showHome = true,
  showSupport = true,
  onRetry,
  errorCode,
  suggestions = []
}: EnhancedErrorPageProps) {
  const defaultSuggestions = [
    "Check your internet connection and try again",
    "Clear your browser cache and refresh the page",
    "Try logging out and logging back in",
    "Contact support if the problem persists"
  ]

  const finalSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <SnowCard className="shadow-2xl">
          <SnowCardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-error" />
            </div>
            <SnowCardTitle className="text-2xl font-bold text-slate-900 mb-2">
              {title}
            </SnowCardTitle>
            <p className="text-slate-600 leading-relaxed">
              {description}
            </p>
            {errorCode && (
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-mono">
                Error Code: {errorCode}
              </div>
            )}
          </SnowCardHeader>

          <SnowCardContent className="space-y-6">
            {/* Error Details */}
            {error && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Error Details</h4>
                <p className="text-sm text-slate-600 font-mono break-words">
                  {error.message}
                </p>
              </div>
            )}

            {/* Troubleshooting Suggestions */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2 text-info" />
                Troubleshooting Steps
              </h4>
              <ul className="space-y-2">
                {finalSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start text-sm text-slate-600">
                    <span className="w-6 h-6 bg-clutch-primary-100 text-clutch-primary text-xs font-semibold rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {showRetry && onRetry && (
                <SnowButton
                  onClick={onRetry}
                  className="flex-1 bg-clutch-primary hover:bg-clutch-primary-dark text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </SnowButton>
              )}
              
              {showHome && (
                <SnowButton
                  asChild
                  variant="outline"
                  className="flex-1"
                >
                  <Link href="/dashboard-consolidated">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </SnowButton>
              )}
            </div>

            {/* Support Information */}
            {showSupport && (
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Need Help?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-info-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Email Support</p>
                      <p className="text-xs text-slate-600">support@clutch.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Phone Support</p>
                      <p className="text-xs text-slate-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SnowCardContent>
        </SnowCard>
      </div>
    </div>
  )
}
