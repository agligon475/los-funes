/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        funes: {
          50: '#fdf4f4',
          100: '#fbe8e8',
          200: '#f7d5d5',
          300: '#efb4b4',
          400: '#e38585',
          500: '#d35656',
          600: '#be3939',
          700: '#9f2d2d',
          800: '#842828',
          900: '#6f2626',
        },
        truco: {
          felt: '#0f3823', // Green baize table felt
          feltLight: '#164d30',
          feltDark: '#0a2618',
          gold: '#f59e0b',
          goldDark: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 15px -3px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 15px -3px rgba(16, 185, 129, 0.4)',
        'bottom-nav': '0 -4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
