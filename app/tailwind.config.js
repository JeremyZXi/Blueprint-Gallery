/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Cinzel Decorative', 'serif'],
        subheading: ['Cormorant', 'serif'],
        body: ['EB Garamond', 'serif'],
      },
    },
  },
  plugins: [],
};