#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
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
  outdir: 'dist/',
  sourcemap: true,
  minify: true
};

if (process.argv.includes('serve')) {
  esbuild.serve({servedir: 'dist/'}, options).catch(() => process.exit(1));
} else {
  esbuild.build(options).catch(() => process.exit(1));
}
