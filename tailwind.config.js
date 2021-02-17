module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'graygray': '#0d0d0d'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
