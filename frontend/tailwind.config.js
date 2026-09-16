/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2430",
        paper: "#F6F5F1",
        slate: "#4A5568",
        accent: "#2F6F5E",
        accentDark: "#234F43",
        line: "#DDD8CC",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["'Source Serif 4'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
