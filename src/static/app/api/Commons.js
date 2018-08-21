import md5 from 'js-md5';

// based on https://github.com/derhuerst/commons-photo-url/blob/master/index.js
export function getFilePath(file, width) {
  file = file.replace(/^File:/, '').replace(/\s+/g, '_');
  const encoded = encodeURIComponent(file);
  const base = 'https://upload.wikimedia.org/wikipedia/commons';
  const hash = md5.hex(file);
  const ns = `${hash[0]}/${hash[0]}${hash[1]}`;
  if (width) {
    // thumbnail
    return `${base}/thumb/${ns}/${encoded}/${width}px-${encoded}`;
  } else {
    return `${base}/${ns}/${encoded}`;
  }
}
