"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LuxuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const LuxuryModal: React.FC<LuxuryModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case '2xl':
        return 'max-w-6xl';
      default:
        return 'max-w-lg';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-luxury-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-luxury-gold-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-luxury-ruby-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-luxury-sapphire-500" />;
      default:
        return null;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-luxury-emerald-500 bg-luxury-emerald-50';
      case 'warning':
        return 'border-l-4 border-luxury-gold-500 bg-luxury-gold-50';
      case 'error':
        return 'border-l-4 border-luxury-ruby-500 bg-luxury-ruby-50';
      case 'info':
        return 'border-l-4 border-luxury-sapphire-500 bg-luxury-sapphire-50';
      default:
        return 'border-l-4 border-luxury-platinum-500 bg-luxury-platinum-50';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`relative w-full ${getSizeClasses()} bg-white rounded-luxury-xl shadow-luxury-2xl border border-luxury-platinum-200 ${className}`}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`flex items-center justify-between p-luxury-lg border-b border-luxury-platinum-200 ${getTypeStyles()}`}>
                <div className="flex items-center space-x-luxury-sm">
                  {getTypeIcon()}
                  {title && (
                    <h2 className="text-luxury-xl font-luxury-semibold text-luxury-platinum-900">
                      {title}
                    </h2>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-luxury-sm rounded-luxury-md hover:bg-luxury-platinum-100 transition-colors duration-200 group"
                  >
                    <X className="w-5 h-5 text-luxury-platinum-500 group-hover:text-luxury-platinum-700" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-luxury-lg">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LuxuryModal;
