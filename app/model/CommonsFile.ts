import {LatLng} from './LatLng';

export interface CommonsFile {
  pageid: number;
  file: string;
  url: string;
  coordinates: LatLng;
  objectLocation: LatLng;
  imageUrl(width: number): string;
}
