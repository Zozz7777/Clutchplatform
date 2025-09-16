import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors using OKLCH for exact color matching
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        error: {
          DEFAULT: "var(--error)",
          foreground: "var(--error-foreground)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: {
          DEFAULT: "var(--ring)",
          ring: "var(--ring-ring)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          primary: "var(--sidebar-primary)",
        },
      },
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "sans-serif", "system-ui"],
        serif: ["Roboto Serif", "ui-serif", "serif"],
        mono: ["Roboto Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        // Design system border radius scale based on 0.625rem base
        none: "0",
        sm: "0.125rem",      // 2px
        md: "0.375rem",      // 6px
        lg: "0.625rem",      // 10px - design system base
        xl: "0.75rem",       // 12px
        "2xl": "1rem",       // 16px
        "3xl": "1.5rem",     // 24px
        full: "9999px",
      },
      boxShadow: {
        "2xs": "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
        sm: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
        md: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)",
      },
      spacing: {
        // Design system spacing scale based on 0.25rem base unit
        "0": "0",
        "0.5": "0.125rem",   // 2px
        "1": "0.25rem",      // 4px - base unit
        "1.5": "0.375rem",   // 6px
        "2": "0.5rem",       // 8px
        "2.5": "0.625rem",   // 10px
        "3": "0.75rem",      // 12px
        "3.5": "0.875rem",   // 14px
        "4": "1rem",         // 16px
        "5": "1.25rem",      // 20px
        "6": "1.5rem",       // 24px
        "7": "1.75rem",      // 28px
        "8": "2rem",         // 32px
        "9": "2.25rem",      // 36px
        "10": "2.5rem",      // 40px
        "11": "2.75rem",     // 44px
        "12": "3rem",        // 48px
        "14": "3.5rem",      // 56px
        "16": "4rem",        // 64px
        "20": "5rem",        // 80px
        "24": "6rem",        // 96px
        "28": "7rem",        // 112px
        "32": "8rem",        // 128px
        "36": "9rem",        // 144px
        "40": "10rem",       // 160px
        "44": "11rem",       // 176px
        "48": "12rem",       // 192px
        "52": "13rem",       // 208px
        "56": "14rem",       // 224px
        "60": "15rem",       // 240px
        "64": "16rem",       // 256px
        "72": "18rem",       // 288px
        "80": "20rem",       // 320px
        "96": "24rem",       // 384px
        // Design system semantic spacing tokens
        base: "0.25rem",     // Design system base unit
        xs: "0.125rem",      // 2px - extra small
        sm: "0.5rem",        // 8px - small
        md: "1rem",          // 16px - medium
        lg: "1.5rem",        // 24px - large
        xl: "2rem",          // 32px - extra large
      },
      letterSpacing: {
        // Design system letter spacing scale
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",        // Design system base
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      animation: {
        // Design system animations
        "fade-in": "fadeIn 0.3s ease-in-out",
        "fade-in-fast": "fadeIn 0.15s ease-in-out",
        "fade-in-slow": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-up-fast": "slideUp 0.15s ease-out",
        "slide-up-slow": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-down-fast": "slideDown 0.15s ease-out",
        "slide-down-slow": "slideDown 0.5s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "scale-in-fast": "scaleIn 0.1s ease-out",
        "scale-in-slow": "scaleIn 0.4s ease-out",
        "scale-out": "scaleOut 0.2s ease-in",
        "scale-out-fast": "scaleOut 0.1s ease-in",
        "scale-out-slow": "scaleOut 0.4s ease-in",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
      transitionDuration: {
        // Design system transition durations
        "fast": "0.15s",
        "normal": "0.2s",
        "slow": "0.3s",
      },
      transitionTimingFunction: {
        // Design system easing functions
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { 
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideDown: {
          "0%": { 
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": { 
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        scaleIn: {
          "0%": { 
            opacity: "0",
            transform: "scale(0.95)",
          },
          "100%": { 
            opacity: "1",
            transform: "scale(1)",
          },
        },
        scaleOut: {
          "0%": { 
            opacity: "1",
            transform: "scale(1)",
          },
          "100%": { 
            opacity: "0",
            transform: "scale(0.95)",
          },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
