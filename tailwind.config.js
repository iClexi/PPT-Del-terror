/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arcade: ['"Press Start 2P"', 'cursive'],
        sans: ['Roboto', 'sans-serif'],
      },
      colors: {
        'retro-bg': '#1a1a2e',
        'retro-accent': '#e94560',
        'retro-text': '#edf2f4',
      },
    },
  },
  plugins: [],
};
