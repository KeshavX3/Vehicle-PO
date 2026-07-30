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
          bg: '#0B0F19',
          'bg-soft': '#111726',
          surface: '#161F33',
          'surface-2': '#1E2942',
          'surface-3': '#263452',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(59, 130, 246, 0.35)',
          text: '#F8FAFC',
          muted: '#94A3B8',
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
        'cockpit-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
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
