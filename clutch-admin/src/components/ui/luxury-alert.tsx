"use client";

import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface LuxuryAlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
  animated?: boolean;
}

const LuxuryAlert: React.FC<LuxuryAlertProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dismissible = false,
  onDismiss,
  icon,
  title,
  className = '',
  animated = true,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          container: 'bg-luxury-emerald-50 border-luxury-emerald-200 text-luxury-emerald-800',
          icon: 'text-luxury-emerald-500',
          title: 'text-luxury-emerald-900',
          content: 'text-luxury-emerald-700',
        };
      case 'warning':
        return {
          container: 'bg-luxury-gold-50 border-luxury-gold-200 text-luxury-gold-800',
          icon: 'text-luxury-gold-500',
          title: 'text-luxury-gold-900',
          content: 'text-luxury-gold-700',
        };
      case 'error':
        return {
          container: 'bg-luxury-ruby-50 border-luxury-ruby-200 text-luxury-ruby-800',
          icon: 'text-luxury-ruby-500',
          title: 'text-luxury-ruby-900',
          content: 'text-luxury-ruby-700',
        };
      case 'info':
        return {
          container: 'bg-luxury-sapphire-50 border-luxury-sapphire-200 text-luxury-sapphire-800',
          icon: 'text-luxury-sapphire-500',
          title: 'text-luxury-sapphire-900',
          content: 'text-luxury-sapphire-700',
        };
      default:
        return {
          container: 'bg-luxury-platinum-50 border-luxury-platinum-200 text-luxury-platinum-800',
          icon: 'text-luxury-platinum-500',
          title: 'text-luxury-platinum-900',
          content: 'text-luxury-platinum-700',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-luxury-sm';
      case 'md':
        return 'p-luxury-md';
      case 'lg':
        return 'p-luxury-lg';
      default:
        return 'p-luxury-md';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className={getIconSize()} />;
      case 'warning':
        return <AlertTriangle className={getIconSize()} />;
      case 'error':
        return <AlertCircle className={getIconSize()} />;
      case 'info':
        return <Info className={getIconSize()} />;
      default:
        return <Info className={getIconSize()} />;
    }
  };

  const variantClasses = getVariantClasses();

  const AlertContent = () => (
    <div className={`border rounded-luxury-md ${variantClasses.container} ${getSizeClasses()} ${className}`}>
      <div className="flex items-start space-x-luxury-sm">
        {/* Icon */}
        <div className={`flex-shrink-0 ${variantClasses.icon}`}>
          {icon || getDefaultIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-luxury-semibold text-luxury-sm mb-luxury-xs ${variantClasses.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-luxury-sm ${variantClasses.content}`}>
            {children}
          </div>
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-luxury-xs rounded-luxury-sm hover:bg-black/10 transition-colors duration-200 ${variantClasses.icon}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <AlertContent />
      </motion.div>
    );
  }

  return <AlertContent />;
};

export default LuxuryAlert;
