/* eslint-env node */
const webpack = require('webpack');
const path = require('path');
const {execSync} = require('child_process');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const productionBuild = process.env.npm_lifecycle_script !== 'webpack-dev-server';

class DefineBuildInfo extends webpack.DefinePlugin {
  constructor() {
    super({});
  }
  apply(compiler) {
    const git = execSync('git describe --always', {encoding: 'utf8'}).trim();
    this.definitions = {
      __BUILD_DATE__: JSON.stringify(Date.now()),
      __BUILD_VERSION__: JSON.stringify(git)
    };
    super.apply(compiler);
  }
}

module.exports = {
  mode: productionBuild ? 'production' : 'development',
  entry: ['./app/index.js', './app/vendor.js', './app/vendor-leaflet.js'],
  output: {
    path: productionBuild ? path.join(__dirname, 'dist') : undefined,
    filename: '[name].[chunkhash].js',
    sourceMapFilename: '[name].[chunkhash].map'
  },
  optimization: {
    splitChunks: {chunks: 'all'}
  },
  performance: {
    hints: false
  },
  resolve: {
    alias: {
      '@': __dirname
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'buble-loader',
        exclude: /(\.test.js$|node_modules)/
      },
      {
        test: /\.pug$/,
        loader: ['html-loader', './pug-loader']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ]
  },
  plugins: [
    productionBuild ? new CleanWebpackPlugin(['./dist']) : undefined,
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      template: './app/index.pug',
      favicon: './app/locator-tool.svg',
      inject: 'body'
    }),
    new DefineBuildInfo(),
    productionBuild ? new CompressionPlugin() : undefined
  ].filter(plugin => !!plugin),
  devtool: productionBuild ? 'source-map' : undefined,
  devServer: {
    proxy: {
      '/render/tlgbe/**': {
        target: 'https://tools.wmflabs.org/',
        changeOrigin: true
      }
    },
    port: 8184
  }
};
