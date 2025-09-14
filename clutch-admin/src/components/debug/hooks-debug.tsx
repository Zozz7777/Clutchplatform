'use client'

import React, { useEffect, useState } from 'react'

/**
 * Debug component to help identify React hooks violations
 * This component should be temporarily added to pages to debug React Error #310
 */
export function HooksDebug({ children }: { children: React.ReactNode }) {
  const [renderCount, setRenderCount] = useState(0)
  const [hooksCount, setHooksCount] = useState(0)

  useEffect(() => {
    setRenderCount(prev => prev + 1)
  })

  // Track hooks count - this should be consistent across renders
  React.useMemo(() => {
    setHooksCount(prev => prev + 1)
    return null
  }, [])

  if (process.env.NODE_ENV === 'development') {
    console.log('HooksDebug:', {
      renderCount,
      hooksCount,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div>
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          background: 'red',
          color: 'white',
          padding: '4px 8px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          Renders: {renderCount} | Hooks: {hooksCount}
        </div>
      )}
      {children}
    </div>
  )
}
