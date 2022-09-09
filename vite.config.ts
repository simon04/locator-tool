import {defineConfig} from 'vite';
import {execSync} from 'child_process';
import {readFileSync, writeFileSync} from 'fs';

function git(command: string): string {
  return execSync(`git ${command}`, {encoding: 'utf8'}).trim();
}

process.env.VITE_BUILD_DATE = git('log -1 --format=%cd --date=iso');
process.env.VITE_BUILD_VERSION = git('describe --always');

process.env.VITE_APP_DEPENDENCIES = Object.keys(
  JSON.parse(readFileSync('./package.json')).dependencies
)
  .map(dependency => JSON.parse(readFileSync(`node_modules/${dependency}/package.json`)))
  .map(({name, version, license, homepage}) => ({name, version, license, homepage}));

// https://vitejs.dev/config/
export default defineConfig({});
