import {execSync} from 'child_process';
import {readFileSync} from 'fs';

import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite-plus';

import {svgLoader} from './vite-svg-loader.ts';

function git(command: string): string {
  return execSync(`git ${command}`, {encoding: 'utf8'}).trim();
}

process.env.VITE_BUILD_DATE = git('log -1 --format=%cd --date=iso');
process.env.VITE_BUILD_VERSION = git('describe --always');

process.env.VITE_APP_DEPENDENCIES = JSON.stringify(
  Object.keys(JSON.parse(readFileSync('./package.json')).dependencies)
    .map(dependency => JSON.parse(readFileSync(`node_modules/${dependency}/package.json`)))
    .map(({name, version, license, homepage}) => ({name, version, license, homepage}))
);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[hash:19].js'
      }
    }
  },
  server: {
    proxy: {
      '/catscan': {
        target: 'https://locator-tool.toolforge.org/',
        changeOrigin: true
      }
    }
  },
  plugins: [vue(), svgLoader()],
  fmt: {
    arrowParens: 'avoid',
    bracketSpacing: false,
    htmlWhitespaceSensitivity: 'css',
    ignorePatterns: ['app/i18n.json'],
    printWidth: 100,
    singleQuote: true,
    sortImports: {},
    trailingComma: 'none'
  },
  lint: {},
  staged: {
    '*': 'vp fmt --no-error-on-unmatched-pattern'
  }
});
