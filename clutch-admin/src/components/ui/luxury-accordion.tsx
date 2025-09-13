"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface LuxuryAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  onToggle?: (itemId: string, isOpen: boolean) => void;
  variant?: 'default' | 'bordered' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LuxuryAccordion: React.FC<LuxuryAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpen = [],
  onToggle,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const handleToggle = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item && item.disabled) return;

    setOpenItems(prev => {
      const isOpen = prev.includes(itemId);
      let newOpenItems;

      if (allowMultiple) {
        newOpenItems = isOpen
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId];
      } else {
        newOpenItems = isOpen ? [] : [itemId];
      }

      onToggle?.(itemId, !isOpen);
      return newOpenItems;
    });
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-luxury-sm';
      case 'md':
        return 'p-luxury-md';
      case 'lg':
        return 'p-luxury-lg';
      default:
        return 'p-luxury-md';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-luxury-platinum-200 rounded-luxury-md';
      case 'flush':
        return 'border-0';
      default:
        return 'border border-luxury-platinum-200 rounded-luxury-md';
    }
  };

  const getItemClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border-b border-luxury-platinum-200 last:border-b-0';
      case 'flush':
        return 'border-b border-luxury-platinum-100 last:border-b-0';
      default:
        return 'border-b border-luxury-platinum-200 last:border-b-0';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(item.id);
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            className={`
              ${getVariantClasses()}
              ${!isFirst && variant !== 'flush' ? 'mt-luxury-sm' : ''}
              ${isFirst && variant === 'bordered' ? 'rounded-t-luxury-md' : ''}
              ${isLast && variant === 'bordered' ? 'rounded-b-luxury-md' : ''}
            `}
          >
            {/* Header */}
            <button
              onClick={() => handleToggle(item.id)}
              disabled={item.disabled}
              className={`
                w-full flex items-center justify-between transition-all duration-200
                ${getSizeClasses()}
                ${getItemClasses()}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-luxury-platinum-50 cursor-pointer'}
                ${isOpen ? 'bg-luxury-sapphire-50' : 'bg-white'}
              `}
            >
              <div className="flex items-center space-x-luxury-sm">
                {item.icon && (
                  <span className="text-luxury-platinum-500">
                    {item.icon}
                  </span>
                )}
                <span className={`font-luxury-medium text-left ${
                  isOpen ? 'text-luxury-sapphire-700' : 'text-luxury-platinum-900'
                }`}>
                  {item.title}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-luxury-platinum-400"
              >
                {isOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </motion.div>
            </button>

            {/* Content */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className={`${getSizeClasses()} pt-0`}>
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default LuxuryAccordion;
