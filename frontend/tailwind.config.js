/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#030712', // deep slate black
          800: '#0b0f19', // dark navy slate
          700: '#111827', // medium dark slate
          600: '#1f2937', // lighter slate
          500: '#374151'
        },
        brand: {
          cyan: '#06b6d4',   // neon cyan
          violet: '#8b5cf6', // neon violet
          emerald: '#10b981', // neon emerald
          rose: '#f43f5e'     // neon rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'equalizer-1': 'equalize 1.2s ease-in-out infinite alternate',
        'equalizer-2': 'equalize 0.8s ease-in-out infinite alternate',
        'equalizer-3': 'equalize 1.5s ease-in-out infinite alternate',
        'equalizer-4': 'equalize 1.0s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.2), 0 0 10px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.6), 0 0 25px rgba(6, 182, 212, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        equalize: {
          '0%': { height: '10%' },
          '100%': { height: '100%' }
        }
      }
    },
  },
  plugins: [],
}
