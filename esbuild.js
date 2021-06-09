#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
function git(command) {
  return require('child_process').execSync(`git ${command}`, {encoding: 'utf8'}).trim();
}
const __BUILD_DATE__ = git('log -1 --format=%cd --date=iso');
const __BUILD_VERSION__ = git('describe --always');

const esbuild = require('esbuild');
const {readFileSync, writeFileSync} = require('fs');

const __APP_DEPENDENCIES__ = Object.keys(JSON.parse(readFileSync('./package.json')).dependencies)
  .map(dependency => JSON.parse(readFileSync(`node_modules/${dependency}/package.json`)))
  .map(({name, version, license, homepage}) => ({name, version, license, homepage}));

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
    __APP_DEPENDENCIES__: JSON.stringify(__APP_DEPENDENCIES__),
    __BUILD_DATE__: JSON.stringify(__BUILD_DATE__),
    __BUILD_VERSION__: JSON.stringify(__BUILD_VERSION__)
  },
  outdir: 'dist/',
  sourcemap: true,
  minify: true
};

if (process.argv.includes('serve')) {
  esbuild
    .serve({servedir: 'dist/'}, options)
    .then(result => console.log(`Serving application on http://${result.host}:${result.port}/`))
    .catch(() => process.exit(1));
} else {
  esbuild.build(options).catch(() => process.exit(1));
  const index = 'dist/index.html';
  const html = readFileSync(index, {encoding: 'utf8'}).replace(
    /"(index.css|index.js)[^"]*"/g,
    `"$1?${__BUILD_VERSION__}"`
  );
  writeFileSync(index, html, {encoding: 'utf8'});
}
