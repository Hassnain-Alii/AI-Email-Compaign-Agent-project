/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          25:  '#f0f9ff',
          50:  '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          dark: '#0f172a',
          'dark-secondary': '#1e293b',
          'dark-tertiary': '#334155',
        },
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#334155',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
        'gradient-purple': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'inner-brand': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'bounce-subtle': 'bounceSubtle 1s ease infinite',
      },
      keyframes: {
        fadeIn:      { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:     { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInLeft: { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:     { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseSoft:   { '0%,100%': { opacity: '1' }, '50%': { opacity: '.6' } },
        bounceSubtle:{ '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-3px)' } },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
