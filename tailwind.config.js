/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.{js,ts,tsx}', './app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'yellow': '#FF8B00'
      },
      backgroundColor: {
        'yellow' : '#FF8B00'
      }
    },
  },
  plugins: [],
};
