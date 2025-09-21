"use client";

import React, { useEffect, useRef } from 'react';

interface AriaLiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

export function AriaLiveRegion({ 
  message, 
  priority = 'polite', 
  className = '' 
}: AriaLiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      // Clear previous message
      regionRef.current.textContent = '';
      // Add new message after a brief delay to ensure screen readers pick it up
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
      role="status"
    />
  );
}

interface ScreenReaderTextProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenReaderText({ children, className = '' }: ScreenReaderTextProps) {
  return (
    <span className={`sr-only ${className}`}>
      {children}
    </span>
  );
}

interface FocusTrapProps {
  children: React.ReactNode;
  active: boolean;
  className?: string;
}

export function FocusTrap({ children, active, className = '' }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={`focus-trap ${className}`}>
      {children}
    </div>
  );
}


