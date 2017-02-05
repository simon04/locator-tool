/* eslint-env node */
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const NoPlugin = {
  apply: () => undefined
};

const productionBuild = process.env.npm_lifecycle_script !== 'webpack-dev-server';

module.exports = {
  entry: {
    main: './app/index.js',
    vendor: './app/vendor.js'
  },
  output: {
    path: productionBuild && './dist' || undefined,
    filename: '[name].[chunkhash].js',
    sourceMapFilename: '[name].[chunkhash].map'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(\.test.js$|node_modules)/
      }, {
        test: /\.html$/,
        loader: 'html-loader'
      }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader',
          fallback: 'style-loader'
        })
      }, {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ]
  },
  plugins: [
    productionBuild && new CleanWebpackPlugin(['./dist']) || NoPlugin,
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
    }),
    productionBuild && new CompressionPlugin() || NoPlugin,
  ],
  devServer: {
    port: 8184
  }
};
