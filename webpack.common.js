const webpack = require('webpack')
const dotenv = require('dotenv')

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
      use: ['@svgr/webpack']
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed)
    })
  ]
}