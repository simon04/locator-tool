#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
function git(command) {
  return require('child_process').execSync(`git ${command}`, {encoding: 'utf8'}).trim();
}

const esbuild = require('esbuild');

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
    __BUILD_DATE__: JSON.stringify(git('log -1 --format=%cd --date=iso')),
    __BUILD_VERSION__: JSON.stringify(git('describe --always'))
  },
  outdir: 'dist/',
  sourcemap: true,
  minify: true
};

if (process.argv.includes('serve')) {
  esbuild.serve({servedir: 'dist/'}, options).catch(() => process.exit(1));
} else {
  esbuild.build(options).catch(() => process.exit(1));
}
