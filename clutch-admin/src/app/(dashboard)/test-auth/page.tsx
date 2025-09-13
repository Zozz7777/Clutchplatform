'use client'

import React, { useState } from 'react'
import { authTester, AuthTestResult } from '@/lib/auth-test'
import { config } from '@/lib/config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Settings,
  Database,
  Shield,
  Key,
  LogOut,
  LogIn,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

export default function TestAuthPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<AuthTestResult[]>([])
  const [lastRun, setLastRun] = useState<Date | null>(null)

  const runTests = async () => {
    setIsRunning(true)
    setResults([])
    
    try {
      const testResults = await authTester.runAllTests()
      setResults(testResults)
      setLastRun(new Date())
      
      const passed = testResults.filter(r => r.success).length
      const total = testResults.length
      
      if (passed === total) {
        toast.success('All Tests Passed!', {
          description: `Authentication is working correctly (${passed}/${total})`
        })
      } else {
        toast.error('Some Tests Failed', {
          description: `Check results for details (${passed}/${total})`
        })
      }
    } catch (error) {
      console.error('Test execution error:', error)
      toast.error('Test Execution Failed', {
        description: 'An error occurred while running tests'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getTestIcon = (testName: string) => {
    switch (testName) {
      case 'Configuration': return <Settings className="h-4 w-4" />
      case 'API Connectivity': return <Database className="h-4 w-4" />
      case 'Login': return <LogIn className="h-4 w-4" />
      case 'Token Validation': return <Shield className="h-4 w-4" />
      case 'Token Refresh': return <Key className="h-4 w-4" />
      case 'Logout': return <LogOut className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        Passed
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        Failed
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authentication Testing</h1>
          <p className="text-gray-600">
            Test and verify authentication functionality with your backend
          </p>
        </div>
        <Button
          onClick={runTests}
          disabled={isRunning}
          className="bg-primary hover:bg-primary-dark"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Current Configuration
          </CardTitle>
          <CardDescription>
            Environment and API configuration being used for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">API URL</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                {config.api.baseUrl}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">App Name</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                {config.app.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Environment</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                {config.app.environment}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Version</label>
              <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                {config.app.version}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Test Results
              {lastRun && (
                <span className="text-sm font-normal text-gray-500 ml-auto">
                  Last run: {lastRun.toLocaleTimeString()}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Results from the latest authentication tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getTestIcon(result.test)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {result.test}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.success)}
                        {getStatusBadge(result.success)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {result.message}
                    </p>
                    {result.error && (
                      <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{result.error}</p>
                      </div>
                    )}
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>
            How to use this testing page and troubleshoot issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Before Running Tests:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Ensure your backend server is running</li>
              <li>Update the API URL in your environment variables</li>
              <li>Verify your backend has the required authentication endpoints</li>
              <li>Check that CORS is properly configured on your backend</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Expected Backend Endpoints:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li><code>POST /api/auth/login</code> - User authentication</li>
              <li><code>GET /api/auth/me</code> - Get current user</li>
              <li><code>POST /api/auth/refresh</code> - Refresh token</li>
              <li><code>POST /api/auth/logout</code> - User logout</li>
              <li><code>GET /api/health</code> - Health check (optional)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Troubleshooting:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Check browser console for detailed error messages</li>
              <li>Verify network requests in browser DevTools</li>
              <li>Ensure backend is accessible from your frontend URL</li>
              <li>Check backend logs for authentication errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
