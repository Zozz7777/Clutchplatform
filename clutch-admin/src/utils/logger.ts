'use client'

// Production-safe logger utility
export const logger = {
  // Only log in development
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args)
    }
  },
  
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args)
    }
  }
}
