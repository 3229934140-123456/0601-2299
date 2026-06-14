/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#1E6FFF",
          600: "#1559D9",
          700: "#0F47B3",
          800: "#0A358C",
          900: "#062366",
        },
        accent: {
          50: "#FFF3EC",
          100: "#FFE1D0",
          200: "#FFC9A8",
          300: "#FFA875",
          400: "#FF8A4A",
          500: "#FF6B35",
          600: "#E8521C",
          700: "#BF3F13",
          800: "#96300E",
          900: "#6D220A",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        surface: "#F0F4F8",
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"SF Mono"', "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 8px 24px rgba(15, 23, 42, 0.10)",
        pop: "0 4px 20px rgba(30, 111, 255, 0.15)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      animation: {
        "bounce-soft": "bounce-soft 0.5s ease-out",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      keyframes: {
        "bounce-soft": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "1" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateX(16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
