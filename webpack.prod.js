const path = require('path')
const common = require('./webpack.common.js')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[name].[contenthash].bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader'
      ]
    }, {
      include: path.resolve('node_modules', 'fp-ts'),
      sideEffects: false
    }]
  },
  plugins: [
    new ESLintPlugin({
      emitError: true,
      failOnError: true
    }),
    new MiniCssExtractPlugin({ filename: '[name].css' })
  ],
  optimization: {
    minimize: true,
    usedExports: true,
    minimizer: [
      new TerserWebpackPlugin(),
      new CssMinimizerPlugin(),
      new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: {
          removeComments: true,
          removeEmptyElements: true,
          removeTagWhitespace: true,
          removeRedundantAttributes: true,
          collapseWhitespace: true
        }
      })
    ]
  }
})
