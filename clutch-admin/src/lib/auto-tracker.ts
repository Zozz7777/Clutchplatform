/**
 * Auto Tracker - Simplified error tracking for React Error #310
 * This will help identify which components are causing the error
 */

// Track all hook calls
let globalHookCount = 0
let renderCount = 0

// Export tracking functions
export const autoTracker = {
  getHookCount: () => globalHookCount,
  getRenderCount: () => renderCount,
  incrementHookCount: () => globalHookCount++,
  incrementRenderCount: () => renderCount++,
  reset: () => {
    globalHookCount = 0
    renderCount = 0
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined') {
  ;(window as any).autoTracker = autoTracker
}
