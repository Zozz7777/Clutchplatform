import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

const sizeClasses = {
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto',
  lg: 'h-12 w-auto',
  xl: 'h-16 w-auto',
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const { theme } = useUIStore()
  
  // Use white logo for dark theme, red logo for light theme
  const logoSrc = theme === 'dark' ? '/assets/LogoWhite.svg' : '/assets/LogoRed.svg'
  const logoAlt = 'Clutch'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 48 : 64}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 48 : 64}
        className={cn(sizeClasses[size], 'object-contain')}
        priority
        onError={(e) => {
          // Fallback to alternative format if SVG fails to load
          const target = e.target as HTMLImageElement;
          const fallbackSrc = theme === 'dark' ? '/assets/LogoWhite.svg' : '/assets/LogoRed.svg';
          target.src = fallbackSrc;
        }}
      />
      {showText && (
        <span className={cn(
          'font-bold tracking-tight',
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-2xl',
          size === 'xl' && 'text-3xl'
        )}>
          Clutch
        </span>
      )}
    </div>
  )
}

// Logo only component (without text)
export function LogoIcon({ className, size = 'md' }: Omit<LogoProps, 'showText'>) {
  return <Logo className={className} size={size} showText={false} />
}
