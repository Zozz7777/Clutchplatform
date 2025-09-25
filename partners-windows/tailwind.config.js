/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors from design.json
        background: "oklch(1 0 0)",
        foreground: "oklch(0.1450 0 0)",
        card: "oklch(1 0 0)",
        "card-foreground": "oklch(0.1450 0 0)",
        primary: "oklch(0.5770 0.2450 27.3250)",
        "primary-foreground": "oklch(0.9850 0 0)",
        secondary: "oklch(0.5770 0.2450 27.3250)",
        muted: "oklch(0.9700 0 0)",
        "muted-foreground": "oklch(0.5560 0 0)",
        destructive: "oklch(0.5770 0.2450 27.3250)",
        border: "oklch(0.9220 0 0)",
        input: "oklch(0.9220 0 0)",
        ring: "oklch(0.7080 0 0)",
        sidebar: "oklch(0.9850 0 0)",
        "sidebar-primary": "oklch(0.2050 0 0)",
        success: "oklch(0.72 0.2 145)",
        warning: "oklch(0.85 0.18 75)",
        info: "oklch(0.75 0.1 220)",
        
        // Dark mode colors
        "dark-background": "oklch(0.1450 0 0)",
        "dark-foreground": "oklch(0.9850 0 0)",
        "dark-card": "oklch(0.2050 0 0)",
        "dark-card-foreground": "oklch(0.9710 0.0130 17.3800)",
        "dark-primary": "oklch(0.5050 0.2130 27.5180)",
        "dark-primary-foreground": "oklch(0.2050 0 0)",
        "dark-secondary": "oklch(0.2690 0 0)",
        "dark-muted": "oklch(0.2690 0 0)",
        "dark-destructive": "oklch(0.7040 0.1910 22.2160)",
        "dark-border": "oklch(0.2750 0 0)",
        "dark-input": "oklch(0.3250 0 0)",
        "dark-ring": "oklch(0.5560 0 0)",
        "dark-sidebar": "oklch(0.2050 0 0)",
        "dark-sidebar-primary": "oklch(0.5770 0.2450 27.3250)"
      },
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "sans-serif", "system-ui"],
        serif: ["Roboto Serif", "ui-serif", "serif"],
        mono: ["Roboto Mono", "ui-monospace", "monospace"]
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem"
      },
      fontWeight: {
        light: "300",
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700"
      },
      lineHeight: {
        tight: "1.25",
        normal: "1.5",
        relaxed: "1.75"
      },
      borderRadius: {
        DEFAULT: "0.625rem"
      },
      boxShadow: {
        "2xs": "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
        sm: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
        md: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)"
      },
      zIndex: {
        dropdown: "1000",
        sticky: "1100",
        modal: "1200",
        popover: "1300",
        tooltip: "1400"
      },
      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms"
      },
      transitionTimingFunction: {
        "in": "cubic-bezier(0.4, 0, 1, 1)",
        "out": "cubic-bezier(0, 0, 0.2, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
  darkMode: 'class'
}
