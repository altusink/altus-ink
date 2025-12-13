import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0.625rem",  /* 10px */
        md: "0.5rem",    /* 8px */
        sm: "0.25rem",   /* 4px */
        xl: "1rem",      /* 16px */
        "2xl": "1.5rem", /* 24px */
      },
      colors: {
        // ENTERPRISE DESIGN SYSTEM MAPPING
        background: "hsl(var(--color-neutral-0) / <alpha-value>)",
        foreground: "hsl(0 0% 100% / <alpha-value>)",

        brand: {
          primary: "hsl(var(--color-brand-primary) / <alpha-value>)",
          secondary: "hsl(var(--color-brand-secondary) / <alpha-value>)",
          accent: "hsl(var(--color-brand-accent) / <alpha-value>)",
          success: "hsl(var(--color-brand-success) / <alpha-value>)",
          warning: "hsl(var(--color-brand-warning) / <alpha-value>)",
          error: "hsl(var(--color-brand-error) / <alpha-value>)",
          info: "hsl(var(--color-brand-info) / <alpha-value>)",
          gold: "hsl(45 100% 50% / <alpha-value>)", // Fallback/Legacy
        },

        neutral: {
          0: "hsl(var(--color-neutral-0) / <alpha-value>)",
          50: "hsl(var(--color-neutral-50) / <alpha-value>)",
          100: "hsl(var(--color-neutral-100) / <alpha-value>)",
          200: "hsl(var(--color-neutral-200) / <alpha-value>)",
          300: "hsl(var(--color-neutral-300) / <alpha-value>)",
          400: "hsl(var(--color-neutral-400) / <alpha-value>)",
          500: "hsl(var(--color-neutral-500) / <alpha-value>)",
          600: "hsl(var(--color-neutral-600) / <alpha-value>)",
          700: "hsl(var(--color-neutral-700) / <alpha-value>)",
          800: "hsl(var(--color-neutral-800) / <alpha-value>)",
          900: "hsl(var(--color-neutral-900) / <alpha-value>)",
        },

        // LOGICAL MAPPINGS FOR SHADCN COMPATIBILITY
        primary: {
          DEFAULT: "hsl(var(--color-brand-primary) / <alpha-value>)",
          foreground: "white",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-brand-secondary) / <alpha-value>)",
          foreground: "black",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-brand-error) / <alpha-value>)",
          foreground: "white",
        },
        muted: {
          DEFAULT: "hsl(var(--color-neutral-800) / <alpha-value>)",
          foreground: "hsl(var(--color-neutral-400) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--color-brand-accent) / <alpha-value>)",
          foreground: "white",
        },
        popover: {
          DEFAULT: "hsl(var(--color-neutral-900) / <alpha-value>)",
          foreground: "white",
        },
        card: {
          DEFAULT: "hsl(var(--color-neutral-900) / <alpha-value>)",
          foreground: "white",
        },
        border: "hsl(var(--color-neutral-800) / <alpha-value>)",
        input: "hsl(var(--color-neutral-800) / <alpha-value>)",
        ring: "hsl(var(--color-brand-primary) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "var(--font-sans)", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)"],
        mono: ["JetBrains Mono", "var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      backdropBlur: {
        xs: "2px",
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
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "border-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "border-flow": "border-flow 3s linear infinite",
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(201, 162, 39, 0.4), 0 0 40px rgba(201, 162, 39, 0.2)",
        "glow-cyan": "0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2)",
        "glow-magenta": "0 0 20px rgba(255, 0, 255, 0.4), 0 0 40px rgba(255, 0, 255, 0.2)",
        "glow-green": "0 0 20px rgba(57, 255, 20, 0.4), 0 0 40px rgba(57, 255, 20, 0.2)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)",
        "neon": "0 0 5px currentColor, 0 0 20px currentColor, 0 0 40px currentColor",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
