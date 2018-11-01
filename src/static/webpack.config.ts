/* eslint-env node */
import * as webpack from 'webpack';
import * as path from 'path';
import {execSync} from 'child_process';

import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as CleanWebpackPlugin from 'clean-webpack-plugin';
import * as CompressionPlugin from 'compression-webpack-plugin';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';

const productionBuild = process.env.npm_lifecycle_script !== 'webpack-dev-server';
const git = execSync('git describe --always', {encoding: 'utf8'}).trim();

const config: webpack.Configuration = {
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
    extensions: ['.ts', '.js'],
    alias: {
      '@': __dirname
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'buble-loader',
        exclude: /node_modules/
      },
      {
        test: /\.ts/,
        loader: 'ts-loader',
        exclude: /node_modules/
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
    new webpack.DefinePlugin({
      __BUILD_DATE__: JSON.stringify(Date.now()),
      __BUILD_VERSION__: JSON.stringify(git)
    }),
    productionBuild ? new CompressionPlugin() : undefined
  ].filter(plugin => !!plugin),
  devtool: productionBuild ? 'source-map' : 'cheap-module-eval-source-map',
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

export default config;
