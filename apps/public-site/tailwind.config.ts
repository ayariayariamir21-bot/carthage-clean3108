import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef3f8",
          100: "#d7e2ee",
          200: "#b0c4dc",
          300: "#88a6c6",
          400: "#5e84ac",
          500: "#3b6690",
          600: "#1e3a5f",
          700: "#193150",
          800: "#142843",
          900: "#0f1f33",
        },
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 31 51 / 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
