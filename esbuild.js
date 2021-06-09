#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
function git(command) {
  return require('child_process').execSync(`git ${command}`, {encoding: 'utf8'}).trim();
}
const __BUILD_DATE__ = git('log -1 --format=%cd --date=iso');
const __BUILD_VERSION__ = git('describe --always');

const esbuild = require('esbuild');
const fs = require('fs');

/**
 * @type {esbuild.BuildOptions}
 */
const options = {
  entryPoints: ['app/index.ts'],
  bundle: true,
  loader: {
    '.gif': 'file',
    '.html': 'text',
    '.png': 'file',
    '.svg': 'text'
  },
  define: {
    __BUILD_DATE__: JSON.stringify(__BUILD_DATE__),
    __BUILD_VERSION__: JSON.stringify(__BUILD_VERSION__)
  },
  outdir: 'dist/',
  sourcemap: true,
  minify: true
};

if (process.argv.includes('serve')) {
  esbuild.serve({servedir: 'dist/'}, options).catch(() => process.exit(1));
} else {
  esbuild.build(options).catch(() => process.exit(1));
  const index = 'dist/index.html';
  const html = fs
    .readFileSync(index, {encoding: 'utf8'})
    .replace(/"(index.css|index.js)[^"]*"/g, `"$1?${__BUILD_VERSION__}"`);
  fs.writeFileSync(index, html, {encoding: 'utf8'});
}
