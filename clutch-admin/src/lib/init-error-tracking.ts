/**
 * Initialize Error Tracking - Call this to enable React Error #310 tracking
 * This will help identify which components are causing the error
 */

// Only run in development mode
if (process.env.NODE_ENV === 'development') {
  // Import and initialize auto tracker
  import('./auto-tracker').then(() => {
    console.log('🔍 Auto Tracker initialized - monitoring all React hooks')
  })
  
  // Set up global error handlers
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    const originalOnError = window.onerror
    window.onerror = function(message, source, lineno, colno, error) {
      if (message?.toString().includes('310') || message?.toString().includes('Rendered more hooks')) {
        console.group('🚨 REACT ERROR #310 CAUGHT BY WINDOW.ONERROR')
        console.error('Message:', message)
        console.error('Source:', source)
        console.error('Line:', lineno, 'Column:', colno)
        console.error('Error:', error)
        console.log('URL:', window.location.href)
        console.log('Timestamp:', new Date().toISOString())
        console.groupEnd()
      }
      
      if (originalOnError) {
        return originalOnError.call(this, message, source, lineno, colno, error)
      }
      return false
    }
    
    // Override window.onunhandledrejection to catch promise rejections
    const originalOnUnhandledRejection = window.onunhandledrejection
    window.onunhandledrejection = function(event) {
      if (event.reason?.message?.includes('310') || event.reason?.message?.includes('Rendered more hooks')) {
        console.group('🚨 REACT ERROR #310 CAUGHT BY UNHANDLED REJECTION')
        console.error('Reason:', event.reason)
        console.log('URL:', window.location.href)
        console.log('Timestamp:', new Date().toISOString())
        console.groupEnd()
      }
      
      if (originalOnUnhandledRejection) {
        return originalOnUnhandledRejection.call(window, event)
      }
    }
    
    console.log('🔍 Error tracking initialized - ready to catch React Error #310')
  }
}
