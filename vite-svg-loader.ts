import {Plugin} from 'vite';
import {compileTemplate} from '@vue/compiler-sfc';
import {readFile} from 'fs/promises';

// inspired by:
// - https://github.com/jpkleemans/vite-svg-loader/blob/main/index.js
// - https://github.com/visualfanatic/vite-svg/blob/master/packages/vite-plugin-vue-svg/index.js
const svgRegex = /\.svg\?component$/;

export const svgLoader = (): Plugin => ({
  name: 'svg-loader',
  enforce: 'pre',
  load(id) {
    if (!svgRegex.test(id)) return;
    const filename = id.replace(svgRegex, '.svg');
    return readFile(filename, 'utf8');
  },
  transform(source, id) {
    if (!svgRegex.test(id)) return;
    const filename = id.replace(svgRegex, '.svg');
    const {code} = compileTemplate({
      id,
      source,
      filename,
      transformAssetUrls: false
    });
    return `${code}\nexport default render`;
  }
});
