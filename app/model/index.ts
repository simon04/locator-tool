import {LatLng} from './LatLng';

export {LatLng} from './LatLng';

export interface CommonsFile {
  pageid: number;
  file: string;
  url: string;
  coordinates: LatLng;
  objectLocation: LatLng;
  $geolocate?: string; // Vue app in maplibregl.Popup has no router
}

// the width of the thumbnail URL obtained from the API (`iiurlwidth`)
export const THUMB_WIDTH = 500;

// the width prefix in the file name, i.e. in the last path segment
const THUMB_WIDTH_PREFIX = new RegExp(`([/-])${THUMB_WIDTH}px-(?=[^/]*$)`);

export function imageUrl(f: {thumbUrl?: string}, width = THUMB_WIDTH): string | undefined {
  if (!f.thumbUrl || width === THUMB_WIDTH) return f.thumbUrl;
  // https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Example.svg/500px-Example.svg.png
  const url = new URL(f.thumbUrl);
  url.pathname = url.pathname.replace(THUMB_WIDTH_PREFIX, `$1${width}px-`);
  return url.toString();
}

export function imageUrls(f: {thumbUrl?: string}): string {
  // small files are not scaled, the API returns the original instead of a thumbnail
  if (!f.thumbUrl || imageUrl(f, THUMB_WIDTH + 1) === f.thumbUrl) return '';
  // https://www.mediawiki.org/wiki/Common_thumbnail_sizes
  // Current standard sizes in Wikimedia production: 20px, 40px, 60px, 120px, 250px, 330px, 500px, 960px, 1280px, 1920px, 3840px
  return [500, 960, 1280, 1920, 3840].map(width => `${imageUrl(f, width)} ${width}w`).join(', ');
}

export type CommonsTitle = string;

export type User = string;

export const WikidataProperty = {
  // coordinate location (P625)
  '*': 'P625',
  // coordinates of the point of view (P1259)
  Location: 'P1259',
  // coordinates of depicted place (P9149)
  'Object location': 'P9149'
};
