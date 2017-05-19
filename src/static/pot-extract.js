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
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (file.match(/\.pug$/)) {
      extractor.parse(file, pug.compile(content)());
    } else {
      extractor.parse(file, content);
    }
  });
}).on('end', () => {
  fs.writeFileSync(destination, extractor.toString());
});
