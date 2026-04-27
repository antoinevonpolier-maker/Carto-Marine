import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#badbff',
          300: '#8bc4ff',
          400: '#55a1f0',
          500: '#2f80d9',
          600: '#1d63b8',
          700: '#194f94',
          800: '#193f73',
          900: '#18365f',
          950: '#0b1b33',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(13, 28, 52, 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config;
