import '@testing-library/jest-dom';

// Mock Electron APIs
Object.defineProperty(window, 'electronAPI', {
  value: {
    dbQuery: jest.fn(),
    dbExec: jest.fn(),
    showNotification: jest.fn(),
    openExternal: jest.fn(),
    getAppVersion: jest.fn(() => Promise.resolve('1.0.0')),
    getSystemInfo: jest.fn(() => Promise.resolve({
      platform: 'win32',
      arch: 'x64',
      version: '10.0.22000'
    })),
    revenueGenerateDaily: jest.fn(),
    revenueGetReport: jest.fn(),
    revenueSyncPending: jest.fn(),
  },
  writable: true,
});

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'ar',
    },
  }),
}));

// Mock console methods in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
