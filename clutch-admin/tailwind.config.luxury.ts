import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Luxury Color Palette
      colors: {
        // Luxury Gold
        'luxury-gold': {
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
        // Luxury Platinum
        'luxury-platinum': {
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
        // Luxury Diamond
        'luxury-diamond': {
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
        // Luxury Emerald
        'luxury-emerald': {
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
        // Luxury Ruby
        'luxury-ruby': {
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
        },
        // Glassmorphism Colors
        'glass': {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          strong: 'rgba(255, 255, 255, 0.3)',
          dark: 'rgba(0, 0, 0, 0.1)',
          darkMedium: 'rgba(0, 0, 0, 0.2)',
          darkStrong: 'rgba(0, 0, 0, 0.3)',
        }
      },
      
      // Luxury Gradients
      backgroundImage: {
        'luxury': 'linear-gradient(135deg, #f5a623 0%, #e8941a 50%, #d17e12 100%)',
        'platinum': 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
        'diamond': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
        'emerald': 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        'sunset': 'linear-gradient(135deg, #f5a623 0%, #ef4444 50%, #8b5cf6 100%)',
        'ocean': 'linear-gradient(135deg, #0ea5e9 0%, #10b981 50%, #f5a623 100%)',
        'cosmic': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f5a623 100%)',
        'aurora': 'linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #8b5cf6 100%)',
      },

      // Luxury Shadows
      boxShadow: {
        'luxury': {
          sm: '0 1px 2px 0 rgba(245, 166, 35, 0.05)',
          base: '0 1px 3px 0 rgba(245, 166, 35, 0.1), 0 1px 2px 0 rgba(245, 166, 35, 0.06)',
          md: '0 4px 6px -1px rgba(245, 166, 35, 0.1), 0 2px 4px -1px rgba(245, 166, 35, 0.06)',
          lg: '0 10px 15px -3px rgba(245, 166, 35, 0.1), 0 4px 6px -2px rgba(245, 166, 35, 0.05)',
          xl: '0 20px 25px -5px rgba(245, 166, 35, 0.1), 0 10px 10px -5px rgba(245, 166, 35, 0.04)',
          '2xl': '0 25px 50px -12px rgba(245, 166, 35, 0.25)',
          inner: 'inset 0 2px 4px 0 rgba(245, 166, 35, 0.06)',
        },
        'glass': {
          sm: '0 1px 2px 0 rgba(255, 255, 255, 0.05)',
          base: '0 1px 3px 0 rgba(255, 255, 255, 0.1), 0 1px 2px 0 rgba(255, 255, 255, 0.06)',
          md: '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06)',
          lg: '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)',
          xl: '0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.04)',
          '2xl': '0 25px 50px -12px rgba(255, 255, 255, 0.25)',
        },
        'neumorphism': {
          light: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.5)',
          dark: '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.1)',
        }
      },

      // Luxury Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'luxury-pulse': 'luxuryPulse 2s ease-in-out infinite',
        'premium-spin': 'premiumSpin 1s linear infinite',
      },

      // Luxury Keyframes
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
        },
        luxuryPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(245, 166, 35, 0.7)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 0 10px rgba(245, 166, 35, 0)',
            transform: 'scale(1.05)'
          },
        },
        premiumSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      // Luxury Typography
      fontFamily: {
        'luxury': ['Playfair Display', 'serif'],
        'display': ['Outfit', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // Luxury Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Luxury Border Radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // Luxury Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Luxury Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    // Custom plugin for luxury utilities
    function({ addUtilities, theme }: any) {
      const newUtilities = {
        '.luxury-gradient-text': {
          background: 'linear-gradient(135deg, #f5a623 0%, #0ea5e9 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.luxury-glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.luxury-glow': {
          'box-shadow': '0 0 20px rgba(245, 166, 35, 0.5)',
        },
        '.luxury-shimmer': {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            animation: 'shimmer 2s infinite',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config
