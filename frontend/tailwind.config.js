/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#1E293B",
        input: "#112240",
        ring: "#00FF94",
        background: "#000000",
        foreground: "#E2E8F0",
        primary: {
          DEFAULT: "#00FF94",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#112240",
          foreground: "#00FF94",
        },
        destructive: {
          DEFAULT: "#FF0055",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#020c1b",
          foreground: "#8892b0",
        },
        accent: {
          DEFAULT: "#112240",
          foreground: "#00FF94",
        },
        popover: {
          DEFAULT: "#0A192F",
          foreground: "#E2E8F0",
        },
        card: {
          DEFAULT: "#0A192F",
          foreground: "#E2E8F0",
        },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
