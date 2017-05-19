/* eslint-env node */
const pug = require('pug');

module.exports = function PugLoader(source) {
  this.cacheable && this.cacheable(true);
  const template = pug.compile(source, {});
  const html = template();
  return 'export default ' + JSON.stringify(html) + ';';
};
