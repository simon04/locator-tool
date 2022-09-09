import {LatLng} from './LatLng';
export {LatLng} from './LatLng';

export interface CommonsFile {
  pageid: number;
  file: string;
  url: string;
  coordinates: LatLng;
  objectLocation: LatLng;
  imageUrl(width?: number): string;
}

export type CommonsTitle = string;

export type User = string;
