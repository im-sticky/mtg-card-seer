/*eslint-env node*/

const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
    new HtmlWebpackPlugin({
      title: 'MTG Card Seer',
      template: 'example/index.html',
      minify: {
        removeRedundantAttributes: true,
        removeEmptyElements: false,
      },
    }),
  ],
});