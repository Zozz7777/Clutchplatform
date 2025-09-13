"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Info } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'completed' | 'current' | 'pending' | 'error';
  icon?: React.ReactNode;
}

interface LuxuryTimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  variant?: 'default' | 'luxury' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LuxuryTimeline: React.FC<LuxuryTimelineProps> = ({
  items,
  orientation = 'vertical',
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'w-4 h-4',
          line: 'w-0.5',
          spacing: 'space-y-luxury-sm',
        };
      case 'md':
        return {
          icon: 'w-5 h-5',
          line: 'w-0.5',
          spacing: 'space-y-luxury-md',
        };
      case 'lg':
        return {
          icon: 'w-6 h-6',
          line: 'w-1',
          spacing: 'space-y-luxury-lg',
        };
      default:
        return {
          icon: 'w-5 h-5',
          line: 'w-0.5',
          spacing: 'space-y-luxury-md',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          line: 'bg-luxury-gold-200',
          activeLine: 'bg-luxury-gold-500',
        };
      case 'premium':
        return {
          line: 'bg-luxury-sapphire-200',
          activeLine: 'bg-luxury-sapphire-500',
        };
      default:
        return {
          line: 'bg-luxury-platinum-200',
          activeLine: 'bg-luxury-sapphire-500',
        };
    }
  };

  const getStatusClasses = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: 'bg-luxury-emerald-500 text-white',
          line: 'bg-luxury-emerald-500',
        };
      case 'current':
        return {
          icon: 'bg-luxury-sapphire-500 text-white',
          line: 'bg-luxury-sapphire-500',
        };
      case 'error':
        return {
          icon: 'bg-luxury-ruby-500 text-white',
          line: 'bg-luxury-ruby-500',
        };
      case 'pending':
      default:
        return {
          icon: 'bg-luxury-platinum-200 text-luxury-platinum-600',
          line: 'bg-luxury-platinum-200',
        };
    }
  };

  const getDefaultIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-full h-full" />;
      case 'current':
        return <Clock className="w-full h-full" />;
      case 'error':
        return <AlertCircle className="w-full h-full" />;
      case 'pending':
      default:
        return <Info className="w-full h-full" />;
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const TimelineContent = () => {
    if (orientation === 'horizontal') {
      return (
        <div className={`flex items-center ${className}`}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const statusClasses = getStatusClasses(item.status);

            return (
              <React.Fragment key={item.id}>
                <div className="flex flex-col items-center">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className={`
                      flex items-center justify-center rounded-luxury-full
                      ${sizeClasses.icon}
                      ${statusClasses.icon}
                    `}
                  >
                    {item.icon || getDefaultIcon(item.status)}
                  </motion.div>

                  {/* Content */}
                  <div className="mt-luxury-sm text-center">
                    <h4 className="text-luxury-sm font-luxury-semibold text-luxury-platinum-900">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-luxury-xs text-luxury-platinum-600 mt-luxury-xs">
                        {item.description}
                      </p>
                    )}
                    {item.timestamp && (
                      <p className="text-luxury-xs text-luxury-platinum-500 mt-luxury-xs">
                        {item.timestamp}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className={`flex-1 h-${sizeClasses.line} mx-luxury-md ${variantClasses.line}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    return (
      <div className={`${sizeClasses.spacing} ${className}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const statusClasses = getStatusClasses(item.status);

          return (
            <div key={item.id} className="relative flex">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`
                  flex items-center justify-center rounded-luxury-full z-10
                  ${sizeClasses.icon}
                  ${statusClasses.icon}
                `}
              >
                {item.icon || getDefaultIcon(item.status)}
              </motion.div>

              {/* Content */}
              <div className="ml-luxury-md flex-1">
                <h4 className="text-luxury-sm font-luxury-semibold text-luxury-platinum-900">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-luxury-xs text-luxury-platinum-600 mt-luxury-xs">
                    {item.description}
                  </p>
                )}
                {item.timestamp && (
                  <p className="text-luxury-xs text-luxury-platinum-500 mt-luxury-xs">
                    {item.timestamp}
                  </p>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`
                    absolute left-1/2 transform -translate-x-1/2
                    ${sizeClasses.line}
                    ${statusClasses.line}
                  `}
                  style={{ top: sizeClasses.icon, height: `calc(100% + ${sizeClasses.spacing})` }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return <TimelineContent />;
};

export default LuxuryTimeline;
