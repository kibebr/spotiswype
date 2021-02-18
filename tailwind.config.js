module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'grayish': '#484848',
        'grayzao': '#333333',
        'graygray': '#0d0d0d',
        'purple': '#010981',
        'gray-text': '#7F84C1',
        'purple-strong': '#184BFF'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  important: true
}
