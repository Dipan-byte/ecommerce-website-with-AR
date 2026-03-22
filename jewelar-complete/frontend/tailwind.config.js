/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  "#fdf9ee",
          100: "#f9efcc",
          200: "#f2db95",
          300: "#ecc355",
          400: "#e5ac2a",
          500: "#d4941a",
          600: "#b87213",
          700: "#925313",
          800: "#784216",
          900: "#663717",
        },
        jewel: {
          dark:  "#0d0b0e",
          deep:  "#1a1520",
          card:  "#211c2a",
          border:"#332b40",
        },
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "fade-up": "fadeUp 0.5s ease forwards",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeUp: {
          "0%":   { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
