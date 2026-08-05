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
        background: "rgb(var(--color-bg) / <alpha-value>)",
        foreground: "rgb(var(--color-text) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(255 255 255 / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          foreground: "rgb(var(--color-text) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--color-border) / <alpha-value>)",
          foreground: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          foreground: "rgb(255 255 255 / <alpha-value>)",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          foreground: "rgb(var(--color-text) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
