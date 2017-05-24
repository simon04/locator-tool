/* eslint-env node */
const pug = require('pug');

module.exports = function PugLoader(source) {
  this.cacheable && this.cacheable(true);
  const template = pug.compile(source, {filename: this.resourcePath});
  const html = template();
  return html;
};
