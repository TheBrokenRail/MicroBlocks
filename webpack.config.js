const path = require('path');
const webpack = require('webpack');
const bundlePath = path.resolve(__dirname, 'dist/');

module.exports = {
  entry: './src/index.js',
  stats: 'verbose',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: path.resolve(__dirname, 'src/blockly.js'),
        use: ['babel-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/',
              publicPath: '/editor/assets/'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              camelCase: true
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    publicPath: bundlePath,
    filename: 'bundle.js'
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
};
