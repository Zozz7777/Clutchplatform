"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LuxurySliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'luxury' | 'premium';
  showLabels?: boolean;
  showValue?: boolean;
  label?: string;
  className?: string;
}

const LuxurySlider: React.FC<LuxurySliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  size = 'md',
  variant = 'default',
  showLabels = false,
  showValue = false,
  label,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          track: 'h-1',
          thumb: 'w-4 h-4',
        };
      case 'md':
        return {
          track: 'h-2',
          thumb: 'w-5 h-5',
        };
      case 'lg':
        return {
          track: 'h-3',
          thumb: 'w-6 h-6',
        };
      default:
        return {
          track: 'h-2',
          thumb: 'w-5 h-5',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          track: 'bg-luxury-platinum-200',
          fill: 'bg-gradient-to-r from-luxury-gold-400 to-luxury-gold-600',
          thumb: 'bg-white border-2 border-luxury-gold-500 shadow-luxury-md',
        };
      case 'premium':
        return {
          track: 'bg-luxury-platinum-200',
          fill: 'bg-gradient-to-r from-luxury-sapphire-400 to-luxury-sapphire-600',
          thumb: 'bg-white border-2 border-luxury-sapphire-500 shadow-luxury-md',
        };
      default:
        return {
          track: 'bg-luxury-platinum-200',
          fill: 'bg-luxury-sapphire-500',
          thumb: 'bg-white border-2 border-luxury-sapphire-500 shadow-luxury-sm',
        };
    }
  };

  const getDisabledClasses = () => {
    return disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || disabled || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const SliderContent = () => (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center mb-luxury-sm">
          <label className="text-luxury-sm font-luxury-medium text-luxury-platinum-900">
            {label}
          </label>
          {showValue && (
            <span className="text-luxury-sm font-luxury-semibold text-luxury-platinum-700">
              {value}
            </span>
          )}
        </div>
      )}

      {/* Slider */}
      <div
        ref={sliderRef}
        className={`
          relative w-full rounded-luxury-full
          ${sizeClasses.track}
          ${variantClasses.track}
          ${getDisabledClasses()}
        `}
        onMouseDown={handleMouseDown}
      >
        {/* Fill */}
        <div
          className={`
            absolute left-0 top-0 h-full rounded-luxury-full
            ${variantClasses.fill}
          `}
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <motion.div
          className={`
            absolute top-1/2 transform -translate-y-1/2 rounded-luxury-full
            ${sizeClasses.thumb}
            ${variantClasses.thumb}
          `}
          style={{ left: `${percentage}%`, transform: 'translate(-50%, -50%)' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-luxury-xs">
          <span className="text-luxury-xs text-luxury-platinum-500">{min}</span>
          <span className="text-luxury-xs text-luxury-platinum-500">{max}</span>
        </div>
      )}
    </div>
  );

  return <SliderContent />;
};

export default LuxurySlider;
