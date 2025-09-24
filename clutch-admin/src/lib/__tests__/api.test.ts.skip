import { apiService } from '../api'

// Mock fetch
global.fetch = jest.fn()

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('token management', () => {
    it('should load tokens from localStorage', () => {
      localStorage.setItem('clutch-admin-token', 'test-token')
      localStorage.setItem('clutch-admin-refresh-token', 'test-refresh-token')
      
      apiService.loadTokens()
      
      expect(apiService.getToken()).toBe('test-token')
    })

    it('should set tokens in both localStorage and sessionStorage', () => {
      apiService.setTokens('new-token', 'new-refresh-token')
      
      expect(localStorage.setItem).toHaveBeenCalledWith('clutch-admin-token', 'new-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('clutch-admin-refresh-token', 'new-refresh-token')
      expect(sessionStorage.setItem).toHaveBeenCalledWith('clutch-admin-token', 'new-token')
    })

    it('should clear tokens on logout', () => {
      apiService.setTokens('test-token', 'test-refresh-token')
      apiService.logout()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('clutch-admin-token')
      expect(localStorage.removeItem).toHaveBeenCalledWith('clutch-admin-refresh-token')
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('clutch-admin-token')
    })
  })

  describe('request method', () => {
    it('should make authenticated requests with proper headers', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: { id: 1 } }),
      }
      
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)
      apiService.setTokens('test-token')
      
      const result = await apiService.request('/test-endpoint')
      
      expect(fetch).toHaveBeenCalledWith(
        'https://clutch-main-nk7x.onrender.com/test-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }),
        })
      )
      expect(result.success).toBe(true)
    })

    it('should handle 401 errors with token refresh', async () => {
      const mockUnauthorizedResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      }
      
      const mockRefreshResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ 
          success: true, 
          data: { token: 'new-token', refreshToken: 'new-refresh-token' } 
        }),
      }
      
      const mockRetryResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: { id: 1 } }),
      }
      
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce(mockUnauthorizedResponse) // First call fails
        .mockResolvedValueOnce(mockRefreshResponse) // Token refresh succeeds
        .mockResolvedValueOnce(mockRetryResponse) // Retry succeeds
      
      apiService.setTokens('expired-token', 'refresh-token')
      
      const result = await apiService.request('/test-endpoint')
      
      expect(fetch).toHaveBeenCalledTimes(3)
      expect(result.success).toBe(true)
    })

    it('should handle network errors with retry', async () => {
      const mockError = new Error('Network error')
      const mockSuccessResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true, data: { id: 1 } }),
      }
      
      ;(fetch as jest.Mock)
        .mockRejectedValueOnce(mockError) // First call fails
        .mockRejectedValueOnce(mockError) // Second call fails
        .mockResolvedValueOnce(mockSuccessResponse) // Third call succeeds
      
      apiService.setTokens('test-token')
      
      const result = await apiService.request('/test-endpoint')
      
      expect(fetch).toHaveBeenCalledTimes(3)
      expect(result.success).toBe(true)
    })
  })

  describe('login method', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ 
          success: true, 
          data: { 
            token: 'login-token', 
            refreshToken: 'login-refresh-token',
            user: { id: 1, email: 'test@example.com' }
          } 
        }),
      }
      
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)
      
      const result = await apiService.login('test@example.com', 'password')
      
      expect(fetch).toHaveBeenCalledWith(
        'https://clutch-main-nk7x.onrender.com/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password',
          }),
        })
      )
      expect(result.success).toBe(true)
    })

    it('should handle login errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ 
          error: 'Invalid credentials' 
        }),
      }
      
      ;(fetch as jest.Mock).mockResolvedValue(mockResponse)
      
      const result = await apiService.login('test@example.com', 'wrong-password')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
    })
  })
})
