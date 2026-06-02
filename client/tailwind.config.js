/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // dark mode support
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0F1D',      // Deep cyber background
          card: 'rgba(17, 24, 39, 0.7)', // Semi-transparent card
          border: 'rgba(255, 255, 255, 0.08)',
        },
        cyber: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          purple: '#a855f7',
          pink: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
