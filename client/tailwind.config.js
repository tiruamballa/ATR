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
        void: '#0F172A',
        surface: '#1E293B',
        card: '#1E293B',
        cyber: {
          cyan: '#3B82F6',
          purple: '#8B5CF6',
          red: '#EF4444',
          yellow: '#F59E0B',
          pink: '#8B5CF6',
          success: '#22C55E'
        }
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cyan':   'none',
        'purple': 'none',
        'red':    'none',
        'yellow': 'none',
      },
      animation: {
        'float':      'float 4s ease-in-out infinite',
        'glow-pulse': 'none',
        'scanline':   'none',
      }
    },
  },
  plugins: [],
}
