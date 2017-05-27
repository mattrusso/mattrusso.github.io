const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './index.html',
  filename: 'index.html',
  inject: 'body'
})

const loaders = {
    jsxLoader: {
        test: /\.jsx?$/,
        exclude: /node_modules|typescript|\.test\.js/,
        loader: 'babel-loader',
    },
    scssLoader: {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader!sass-loader',
    },
    cssLoader: {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader',
    }
};

module.exports = { 
  entry: './index.js', 
  output: { 
    path: path.join(__dirname, './'),
    publicPath: './', // instead of publicPath: '/build/' 
    filename: 'bundle.js'
  }, 
  module: { 
    loaders: [ 
      loaders.jsxLoader,
      loaders.scssLoader,
      loaders.cssLoader
    ]
  }, 
  plugins: [HtmlWebpackPluginConfig]
}
