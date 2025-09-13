"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Command, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
  action: () => void;
}

interface LuxuryCommandProps {
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  maxHeight?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'luxury' | 'premium';
  className?: string;
  onSelect?: (item: CommandItem) => void;
}

const LuxuryCommand: React.FC<LuxuryCommandProps> = ({
  items,
  placeholder = 'Search commands...',
  emptyMessage = 'No commands found',
  maxHeight = '300px',
  size = 'md',
  variant = 'default',
  className = '',
  onSelect,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          input: 'px-luxury-sm py-luxury-xs text-luxury-sm',
          item: 'px-luxury-sm py-luxury-xs text-luxury-sm',
          icon: 'w-4 h-4',
        };
      case 'md':
        return {
          input: 'px-luxury-md py-luxury-sm text-luxury-base',
          item: 'px-luxury-md py-luxury-sm text-luxury-base',
          icon: 'w-5 h-5',
        };
      case 'lg':
        return {
          input: 'px-luxury-lg py-luxury-md text-luxury-lg',
          item: 'px-luxury-lg py-luxury-md text-luxury-lg',
          icon: 'w-6 h-6',
        };
      default:
        return {
          input: 'px-luxury-md py-luxury-sm text-luxury-base',
          item: 'px-luxury-md py-luxury-sm text-luxury-base',
          icon: 'w-5 h-5',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          input: 'border-luxury-gold-200 focus:border-luxury-gold-500 focus:ring-luxury-gold-200',
          item: 'hover:bg-luxury-gold-50',
          selected: 'bg-luxury-gold-100 text-luxury-gold-700',
        };
      case 'premium':
        return {
          input: 'border-luxury-sapphire-200 focus:border-luxury-sapphire-500 focus:ring-luxury-sapphire-200',
          item: 'hover:bg-luxury-sapphire-50',
          selected: 'bg-luxury-sapphire-100 text-luxury-sapphire-700',
        };
      default:
        return {
          input: 'border-luxury-platinum-200 focus:border-luxury-sapphire-500 focus:ring-luxury-sapphire-200',
          item: 'hover:bg-luxury-sapphire-50',
          selected: 'bg-luxury-sapphire-100 text-luxury-sapphire-700',
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const filteredItems = items.filter(item => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    const labelMatch = item.label.toLowerCase().includes(searchLower);
    const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
    const keywordMatch = item.keywords?.some(keyword => 
      keyword.toLowerCase().includes(searchLower)
    );
    
    return labelMatch || descriptionMatch || keywordMatch;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        break;
    }
  };

  const handleSelect = (item: CommandItem) => {
    item.action();
    onSelect?.(item);
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for clicks on items
    setTimeout(() => setIsOpen(false), 150);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const CommandContent = () => (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search className={`absolute left-luxury-sm top-1/2 transform -translate-y-1/2 text-luxury-platinum-400 ${sizeClasses.icon}`} />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full pl-luxury-lg pr-luxury-md border rounded-luxury-md transition-all duration-200
            ${sizeClasses.input}
            ${variantClasses.input}
            focus:outline-none focus:ring-2
          `}
        />
        <div className="absolute right-luxury-sm top-1/2 transform -translate-y-1/2 flex items-center space-x-luxury-xs">
          <kbd className="px-luxury-xs py-luxury-xs text-luxury-xs bg-luxury-platinum-100 text-luxury-platinum-600 rounded-luxury-sm">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-luxury-platinum-200 rounded-luxury-md shadow-luxury-lg z-50 overflow-hidden"
            style={{ maxHeight }}
          >
            {filteredItems.length > 0 ? (
              <div ref={listRef} className="py-luxury-xs">
                {filteredItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`
                      w-full flex items-center space-x-luxury-sm text-left transition-colors duration-150
                      ${sizeClasses.item}
                      ${index === selectedIndex ? variantClasses.selected : variantClasses.item}
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0 text-luxury-platinum-500">
                        {item.icon}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-luxury-medium text-luxury-platinum-900">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-luxury-sm text-luxury-platinum-600">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="px-luxury-md py-luxury-lg text-center text-luxury-sm text-luxury-platinum-500">
                {emptyMessage}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return <CommandContent />;
};

export default LuxuryCommand;