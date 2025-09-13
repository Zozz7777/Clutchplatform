/**
 * Premium Design Tokens - Luxury UI/UX System
 * World-class design system for the most expensive admin dashboard
 */

export const premiumDesignTokens = {
  // Luxury Color Palette
  colors: {
    // Primary Luxury Colors
    luxury: {
      gold: {
        50: '#fefdf8',
        100: '#fef7e0',
        200: '#fdecc2',
        300: '#fbd99a',
        400: '#f8c26b',
        500: '#f5a623', // Main luxury gold
        600: '#e8941a',
        700: '#d17e12',
        800: '#b8680a',
        900: '#9f5208',
      },
      platinum: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b', // Main platinum
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      diamond: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // Main diamond blue
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      emerald: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981', // Main emerald
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
      ruby: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // Main ruby red
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      }
    },
    
    // Premium Gradients
    gradients: {
      luxury: 'linear-gradient(135deg, #f5a623 0%, #e8941a 50%, #d17e12 100%)',
      platinum: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
      diamond: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
      emerald: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      sunset: 'linear-gradient(135deg, #f5a623 0%, #ef4444 50%, #8b5cf6 100%)',
      ocean: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 50%, #f5a623 100%)',
      cosmic: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f5a623 100%)',
      aurora: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #8b5cf6 100%)',
    },

    // Glassmorphism Colors
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      strong: 'rgba(255, 255, 255, 0.3)',
      dark: 'rgba(0, 0, 0, 0.1)',
      darkMedium: 'rgba(0, 0, 0, 0.2)',
      darkStrong: 'rgba(0, 0, 0, 0.3)',
    }
  },

  // Premium Typography
  typography: {
    fonts: {
      primary: ['Inter', 'system-ui', 'sans-serif'],
      luxury: ['Playfair Display', 'serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      display: ['Outfit', 'Inter', 'sans-serif'],
    },
    weights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem',  // 72px
      '8xl': '6rem',    // 96px
      '9xl': '8rem',    // 128px
    },
    lineHeights: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    }
  },

  // Premium Spacing
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  // Premium Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    '4xl': '2rem',    // 32px
    full: '9999px',
  },

  // Premium Shadows
  shadows: {
    luxury: {
      sm: '0 1px 2px 0 rgba(245, 166, 35, 0.05)',
      base: '0 1px 3px 0 rgba(245, 166, 35, 0.1), 0 1px 2px 0 rgba(245, 166, 35, 0.06)',
      md: '0 4px 6px -1px rgba(245, 166, 35, 0.1), 0 2px 4px -1px rgba(245, 166, 35, 0.06)',
      lg: '0 10px 15px -3px rgba(245, 166, 35, 0.1), 0 4px 6px -2px rgba(245, 166, 35, 0.05)',
      xl: '0 20px 25px -5px rgba(245, 166, 35, 0.1), 0 10px 10px -5px rgba(245, 166, 35, 0.04)',
      '2xl': '0 25px 50px -12px rgba(245, 166, 35, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(245, 166, 35, 0.06)',
    },
    glass: {
      sm: '0 1px 2px 0 rgba(255, 255, 255, 0.05)',
      base: '0 1px 3px 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(255, 255, 255, 0.06)',
      md: '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06)',
      lg: '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)',
      xl: '0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.04)',
      '2xl': '0 25px 50px -12px rgba(255, 255, 255, 0.25)',
    },
    neumorphism: {
      light: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)',
      dark: '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.1)',
    }
  },

  // Premium Animations
  animations: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      luxury: 'cubic-bezier(0.4, 0, 0.2, 1)',
      premium: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideIn: {
        '0%': { transform: 'translateY(-10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      shimmer: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      bounce: {
        '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
        '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      glow: {
        '0%, 100%': { boxShadow: '0 0 5px rgba(245, 166, 35, 0.5)' },
        '50%': { boxShadow: '0 0 20px rgba(245, 166, 35, 0.8)' },
      }
    }
  },

  // Premium Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
    luxury: 9999,
  },

  // Premium Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
    '4xl': '2560px',
  }
}

export default premiumDesignTokens

/*
 * Premium Design Tokens - Luxury Grade Design System
 * Crafted for the most discerning users and premium experiences
 */

