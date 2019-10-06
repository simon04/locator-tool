#!/usr/bin/env node
/* eslint-env node */
const Extractor = require('angular-gettext-tools').Extractor;
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const pug = require('pug');

const destination = path.join(__dirname, 'po', 'locator-tool.pot');

const extractor = new Extractor({
  lineNumbers: false,
  extensions: {
    pug: 'html'
  }
});

glob('./{,app/**/}*.{js,pug}', (err, files) => {
  if (err) {
    throw err;
  }
  files.forEach(filename => {
    const content = fs.readFileSync(filename, 'utf8');
    if (filename.match(/\.pug$/)) {
      extractor.parse(filename, pug.compile(content, {filename})());
    } else {
      extractor.parse(filename, content);
    }
  });
}).on('end', () => {
  fs.writeFileSync(destination, extractor.toString());
});
