import getFilePath from 'wikimedia-commons-file-path';

import {CommonsFile, CommonsTitle, LatLng, WikidataProperty} from '../model';
import {MediaInfo, Statement} from '../model/mediainfo.ts';
import {LatLngBounds} from 'leaflet';
import {mergeWith} from 'es-toolkit';

export const API_URL = 'https://commons.wikimedia.org/w/api.php';
const NS_FILE = 6;
const NS_CATEGORY = 14;

interface ApiResponse<P = never> {
  continue: {[key: string]: string} | undefined;
  batchcomplete: string;
  query: {
    pages: {[key: string]: P};
    categorymembers?: P[];
    allpages?: P[];
    allusers?: P[];
    geosearch?: P[];
  };
}

interface Page {
  pageid: number;
  ns: number;
  title: string;
}

interface User {
  userid: number;
  name: string;
}

interface CoordinatePage {
  pageid: number;
  ns: number;
  title: string;
  coordinates?: Coordinate[];
}

interface Coordinate {
  lat: number;
  lon: number;
  primary?: string;
  type: 'camera' | 'object';
}

interface DetailsPage {
  pageid: number;
  ns: number;
  title: string;
  categories?: Category[];
  imagerepository: string;
  imageinfo: ImageInfo[];
  revisions?: Revision[];
}

interface Category {
  ns: number;
  title: string;
}

interface ImageInfo {
  url: string;
  descriptionurl: string;
  descriptionshorturl: string;
  extmetadata: ExtMetadata;
}

interface ExtMetadata {
  ImageDescription: Artist;
  DateTimeOriginal: Artist;
  Artist: Artist;
}

interface Artist {
  value: string;
  source: string;
}

interface Revision {
  slots: Slots;
}

export interface Slots {
  main: MainSlot;
  mediainfo: MainSlot;
}

