const webpack = require('webpack')
const dotenv = require('dotenv')
const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: './src/index.tsx',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      loader: 'ts-loader'
    }, {
      test: /\.svg$/,
      exclude: /node_modules/,
      use: [{
        loader: '@svgr/webpack',
        options: {
          ref: true,
          icon: true
        }
      }, {
        loader: 'url-loader'
      }]
    }, {
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      loader: 'url-loader'
    }]
  },
  plugins: [
    new Dotenv({
      systemvars: true
    })
  ]
}
