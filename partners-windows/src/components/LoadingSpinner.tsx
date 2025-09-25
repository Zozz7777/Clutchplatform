import React from 'react';
import { BaseComponentProps } from '../types';

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
};

export default LoadingSpinner;
