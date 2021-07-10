const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        black: '#111',
        green: {
          50: '#f6f9f6',
          100: '#eef7eb',
          200: '#daf0ce',
          300: '#bae3a6',
          400: '#adce74',
          500: '#40ae3c',
          600: '#2f8e27',
          700: '#2e7027',
          800: '#295527',
          900: '#224423'
        },
        purple: 'white',
        'gray-text': '#7F86BD',
        'purple-strong': '#1931C9'
      },
      cursor: {
        grab: 'grab'
      },
      animation: {
        'from-left': 'fromLeft 0.3s ease-in-out'
      },
      transitionProperty: {
        'max-height': 'max-height'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
}
