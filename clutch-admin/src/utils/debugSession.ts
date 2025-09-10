// Debug utility for session management
export const debugSession = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [Session Debug] ${message}`, data || '')
    }
  },

  logError: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`🚨 [Session Error] ${message}`, error || '')
    }
  },

  logToken: (token: string | null) => {
    if (process.env.NODE_ENV === 'development' && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('🔍 [Session Debug] Token payload:', {
          userId: payload.userId,
          type: payload.type,
          exp: new Date(payload.exp * 1000).toISOString(),
          iat: new Date(payload.iat * 1000).toISOString()
        })
      } catch (error) {
        console.log('🔍 [Session Debug] Could not decode token')
      }
    }
  },

  logUser: (user: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [Session Debug] User data:', {
        id: user?.id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        role: user?.role
      })
    }
  },

  logStorage: () => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const authToken = localStorage.getItem('auth-token')
      const refreshToken = localStorage.getItem('refresh-token')
      console.log('🔍 [Session Debug] Storage state:', {
        hasAuthToken: !!authToken,
        hasRefreshToken: !!refreshToken,
        authTokenLength: authToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0
      })
    }
  }
}
