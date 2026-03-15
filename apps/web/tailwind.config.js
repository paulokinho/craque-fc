/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: { DEFAULT: '#0A1628', light: '#0D1F3C', card: '#132038' },
        gold: { DEFAULT: '#F9CB42', dark: '#BA7517' },
        verde: '#00A650',
        azul: '#009ADE',
        muted: '#7A8BA8',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
