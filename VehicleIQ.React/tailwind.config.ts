/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cockpit: {
          bg: '#0B0B0C',
          'bg-soft': '#141418',
          surface: '#1C1C1F',
          'surface-2': '#252529',
          border: '#2A2A2E',
          text: '#F4F4F5',
          muted: '#71717A',
          amber: '#F59E0B',
          green: '#22C55E',
          red: '#EF4444',
          blue: '#3B82F6',
        },
        navy: {
          900: '#0B0B0C',
          800: '#141418',
          700: '#1C1C1F',
          600: '#252529',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
      },
      opacity: {
        '2':  '0.02',
        '4':  '0.04',
        '6':  '0.06',
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
        '18': '0.18',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gauge-fill': 'gaugeFill 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px rgba(245, 158, 11, 0.2))' },
        },
        gaugeFill: {
          '0%': { strokeDashoffset: '283' },
        },
      },
    },
  },
  plugins: [],
};
