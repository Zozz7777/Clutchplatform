import { useCallback, useRef } from 'react';

// Hook to prevent infinite loops in useEffect dependencies
export const useStableCallback = <T extends (...args: any[]) => any>(callback: T): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
};

// Hook to prevent infinite API calls
export const useApiCall = () => {
  const callCountRef = useRef(0);
  const lastCallRef = useRef(0);

  const makeApiCall = useCallback(async (apiFunction: () => Promise<any>, maxCalls: number = 3) => {
    const now = Date.now();
    
    // Reset counter if more than 5 seconds have passed
    if (now - lastCallRef.current > 5000) {
      callCountRef.current = 0;
    }
    
    // Prevent too many calls
    if (callCountRef.current >= maxCalls) {
      console.warn('🚨 API_CALL_LIMIT: Maximum API calls reached, skipping');
      return null;
    }
    
    callCountRef.current++;
    lastCallRef.current = now;
    
    try {
      return await apiFunction();
    } catch (error) {
      console.error('🚨 API_CALL_ERROR:', error);
      throw error;
    }
  }, []);

  return { makeApiCall };
};

// Hook to prevent infinite re-renders
export const useStableValue = <T>(value: T, deps: any[]): T => {
  const ref = useRef<T>(value);
  const depsRef = useRef(deps);
  
  // Only update if dependencies actually changed
  const hasChanged = deps.some((dep, index) => dep !== depsRef.current[index]);
  
  if (hasChanged) {
    ref.current = value;
    depsRef.current = deps;
  }
  
  return ref.current;
};
