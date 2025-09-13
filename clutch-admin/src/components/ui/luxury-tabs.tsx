"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface LuxuryTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LuxuryTabs: React.FC<LuxuryTabsProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    }
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
      case 'pills':
        return 'rounded-luxury-full';
      case 'underline':
        return 'rounded-none border-b-2 border-transparent';
      default:
        return 'rounded-luxury-md';
    }
  };

  const getActiveClasses = () => {
    switch (variant) {
      case 'pills':
        return 'bg-luxury-sapphire-500 text-white shadow-luxury-md';
      case 'underline':
        return 'border-luxury-sapphire-500 text-luxury-sapphire-600 bg-transparent';
      default:
        return 'bg-luxury-sapphire-50 text-luxury-sapphire-700 border-luxury-sapphire-200';
    }
  };

  const getInactiveClasses = () => {
    switch (variant) {
      case 'pills':
        return 'text-luxury-platinum-600 hover:text-luxury-platinum-800 hover:bg-luxury-platinum-100';
      case 'underline':
        return 'text-luxury-platinum-600 hover:text-luxury-platinum-800 hover:border-luxury-platinum-300';
      default:
        return 'text-luxury-platinum-600 hover:text-luxury-platinum-800 hover:bg-luxury-platinum-50 border-luxury-platinum-200';
    }
  };

  const getDisabledClasses = () => {
    return 'opacity-50 cursor-not-allowed';
  };

  const getTabListClasses = () => {
    switch (variant) {
      case 'pills':
        return 'flex space-x-luxury-xs p-luxury-xs bg-luxury-platinum-100 rounded-luxury-full';
      case 'underline':
        return 'flex space-x-luxury-lg border-b border-luxury-platinum-200';
      default:
        return 'flex space-x-luxury-xs border-b border-luxury-platinum-200';
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab List */}
      <div className={getTabListClasses()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`
              flex items-center space-x-luxury-xs font-luxury-medium transition-all duration-200
              ${getSizeClasses()}
              ${getVariantClasses()}
              ${tab.disabled ? getDisabledClasses() : ''}
              ${activeTab === tab.id ? getActiveClasses() : getInactiveClasses()}
            `}
          >
            {tab.icon && (
              <span className="flex-shrink-0">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-luxury-lg">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {activeTabContent}
        </motion.div>
      </div>
    </div>
  );
};

export default LuxuryTabs;
