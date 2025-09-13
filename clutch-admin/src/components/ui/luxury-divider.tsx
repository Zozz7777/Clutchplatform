"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LuxuryDividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'dashed' | 'dotted' | 'gradient' | 'luxury';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  animated?: boolean;
}

const LuxuryDivider: React.FC<LuxuryDividerProps> = ({
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  className = '',
  label,
  animated = false,
}) => {
  const getSizeClasses = () => {
    if (orientation === 'horizontal') {
      switch (size) {
        case 'sm':
          return 'h-px';
        case 'md':
          return 'h-0.5';
        case 'lg':
          return 'h-1';
        default:
          return 'h-0.5';
      }
    } else {
      switch (size) {
        case 'sm':
          return 'w-px';
        case 'md':
          return 'w-0.5';
        case 'lg':
          return 'w-1';
        default:
          return 'w-0.5';
      }
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'dashed':
        return 'border-dashed border-luxury-platinum-300';
      case 'dotted':
        return 'border-dotted border-luxury-platinum-300';
      case 'gradient':
        return 'bg-gradient-to-r from-transparent via-luxury-platinum-300 to-transparent';
      case 'luxury':
        return 'bg-gradient-to-r from-transparent via-luxury-gold-400 to-transparent';
      default:
        return 'bg-luxury-platinum-300';
    }
  };

  const getOrientationClasses = () => {
    if (orientation === 'horizontal') {
      return 'w-full';
    } else {
      return 'h-full';
    }
  };

  const DividerContent = () => {
    if (label && orientation === 'horizontal') {
      return (
        <div className={`flex items-center ${className}`}>
          <div className={`flex-1 ${getSizeClasses()} ${getVariantClasses()}`} />
          <span className="px-luxury-md text-luxury-sm font-luxury-medium text-luxury-platinum-500">
            {label}
          </span>
          <div className={`flex-1 ${getSizeClasses()} ${getVariantClasses()}`} />
        </div>
      );
    }

    return (
      <div
        className={`
          ${getOrientationClasses()}
          ${getSizeClasses()}
          ${getVariantClasses()}
          ${className}
        `}
      />
    );
  };

  if (animated) {
    return (
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <DividerContent />
      </motion.div>
    );
  }

  return <DividerContent />;
};

export default LuxuryDivider;
