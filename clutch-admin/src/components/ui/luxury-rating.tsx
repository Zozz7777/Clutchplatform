"use client";

import React, { useState } from 'react';
import { Star, Heart, ThumbsUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface LuxuryRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'star' | 'heart' | 'thumbs' | 'zap' | 'custom';
  disabled?: boolean;
  showValue?: boolean;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'luxury' | 'premium' | 'success' | 'warning' | 'error';
}

const LuxuryRating: React.FC<LuxuryRatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 'md',
  variant = 'star',
  disabled = false,
  showValue = false,
  label,
  className = '',
  icon,
  color = 'default',
}) => {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-8 h-8';
      default:
        return 'w-5 h-5';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'luxury':
        return 'text-luxury-gold-500';
      case 'premium':
        return 'text-luxury-sapphire-500';
      case 'success':
        return 'text-luxury-emerald-500';
      case 'warning':
        return 'text-luxury-gold-500';
      case 'error':
        return 'text-luxury-ruby-500';
      default:
        return 'text-luxury-gold-500';
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'heart':
        return Heart;
      case 'thumbs':
        return ThumbsUp;
      case 'zap':
        return Zap;
      case 'custom':
        return icon;
      default:
        return Star;
    }
  };

  const getDisabledClasses = () => {
    return disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoveredValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredValue(null);
    }
  };

  const IconComponent = getVariantIcon() as React.ComponentType<any>;
  const sizeClasses = getSizeClasses();
  const colorClasses = getColorClasses();

  const RatingContent = () => (
    <div className={`flex items-center space-x-luxury-xs ${className}`}>
      {/* Label */}
      {label && (
        <span className="text-luxury-sm font-luxury-medium text-luxury-platinum-700 mr-luxury-sm">
          {label}
        </span>
      )}

      {/* Rating Icons */}
      <div className="flex items-center space-x-luxury-xs">
        {Array.from({ length: max }, (_, index) => {
          const rating = index + 1;
          const isActive = rating <= (hoveredValue || value);
          const isHalf = rating === Math.ceil(value) && value % 1 !== 0;

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              disabled={disabled}
              className={`
                transition-all duration-200
                ${sizeClasses}
                ${getDisabledClasses()}
                ${isActive ? colorClasses : 'text-luxury-platinum-300'}
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {IconComponent && (
                <IconComponent
                  className={`w-full h-full ${
                    isActive ? 'fill-current' : 'fill-none'
                  }`}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Value Display */}
      {showValue && (
        <span className="text-luxury-sm font-luxury-semibold text-luxury-platinum-700 ml-luxury-sm">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );

  return <RatingContent />;
};

export default LuxuryRating;
