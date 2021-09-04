/*eslint-env node*/

const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  optimization: {
    usedExports: true,
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'example/*.(txt|dek)',
        }
      ]
    }),
    new HtmlWebpackPlugin({
      title: 'MTG Card Seer',
      template: 'example/index.html',
    }),
    new HtmlWebpackPlugin({
      title: 'MTG Card Seer',
      template: 'example/decks.html',
      filename: 'decks.html',
    }),
  ],
});