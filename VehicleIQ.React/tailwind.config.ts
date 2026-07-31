/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cockpit: {
          bg: 'var(--bg-main)',
          'bg-soft': 'var(--bg-soft)',
          surface: 'var(--bg-surface)',
          'surface-2': 'var(--bg-surface-2)',
          'surface-3': 'var(--bg-surface-hover)',
          border: 'var(--border-color)',
          'border-hover': 'var(--border-color-hover)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          azure: '#3B82F6',
          'azure-glow': 'rgba(59, 130, 246, 0.25)',
          amber: '#F59E0B',
          cyan: '#06B6D4',
          green: '#10B981',
          red: '#EF4444',
          purple: '#8B5CF6',
        },
      },
      boxShadow: {
        'cockpit-glow': '0 0 25px -5px rgba(59, 130, 246, 0.15)',
        'cockpit-amber-glow': '0 0 25px -5px rgba(245, 158, 11, 0.2)',
        'cockpit-card': 'var(--card-shadow)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.2))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
