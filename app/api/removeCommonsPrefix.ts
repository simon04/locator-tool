export function removeCommonsPrefix(string: string, prefix: string): string {
  const urlPrefix = 'https://commons.wikimedia.org/wiki/';
  if (string.startsWith(urlPrefix)) {
    string = string.slice(urlPrefix.length);
    string = decodeURI(string);
  }
  if (string.startsWith(prefix)) {
    string = string.slice(prefix.length);
  }
  return string;
}
