"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface LuxurySkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

const LuxurySkeleton: React.FC<LuxurySkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  lines = 1,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded-luxury-sm';
      case 'circular':
        return 'rounded-luxury-full';
      case 'rectangular':
      default:
        return 'rounded-luxury-md';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-luxury-pulse';
      case 'wave':
        return 'animate-luxury-shimmer';
      case 'none':
      default:
        return '';
    }
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  const SkeletonElement = () => (
    <div
      className={`bg-luxury-platinum-200 ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={getStyle()}
    />
  );

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-luxury-xs">
        {Array.from({ length: lines }, (_, index) => (
          <SkeletonElement key={index} />
        ))}
      </div>
    );
  }

  return <SkeletonElement />;
};

// Predefined skeleton components for common use cases
export const LuxurySkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => (
  <div className={`space-y-luxury-xs ${className}`}>
    {Array.from({ length: lines }, (_, index) => (
      <LuxurySkeleton
        key={index}
        variant="text"
        width={index === lines - 1 ? '75%' : '100%'}
        animation="pulse"
      />
    ))}
  </div>
);

export const LuxurySkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-luxury-lg border border-luxury-platinum-200 rounded-luxury-lg ${className}`}>
    <LuxurySkeleton variant="rectangular" height={200} className="mb-luxury-md" />
    <LuxurySkeletonText lines={3} />
  </div>
);

export const LuxurySkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 40;
      case 'lg':
        return 64;
      default:
        return 40;
    }
  };

  return (
    <LuxurySkeleton
      variant="circular"
      width={getSize()}
      height={getSize()}
      className={className}
    />
  );
};

export const LuxurySkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => (
  <div className={`space-y-luxury-sm ${className}`}>
    {/* Header */}
    <div className="flex space-x-luxury-md">
      {Array.from({ length: columns }, (_, index) => (
        <LuxurySkeleton
          key={`header-${index}`}
          variant="text"
          width="100%"
          height={20}
        />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex space-x-luxury-md">
        {Array.from({ length: columns }, (_, colIndex) => (
          <LuxurySkeleton
            key={`cell-${rowIndex}-${colIndex}`}
            variant="text"
            width="100%"
            height={16}
          />
        ))}
      </div>
    ))}
  </div>
);

export default LuxurySkeleton;