export interface MainSlot {
  contentformat: string;
  contentmodel: string;
  '*': string;
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
      imageUrl(width?: number) {
        return getFilePath(this.file, width);
      },
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

export interface FileDetails {
  categories: string[];
  description: string;
  author: string;
  timestamp: string;
  url?: string;
  coordinates?: LatLng;
  objectLocation?: LatLng;
}

export async function getFileDetails(
  pageid: number,
  prop = 'categories|imageinfo|revisions|wbentityusage',
  iiprop = 'url|extmetadata'
): Promise<FileDetails> {
  const params = {
    prop,
    pageids: pageid,
    iiprop,
    iiextmetadatafilter: 'ImageDescription|Artist|DateTimeOriginal',
    iiextmetadatalanguage: document.body.parentElement!.lang,
    ...(prop.includes('categories') ? {clshow: '!hidden'} : {}),
    ...(prop.includes('revisions') ? {rvslots: '*', rvprop: 'content'} : {})
  };
  const data = await $query<ApiResponse<DetailsPage>>(params);
  const page: DetailsPage | undefined = data?.query?.pages?.[pageid];
  const categories = (page?.categories || []).map(category =>
    category.title.replace(/^Category:/, '')
  );
  const extmetadata = page?.imageinfo[0]?.extmetadata;
  return {
    categories,
    description: extmetadata?.ImageDescription?.value,
    author: extmetadata?.Artist?.value,
    timestamp: extmetadata?.DateTimeOriginal?.value,
    ...(iiprop.includes('url') ? {url: page?.imageinfo[0]?.descriptionurl} : {}),
    objectLocation: extractObjectLocation(page),
    ...extractMediaInfo(page)
  };

  function extractMediaInfo(page: DetailsPage): Partial<FileDetails> {
    const json = page?.revisions?.[0]?.slots?.mediainfo['*'];
    if (!json) return {};
    const mediainfo: MediaInfo = JSON.parse(json);
    const coordinates = extractMediaInfoLocation(
      'Location',
      mediainfo.statements[WikidataProperty['Location']]?.[0]
    );
    const objectLocation = extractMediaInfoLocation(
      'Object location',
      mediainfo.statements[WikidataProperty['Object location']]?.[0]
    );
    return {
      ...(coordinates ? {coordinates} : {}),
      ...(objectLocation ? {objectLocation} : {})
    };
  }

  function extractMediaInfoLocation(
    type: LatLng['type'],
    statement: Statement | undefined
  ): LatLng | undefined {
    if (statement?.mainsnak.datavalue?.type !== 'globecoordinate') {
      return;
    }
    return new LatLng(
      type,
      statement?.mainsnak.datavalue.value.latitude,
      statement?.mainsnak.datavalue.value.longitude
    );
  }

  function extractObjectLocation(page: DetailsPage) {
    try {
      const wikitext: string = page?.revisions?.[0]?.slots?.main['*'] || '';
      const locDeg = wikitext.match(
        /\{\{Object location( dec)?\|([0-9]+)\|([0-9]+)\|([0-9.]+)\|([NS])\|([0-9]+)\|([0-9]+)\|([0-9.]+)\|([WE])/i
      );
      const loc = wikitext.match(/\{\{Object location( dec)?\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)/i);
      let lat;
      let lng;
      if (locDeg) {
        lat = parseInt(locDeg[2]) + parseInt(locDeg[3]) / 60 + parseFloat(locDeg[4]) / 3600;
        lat *= locDeg[5] === 'N' ? 1 : -1;
        lng = parseInt(locDeg[6]) + parseInt(locDeg[7]) / 60 + parseFloat(locDeg[8]) / 3600;
        lng *= locDeg[9] === 'E' ? 1 : -1;
      } else if (loc) {
        lat = parseFloat(loc[2]);
        lng = parseFloat(loc[3]);
      }
      return new LatLng('Object location', lat, lng);
    } catch {
      return new LatLng('Object location', undefined, undefined);
    }
  }
}

export async function getCategoriesForPrefix(prefix: string): Promise<CommonsTitle[]> {
  const params = {
    list: 'allpages',
    apnamespace: NS_CATEGORY,
    aplimit: 30,
    apfrom: prefix,
    apprefix: prefix
  };
  const data = await $query<ApiResponse<Page>>(params, {}, undefined, () => false);
  return (data.query.allpages || []).map(i => i.title.replace(/^Category:/, '' as CommonsTitle));
}

export async function getUsersForPrefix(prefix: string): Promise<string[]> {
  const params = {
    list: 'allusers',
    aulimit: 30,
    aufrom: prefix,
    apuprefix: prefix
  };
  const data = await $query<ApiResponse<User>>(params, {}, undefined, () => false);
  return (data.query.allusers || []).map(i => i.name);
}

export type FilesOptions = {
  files?: CommonsTitle | CommonsTitle[];
  user?: string;
  userLimit?: string;
  userStart?: string;
  userEnd?: string;
  category?: string;
  categoryDepth?: string;
};

export async function getFiles({
  files,
  user,
  userLimit,
  userStart,
  userEnd,
  category,
  categoryDepth
}: FilesOptions & {userLimit?: string | number; categoryDepth?: string | number}): Promise<
  CommonsTitle[]
> {
  if (typeof files === 'string') {
    files = files.split('|');
  }
  if (files) {
    return files.map(file => (file.startsWith('File:') ? file : `File:${file}`));
  } else if (user) {
    const userLimit0 = typeof userLimit === 'string' ? +userLimit : userLimit;
    return getFilesForUser(user, userLimit0, userStart, userEnd);
  } else if (category) {
    const categoryDepth0 = typeof categoryDepth === 'string' ? +categoryDepth : categoryDepth;
    return getFilesForCategory(category, categoryDepth0);
  } else {
    throw new Error();
  }
}

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

function removeCommonsPrefix(string: string, prefix: string): string {
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

export async function getFilesForUser(
  user: string,
  userLimit: number | undefined,
  userStart: string | undefined,
  userEnd: string | undefined
): Promise<CommonsTitle[]> {
  user = removeCommonsPrefix(user, 'User:');
  // https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Ballimages
  const params = {
    generator: 'allimages',
    gaiuser: user,
    gailimit: typeof userLimit === 'number' && userLimit <= 500 ? userLimit : 'max',
    gaistart: userEnd ? new Date(userEnd).toISOString() : undefined, // sic! (due to gaidir)
    gaiend: userStart ? new Date(userStart).toISOString() : undefined, // sic! (due to gaidir)
    gaisort: 'timestamp',
    gaidir: 'older'
  };
  const toPageArray = (data: ApiResponse<Page>): Page[] => Object.values(data.query.pages);
  const shouldContinue = (data: ApiResponse<Page>): boolean =>
    data.continue ? !userLimit || toPageArray(data).length < userLimit : false;
  const data = await $query<ApiResponse<Page>>(params, {}, undefined, shouldContinue);
  const pages = toPageArray(data).map(page => page.title as CommonsTitle);
  return userLimit ? pages.slice(0, userLimit) : pages;
}

export async function getFilesForCategory(cat: string, depth = 3): Promise<CommonsTitle[]> {
  cat = removeCommonsPrefix(cat, 'Category:');
  const abort = new AbortController();
  const requests = [
    getFilesForCategory1(cat, depth, abort.signal),
    getFilesForCategory2(cat, depth, abort.signal),
    getFilesForCategory3(cat, depth, abort.signal)
  ];
  if (depth <= 0) {
    requests.unshift(getFilesForCategory0(cat, abort.signal));
  }
  try {
    return await new Promise<CommonsTitle[]>((resolve, reject) => {
      // resolve first successful one
      for (const promise of requests) {
        promise.then(resolve, error => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          console.warn('Error fetching category', cat, error);
        });
      }
      // reject when all fail
      Promise.allSettled(requests).catch(reject);
    });
  } finally {
    abort.abort();
  }
}

export async function getFilesForCategory0(
  cat: string,
  signal?: AbortSignal
): Promise<CommonsTitle[]> {
  const params = {
    list: 'categorymembers',
    cmlimit: 500,
    cmnamespace: NS_FILE,
    cmtitle: 'Category:' + cat
  };
  const data = await $query<ApiResponse<Page>>(params, {}, signal);
  return (data.query.categorymembers || []).map(cm => cm.title);
}

export async function getFilesForCategory1(
  cat: string,
  depth: number,
  signal?: AbortSignal
): Promise<CommonsTitle[]> {
  const params = {
    lang: 'commons',
    cat: cat.replace(/^Category:/, ''),
    type: NS_FILE,
    depth,
    json: 1
  };
  const url = 'https://cats-php.toolforge.org/?' + toSearchParams(params);
  const data = await fetchJSON<CommonsTitle[]>(url, {signal});
  return data.map(f => `File:${f}`);
}

export async function getFilesForCategory2(
  cat: string,
  depth: number,
  signal?: AbortSignal
): Promise<CommonsTitle[]> {
  const params = {
    category: cat.replace(/^Category:/, ''),
    ns: NS_FILE,
    depth
  };
  const url = '/catscan?' + toSearchParams(params);
  const data = await fetchJSON<{pages: CommonsTitle[]}>(url, {signal});
  return data.pages.map(f => `File:${f}`);
}

export async function getFilesForCategory3(
  categories: string,
  depth: number,
  signal?: AbortSignal
): Promise<CommonsTitle[]> {
  const params = {
    language: 'commons',
    project: 'wikimedia',
    depth,
    categories,
    [`ns[${NS_FILE}]`]: 1,
    format: 'json',
    sparse: 1,
    doit: 1
  };
  const url = 'https://petscan.wmcloud.org/?' + toSearchParams(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchJSON<any>(url, {signal});
  return data['*'][0]['a']['*'] as CommonsTitle[];
}

function buildQuery(query: Record<string, unknown> = {}) {
  const params = {
    action: 'query',
    format: 'json',
    origin: '*',
    ...query
  };
  const url = API_URL + '?' + toSearchParams(params);
  return url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function $query<T extends ApiResponse<any>>(
  query: URL | Record<string, unknown>,
  previousResults = {},
  signal?: AbortSignal,
  shouldContinue = (data: T) => !!data.continue
): Promise<T> {
  const url = query instanceof URL ? query.toString() : buildQuery(query);
  let data = await fetchJSON<T>(url, {
    signal
  });
  data = mergeWith(previousResults, data, (x, y) => {
    if (Array.isArray(x) && Array.isArray(y)) {
      return [].concat(...x, ...y);
    }
  }) as T;
  if (shouldContinue(data)) {
    return $query<T>(
      {...query, continue: undefined, ...data.continue},
      {...data, continue: undefined},
      signal,
      shouldContinue
    );
  }
  return data;
}

function toSearchParams(query: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    searchParams.append(key, String(value));
  }
  return searchParams;
}

async function fetchJSON<T>(url: RequestInfo, options?: RequestInit): Promise<T> {
  console.log('Fetching', url);
  const res = await fetch(url, {
    cache: 'no-cache',
    headers: {Accept: 'application/json'},
    ...options
  });
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(res.statusText);
  }
}
