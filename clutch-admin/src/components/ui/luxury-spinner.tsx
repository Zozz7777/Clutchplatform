"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LuxurySpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'luxury' | 'premium' | 'minimal';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  label?: string;
}

const LuxurySpinner: React.FC<LuxurySpinnerProps> = ({
  size = 'md',
  variant = 'default',
  color = 'primary',
  className = '',
  label,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-luxury-sapphire-500';
      case 'secondary':
        return 'text-luxury-platinum-500';
      case 'success':
        return 'text-luxury-emerald-500';
      case 'warning':
        return 'text-luxury-gold-500';
      case 'error':
        return 'text-luxury-ruby-500';
      case 'info':
        return 'text-luxury-sapphire-500';
      default:
        return 'text-luxury-sapphire-500';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return 'text-luxury-gold-500';
      case 'premium':
        return 'text-luxury-sapphire-500';
      case 'minimal':
        return 'text-luxury-platinum-400';
      default:
        return getColorClasses();
    }
  };

  const getBorderWidth = () => {
    switch (size) {
      case 'sm':
        return 'border-2';
      case 'md':
        return 'border-2';
      case 'lg':
        return 'border-3';
      case 'xl':
        return 'border-4';
      default:
        return 'border-2';
    }
  };

  const SpinnerContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className={`${getSizeClasses()} ${className}`}>
            <div className="flex space-x-1">
              <motion.div
                className="w-1 h-1 bg-luxury-platinum-400 rounded-luxury-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-1 h-1 bg-luxury-platinum-400 rounded-luxury-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-1 h-1 bg-luxury-platinum-400 rounded-luxury-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
        );

      case 'luxury':
        return (
          <div className={`${getSizeClasses()} ${className}`}>
            <motion.div
              className={`w-full h-full rounded-luxury-full border-2 border-luxury-gold-200 border-t-luxury-gold-500`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );

      case 'premium':
        return (
          <div className={`${getSizeClasses()} ${className}`}>
            <motion.div
              className="w-full h-full rounded-luxury-full border-2 border-luxury-sapphire-200"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="w-full h-full rounded-luxury-full border-2 border-transparent border-t-luxury-sapphire-500"
                animate={{ rotate: -360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        );

      default:
        return (
          <div className={`${getSizeClasses()} ${className}`}>
            <motion.div
              className={`w-full h-full rounded-luxury-full ${getBorderWidth()} border-luxury-platinum-200 border-t-luxury-sapphire-500`}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );
    }
  };

  if (label) {
    return (
      <div className="flex flex-col items-center space-y-luxury-sm">
        <SpinnerContent />
        <span className="text-luxury-sm font-luxury-medium text-luxury-platinum-600">
          {label}
        </span>
      </div>
    );
  }

  return <SpinnerContent />;
};

export default LuxurySpinner;
