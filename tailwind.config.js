const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      sans: ['Karla', ...defaultTheme.fontFamily.sans]
    },
    extend: {
      colors: {
        green: {
          '50':  '#f6f9f6',
          '100': '#eef7eb',
          '200': '#daf0ce',
          '300': '#bae3a6',
          '400': '#adce74',
          '500': '#40ae3c',
          '600': '#2f8e27',
          '700': '#2e7027',
          '800': '#295527',
          '900': '#224423',
        },
        'purple': '#010981',
        'gray-text': '#7F84C1',
        'purple-strong': '#184BFF'
      },
      cursor: {
        grab: 'grab'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: []
}
