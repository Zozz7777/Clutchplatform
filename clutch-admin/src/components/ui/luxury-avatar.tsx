"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Star, Shield } from 'lucide-react';

interface LuxuryAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'luxury' | 'premium' | 'vip';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

const LuxuryAvatar: React.FC<LuxuryAvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  variant = 'default',
  status,
  showStatus = false,
  className = '',
  onClick,
  animated = true,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'w-6 h-6 text-luxury-xs';
      case 'sm':
        return 'w-8 h-8 text-luxury-sm';
      case 'md':
        return 'w-10 h-10 text-luxury-base';
      case 'lg':
        return 'w-12 h-12 text-luxury-lg';
      case 'xl':
        return 'w-16 h-16 text-luxury-xl';
      case '2xl':
        return 'w-20 h-20 text-luxury-2xl';
      default:
        return 'w-10 h-10 text-luxury-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'luxury':
        return 'bg-gradient-to-br from-luxury-gold-400 to-luxury-gold-600 text-white shadow-luxury-glow';
      case 'premium':
        return 'bg-gradient-to-br from-luxury-sapphire-400 to-luxury-sapphire-600 text-white shadow-luxury-glow';
      case 'vip':
        return 'bg-gradient-to-br from-luxury-emerald-400 to-luxury-emerald-600 text-white shadow-luxury-glow';
      default:
        return 'bg-luxury-platinum-200 text-luxury-platinum-700';
    }
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'online':
        return 'bg-luxury-emerald-500';
      case 'away':
        return 'bg-luxury-gold-500';
      case 'busy':
        return 'bg-luxury-ruby-500';
      case 'offline':
      default:
        return 'bg-luxury-platinum-400';
    }
  };

  const getStatusSize = () => {
    switch (size) {
      case 'xs':
        return 'w-2 h-2';
      case 'sm':
        return 'w-2.5 h-2.5';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-3.5 h-3.5';
      case 'xl':
        return 'w-4 h-4';
      case '2xl':
        return 'w-5 h-5';
      default:
        return 'w-3 h-3';
    }
  };

  const getVariantIcon = () => {
    switch (variant) {
      case 'luxury':
        return <Crown className="w-4 h-4" />;
      case 'premium':
        return <Star className="w-4 h-4" />;
      case 'vip':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const AvatarContent = () => (
    <div
      className={`
        relative inline-flex items-center justify-center rounded-luxury-full
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${onClick ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full rounded-luxury-full object-cover"
        />
      ) : name ? (
        <span className="font-luxury-semibold">
          {getInitials(name)}
        </span>
      ) : (
        getVariantIcon()
      )}

      {/* Status Indicator */}
      {showStatus && status && (
        <div
          className={`
            absolute bottom-0 right-0 rounded-luxury-full border-2 border-white
            ${getStatusSize()}
            ${getStatusClasses()}
          `}
        />
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={onClick ? { scale: 1.05 } : {}}
        whileTap={onClick ? { scale: 0.95 } : {}}
      >
        <AvatarContent />
      </motion.div>
    );
  }

  return <AvatarContent />;
};

export default LuxuryAvatar;
