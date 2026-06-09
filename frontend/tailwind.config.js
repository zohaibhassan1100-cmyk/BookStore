/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
        surface: { 50:'#f8fafc', 100:'#f1f5f9', 200:'#e2e8f0', 300:'#cbd5e1', DEFAULT:'#ffffff' },
        ink:     { DEFAULT:'#0f172a', subtle:'#1e293b', muted:'#475569', faint:'#94a3b8' },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / .08), 0 1px 2px -1px rgb(0 0 0 / .04)',
        pop:  '0 10px 40px -8px rgb(99 102 241 / .25)',
        lg:   '0 4px 24px -2px rgb(0 0 0 / .08)',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
    },
  },
  plugins: [],
};
