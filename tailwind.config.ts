import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "growthscape-sm": "0 1px 2px rgba(108, 92, 231, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
        "growthscape-md": "0 4px 6px rgba(108, 92, 231, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08)",
        "growthscape-lg": "0 10px 15px rgba(108, 92, 231, 0.08), 0 4px 6px rgba(0, 0, 0, 0.10)",
        "growthscape-xl": "0 20px 25px rgba(108, 92, 231, 0.10), 0 8px 10px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      transitionTimingFunction: {
        "growthscape": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      transitionDuration: {
        "fast": "150ms",
        "normal": "250ms",
        "slow": "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
