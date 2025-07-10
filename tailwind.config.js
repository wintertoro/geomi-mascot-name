/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from Figma
        'neutral': {
          100: '#f4f2ee',
          950: '#0e0707',
        },
        'blaze': {
          600: '#ff5400',
        },
        'sky-blue': {
          500: '#28b6ff',
          600: '#1fa1ff',
        },
        'olive': {
          500: '#609057',
        },
        'brand-light': '#f8f8f8',
      },
      fontFamily: {
        'zagma': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['DM Mono', 'monospace'],
      },
      fontSize: {
        'body-sm': ['12px', '16px'],
        'body-md': ['14px', '20px'],
        'mono-sm': ['12px', '16px'],
      },
    },
  },
  plugins: [],
}; 