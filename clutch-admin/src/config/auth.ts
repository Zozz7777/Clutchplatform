// Authentication configuration
export const AUTH_CONFIG = {
  // Default credentials for development (existing employee)
  defaultCredentials: {
    email: 'ziad@YourClutch.com',
    password: '4955698*Z*z'
  },
  
  // Alternative credentials (created admin user)
  alternativeCredentials: {
    email: 'admin@clutch.com',
    password: 'admin123'
  },
  
  // API endpoints
  endpoints: {
    login: '/auth/employee-login',
    refresh: '/auth/refresh-token',
    logout: '/auth/logout',
    currentUser: '/auth/current-user'
  },
  
  // Token storage keys
  storageKeys: {
    token: 'auth-token',
    refreshToken: 'refresh-token'
  }
}

export default AUTH_CONFIG
