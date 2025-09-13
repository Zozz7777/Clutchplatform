"use client";

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface LuxuryToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const LuxuryToast: React.FC<LuxuryToastProps> = ({
  toast,
  onRemove,
  position = 'top-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getTypeIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-luxury-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-luxury-ruby-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-luxury-gold-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-luxury-sapphire-500" />;
      default:
        return <Info className="w-5 h-5 text-luxury-platinum-500" />;
    }
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-white border-l-4 border-luxury-emerald-500 shadow-luxury-lg';
      case 'error':
        return 'bg-white border-l-4 border-luxury-ruby-500 shadow-luxury-lg';
      case 'warning':
        return 'bg-white border-l-4 border-luxury-gold-500 shadow-luxury-lg';
      case 'info':
        return 'bg-white border-l-4 border-luxury-sapphire-500 shadow-luxury-lg';
      default:
        return 'bg-white border-l-4 border-luxury-platinum-500 shadow-luxury-lg';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed z-50 max-w-sm w-full ${getPositionClasses()}`}
    >
      <div className={`p-luxury-md rounded-luxury-lg ${getTypeStyles()}`}>
        <div className="flex items-start space-x-luxury-sm">
          {/* Icon */}
          <div className="flex-shrink-0">
            {getTypeIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="text-luxury-sm font-luxury-semibold text-luxury-platinum-900 mb-luxury-xs">
                {toast.title}
              </h4>
            )}
            <p className="text-luxury-sm text-luxury-platinum-700">
              {toast.message}
            </p>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-luxury-xs text-luxury-sm font-luxury-medium text-luxury-sapphire-600 hover:text-luxury-sapphire-700 transition-colors duration-200"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleRemove}
            className="flex-shrink-0 p-luxury-xs rounded-luxury-sm hover:bg-luxury-platinum-100 transition-colors duration-200"
          >
            <X className="w-4 h-4 text-luxury-platinum-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Toast Container Component
interface LuxuryToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const LuxuryToastContainer: React.FC<LuxuryToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
}) => {
  return (
    <AnimatePresence>
      {toasts.map((toast) => (
        <LuxuryToast
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          position={position}
        />
      ))}
    </AnimatePresence>
  );
};

// Toast Hook
export const useLuxuryToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message: string, options?: Partial<Toast>) => {
    addToast({ ...options, message, type: 'success' });
  };

  const error = (message: string, options?: Partial<Toast>) => {
    addToast({ ...options, message, type: 'error' });
  };

  const warning = (message: string, options?: Partial<Toast>) => {
    addToast({ ...options, message, type: 'warning' });
  };

  const info = (message: string, options?: Partial<Toast>) => {
    addToast({ ...options, message, type: 'info' });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

export default LuxuryToast;
