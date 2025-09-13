"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LuxuryBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'luxury';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
  icon?: React.ReactNode;
}

const LuxuryBadge: React.FC<LuxuryBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  animated = false,
  icon,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-luxury-emerald-100 text-luxury-emerald-800 border-luxury-emerald-200';
      case 'warning':
        return 'bg-luxury-gold-100 text-luxury-gold-800 border-luxury-gold-200';
      case 'error':
        return 'bg-luxury-ruby-100 text-luxury-ruby-800 border-luxury-ruby-200';
      case 'info':
        return 'bg-luxury-sapphire-100 text-luxury-sapphire-800 border-luxury-sapphire-200';
      case 'luxury':
        return 'bg-gradient-to-r from-luxury-gold-400 to-luxury-gold-600 text-white border-luxury-gold-500 shadow-luxury-glow';
      default:
        return 'bg-luxury-platinum-100 text-luxury-platinum-800 border-luxury-platinum-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-luxury-xs py-luxury-xs text-luxury-xs';
      case 'md':
        return 'px-luxury-sm py-luxury-xs text-luxury-sm';
      case 'lg':
        return 'px-luxury-md py-luxury-sm text-luxury-base';
      default:
        return 'px-luxury-sm py-luxury-xs text-luxury-sm';
    }
  };

  const BadgeContent = () => (
    <span className={`inline-flex items-center space-x-luxury-xs border rounded-luxury-full font-luxury-medium ${getVariantClasses()} ${getSizeClasses()} ${className}`}>
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BadgeContent />
      </motion.div>
    );
  }

  return <BadgeContent />;
};

export default LuxuryBadge;
