"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LuxuryRadioProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'luxury' | 'premium';
  label?: string;
  description?: string;
  name?: string;
  value?: string;
  className?: string;
}

const LuxuryRadio: React.FC<LuxuryRadioProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  label,
  description,
  name,
  value,
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          radio: 'w-4 h-4',
          dot: 'w-2 h-2',
        };
      case 'md':
        return {
          radio: 'w-5 h-5',
          dot: 'w-2.5 h-2.5',
        };
      case 'lg':
        return {
          radio: 'w-6 h-6',
          dot: 'w-3 h-3',
        };
      default:
        return {
          radio: 'w-5 h-5',
          dot: 'w-2.5 h-2.5',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          unchecked: 'border-luxury-platinum-300 bg-white hover:border-luxury-gold-400',
          checked: 'border-luxury-gold-500 bg-white',
          dot: 'bg-luxury-gold-500',
        };
      case 'premium':
        return {
          unchecked: 'border-luxury-platinum-300 bg-white hover:border-luxury-sapphire-400',
          checked: 'border-luxury-sapphire-500 bg-white',
          dot: 'bg-luxury-sapphire-500',
        };
      default:
        return {
          unchecked: 'border-luxury-platinum-300 bg-white hover:border-luxury-sapphire-400',
          checked: 'border-luxury-sapphire-500 bg-white',
          dot: 'bg-luxury-sapphire-500',
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

  const RadioContent = () => (
    <div className={`flex items-start space-x-luxury-sm ${className}`}>
      {/* Radio */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex items-center justify-center rounded-luxury-full border-2 transition-all duration-200
          ${sizeClasses.radio}
          ${checked ? variantClasses.checked : variantClasses.unchecked}
          ${getDisabledClasses()}
        `}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={`
            rounded-luxury-full
            ${sizeClasses.dot}
            ${variantClasses.dot}
          `}
        />
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

  return <RadioContent />;
};

export default LuxuryRadio;
