export function getFilePath(file, width) {
  file = file.replace(/^File:/, '');
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}`;
  if (width >= 2048) {
    return url;
  } else if (width >= 1280) {
    return `${url}?width=2048`;
  } else {
    return `${url}?width=1024`;
  }
}
