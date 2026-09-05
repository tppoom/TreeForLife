import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f2f7f4",
          100: "#e1ede6",
          200: "#c4dcce",
          300: "#9bc3ad",
          400: "#6da387",
          500: "#4b8568",
          600: "#386b52",
          700: "#2d5442",
          800: "#254436",
          900: "#1f382d",
          950: "#0e1f18",
        },
        sand: {
          50: "#faf8f5",
          100: "#f4efe6",
          200: "#eae2d2",
          300: "#dcceb7",
          400: "#cbb799",
          500: "#b59d7d",
          600: "#9e8364",
          700: "#7f684f",
          800: "#675542",
          900: "#554637",
        },
        gold: {
          100: "#fdf8e6",
          200: "#faedbe",
          300: "#f5dd8c",
          400: "#eec750",
          500: "#d4a92c",
          600: "#b8871f",
          700: "#92631b",
          800: "#774e1c",
          900: "#64411b",
        },
        earth: {
          50: "#fbf6f2",
          100: "#f5eae2",
          200: "#ecd6c6",
          300: "#ddb9a2",
          400: "#cb987e",
          500: "#be7c5e",
          600: "#ab6449",
          700: "#8e4f3a",
          800: "#754233",
          900: "#61392d",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        thai: ["var(--font-thai)", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'card': '0 4px 20px -2px rgba(15, 41, 30, 0.06), 0 2px 6px -1px rgba(15, 41, 30, 0.03)',
        'elevated': '0 20px 30px -10px rgba(15, 41, 30, 0.12), 0 8px 15px -4px rgba(15, 41, 30, 0.06)',
        'gold': '0 4px 20px -2px rgba(212, 169, 44, 0.25)',
      }
    },
  },
  plugins: [],
};

export default config;
