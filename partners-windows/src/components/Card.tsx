import React from 'react';
import { BaseComponentProps } from '../types';

interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  className = '',
  ...props
}) => {
  return (
    <div className={`bg-card border border-border rounded-lg shadow-sm ${className}`} {...props}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-border">
          {title && (
            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
