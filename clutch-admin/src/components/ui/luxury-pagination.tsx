"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface LuxuryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'luxury' | 'premium';
  disabled?: boolean;
  className?: string;
}

const LuxuryPagination: React.FC<LuxuryPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  variant = 'default',
  disabled = false,
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'w-8 h-8 text-luxury-sm',
          icon: 'w-4 h-4',
        };
      case 'md':
        return {
          button: 'w-10 h-10 text-luxury-base',
          icon: 'w-5 h-5',
        };
      case 'lg':
        return {
          button: 'w-12 h-12 text-luxury-lg',
          icon: 'w-6 h-6',
        };
      default:
        return {
          button: 'w-10 h-10 text-luxury-base',
          icon: 'w-5 h-5',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          active: 'bg-luxury-gold-500 text-white',
          inactive: 'bg-white text-luxury-platinum-700 hover:bg-luxury-gold-50 hover:text-luxury-gold-700',
          disabled: 'bg-luxury-platinum-100 text-luxury-platinum-400',
        };
      case 'premium':
        return {
          active: 'bg-luxury-sapphire-500 text-white',
          inactive: 'bg-white text-luxury-platinum-700 hover:bg-luxury-sapphire-50 hover:text-luxury-sapphire-700',
          disabled: 'bg-luxury-platinum-100 text-luxury-platinum-400',
        };
      default:
        return {
          active: 'bg-luxury-sapphire-500 text-white',
          inactive: 'bg-white text-luxury-platinum-700 hover:bg-luxury-sapphire-50 hover:text-luxury-sapphire-700',
          disabled: 'bg-luxury-platinum-100 text-luxury-platinum-400',
        };
    }
  };

  const getDisabledClasses = () => {
    return disabled ? 'opacity-50 cursor-not-allowed' : '';
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisiblePages);
    }
    if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageClick = (page: number) => {
    if (!disabled && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (!disabled && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!disabled && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (!disabled && currentPage > 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (!disabled && currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const visiblePages = getVisiblePages();

  const PaginationContent = () => (
    <div className={`flex items-center space-x-luxury-xs ${className}`}>
      {/* First Page */}
      {showFirstLast && (
        <motion.button
          onClick={handleFirst}
          disabled={disabled || currentPage === 1}
          className={`
            flex items-center justify-center rounded-luxury-md border border-luxury-platinum-200 transition-all duration-200
            ${sizeClasses.button}
            ${currentPage === 1 ? variantClasses.disabled : variantClasses.inactive}
            ${getDisabledClasses()}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className={sizeClasses.icon} />
          <ChevronLeft className={sizeClasses.icon} />
        </motion.button>
      )}

      {/* Previous Page */}
      {showPrevNext && (
        <motion.button
          onClick={handlePrevious}
          disabled={disabled || currentPage === 1}
          className={`
            flex items-center justify-center rounded-luxury-md border border-luxury-platinum-200 transition-all duration-200
            ${sizeClasses.button}
            ${currentPage === 1 ? variantClasses.disabled : variantClasses.inactive}
            ${getDisabledClasses()}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className={sizeClasses.icon} />
        </motion.button>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <div
              key={`ellipsis-${index}`}
              className={`flex items-center justify-center rounded-luxury-md border border-luxury-platinum-200 ${sizeClasses.button} ${variantClasses.disabled}`}
            >
              <MoreHorizontal className={sizeClasses.icon} />
            </div>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <motion.button
            key={pageNumber}
            onClick={() => handlePageClick(pageNumber)}
            disabled={disabled}
            className={`
              flex items-center justify-center rounded-luxury-md border border-luxury-platinum-200 transition-all duration-200
              ${sizeClasses.button}
              ${isActive ? variantClasses.active : variantClasses.inactive}
              ${getDisabledClasses()}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {pageNumber}
          </motion.button>
        );
      })}

      {/* Next Page */}
      {showPrevNext && (
        <motion.button
          onClick={handleNext}
          disabled={disabled || currentPage === totalPages}
          className={`
            flex items-center justify-center rounded-luxury-md border border-luxury-platinum-200 transition-all duration-200
            ${sizeClasses.button}
            ${currentPage === totalPages ? variantClasses.disabled : variantClasses.inactive}
            ${getDisabledClasses()}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className={sizeClasses.icon} />
        </motion.button>
      )}

      {/* Last Page */}
      {showFirstLast && (
        <motion.button
          onClick={handleLast}
          disabled={disabled || currentPage === totalPages}
          className={`
            flex items-center justify-center rounded-luxury-md border border-luxury-platinum-200 transition-all duration-200
            ${sizeClasses.button}
            ${currentPage === totalPages ? variantClasses.disabled : variantClasses.inactive}
            ${getDisabledClasses()}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className={sizeClasses.icon} />
          <ChevronRight className={sizeClasses.icon} />
        </motion.button>
      )}
    </div>
  );

  return <PaginationContent />;
};

export default LuxuryPagination;
