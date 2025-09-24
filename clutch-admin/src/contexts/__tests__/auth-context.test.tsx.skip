import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth-context'
import { apiService } from '@/lib/api'

// Mock the API service
jest.mock('@/lib/api', () => ({
  apiService: {
    login: jest.fn(),
    logout: jest.fn(),
    getToken: jest.fn(),
  },
}))

const TestComponent = () => {
  const { user, isLoading, login, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should provide initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('should handle successful login', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
    const mockResponse = {
      success: true,
      data: {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: mockUser,
      },
    }

    ;(apiService.login as jest.Mock).mockResolvedValue(mockResponse)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByText('Login')
    
    await act(async () => {
      loginButton.click()
    })

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('test@example.com', 'password')
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('should handle login failure', async () => {
    const mockResponse = {
      success: false,
      error: 'Invalid credentials',
    }

    ;(apiService.login as jest.Mock).mockResolvedValue(mockResponse)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByText('Login')
    
    await act(async () => {
      loginButton.click()
    })

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('test@example.com', 'password')
    })

    // User should remain null after failed login
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('should handle logout', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
    const mockResponse = {
      success: true,
      data: {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        user: mockUser,
      },
    }

    ;(apiService.login as jest.Mock).mockResolvedValue(mockResponse)
    ;(apiService.logout as jest.Mock).mockImplementation(() => {})

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // First login
    const loginButton = screen.getByText('Login')
    await act(async () => {
      loginButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Then logout
    const logoutButton = screen.getByText('Logout')
    await act(async () => {
      logoutButton.click()
    })

    await waitFor(() => {
      expect(apiService.logout).toHaveBeenCalled()
    })

    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('should restore user from localStorage on mount', async () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
    
    // Set up localStorage with user data
    localStorage.setItem('clutch-admin-user', JSON.stringify(mockUser))
    localStorage.setItem('clutch-admin-token', 'test-token')
    ;(apiService.getToken as jest.Mock).mockReturnValue('test-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })
})
