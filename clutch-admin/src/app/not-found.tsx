'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react'

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            {/* Clutch Logo */}
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg overflow-hidden">
                  <Image
                    src="/Logo White.png"
                    alt="Clutch Logo"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Page Not Found
              </h2>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                Oops! The page you're looking for seems to have slipped through our gears.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Don't worry, even the best machines need a tune-up sometimes.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/dashboard">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleGoBack}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Quick Links */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Quick Links
              </h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link 
                  href="/dashboard-consolidated" 
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  Dashboard
                </Link>
                <Link 
                  href="/support/tickets" 
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  Support
                </Link>
                <Link 
                  href="/settings" 
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  Settings
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                If you believe this is an error, please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}