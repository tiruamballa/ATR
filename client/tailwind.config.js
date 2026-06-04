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
        void: '#0B0F14',
        surface: '#111827',
        card: '#151B26',
        cyber: {
          cyan: '#22D3EE',
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
        'cyan':   '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'purple': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'red':    '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'yellow': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'float':      'float 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'scanline':   'scanline 6s linear infinite',
      }
    },
  },
  plugins: [],
}
