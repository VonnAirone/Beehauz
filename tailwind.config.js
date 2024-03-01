/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.{js,ts,tsx}', './app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'yellow': '#FFA233'
      },
      backgroundColor: {
        'yellow' : '#FFA233'
      }
    },
  },
  plugins: [],
};
