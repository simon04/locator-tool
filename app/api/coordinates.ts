import {type CommonsTitle, type CommonsFile, LatLng} from '../model';
import {type ApiResponse} from './ApiResponse';
import {buildQuery} from './buildQuery';
import {$query} from './query';

export interface CoordinatePage {
  pageid: number;
  ns: number;
  title: string;
  coordinates?: Coordinate[];
}

export interface Coordinate {
  lat: number;
  lon: number;
  primary?: string;
  type: 'camera' | 'object';
}

export async function getCoordinates(titles: string | CommonsTitle[]): Promise<CommonsFile[]> {
  if (typeof titles === 'string') {
    titles = titles.split('|');
  }

  const url = new URL(
    buildQuery({
      prop: 'coordinates',
      colimit: 500,
      coprop: 'type|name',
      coprimary: 'all'
    })
  );

  // takeWhile
  const titles0 = titles.reduce((acc, title, index, array) => {
    url.searchParams.set('titles', (array as string[]).slice(0, index).join('|'));
    return url.toString().length < 2000 ? acc.concat(title) : acc;
  }, [] as CommonsTitle[]);

  if (titles.length > titles0.length) {
    const coordinates = await Promise.all([
      getCoordinates(titles0),
      getCoordinates(titles.slice(titles0.length))
    ]);
    return coordinates.flat();
  }

  url.searchParams.set('titles', titles.join('|').replace(/_/g, ' '));
  const data = await $query<ApiResponse<CoordinatePage>>(url);
  const pages = data?.query?.pages || {};
  return Object.entries(pages).map(([pageid, page]) => {
    return {
      pageid: parseInt(pageid),
      file: page.title,
      url: `https://commons.wikimedia.org/wiki/${page.title}`,

      coordinates: new LatLng(
        'Location',
        ...toLatLng(page.coordinates?.find(c => c.primary === '' && c.type === 'camera'))
      ),
      objectLocation: new LatLng(
        'Object location',
        ...toLatLng(page.coordinates?.find(c => c.type === 'object'))
      )
    } as CommonsFile;
  });

  function toLatLng(c: Coordinate | undefined): [number?, number?] {
    return typeof c === 'object' ? [c.lat, c.lon] : [undefined, undefined];
  }
}
