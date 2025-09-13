"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface LuxuryCalendarProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'luxury' | 'premium';
  showHeader?: boolean;
  showToday?: boolean;
  className?: string;
}

const LuxuryCalendar: React.FC<LuxuryCalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  size = 'md',
  variant = 'default',
  showHeader = true,
  showToday = true,
  className = '',
}) => {
  const [currentDate, setCurrentDate] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          cell: 'w-8 h-8 text-luxury-xs',
          header: 'text-luxury-sm',
          month: 'text-luxury-base',
        };
      case 'md':
        return {
          cell: 'w-10 h-10 text-luxury-sm',
          header: 'text-luxury-base',
          month: 'text-luxury-lg',
        };
      case 'lg':
        return {
          cell: 'w-12 h-12 text-luxury-base',
          header: 'text-luxury-lg',
          month: 'text-luxury-xl',
        };
      default:
        return {
          cell: 'w-10 h-10 text-luxury-sm',
          header: 'text-luxury-base',
          month: 'text-luxury-lg',
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return {
          selected: 'bg-luxury-gold-500 text-white',
          today: 'bg-luxury-gold-100 text-luxury-gold-700',
          hover: 'hover:bg-luxury-gold-50',
          header: 'bg-luxury-gold-50 text-luxury-gold-700',
        };
      case 'premium':
        return {
          selected: 'bg-luxury-sapphire-500 text-white',
          today: 'bg-luxury-sapphire-100 text-luxury-sapphire-700',
          hover: 'hover:bg-luxury-sapphire-50',
          header: 'bg-luxury-sapphire-50 text-luxury-sapphire-700',
        };
      default:
        return {
          selected: 'bg-luxury-sapphire-500 text-white',
          today: 'bg-luxury-sapphire-100 text-luxury-sapphire-700',
          hover: 'hover:bg-luxury-sapphire-50',
          header: 'bg-luxury-platinum-50 text-luxury-platinum-700',
        };
    }
  };

  const getDisabledClasses = () => {
    return disabled ? 'opacity-50 cursor-not-allowed' : '';
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate.toDateString() === date.toDateString();
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!disabled && !isDisabled(date)) {
      setSelectedDate(date);
      onChange(date);
    }
  };

  const handlePreviousMonth = () => {
    if (!disabled) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (!disabled) {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const days = getDaysInMonth(currentDate);

  const CalendarContent = () => (
    <div className={`bg-white border border-luxury-platinum-200 rounded-luxury-lg shadow-luxury-md ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className={`flex items-center justify-between p-luxury-md border-b border-luxury-platinum-200 ${variantClasses.header}`}>
          <button
            onClick={handlePreviousMonth}
            disabled={disabled}
            className={`p-luxury-xs rounded-luxury-sm hover:bg-black/10 transition-colors duration-200 ${getDisabledClasses()}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h3 className={`font-luxury-semibold ${sizeClasses.month}`}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={handleNextMonth}
            disabled={disabled}
            className={`p-luxury-xs rounded-luxury-sm hover:bg-black/10 transition-colors duration-200 ${getDisabledClasses()}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-px bg-luxury-platinum-200">
        {dayNames.map((day) => (
          <div
            key={day}
            className={`p-luxury-sm text-center font-luxury-medium ${sizeClasses.header} bg-luxury-platinum-50`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-luxury-platinum-200">
        {days.map((date, index) => {
          if (!date) {
            return (
              <div
                key={index}
                className={`${sizeClasses.cell} bg-white`}
              />
            );
          }

          const isDateToday = isToday(date);
          const isDateSelected = isSelected(date);
          const isDateDisabled = isDisabled(date);

          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={disabled || isDateDisabled}
              className={`
                flex items-center justify-center transition-all duration-200
                ${sizeClasses.cell}
                ${isDateSelected ? variantClasses.selected : ''}
                ${isDateToday && !isDateSelected ? variantClasses.today : ''}
                ${!isDateSelected && !isDateToday ? variantClasses.hover : ''}
                ${isDateDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${getDisabledClasses()}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {date.getDate()}
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return <CalendarContent />;
};

export default LuxuryCalendar;