export const premiumDesignTokens = {
  // Luxury Color Palette - Inspired by high-end brands
  colors: {
    // Primary Luxury Colors
    luxury: {
      gold: {
        50: '#fefdf8',
        100: '#fef9e7',
        200: '#fef0c7',
        300: '#fde68a',
        400: '#fcd34d',
        500: '#f59e0b', // Main luxury gold
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      platinum: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b', // Main platinum
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      emerald: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981', // Main emerald
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
      sapphire: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Main sapphire
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      ruby: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // Main ruby
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      }
    },
    
    // Premium Semantic Colors
    premium: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
      }
    }
  },

  // Luxury Typography System
  typography: {
    fontFamilies: {
      display: ['Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      luxury: ['Playfair Display', 'serif'], // For premium headings
    },
    fontSizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
      '7xl': '4.5rem',  // 72px
      '8xl': '6rem',    // 96px
      '9xl': '8rem',    // 128px
    },
    fontWeights: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    }
  },

  // Premium Spacing System
  spacing: {
    0: '0px',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    9: '2.25rem',   // 36px
    10: '2.5rem',   // 40px
    11: '2.75rem',   // 44px
    12: '3rem',     // 48px
    14: '3.5rem',   // 56px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    28: '7rem',     // 112px
    32: '8rem',     // 128px
    36: '9rem',     // 144px
    40: '10rem',    // 160px
    44: '11rem',    // 176px
    48: '12rem',    // 192px
    52: '13rem',    // 208px
    56: '14rem',    // 224px
    60: '15rem',    // 240px
    64: '16rem',    // 256px
    72: '18rem',    // 288px
    80: '20rem',    // 320px
    96: '24rem',    // 384px
  },

  // Luxury Border Radius System
  borderRadius: {
    none: '0px',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    '4xl': '2rem',    // 32px
    '5xl': '2.5rem',  // 40px
    full: '9999px',
  },

  // Premium Shadow System
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    
    // Luxury shadows
    luxury: {
      gold: '0 20px 25px -5px rgb(245 158 11 / 0.1), 0 8px 10px -6px rgb(245 158 11 / 0.1)',
      platinum: '0 20px 25px -5px rgb(100 116 139 / 0.1), 0 8px 10px -6px rgb(100 116 139 / 0.1)',
      emerald: '0 20px 25px -5px rgb(16 185 129 / 0.1), 0 8px 10px -6px rgb(16 185 129 / 0.1)',
      sapphire: '0 20px 25px -5px rgb(59 130 246 / 0.1), 0 8px 10px -6px rgb(59 130 246 / 0.1)',
      ruby: '0 20px 25px -5px rgb(239 68 68 / 0.1), 0 8px 10px -6px rgb(239 68 68 / 0.1)',
    }
  },

  // Premium Animation System
  animations: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      
      // Premium easing curves
      luxury: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        elegant: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        premium: 'cubic-bezier(0.23, 1, 0.32, 1)',
        sophisticated: 'cubic-bezier(0.19, 1, 0.22, 1)',
      }
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      slideInUp: {
        '0%': { transform: 'translateY(100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideInDown: {
        '0%': { transform: 'translateY(-100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideInLeft: {
        '0%': { transform: 'translateX(-100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      slideInRight: {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.9)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.9)', opacity: '0' },
      },
      rotateIn: {
        '0%': { transform: 'rotate(-180deg)', opacity: '0' },
        '100%': { transform: 'rotate(0deg)', opacity: '1' },
      },
      bounce: {
        '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
        '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
        '70%': { transform: 'translate3d(0, -15px, 0)' },
        '90%': { transform: 'translate3d(0, -4px, 0)' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
      shimmer: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
      glow: {
        '0%, 100%': { boxShadow: '0 0 5px rgb(245 158 11 / 0.5)' },
        '50%': { boxShadow: '0 0 20px rgb(245 158 11 / 0.8), 0 0 30px rgb(245 158 11 / 0.6)' },
      }
    }
  },

  // Premium Z-Index System
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Luxury Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px',
    '4xl': '2560px',
  },

  // Premium Component Tokens
  components: {
    button: {
      height: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px
        lg: '3rem',      // 48px
        xl: '3.5rem',    // 56px
      },
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
        xl: '1.25rem 2.5rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      }
    },
    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
      }
    },
    input: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
        xl: '3.5rem',
      },
      padding: {
        sm: '0.5rem 0.75rem',
        md: '0.75rem 1rem',
        lg: '1rem 1.25rem',
        xl: '1.25rem 1.5rem',
      }
    }
  }
}

export default premiumDesignTokens
