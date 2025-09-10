'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// import errorTracker from '@/utils/errorTracker';
// import { useAuth } from './AuthContext';

interface ErrorTrackerContextType {
  errorTracker: any;
  errorCount: number;
  lastError: any;
  clearErrors: () => void;
}

const ErrorTrackerContext = createContext<ErrorTrackerContextType | undefined>(undefined);

export function ErrorTrackerProvider({ children }: { children: React.ReactNode }) {
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<any>(null);
  // const { user } = useAuth();

  useEffect(() => {
    // Only run on client side to prevent SSR issues
    if (typeof window === 'undefined') return;

    // Set user ID when user is available
    // if (user?.id) {
    //   errorTracker.setUserId(user.id);
    // }

    // Monitor error buffer for UI updates
    const checkErrors = () => {
      // const buffer = errorTracker.getErrorBuffer();
      setErrorCount(0);
      // if (buffer.length > 0) {
      //   setLastError(buffer[buffer.length - 1]);
      // }
    };

    // Check for errors every 5 seconds
    const interval = setInterval(checkErrors, 5000);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      // errorTracker.destroy();
    };
  }, []);

  const clearErrors = () => {
    // errorTracker.clearErrorBuffer();
    setErrorCount(0);
    setLastError(null);
  };

  return (
    <ErrorTrackerContext.Provider
      value={{
        errorTracker: {},
        errorCount,
        lastError,
        clearErrors
      }}
    >
      {children}
    </ErrorTrackerContext.Provider>
  );
}

export function useErrorTracker() {
  const context = useContext(ErrorTrackerContext);
  if (context === undefined) {
    throw new Error('useErrorTracker must be used within an ErrorTrackerProvider');
  }
  return context;
}
