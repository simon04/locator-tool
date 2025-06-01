import {LatLng} from './LatLng';

export {LatLng} from './LatLng';

export interface CommonsFile {
  pageid: number;
  file: string;
  url: string;
  coordinates: LatLng;
  objectLocation: LatLng;
  $geolocate?: string; // Vue app in L.Popup has no router

  imageUrl(width?: number): string;
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
