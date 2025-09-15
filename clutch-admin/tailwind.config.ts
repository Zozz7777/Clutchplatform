import type { Config } from "tailwindcss";

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
        // Light theme colors from design.json
        background: "oklch(1 0 0)",
        foreground: "oklch(0.1450 0 0)",
        card: {
          DEFAULT: "oklch(1 0 0)",
          foreground: "oklch(0.1450 0 0)",
        },
        primary: {
          DEFAULT: "oklch(0.5770 0.2450 27.3250)",
          foreground: "oklch(0.9850 0 0)",
        },
        secondary: {
          DEFAULT: "oklch(0.5770 0.2450 27.3250)",
          foreground: "oklch(0.9850 0 0)",
        },
        muted: {
          DEFAULT: "oklch(0.9700 0 0)",
          foreground: "oklch(0.5560 0 0)",
        },
        destructive: {
          DEFAULT: "oklch(0.5770 0.2450 27.3250)",
          foreground: "oklch(0.9850 0 0)",
        },
        border: "oklch(0.9220 0 0)",
        input: "oklch(0.9220 0 0)",
        ring: "oklch(0.7080 0 0)",
        sidebar: {
          DEFAULT: "oklch(0.9850 0 0)",
          primary: "oklch(0.2050 0 0)",
        },
        // Dark theme colors
        dark: {
          background: "oklch(0.1450 0 0)",
          foreground: "oklch(0.9850 0 0)",
          card: {
            DEFAULT: "oklch(0.2050 0 0)",
            foreground: "oklch(0.9710 0.0130 17.3800)",
          },
          primary: {
            DEFAULT: "oklch(0.5050 0.2130 27.5180)",
            foreground: "oklch(0.2050 0 0)",
          },
          secondary: {
            DEFAULT: "oklch(0.2690 0 0)",
            foreground: "oklch(0.9850 0 0)",
          },
          muted: {
            DEFAULT: "oklch(0.2690 0 0)",
            foreground: "oklch(0.5560 0 0)",
          },
          destructive: {
            DEFAULT: "oklch(0.7040 0.1910 22.2160)",
            foreground: "oklch(0.9850 0 0)",
          },
          border: "oklch(0.2750 0 0)",
          input: "oklch(0.3250 0 0)",
          ring: "oklch(0.5560 0 0)",
          sidebar: {
            DEFAULT: "oklch(0.2050 0 0)",
            primary: "oklch(0.5770 0.2450 27.3250)",
          },
        },
      },
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "sans-serif", "system-ui"],
        serif: ["Roboto Serif", "ui-serif", "serif"],
        mono: ["Roboto Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "0.625rem",
        md: "calc(0.625rem - 2px)",
        sm: "calc(0.625rem - 4px)",
      },
      boxShadow: {
        "2xs": "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
        sm: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
        md: "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)",
      },
      spacing: {
        base: "0.25rem",
      },
      letterSpacing: {
        normal: "0em",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
