import {WikidataProperty, LatLng} from '../model';
import type {MediaInfo, Statement} from '../model/mediainfo';
import {type ApiResponse} from './ApiResponse';
import type {GlobalUsage} from './globalusage';
import {$query} from './query';
import {removeCommonsPrefix} from './removeCommonsPrefix';

export interface FileDetails {
  categories: string[];
  description?: string;
  author?: string;
  timestamp?: string;
  url?: string;
  coordinates?: LatLng;
  objectLocation?: LatLng;
  globalUsage?: GlobalUsage[];
}

export interface DetailsPage {
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
    removeCommonsPrefix(category.title, 'Category:')
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

  function extractMediaInfo(page: DetailsPage | undefined): Partial<FileDetails> {
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

  function extractObjectLocation(page: DetailsPage | undefined) {
    try {
      const wikitext: string = page?.revisions?.[0]?.slots?.main['*'] || '';
      const locDeg = wikitext.match(
        /\{\{Object location( dec)?\|([0-9]+)\|([0-9]+)\|([0-9.]+)\|([NS])\|([0-9]+)\|([0-9]+)\|([0-9.]+)\|([WE])/i
      );
      const loc = wikitext.match(/\{\{Object location( dec)?\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)/i);
      let lat;
      let lng;
      if (locDeg && locDeg[2] && locDeg[3] && locDeg[4] && locDeg[6] && locDeg[7] && locDeg[8]) {
        lat = parseInt(locDeg[2]) + parseInt(locDeg[3]) / 60 + parseFloat(locDeg[4]) / 3600;
        lat *= locDeg[5] === 'N' ? 1 : -1;
        lng = parseInt(locDeg[6]) + parseInt(locDeg[7]) / 60 + parseFloat(locDeg[8]) / 3600;
        lng *= locDeg[9] === 'E' ? 1 : -1;
      } else if (loc && loc[2] && loc[3]) {
        lat = parseFloat(loc[2]);
        lng = parseFloat(loc[3]);
      }
      return new LatLng('Object location', lat, lng);
    } catch {
      return new LatLng('Object location', undefined, undefined);
    }
  }
}
