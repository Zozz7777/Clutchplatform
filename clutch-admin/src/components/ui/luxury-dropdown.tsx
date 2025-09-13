"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface LuxuryDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const LuxuryDropdown: React.FC<LuxuryDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  size = 'md',
  variant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const option = options.find(opt => opt.value === value);
    setSelectedOption(option || null);
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-luxury-sm py-luxury-xs text-luxury-sm';
      case 'md':
        return 'px-luxury-md py-luxury-sm text-luxury-base';
      case 'lg':
        return 'px-luxury-lg py-luxury-md text-luxury-lg';
      default:
        return 'px-luxury-md py-luxury-sm text-luxury-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border border-luxury-platinum-300 bg-white hover:border-luxury-platinum-400 focus:border-luxury-sapphire-500 focus:ring-2 focus:ring-luxury-sapphire-200';
      case 'ghost':
        return 'border border-transparent bg-transparent hover:bg-luxury-platinum-50 focus:bg-luxury-platinum-50 focus:ring-2 focus:ring-luxury-sapphire-200';
      default:
        return 'border border-luxury-platinum-200 bg-luxury-platinum-50 hover:bg-luxury-platinum-100 focus:bg-white focus:border-luxury-sapphire-500 focus:ring-2 focus:ring-luxury-sapphire-200';
    }
  };

  const getDisabledClasses = () => {
    return disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between rounded-luxury-md transition-all duration-200 ${getSizeClasses()} ${getVariantClasses()} ${getDisabledClasses()}`}
      >
        <div className="flex items-center space-x-luxury-sm">
          {selectedOption?.icon && (
            <span className="text-luxury-platinum-500">
              {selectedOption.icon}
            </span>
          )}
          <span className={selectedOption ? 'text-luxury-platinum-900' : 'text-luxury-platinum-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-luxury-platinum-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-luxury-platinum-200 rounded-luxury-md shadow-luxury-lg z-50 overflow-hidden"
          >
            <div className="py-luxury-xs">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={`w-full flex items-center justify-between px-luxury-md py-luxury-sm text-left transition-colors duration-150 ${
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-luxury-platinum-50 cursor-pointer'
                  } ${
                    selectedOption?.value === option.value
                      ? 'bg-luxury-sapphire-50 text-luxury-sapphire-700'
                      : 'text-luxury-platinum-900'
                  }`}
                >
                  <div className="flex items-center space-x-luxury-sm">
                    {option.icon && (
                      <span className="text-luxury-platinum-500">
                        {option.icon}
                      </span>
                    )}
                    <span className="text-luxury-sm font-luxury-medium">
                      {option.label}
                    </span>
                  </div>
                  {selectedOption?.value === option.value && (
                    <Check className="w-4 h-4 text-luxury-sapphire-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuxuryDropdown;
