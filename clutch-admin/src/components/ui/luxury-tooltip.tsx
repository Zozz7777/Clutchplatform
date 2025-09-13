"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuxuryTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  disabled?: boolean;
}

const LuxuryTooltip: React.FC<LuxuryTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-luxury-platinum-800';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-luxury-platinum-800';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-luxury-platinum-800';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-luxury-platinum-800';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-luxury-platinum-800';
    }
  };

  const getAnimationVariants = () => {
    switch (position) {
      case 'top':
        return {
          initial: { opacity: 0, y: 10, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 10, scale: 0.95 },
        };
      case 'bottom':
        return {
          initial: { opacity: 0, y: -10, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -10, scale: 0.95 },
        };
      case 'left':
        return {
          initial: { opacity: 0, x: 10, scale: 0.95 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: 10, scale: 0.95 },
        };
      case 'right':
        return {
          initial: { opacity: 0, x: -10, scale: 0.95 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: -10, scale: 0.95 },
        };
      default:
        return {
          initial: { opacity: 0, y: 10, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 10, scale: 0.95 },
        };
    }
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={getAnimationVariants().initial}
            animate={getAnimationVariants().animate}
            exit={getAnimationVariants().exit}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={`absolute z-50 px-luxury-sm py-luxury-xs bg-luxury-platinum-800 text-white text-luxury-sm font-luxury-medium rounded-luxury-md shadow-luxury-lg whitespace-nowrap ${getPositionClasses()} ${className}`}
          >
            {content}
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuxuryTooltip;
