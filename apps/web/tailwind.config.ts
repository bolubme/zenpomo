import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:     "#FAF8F4",
        parchment: "#F2EBE0",
        latte:     "#E8DDD0",
        mocha:     "#C4A882",
        espresso:  "#3D2B1F",
        ink:       "#2A1E15",
        muted:     "#9C8878",
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "28px",
        "4xl": "36px",
      },
      boxShadow: {
        warm:   "0 4px 16px rgba(61,43,31,0.10)",
        "warm-lg": "0 12px 40px rgba(61,43,31,0.14)",
        "warm-sm": "0 1px 3px rgba(61,43,31,0.08)",
      },
      animation: {
        "fade-up":   "fade-up 0.5s ease both",
        "breathe":   "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.015)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
