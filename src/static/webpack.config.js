/* eslint-env node */
var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    main: './app/index.js',
    vendor: './app/vendor.js'
  },
  output: {
    filename: '[name].[chunkhash].js',
    sourceMapFilename: '[name].[chunkhash].map'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        exclude: /(\.test.js$|node_modules)/
      },
      {
        test: /\.html$/,
        loaders: ['html-loader']
      },
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/, loader: 'url-loader?limit=50000'}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
    })
  ]
};

if (process.env.NODE_ENV === 'DIST') {
  module.exports.output.path = './dist';
  module.exports.plugins = module.exports.plugins.concat([
    new CleanWebpackPlugin(['dist']),
    new webpack.optimize.UglifyJsPlugin()
  ]);
} else {
  module.exports.devServer = {
    port: 8184
  };
}
