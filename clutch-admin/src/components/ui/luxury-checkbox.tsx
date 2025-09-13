"use client";

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface LuxuryCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'luxury' | 'premium';
  label?: string;
  description?: string;
  indeterminate?: boolean;
  className?: string;
}

const LuxuryCheckbox: React.FC<LuxuryCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  label,
  description,
  indeterminate = false,
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          checkbox: 'w-4 h-4',
          icon: 'w-3 h-3',
        };
      case 'md':
        return {
          checkbox: 'w-5 h-5',
          icon: 'w-4 h-4',
        };
      case 'lg':
        return {
          checkbox: 'w-6 h-6',
          icon: 'w-5 h-5',
        };
      default:
        return {
          checkbox: 'w-5 h-5',
          icon: 'w-4 h-4',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          unchecked: 'border-luxury-platinum-300 bg-white hover:border-luxury-gold-400',
          checked: 'bg-gradient-to-r from-luxury-gold-400 to-luxury-gold-600 border-luxury-gold-500',
          icon: 'text-white',
        };
      case 'premium':
        return {
          unchecked: 'border-luxury-platinum-300 bg-white hover:border-luxury-sapphire-400',
          checked: 'bg-gradient-to-r from-luxury-sapphire-400 to-luxury-sapphire-600 border-luxury-sapphire-500',
          icon: 'text-white',
        };
      default:
        return {
          unchecked: 'border-luxury-platinum-300 bg-white hover:border-luxury-sapphire-400',
          checked: 'bg-luxury-sapphire-500 border-luxury-sapphire-500',
          icon: 'text-white',
        };
    }
  };

  const getDisabledClasses = () => {
    return disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const isChecked = checked || indeterminate;

  const CheckboxContent = () => (
    <div className={`flex items-start space-x-luxury-sm ${className}`}>
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex items-center justify-center rounded-luxury-sm border-2 transition-all duration-200
          ${sizeClasses.checkbox}
          ${isChecked ? variantClasses.checked : variantClasses.unchecked}
          ${getDisabledClasses()}
        `}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: isChecked ? 1 : 0, opacity: isChecked ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={variantClasses.icon}
        >
          {indeterminate ? (
            <Minus className={sizeClasses.icon} />
          ) : (
            <Check className={sizeClasses.icon} />
          )}
        </motion.div>
      </button>

      {/* Label and Description */}
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className="text-luxury-sm font-luxury-medium text-luxury-platinum-900">
              {label}
            </label>
          )}
          {description && (
            <p className="text-luxury-xs text-luxury-platinum-600 mt-luxury-xs">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );

  return <CheckboxContent />;
};

export default LuxuryCheckbox;
