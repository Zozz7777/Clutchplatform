import { useMemo, useRef } from 'react'

/**
 * Safe useMemo hook that ensures consistent hook calls
 * This prevents React Error #310 by ensuring useMemo is always called
 * with the same number of dependencies
 */
export function useSafeMemo<T>(
  factory: () => T,
  deps: React.DependencyList | undefined
): T {
  const prevDepsRef = useRef<React.DependencyList | undefined>(undefined)
  
  // Always call useMemo with the same pattern
  const memoizedValue = useMemo(() => {
    // If dependencies changed, recalculate
    if (prevDepsRef.current !== deps) {
      prevDepsRef.current = deps
      return factory()
    }
    return factory()
  }, deps || [])
  
  return memoizedValue
}

/**
 * Conditional useMemo that ensures consistent hook calls
 * Use this instead of conditional useMemo calls
 */
export function useConditionalMemo<T>(
  factory: () => T,
  deps: React.DependencyList | undefined,
  condition: boolean
): T | undefined {
  // Always call useMemo, but conditionally return the value
  const memoizedValue = useMemo(() => {
    if (condition) {
      return factory()
    }
    return undefined
  }, [...(deps || []), condition])
  
  return memoizedValue
}
