'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            {isOnline ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <WifiOff className="h-8 w-8 text-slate-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isOnline ? 'Connection Restored' : 'You\'re Offline'}
          </CardTitle>
          <CardDescription>
            {isOnline 
              ? 'Your internet connection has been restored. You can now continue using the app.'
              : 'It looks like you\'re not connected to the internet. Some features may not be available.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOnline && (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Limited Functionality
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      While offline, you can still access cached content and perform some actions that will sync when you\'re back online.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  What you can do offline:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• View previously loaded pages</li>
                  <li>• Access cached data and reports</li>
                  <li>• Use basic navigation</li>
                  <li>• View saved settings</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  What requires internet:
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Real-time data updates</li>
                  <li>• New data fetching</li>
                  <li>• User authentication</li>
                  <li>• File uploads and downloads</li>
                </ul>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRetry} 
              className="w-full"
              disabled={retryCount > 3}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryCount > 3 ? 'Retry Limit Reached' : 'Try Again'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>

          {retryCount > 0 && (
            <p className="text-xs text-slate-500 text-center">
              Retry attempts: {retryCount}/3
            </p>
          )}

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Connection status: <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
