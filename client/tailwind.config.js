/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f4a9b8',
          400: '#ec738e',
          500: '#df4267',
          600: '#cb264f',
          700: '#aa1c3e',
          800: '#8d1a36',
          900: '#771a31',
          950: '#430916',
        },
        gold: {
          50: '#faf7ed',
          100: '#f4eed5',
          200: '#eadeab',
          300: '#dec77b',
          400: '#d4af37',
          500: '#ba9427',
          600: '#9b741f',
          700: '#7c571c',
          800: '#67461c',
          900: '#583a1c',
          950: '#321e0d',
        },
        ivory: {
          50: '#ffffff',
          100: '#fffdfa',
          200: '#fdf9f2',
          300: '#faf4e7',
          400: '#f5ebdb',
          500: '#eee0cc',
        },
        charcoal: {
          800: '#2b2627',
          900: '#1e1b1c',
          950: '#121011',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 4px 20px -2px rgba(212, 175, 55, 0.25)',
        'rose-glow': '0 4px 20px -2px rgba(203, 38, 79, 0.25)',
      }
    },
  },
  plugins: [],
}

