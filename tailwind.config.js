/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8ff',
          100: '#d9ebff',
          500: '#2563eb',
          700: '#1d4ed8',
          900: '#10234d',
        },
      },
      boxShadow: {
        soft: '0 12px 35px -18px rgba(16, 35, 77, 0.35)',
      },
    },
  },
  plugins: [],
}
