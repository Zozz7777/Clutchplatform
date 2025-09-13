/**
 * Authentication Testing Utility
 * Helps test and debug authentication with your backend
 */

import { authService } from './auth-service'
import { config } from './config'

export interface AuthTestResult {
  test: string
  success: boolean
  message: string
  data?: any
  error?: string
}

export class AuthTester {
  private results: AuthTestResult[] = []

  /**
   * Run all authentication tests
   */
  async runAllTests(): Promise<AuthTestResult[]> {
    this.results = []
    
    console.log('🧪 Starting Authentication Tests...')
    console.log('📋 Configuration:', {
      apiUrl: config.api.baseUrl,
      appName: config.app.name,
      environment: config.app.environment
    })

    // Test 1: Configuration validation
    await this.testConfiguration()
    
    // Test 2: API connectivity
    await this.testApiConnectivity()
    
    // Test 3: Login functionality
    await this.testLogin()
    
    // Test 4: Token validation
    await this.testTokenValidation()
    
    // Test 5: Refresh token
    await this.testTokenRefresh()
    
    // Test 6: Logout functionality
    await this.testLogout()

    this.printResults()
    return this.results
  }

  /**
   * Test configuration
   */
  private async testConfiguration(): Promise<void> {
    try {
      const hasApiUrl = !!config.api.baseUrl
      const hasAppName = !!config.app.name
      
      this.addResult({
        test: 'Configuration',
        success: hasApiUrl && hasAppName,
        message: hasApiUrl && hasAppName 
          ? 'Configuration is valid' 
          : 'Missing required configuration',
        data: {
          apiUrl: config.api.baseUrl,
          appName: config.app.name,
          environment: config.app.environment
        }
      })
    } catch (error) {
      this.addResult({
        test: 'Configuration',
        success: false,
        message: 'Configuration test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Test API connectivity
   */
  private async testApiConnectivity(): Promise<void> {
    try {
      const response = await fetch(`${config.api.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      this.addResult({
        test: 'API Connectivity',
        success: response.ok,
        message: response.ok 
          ? 'API is reachable' 
          : `API returned ${response.status}: ${response.statusText}`,
        data: {
          status: response.status,
          statusText: response.statusText,
          url: `${config.api.baseUrl}/health`
        }
      })
    } catch (error) {
      this.addResult({
        test: 'API Connectivity',
        success: false,
        message: 'Cannot reach API endpoint',
        error: error instanceof Error ? error.message : 'Network error',
        data: {
          url: `${config.api.baseUrl}/health`
        }
      })
    }
  }

  /**
   * Test login functionality
   */
  private async testLogin(): Promise<void> {
    try {
      // Test with demo credentials
      const response = await authService.login({
        email: 'admin@clutch.com',
        password: 'admin123'
      })

      this.addResult({
        test: 'Login',
        success: response.success,
        message: response.success 
          ? 'Login successful' 
          : response.message || 'Login failed',
        data: response.success ? {
          user: response.data?.user,
          hasToken: !!response.data?.token,
          hasRefreshToken: !!response.data?.refreshToken
        } : undefined,
        error: response.error
      })
    } catch (error) {
      this.addResult({
        test: 'Login',
        success: false,
        message: 'Login test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Test token validation
   */
  private async testTokenValidation(): Promise<void> {
    try {
      const response = await authService.getCurrentUser()

      this.addResult({
        test: 'Token Validation',
        success: response.success,
        message: response.success 
          ? 'Token is valid' 
          : response.message || 'Token validation failed',
        data: response.success ? {
          user: response.data?.user,
          isAuthenticated: authService.isAuthenticated()
        } : undefined,
        error: response.error
      })
    } catch (error) {
      this.addResult({
        test: 'Token Validation',
        success: false,
        message: 'Token validation test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Test token refresh
   */
  private async testTokenRefresh(): Promise<void> {
    try {
      const refreshToken = authService.getRefreshToken()
      
      if (!refreshToken) {
        this.addResult({
          test: 'Token Refresh',
          success: false,
          message: 'No refresh token available',
          error: 'Refresh token not found'
        })
        return
      }

      const response = await authService.refreshToken(refreshToken)

      this.addResult({
        test: 'Token Refresh',
        success: response.success,
        message: response.success 
          ? 'Token refresh successful' 
          : response.message || 'Token refresh failed',
        data: response.success ? {
          hasNewToken: !!response.data?.token,
          hasNewRefreshToken: !!response.data?.refreshToken
        } : undefined,
        error: response.error
      })
    } catch (error) {
      this.addResult({
        test: 'Token Refresh',
        success: false,
        message: 'Token refresh test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Test logout functionality
   */
  private async testLogout(): Promise<void> {
    try {
      const response = await authService.logout()

      this.addResult({
        test: 'Logout',
        success: response.success,
        message: response.success 
          ? 'Logout successful' 
          : response.message || 'Logout failed',
        data: {
          isAuthenticated: authService.isAuthenticated(),
          hasToken: !!authService.getToken(),
          hasRefreshToken: !!authService.getRefreshToken()
        },
        error: response.error
      })
    } catch (error) {
      this.addResult({
        test: 'Logout',
        success: false,
        message: 'Logout test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Add test result
   */
  private addResult(result: AuthTestResult): void {
    this.results.push(result)
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.test}: ${result.message}`)
  }

  /**
   * Print test results summary
   */
  private printResults(): void {
    const passed = this.results.filter(r => r.success).length
    const total = this.results.length
    
    console.log('\n📊 Authentication Test Results:')
    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${total - passed}/${total}`)
    
    if (passed === total) {
      console.log('🎉 All tests passed! Authentication is working correctly.')
    } else {
      console.log('⚠️  Some tests failed. Check the results above for details.')
    }
  }

  /**
   * Get test results
   */
  getResults(): AuthTestResult[] {
    return this.results
  }

  /**
   * Check if all tests passed
   */
  allTestsPassed(): boolean {
    return this.results.every(result => result.success)
  }
}

// Export singleton instance
export const authTester = new AuthTester()

// Helper function to run tests from browser console
export function runAuthTests(): Promise<AuthTestResult[]> {
  return authTester.runAllTests()
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).runAuthTests = runAuthTests
  (window as any).authTester = authTester
}
