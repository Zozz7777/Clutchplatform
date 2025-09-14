/**
 * Brand Configuration for Clutch Admin
 * Centralized branding system for easy customization
 */

export interface BrandColors {
  primary: string
  primaryDark: string
  primaryLight: string
  secondary: string
  secondaryDark: string
  secondaryLight: string
  accent: string
  success: string
  warning: string
  error: string
  info: string
  neutral: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
}

export interface BrandTypography {
  fontFamily: {
    sans: string[]
    mono: string[]
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
  }
  fontWeight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
  }
  lineHeight: {
    tight: number
    snug: number
    normal: number
    relaxed: number
    loose: number
  }
}

export interface BrandSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

export interface BrandShadows {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

export interface BrandConfig {
  name: string
  logo: {
    light: string
    dark: string
    favicon: string
    width: number
    height: number
  }
  colors: BrandColors
  typography: BrandTypography
  spacing: BrandSpacing
  shadows: BrandShadows
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  animations: {
    duration: {
      fast: string
      normal: string
      slow: string
    }
    easing: {
      ease: string
      easeIn: string
      easeOut: string
      easeInOut: string
    }
  }
}

// Default Clutch Brand Configuration
export const defaultBrandConfig: BrandConfig = {
  name: 'Clutch',
  logo: {
    light: '/logos/clutch-logo-light.svg',
    dark: '/logos/clutch-logo-dark.svg',
    favicon: '/favicon.ico',
    width: 120,
    height: 40,
  },
  colors: {
    primary: '#ED1B24', // Clutch Red
    primaryDark: '#C41E3A',
    primaryLight: '#F87171',
    secondary: '#3F4D4D', // Clutch Dark Gray
    secondaryDark: '#221E22', // Clutch Charcoal
    secondaryLight: '#F2F2F2', // Clutch Light Gray
    accent: '#F59E0B', // Clutch Gold
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0284C7',
    neutral: {
      50: '#F2F2F2', // Clutch Light Gray
      100: '#E5E5E5',
      200: '#D4D4D4',
      300: '#A3A3A3',
      400: '#737373',
      500: '#3F4D4D', // Clutch Dark Gray
      600: '#2D3333',
      700: '#221E22', // Clutch Charcoal
      800: '#1A1619',
      900: '#0F0D0F',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
}

// Custom brand configurations
export const brandConfigs: Record<string, Partial<BrandConfig>> = {
  // Clutch Default (already defined above)
  clutch: defaultBrandConfig,

  // Alternative brand configurations
  modern: {
    name: 'Modern Admin',
    colors: {
      ...defaultBrandConfig.colors,
      primary: '#6366F1', // Indigo
      secondary: '#8B5CF6', // Purple
      accent: '#06B6D4', // Cyan
    },
  },

  corporate: {
    name: 'Corporate Admin',
    colors: {
      ...defaultBrandConfig.colors,
      primary: '#1F2937', // Gray
      secondary: '#374151', // Dark Gray
      accent: '#F59E0B', // Amber
    },
  },

  vibrant: {
    name: 'Vibrant Admin',
    colors: {
      ...defaultBrandConfig.colors,
      primary: '#EC4899', // Pink
      secondary: '#8B5CF6', // Purple
      accent: '#F59E0B', // Amber
    },
  },
}

// Current brand configuration (can be changed via environment or settings)
export function getCurrentBrandConfig(): BrandConfig {
  const brandName = process.env.NEXT_PUBLIC_BRAND || 'clutch'
  const customConfig = brandConfigs[brandName] || {}
  
  return {
    ...defaultBrandConfig,
    ...customConfig,
    colors: {
      ...defaultBrandConfig.colors,
      ...customConfig.colors,
    },
    typography: {
      ...defaultBrandConfig.typography,
      ...customConfig.typography,
    },
  }
}

// Generate CSS custom properties for the current brand
export function generateBrandCSS(): string {
  const config = getCurrentBrandConfig()
  
  return `
    :root {
      /* Brand Colors */
      --brand-primary: ${config.colors.primary};
      --brand-primary-dark: ${config.colors.primaryDark};
      --brand-primary-light: ${config.colors.primaryLight};
      --brand-secondary: ${config.colors.secondary};
      --brand-secondary-dark: ${config.colors.secondaryDark};
      --brand-secondary-light: ${config.colors.secondaryLight};
      --brand-accent: ${config.colors.accent};
      --brand-success: ${config.colors.success};
      --brand-warning: ${config.colors.warning};
      --brand-error: ${config.colors.error};
      --brand-info: ${config.colors.info};
      
      /* Neutral Colors */
      --brand-neutral-50: ${config.colors.neutral[50]};
      --brand-neutral-100: ${config.colors.neutral[100]};
      --brand-neutral-200: ${config.colors.neutral[200]};
      --brand-neutral-300: ${config.colors.neutral[300]};
      --brand-neutral-400: ${config.colors.neutral[400]};
      --brand-neutral-500: ${config.colors.neutral[500]};
      --brand-neutral-600: ${config.colors.neutral[600]};
      --brand-neutral-700: ${config.colors.neutral[700]};
      --brand-neutral-800: ${config.colors.neutral[800]};
      --brand-neutral-900: ${config.colors.neutral[900]};
      
      /* Typography */
      --brand-font-sans: ${config.typography.fontFamily.sans.join(', ')};
      --brand-font-mono: ${config.typography.fontFamily.mono.join(', ')};
      
      /* Spacing */
      --brand-spacing-xs: ${config.spacing.xs};
      --brand-spacing-sm: ${config.spacing.sm};
      --brand-spacing-md: ${config.spacing.md};
      --brand-spacing-lg: ${config.spacing.lg};
      --brand-spacing-xl: ${config.spacing.xl};
      
      /* Shadows */
      --brand-shadow-sm: ${config.shadows.sm};
      --brand-shadow-md: ${config.shadows.md};
      --brand-shadow-lg: ${config.shadows.lg};
      --brand-shadow-xl: ${config.shadows.xl};
      
      /* Border Radius */
      --brand-radius-sm: ${config.borderRadius.sm};
      --brand-radius-md: ${config.borderRadius.md};
      --brand-radius-lg: ${config.borderRadius.lg};
      --brand-radius-xl: ${config.borderRadius.xl};
      
      /* Animations */
      --brand-duration-fast: ${config.animations.duration.fast};
      --brand-duration-normal: ${config.animations.duration.normal};
      --brand-duration-slow: ${config.animations.duration.slow};
    }
  `
}

// Brand customization utility
export class BrandCustomizer {
  private config: BrandConfig

  constructor(config: BrandConfig = getCurrentBrandConfig()) {
    this.config = config
  }

  // Update brand colors
  updateColors(colors: Partial<BrandColors>): void {
    this.config.colors = { ...this.config.colors, ...colors }
    this.applyBrandCSS()
  }

  // Update logo
  updateLogo(logo: Partial<BrandConfig['logo']>): void {
    this.config.logo = { ...this.config.logo, ...logo }
  }

  // Apply brand CSS to document
  applyBrandCSS(): void {
    if (typeof document !== 'undefined') {
      const style = document.getElementById('brand-custom-css') || document.createElement('style')
      style.id = 'brand-custom-css'
      style.textContent = generateBrandCSS()
      document.head.appendChild(style)
    }
  }

  // Get current configuration
  getConfig(): BrandConfig {
    return this.config
  }

  // Export configuration
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2)
  }

  // Import configuration
  importConfig(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson)
      this.config = { ...this.config, ...importedConfig }
      this.applyBrandCSS()
    } catch (error) {
      console.error('Failed to import brand configuration:', error)
    }
  }
}

// Export singleton instance
export const brandCustomizer = new BrandCustomizer()

// Helper functions
export function getBrandColor(color: keyof BrandColors): string {
  const colorValue = getCurrentBrandConfig().colors[color]
  return typeof colorValue === 'string' ? colorValue : colorValue[500] || colorValue[600] || Object.values(colorValue)[0]
}

export function getBrandLogo(theme: 'light' | 'dark' = 'light'): string {
  const config = getCurrentBrandConfig()
  return theme === 'light' ? config.logo.light : config.logo.dark
}

export function getBrandName(): string {
  return getCurrentBrandConfig().name
}

export default getCurrentBrandConfig
