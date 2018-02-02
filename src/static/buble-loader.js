/* eslint-env node */
const buble = require('buble');
const loaderUtils = require('loader-utils');
const path = require('path');

module.exports = function BubleLoader(source) {
  this.cacheable && this.cacheable();

  const options = Object.assign({transforms: {modules: false}}, loaderUtils.getOptions(this));
  const transformed = buble.transform(source, options);
  transformed.map.file = this.resourcePath;
  transformed.map.sources[0] = path.relative(process.cwd(), this.resourcePath);
  transformed.map.sourceRoot = process.cwd();
  this.callback(null, transformed.code, transformed.map);
};
