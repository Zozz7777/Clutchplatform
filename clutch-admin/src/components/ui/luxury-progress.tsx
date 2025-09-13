"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LuxuryProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'luxury';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const LuxuryProgress: React.FC<LuxuryProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-3';
      case 'lg':
        return 'h-4';
      default:
        return 'h-3';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-luxury-emerald-500';
      case 'warning':
        return 'bg-luxury-gold-500';
      case 'error':
        return 'bg-luxury-ruby-500';
      case 'info':
        return 'bg-luxury-sapphire-500';
      case 'luxury':
        return 'bg-gradient-to-r from-luxury-gold-400 to-luxury-gold-600';
      default:
        return 'bg-luxury-platinum-500';
    }
  };

  const getBackgroundClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-luxury-emerald-100';
      case 'warning':
        return 'bg-luxury-gold-100';
      case 'error':
        return 'bg-luxury-ruby-100';
      case 'info':
        return 'bg-luxury-sapphire-100';
      case 'luxury':
        return 'bg-luxury-platinum-100';
      default:
        return 'bg-luxury-platinum-100';
    }
  };

  const ProgressBar = () => (
    <div className={`w-full ${getBackgroundClasses()} rounded-luxury-full overflow-hidden ${getSizeClasses()}`}>
      <div
        className={`h-full ${getVariantClasses()} rounded-luxury-full transition-all duration-500 ease-out ${
          variant === 'luxury' ? 'shadow-luxury-glow' : ''
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );

  const AnimatedProgressBar = () => (
    <div className={`w-full ${getBackgroundClasses()} rounded-luxury-full overflow-hidden ${getSizeClasses()}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${getVariantClasses()} rounded-luxury-full ${
          variant === 'luxury' ? 'shadow-luxury-glow' : ''
        }`}
      />
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-luxury-xs">
          <span className="text-luxury-sm font-luxury-medium text-luxury-platinum-700">
            {label || 'Progress'}
          </span>
          <span className="text-luxury-sm font-luxury-semibold text-luxury-platinum-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      {animated ? <AnimatedProgressBar /> : <ProgressBar />}
    </div>
  );
};

export default LuxuryProgress;
