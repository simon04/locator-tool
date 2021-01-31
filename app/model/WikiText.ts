import {LatLng} from '.';

/**
 * Adds a {{Location}} template containing `lat`, `lng` to the `wikitext`.
 * Replaces previously specified `{{Location}}`, `{{Location dec}}` templates.
 */
export function addLocationToWikiText(ll: LatLng, text: string): string {
  const location = `{{${ll.type}|${ll.lat}|${ll.lng}`;
  const type =
    ll.type === 'Location' ? /\{\{\s*Location( dec)?\s*/ : /\{\{\s*Object location(dec )?\s*/;
  const numeric = /(\|\s*([1-9]\s*=\s*)?[-+.0-9]+\s*)/;
  let pattern = new RegExp(`${type.source}(${numeric.source}{3}\\|\\s*[NESW]\\s*){2}`, 'i');
  if (pattern.exec(text)) {
    return text.replace(pattern, location);
  }
  pattern = new RegExp(`${type.source}${numeric.source}${numeric.source}`, 'i');
  if (pattern.exec(text)) {
    return text.replace(pattern, location);
  }
  pattern = /\{\{\s*Information.*/is;
  if (pattern.exec(text)) {
    return text.replace(pattern, information => {
      let braceCount = 2;
      let pos = 2;
      while (braceCount > 0 && pos < information.length) {
        switch (information.charAt(pos)) {
          case '{':
            braceCount++;
            break;
          case '}':
            braceCount--;
            break;
        }
        pos++;
      }
      return [information.substr(0, pos), location + '}}', information.substr(pos)].join('\n');
    });
  }
  return text + location + '}}';
}
