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
        void: '#0B0F19',
        surface: '#111827',
        card: '#151D2F',
        cyber: {
          cyan: '#00F5D4',
          purple: '#7B61FF',
          red: '#FF6B6B',
          yellow: '#FACC15',
          pink: '#F472B6',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body:    ['Space Grotesk', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cyan':   '0 0 20px rgba(0,245,212,0.35)',
        'purple': '0 0 20px rgba(123,97,255,0.35)',
        'red':    '0 0 20px rgba(255,107,107,0.5)',
        'yellow': '0 0 20px rgba(250,204,21,0.4)',
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
