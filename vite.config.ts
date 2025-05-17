import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {svgLoader} from './vite-svg-loader';
import {execSync} from 'child_process';
import {readFileSync} from 'fs';

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
  resolve: {
    alias: {
      'leaflet/dist/images/marker-icon-2x.png': 'leaflet/src/images/marker-icon-2x.png',
      'leaflet/dist/images/marker-icon.png': 'leaflet/src/images/marker-icon.png',
      'leaflet/dist/images/marker-shadow.png': 'leaflet/src/images/marker-shadow.png',
      'leaflet/dist/leaflet.css': 'leaflet/src/leaflet.css',
      leaflet: 'leaflet/src/LeafletWithGlobals.js'
    }
  },
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
  plugins: [vue(), svgLoader()]
});
