/**
 * Test Setup Configuration
 * Global test configuration and utilities
 */

import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
})

// Mock API handlers
const handlers = [
  // Mock authentication
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'admin'
        },
        token: 'mock-token'
      })
    )
  }),

  // Mock dashboard data
  rest.get('/api/dashboard/metrics', (req, res, ctx) => {
    return res(
      ctx.json({
        totalUsers: 12345,
        revenue: 45678,
        activeSessions: 2456,
        conversionRate: 3.2
      })
    )
  }),

  // Mock user data
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        users: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: ['Admin', 'User', 'Manager', 'Guest'][i % 4],
          status: ['Active', 'Inactive', 'Pending'][i % 3]
        })),
        total: 100
      })
    )
  }),

  // Mock navigation data
  rest.get('/api/navigation', (req, res, ctx) => {
    return res(
      ctx.json({
        items: [
          { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
          { id: 'users', label: 'Users', path: '/users' },
          { id: 'settings', label: 'Settings', path: '/settings' }
        ]
      })
    )
  }),

  // Mock performance data
  rest.get('/api/performance', (req, res, ctx) => {
    return res(
      ctx.json({
        metrics: {
          loadTime: 1200,
          renderTime: 800,
          memoryUsage: 45.6,
          cpuUsage: 23.4
        }
      })
    )
  }),

  // Mock analytics data
  rest.get('/api/analytics', (req, res, ctx) => {
    return res(
      ctx.json({
        events: [
          { id: 1, name: 'page_view', timestamp: new Date().toISOString() },
          { id: 2, name: 'button_click', timestamp: new Date().toISOString() }
        ]
      })
    )
  })
]

// Setup MSW server
export const server = setupServer(...handlers)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => [])
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock navigator
Object.defineProperty(navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  }
})

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(() => Promise.resolve()),
    ready: Promise.resolve(),
    controller: null
  }
})

// Mock fetch
global.fetch = jest.fn()

// Mock console methods in tests
const originalConsole = { ...console }
beforeEach(() => {
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterEach(() => {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})

// Setup and teardown
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  localStorageMock.clear()
  sessionStorageMock.clear()
})

afterAll(() => {
  server.close()
})

// Test utilities
export const testUtils = {
  // Mock user data
  mockUser: {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'admin',
    jobTitle: 'Administrator'
  },

  // Mock navigation items
  mockNavigationItems: [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'users', label: 'Users', path: '/users' },
    { id: 'settings', label: 'Settings', path: '/settings' }
  ],

  // Mock metrics data
  mockMetrics: {
    totalUsers: 12345,
    revenue: 45678,
    activeSessions: 2456,
    conversionRate: 3.2
  },

  // Mock table data
  mockTableData: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['Admin', 'User', 'Manager', 'Guest'][i % 4],
    status: ['Active', 'Inactive', 'Pending'][i % 3],
    lastLogin: new Date().toLocaleDateString()
  })),

  // Mock performance data
  mockPerformanceData: {
    loadTime: 1200,
    renderTime: 800,
    memoryUsage: 45.6,
    cpuUsage: 23.4
  },

  // Mock analytics data
  mockAnalyticsData: {
    events: [
      { id: 1, name: 'page_view', timestamp: new Date().toISOString() },
      { id: 2, name: 'button_click', timestamp: new Date().toISOString() }
    ]
  },

  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock API response
  mockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  }),

  // Mock error response
  mockApiError: (message: string, status = 500) => ({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(JSON.stringify({ error: message }))
  })
}

export default testUtils
