import deepmerge from 'deepmerge';
import getFilePath from 'wikimedia-commons-file-path';

import {CommonsFile, CommonsTitle, LatLng} from '../model';

export const API_URL = 'https://commons.wikimedia.org/w/api.php';
const NS_FILE = 6;
const NS_CATEGORY = 14;
const maxTitlesPerRequest = 50;

interface ApiResponse<P = never> {
  continue: {[key: string]: string} | undefined;
  batchcomplete: string;
  query: {
    pages: {[key: string]: P};
    categorymembers?: P[];
    allpages?: P[];
  };
}

interface Page {
  pageid: number;
  ns: number;
  title: string;
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
  if (titles.length > maxTitlesPerRequest) {
    return getCoordinatesChunkByChunk(titles);
  }
  const params = {
    prop: 'coordinates',
    colimit: 500,
    coprop: 'type|name',
    coprimary: 'all',
    titles: titles.join('|').replace(/_/g, ' ')
  };
  const data = await $query<ApiResponse<CoordinatePage>>(params);
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

export async function getCoordinatesChunkByChunk(titles: CommonsTitle[]): Promise<CommonsFile[]> {
  const t = [...titles];
  const requests: CommonsTitle[][] = [];
  while (t.length) {
    requests.push(t.splice(0, Math.min(maxTitlesPerRequest, t.length)));
  }
  const coordinatesPromises = requests.map(x => getCoordinates(x));
  const x = await Promise.all(coordinatesPromises);
  return x.flat();
}

export interface FileDetails {
  categories: string[];
  description: string;
  author: string;
  timestamp: string;
  url?: string;
  objectLocation: LatLng;
}

export async function getFileDetails(
  pageid: number,
  prop = 'categories|imageinfo|revisions',
  iiprop = 'url|extmetadata'
): Promise<FileDetails> {
  const params = {
    prop,
    pageids: pageid,
    iiprop,
    iiextmetadatafilter: 'ImageDescription|Artist|DateTimeOriginal',
    iiextmetadatalanguage: document.body.parentElement!.lang,
    ...(prop.includes('categories') ? {clshow: '!hidden'} : {}),
    ...(prop.includes('revisions') ? {rvslots: 'main', rvprop: 'content'} : {})
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
    objectLocation: extractObjectLocation(page)
  };

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
    } catch (e) {
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

export async function getFiles({
  files,
  user,
  userLimit,
  userStart,
  userEnd,
  category,
  categoryDepth
}: {
  files: CommonsTitle | CommonsTitle[];
  user: string;
  userLimit: string | number | undefined;
  userStart: string | undefined;
  userEnd: string | undefined;
  category: string;
  categoryDepth: string | number | undefined;
}): Promise<CommonsTitle[]> {
  if (typeof files === 'string') {
    files = files.split('|');
  }
  if (files) {
    return files.map(file => (file.startsWith('File:') ? file : `File:${file}`));
  } else if (user) {
    userLimit = typeof userLimit === 'string' ? +userLimit : userLimit;
    return getFilesForUser(user, userLimit, userStart, userEnd);
  } else if (category) {
    categoryDepth = typeof categoryDepth === 'string' ? +categoryDepth : categoryDepth;
    return getFilesForCategory(category, categoryDepth);
  } else {
    throw new Error();
  }
}

function removeCommonsPrefix(string: string, prefix: string): string {
  const urlPrefix = 'https://commons.wikimedia.org/wiki/';
  if (string.indexOf(urlPrefix) === 0) {
    string = string.slice(urlPrefix.length);
    string = decodeURI(string);
  }
  if (string.indexOf(prefix) === 0) {
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
    getFilesForCategory3(cat, depth, abort.signal)
  ];
  if (depth <= 0) {
    requests.unshift(getFilesForCategory0(cat, abort.signal));
  }
  try {
    return await successRace(requests);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function $query<T extends ApiResponse<any>>(
  query: Record<string, unknown>,
  previousResults = {},
  signal?: AbortSignal,
  shouldContinue = (data: T) => !!data.continue
): Promise<T> {
  const params = {
    action: 'query',
    format: 'json',
    origin: '*'
  };
  const url = API_URL + '?' + new URLSearchParams(params);
  let data = await fetchJSON<T>(url, {
    body: toFormData(query),
    method: 'POST',
    signal
  });
  data = deepmerge(previousResults, data, {arrayMerge: (x, y) => [].concat(...x, ...y)}) as T;
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

function toFormData(query: Record<string, unknown>): FormData {
  const formData = new FormData();
  Object.entries(query).forEach(
    ([key, value]) => value === undefined || formData.append(key, String(value))
  );
  return formData;
}

function toSearchParams(query: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(
    ([key, value]) => value === undefined || searchParams.append(key, String(value))
  );
  return searchParams;
}

function successRace<T>(promises: Promise<T>[]): Promise<T> {
  promises = promises.filter(p => !!p);
  return new Promise<T>((resolve, reject) => {
    // resolve first successful one
    promises.forEach(promise => promise.then(resolve));
    // reject when all fail
    Promise.allSettled(promises).catch(reject);
  });
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
