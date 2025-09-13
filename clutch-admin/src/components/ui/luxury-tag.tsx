"use client";

import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface LuxuryTagProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'luxury' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

const LuxuryTag: React.FC<LuxuryTagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  closable = false,
  onClose,
  icon,
  className = '',
  animated = false,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-luxury-xs py-luxury-xs text-luxury-xs',
          icon: 'w-3 h-3',
          close: 'w-3 h-3',
        };
      case 'md':
        return {
          container: 'px-luxury-sm py-luxury-xs text-luxury-sm',
          icon: 'w-4 h-4',
          close: 'w-4 h-4',
        };
      case 'lg':
        return {
          container: 'px-luxury-md py-luxury-sm text-luxury-base',
          icon: 'w-5 h-5',
          close: 'w-5 h-5',
        };
      default:
        return {
          container: 'px-luxury-sm py-luxury-xs text-luxury-sm',
          icon: 'w-4 h-4',
          close: 'w-4 h-4',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return {
          container: 'bg-luxury-emerald-100 text-luxury-emerald-800 border-luxury-emerald-200',
          close: 'text-luxury-emerald-600 hover:text-luxury-emerald-800 hover:bg-luxury-emerald-200',
        };
      case 'warning':
        return {
          container: 'bg-luxury-gold-100 text-luxury-gold-800 border-luxury-gold-200',
          close: 'text-luxury-gold-600 hover:text-luxury-gold-800 hover:bg-luxury-gold-200',
        };
      case 'error':
        return {
          container: 'bg-luxury-ruby-100 text-luxury-ruby-800 border-luxury-ruby-200',
          close: 'text-luxury-ruby-600 hover:text-luxury-ruby-800 hover:bg-luxury-ruby-200',
        };
      case 'info':
        return {
          container: 'bg-luxury-sapphire-100 text-luxury-sapphire-800 border-luxury-sapphire-200',
          close: 'text-luxury-sapphire-600 hover:text-luxury-sapphire-800 hover:bg-luxury-sapphire-200',
        };
      case 'luxury':
        return {
          container: 'bg-gradient-to-r from-luxury-gold-400 to-luxury-gold-600 text-white border-luxury-gold-500 shadow-luxury-glow',
          close: 'text-white hover:bg-white/20',
        };
      case 'premium':
        return {
          container: 'bg-gradient-to-r from-luxury-sapphire-400 to-luxury-sapphire-600 text-white border-luxury-sapphire-500 shadow-luxury-glow',
          close: 'text-white hover:bg-white/20',
        };
      default:
        return {
          container: 'bg-luxury-platinum-100 text-luxury-platinum-800 border-luxury-platinum-200',
          close: 'text-luxury-platinum-600 hover:text-luxury-platinum-800 hover:bg-luxury-platinum-200',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  const TagContent = () => (
    <span className={`inline-flex items-center space-x-luxury-xs border rounded-luxury-full font-luxury-medium ${sizeClasses.container} ${variantClasses.container} ${className}`}>
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {closable && (
        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-luxury-xs rounded-luxury-full transition-colors duration-200 ${variantClasses.close}`}
        >
          <X className={sizeClasses.close} />
        </button>
      )}
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <TagContent />
      </motion.div>
    );
  }

  return <TagContent />;
};

export default LuxuryTag;
