import type {LatLngBounds} from 'leaflet';
import getFilePath from 'wikimedia-commons-file-path';

import {type CommonsFile, LatLng} from '../model';
import {type ApiResponse} from './ApiResponse';
import {NS_FILE, $query} from './query';

export interface Geosearch {
  pageid: number;
  ns: number;
  title: string;
  lat: number;
  lon: number;
  dist: number;
  primary: string;
  type: string;
  name: null;
}

export async function geosearch(bounds: LatLngBounds): Promise<CommonsFile[]> {
  const params = {
    list: 'geosearch',
    gsnamespace: NS_FILE,
    gslimit: 500,
    gsprop: 'type|name',
    gsbbox: [bounds.getNorth(), bounds.getWest(), bounds.getSouth(), bounds.getEast()].join('|')
  };
  const data = await $query<ApiResponse<Geosearch>>(params, {});
  return (data.query?.geosearch || []).map(
    (gs): CommonsFile => ({
      pageid: gs.pageid,
      file: gs.title,
      url: `https://commons.wikimedia.org/wiki/${gs.title}`,
      imageUrl(width?: number) {
        return getFilePath(this.file, width);
      },
      coordinates: new LatLng('Location', gs.lat, gs.lon),
      objectLocation: new LatLng('Object location', undefined, undefined)
    })
  );
}
