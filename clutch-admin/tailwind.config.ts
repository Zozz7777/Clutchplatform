import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced Clutch Brand Colors
        'clutch': {
          primary: 'hsl(var(--clutch-primary))',
          'primary-light': 'hsl(var(--clutch-primary-light))',
          'primary-dark': 'hsl(var(--clutch-primary-dark))',
          'primary-50': 'hsl(var(--clutch-primary-50))',
          'primary-100': 'hsl(var(--clutch-primary-100))',
          'primary-900': 'hsl(var(--clutch-primary-900))',
          secondary: 'hsl(var(--clutch-secondary))',
          'secondary-light': 'hsl(var(--clutch-secondary-light))',
          'secondary-dark': 'hsl(var(--clutch-secondary-dark))',
          'secondary-50': 'hsl(var(--clutch-secondary-50))',
          'secondary-100': 'hsl(var(--clutch-secondary-100))',
        },
        // Clutch Brand Colors - Red & White
        'clutch': {
          'red-50': '#FEF2F2',
          'red-100': '#FEE2E2',
          'red-200': '#FECACA',
          'red-300': '#FCA5A5',
          'red-400': '#F87171',
          'red-500': '#ED1B24', // Primary brand red
          'red-600': '#DC2626',
          'red-700': '#B91C1C',
          'red-800': '#991B1B',
          'red-900': '#7F1D1D',
          'white-50': '#FFFFFF',
          'white-100': '#FEFEFE',
          'white-200': '#FDFDFD',
          'white-300': '#FCFCFC',
          'white-400': '#FAFAFA',
          'white-500': '#F8F8F8',
          'white-600': '#F5F5F5',
          'white-700': '#F0F0F0',
          'white-800': '#E5E5E5',
          'white-900': '#D1D1D1',
        },
        // Luxury color palette (keeping for compatibility)
        'luxury': {
          'gold-50': '#FFFBEB',
          'gold-100': '#FEF3C7',
          'gold-200': '#FDE68A',
          'gold-300': '#FCD34D',
          'gold-400': '#FBBF24',
          'gold-500': '#F59E0B',
          'gold-600': '#D97706',
          'gold-700': '#B45309',
          'gold-800': '#92400E',
          'gold-900': '#78350F',
          'platinum-50': '#F8FAFC',
          'platinum-100': '#F1F5F9',
          'platinum-200': '#E2E8F0',
          'platinum-300': '#CBD5E1',
          'platinum-400': '#94A3B8',
          'platinum-500': '#64748B',
          'platinum-600': '#475569',
          'platinum-700': '#334155',
          'platinum-800': '#1E293B',
          'platinum-900': '#0F172A',
          'emerald-50': '#ECFDF5',
          'emerald-100': '#D1FAE5',
          'emerald-200': '#A7F3D0',
          'emerald-300': '#6EE7B7',
          'emerald-400': '#34D399',
          'emerald-500': '#10B981',
          'emerald-600': '#059669',
          'emerald-700': '#047857',
          'emerald-800': '#065F46',
          'emerald-900': '#064E3B',
          'sapphire-50': '#EFF6FF',
          'sapphire-100': '#DBEAFE',
          'sapphire-200': '#BFDBFE',
          'sapphire-300': '#93C5FD',
          'sapphire-400': '#60A5FA',
          'sapphire-500': '#3B82F6',
          'sapphire-600': '#2563EB',
          'sapphire-700': '#1D4ED8',
          'sapphire-800': '#1E40AF',
          'sapphire-900': '#1E3A8A',
          'ruby-50': '#FEF2F2',
          'ruby-100': '#FEE2E2',
          'ruby-200': '#FECACA',
          'ruby-300': '#FCA5A5',
          'ruby-400': '#F87171',
          'ruby-500': '#EF4444',
          'ruby-600': '#DC2626',
          'ruby-700': '#B91C1C',
          'ruby-800': '#991B1B',
          'ruby-900': '#7F1D1D',
        },
        // Legacy support
        'clutch-red': {
          DEFAULT: '#ED1B24',
          50: '#FEF2F2',
          100: '#FEE2E2', 
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#ED1B24',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A',
        },
        'clutch-blue': {
          DEFAULT: 'hsl(var(--clutch-secondary))',
          light: 'hsl(var(--clutch-secondary-light))',
          dark: 'hsl(var(--clutch-secondary-dark))',
        },
        // SnowUI Design System Colors
        snow: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Neutral Colors
        'slate': {
          50: 'hsl(var(--slate-50))',
          100: 'hsl(var(--slate-100))',
          200: 'hsl(var(--slate-200))',
          300: 'hsl(var(--slate-300))',
          400: 'hsl(var(--slate-400))',
          500: 'hsl(var(--slate-500))',
          600: 'hsl(var(--slate-600))',
          700: 'hsl(var(--slate-700))',
          800: 'hsl(var(--slate-800))',
          900: 'hsl(var(--slate-900))',
        },
        // Enhanced Semantic Colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          light: 'hsl(var(--success-light))',
          dark: 'hsl(var(--success-dark))',
          50: 'hsl(var(--success-50))',
          100: 'hsl(var(--success-100))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          light: 'hsl(var(--warning-light))',
          dark: 'hsl(var(--warning-dark))',
          50: 'hsl(var(--warning-50))',
          100: 'hsl(var(--warning-100))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          light: 'hsl(var(--error-light))',
          dark: 'hsl(var(--error-dark))',
          50: 'hsl(var(--error-50))',
          100: 'hsl(var(--error-100))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          light: 'hsl(var(--info-light))',
          dark: 'hsl(var(--info-dark))',
          50: 'hsl(var(--info-50))',
          100: 'hsl(var(--info-100))',
        },
        // Background Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Luxury border radius
        'luxury-sm': '8px',
        'luxury-md': '12px',
        'luxury-lg': '16px',
        'luxury-xl': '20px',
        'luxury-2xl': '24px',
        'luxury-3xl': '32px',
        'luxury-full': '9999px',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        // Luxury typography
        'luxury-sans': ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'luxury-serif': ['Playfair Display', 'Georgia', 'serif'],
        'luxury-mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '32': 'var(--space-32)',
        '64': '16rem', // 256px
        '80': '20rem', // 320px
        '128': '32rem', // 512px
        // Luxury spacing
        'luxury-xs': '0.25rem', // 4px
        'luxury-sm': '0.5rem',  // 8px
        'luxury-md': '1rem',    // 16px
        'luxury-lg': '1.5rem',  // 24px
        'luxury-xl': '2rem',    // 32px
        'luxury-2xl': '3rem',   // 48px
        'luxury-3xl': '4rem',   // 64px
        'luxury-4xl': '6rem',   // 96px
        'luxury-5xl': '8rem',   // 128px
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)',
        // Luxury typography scale
        'luxury-xs': '0.75rem',    // 12px
        'luxury-sm': '0.875rem',   // 14px
        'luxury-base': '1rem',     // 16px
        'luxury-lg': '1.125rem',   // 18px
        'luxury-xl': '1.25rem',    // 20px
        'luxury-2xl': '1.5rem',    // 24px
        'luxury-3xl': '1.875rem',  // 30px
        'luxury-4xl': '2.25rem',   // 36px
        'luxury-5xl': '3rem',      // 48px
        'luxury-6xl': '3.75rem',   // 60px
        'luxury-7xl': '4.5rem',    // 72px
        'luxury-8xl': '6rem',      // 96px
        'luxury-9xl': '8rem',      // 128px
      },
      fontWeight: {
        'light': 'var(--font-weight-light)',
        'normal': 'var(--font-weight-normal)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
        'bold': 'var(--font-weight-bold)',
        'extrabold': 'var(--font-weight-extrabold)',
        // Luxury font weights
        'luxury-thin': '100',
        'luxury-extralight': '200',
        'luxury-light': '300',
        'luxury-normal': '400',
        'luxury-medium': '500',
        'luxury-semibold': '600',
        'luxury-bold': '700',
        'luxury-extrabold': '800',
        'luxury-black': '900',
      },
      lineHeight: {
        'tight': 'var(--line-height-tight)',
        'snug': 'var(--line-height-snug)',
        'normal': 'var(--line-height-normal)',
        'relaxed': 'var(--line-height-relaxed)',
        'loose': 'var(--line-height-loose)',
        // Luxury line heights
        'luxury-tight': '1.1',
        'luxury-snug': '1.2',
        'luxury-normal': '1.4',
        'luxury-relaxed': '1.6',
        'luxury-loose': '1.8',
        'luxury-extra-loose': '2.0',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        // Luxury shadows
        'luxury-sm': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'luxury-md': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.12)',
        'luxury-lg': '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.16)',
        'luxury-xl': '0 16px 64px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.20)',
        'luxury-2xl': '0 32px 128px rgba(0, 0, 0, 0.20), 0 16px 48px rgba(0, 0, 0, 0.24)',
        'luxury-glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'luxury-glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
        'luxury-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        // Luxury animations
        "luxury-fade-in": "luxury-fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        "luxury-slide-up": "luxury-slide-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "luxury-scale-in": "luxury-scale-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "luxury-float": "luxury-float 3s ease-in-out infinite",
        "luxury-glow": "luxury-glow 2s ease-in-out infinite alternate",
        "luxury-shimmer": "luxury-shimmer 2s linear infinite",
        "luxury-bounce": "luxury-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "luxury-pulse": "luxury-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "luxury-spin": "luxury-spin 1s linear infinite",
        "luxury-wiggle": "luxury-wiggle 0.5s ease-in-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Luxury keyframes
        "luxury-fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "luxury-slide-up": {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "luxury-scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "luxury-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "luxury-glow": {
          "0%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" },
        },
        "luxury-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "luxury-bounce": {
          "0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
          "40%, 43%": { transform: "translate3d(0,-8px,0)" },
          "70%": { transform: "translate3d(0,-4px,0)" },
          "90%": { transform: "translate3d(0,-2px,0)" },
        },
        "luxury-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "luxury-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "luxury-wiggle": {
          "0%, 7%": { transform: "rotateZ(0)" },
          "15%": { transform: "rotateZ(-15deg)" },
          "20%": { transform: "rotateZ(10deg)" },
          "25%": { transform: "rotateZ(-10deg)" },
          "30%": { transform: "rotateZ(6deg)" },
          "35%": { transform: "rotateZ(-4deg)" },
          "40%, 100%": { transform: "rotateZ(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
