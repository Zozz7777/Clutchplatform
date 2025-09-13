"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LuxurySwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'luxury' | 'premium';
  label?: string;
  description?: string;
  className?: string;
}

const LuxurySwitch: React.FC<LuxurySwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  label,
  description,
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          track: 'w-8 h-4',
          thumb: 'w-3 h-3',
          translate: 'translate-x-4',
        };
      case 'md':
        return {
          track: 'w-11 h-6',
          thumb: 'w-5 h-5',
          translate: 'translate-x-5',
        };
      case 'lg':
        return {
          track: 'w-14 h-7',
          thumb: 'w-6 h-6',
          translate: 'translate-x-7',
        };
      default:
        return {
          track: 'w-11 h-6',
          thumb: 'w-5 h-5',
          translate: 'translate-x-5',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          track: checked
            ? 'bg-gradient-to-r from-luxury-gold-400 to-luxury-gold-600'
            : 'bg-luxury-platinum-200',
          thumb: 'bg-white shadow-luxury-md',
        };
      case 'premium':
        return {
          track: checked
            ? 'bg-gradient-to-r from-luxury-sapphire-400 to-luxury-sapphire-600'
            : 'bg-luxury-platinum-200',
          thumb: 'bg-white shadow-luxury-md',
        };
      default:
        return {
          track: checked
            ? 'bg-luxury-sapphire-500'
            : 'bg-luxury-platinum-200',
          thumb: 'bg-white shadow-luxury-sm',
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

  const SwitchContent = () => (
    <div className={`flex items-center space-x-luxury-sm ${className}`}>
      {/* Switch */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-luxury-full transition-colors duration-200
          ${sizeClasses.track}
          ${variantClasses.track}
          ${getDisabledClasses()}
        `}
      >
        <motion.div
          className={`
            inline-block rounded-luxury-full transition-transform duration-200
            ${sizeClasses.thumb}
            ${variantClasses.thumb}
          `}
          animate={{
            x: checked ? 0 : sizeClasses.translate,
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
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

  return <SwitchContent />;
};

export default LuxurySwitch;
