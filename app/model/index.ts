import getFilePath from 'wikimedia-commons-file-path';

import {LatLng} from './LatLng';

export {LatLng} from './LatLng';

export interface CommonsFile {
  pageid: number;
  file: string;
  url: string;
  coordinates: LatLng;
  objectLocation: LatLng;
  $geolocate?: string; // Vue app in L.Popup has no router
}

export function imageUrl(f: CommonsFile, width?: number): string {
  return getFilePath(f.file, width);
}

export function imageUrls(f: CommonsFile): string {
  // https://www.mediawiki.org/wiki/Common_thumbnail_sizes
  // Current standard sizes in Wikimedia production: 20px, 40px, 60px, 120px, 250px, 330px, 500px, 960px, 1280px, 1920px, 3840px
  return [500, 960, 1280, 1920, 3840]
    .map(width => `${getFilePath(f.file, width)} ${width}w`)
    .join(', ');
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
