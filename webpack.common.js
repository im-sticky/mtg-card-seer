/*eslint-env node*/

const path = require('path',);
const {CleanWebpackPlugin,} = require('clean-webpack-plugin',);

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist',),
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!.git',],
    }),
  ],
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname + '/src',),
    ],
    alias: {
      src: path.resolve(__dirname + '/src',),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              [
                'template-html-minifier', {
                  'modules': {
                    'lit-html': ['html',],
                    'lit-element': [
                      'html',
                      {'name': 'css', 'encapsulation': 'style',},
                    ],
                  },
                  'strictCSS': true,
                  'htmlMinifier': {
                    'collapseWhitespace': true,
                    'conservativeCollapse': true,
                    'removeComments': true,
                    'caseSensitive': true,
                    'minifyCSS': true,
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
};