"use client";

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface LuxuryBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'luxury' | 'premium';
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

const LuxuryBreadcrumb: React.FC<LuxuryBreadcrumbProps> = ({
  items,
  separator,
  size = 'md',
  variant = 'default',
  showHome = true,
  homeHref = '/',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          text: 'text-luxury-sm',
          icon: 'w-4 h-4',
          spacing: 'space-x-luxury-xs',
        };
      case 'md':
        return {
          text: 'text-luxury-base',
          icon: 'w-5 h-5',
          spacing: 'space-x-luxury-sm',
        };
      case 'lg':
        return {
          text: 'text-luxury-lg',
          icon: 'w-6 h-6',
          spacing: 'space-x-luxury-md',
        };
      default:
        return {
          text: 'text-luxury-base',
          icon: 'w-5 h-5',
          spacing: 'space-x-luxury-sm',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          current: 'text-luxury-gold-700 font-luxury-semibold',
          link: 'text-luxury-platinum-600 hover:text-luxury-gold-600',
          separator: 'text-luxury-gold-400',
        };
      case 'premium':
        return {
          current: 'text-luxury-sapphire-700 font-luxury-semibold',
          link: 'text-luxury-platinum-600 hover:text-luxury-sapphire-600',
          separator: 'text-luxury-sapphire-400',
        };
      default:
        return {
          current: 'text-luxury-platinum-900 font-luxury-semibold',
          link: 'text-luxury-platinum-600 hover:text-luxury-sapphire-600',
          separator: 'text-luxury-platinum-400',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const defaultSeparator = <ChevronRight className={sizeClasses.icon} />;

  const BreadcrumbContent = () => (
    <nav className={`flex items-center ${sizeClasses.spacing} ${className}`}>
      {/* Home */}
      {showHome && (
        <motion.a
          href={homeHref}
          className={`flex items-center ${sizeClasses.spacing} ${variantClasses.link} transition-colors duration-200`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className={sizeClasses.icon} />
          <span className={sizeClasses.text}>Home</span>
        </motion.a>
      )}

      {/* Separator after home */}
      {showHome && items.length > 0 && (
        <span className={variantClasses.separator}>
          {separator || defaultSeparator}
        </span>
      )}

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = item.current || isLast;

        return (
          <React.Fragment key={index}>
            {item.href && !isCurrent ? (
              <motion.a
                href={item.href}
                className={`flex items-center ${sizeClasses.spacing} ${variantClasses.link} transition-colors duration-200`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon && (
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className={sizeClasses.text}>{item.label}</span>
              </motion.a>
            ) : (
              <span className={`flex items-center ${sizeClasses.spacing} ${variantClasses.current}`}>
                {item.icon && (
                  <span className="flex-shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className={sizeClasses.text}>{item.label}</span>
              </span>
            )}

            {/* Separator */}
            {!isLast && (
              <span className={variantClasses.separator}>
                {separator || defaultSeparator}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );

  return <BreadcrumbContent />;
};

export default LuxuryBreadcrumb;
