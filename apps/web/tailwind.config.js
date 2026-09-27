/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        surface: {
          page: '#f9f9f7',
          card: '#ffffff',
        },
        ink: {
          primary: '#0b0b0b',
          secondary: '#52514e',
          muted: '#898781',
        },
        border: {
          DEFAULT: '#e5e4de',
        },
        brand: {
          50: '#f1f0fb',
          100: '#e2e0f7',
          200: '#c5c1ef',
          300: '#a8a2e7',
          400: '#8b83df',
          500: '#534AB7',
          600: '#453e9b',
          700: '#37317c',
          800: '#29245d',
          900: '#1b183e',
        },
        series: {
          1: '#2a78d6',
          2: '#eb6834',
          3: '#1baf7a',
          4: '#eda100',
          5: '#e87ba4',
          6: '#008300',
          7: '#4a3aa7',
          8: '#e34948',
        },
        status: {
          good: '#0ca30c',
          warning: '#fab219',
          serious: '#ec835a',
          critical: '#d03b3b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,11,11,0.04), 0 1px 6px rgba(11,11,11,0.04)',
        popover: '0 4px 16px rgba(11,11,11,0.10)',
      },
    },
  },
  plugins: [],
};
