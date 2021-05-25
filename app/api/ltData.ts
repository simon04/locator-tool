import angular from 'angular';
import deepmerge from 'deepmerge';
import getFilePath from 'wikimedia-commons-file-path';

import {CommonsFile, CommonsTitle, LatLng} from '../model';

export const API_URL = 'https://commons.wikimedia.org/w/api.php';
const maxTitlesPerRequest = 50;

interface ApiResponse<P = never> {
  continue: unknown;
  batchcomplete: string;
  query: {
    pages: {[key: string]: P};
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
  contentformat: string;
  contentmodel: string;
  '*': string;
}
export default class LtData {
  public static $inject = [
    '$http',
    '$httpParamSerializer',
    '$parse',
    '$sce',
    '$q',
    'gettextCatalog',
    'limitToFilter'
  ];
  constructor(
    private $http: ng.IHttpService,
    private $httpParamSerializer: ng.IHttpParamSerializer,
    private $parse: ng.IParseService,
    private $sce: ng.ISCEService,
    private $q: ng.IQService,
    private gettextCatalog: gettextCatalog,
    private limitToFilter: ng.IFilterLimitTo
  ) {}

  getCoordinates(titles: CommonsTitle[]): ng.IPromise<CommonsFile[]> {
    if (angular.isString(titles)) {
      titles = titles.split('|');
    }
    if (titles.length > maxTitlesPerRequest) {
      return this.getCoordinatesChunkByChunk(titles);
    }
    const params = {
      prop: 'coordinates',
      colimit: 500,
      coprop: 'type|name',
      coprimary: 'all',
      titles: titles.join('|').replace(/_/g, ' ')
    };
    return this.$query<ApiResponse<CoordinatePage>>(params).then(data => {
      const pages = (data && data.query && data.query.pages) || {};
      return Object.keys(pages).map(pageid => {
        const page: CoordinatePage = pages[pageid];
        const coordinates = page.coordinates || [];
        return {
          pageid: parseInt(pageid),
          file: page.title,
          url: `https://commons.wikimedia.org/wiki/${page.title}`,
          imageUrl(width: number) {
            return getFilePath(this.file, width);
          },
          coordinates: new LatLng(
            'Location',
            toLatLng(coordinates.filter(c => c.primary === '' && c.type === 'camera'))
          ),
          objectLocation: new LatLng(
            'Object location',
            toLatLng(coordinates.filter(c => c.type === 'object'))
          )
        } as CommonsFile;
      });
      function toLatLng(cc: Coordinate[]): {lat?: number; lng?: number} {
        const c: Coordinate = cc && cc.length ? cc[0] : undefined;
        return angular.isObject(c) ? {lat: c.lat, lng: c.lon} : {};
      }
    });
  }

  getCoordinatesChunkByChunk(titles: CommonsTitle[]): ng.IPromise<CommonsFile[]> {
    const t = [...titles];
    const requests: CommonsTitle[][] = [];
    while (t.length) {
      requests.push(t.splice(0, Math.min(maxTitlesPerRequest, t.length)));
    }
    const coordinatesPromises = requests.map(x => this.getCoordinates(x));
    return this.$q.all(coordinatesPromises).then(x => flatten(x));

    function flatten<T>(array: T[][]) {
      const result: T[] = [];
      return result.concat(...array);
    }
  }

  getFileDetails(pageid: number): ng.IPromise<{
    categories: string[];
    description: string;
    author: string;
    timestamp: string;
    url: string;
    objectLocation: LatLng;
  }> {
    const params = {
      prop: 'categories|imageinfo|revisions',
      clshow: '!hidden',
      pageids: pageid,
      iiprop: 'url|extmetadata',
      iiextmetadatafilter: 'ImageDescription|Artist|DateTimeOriginal',
      iiextmetadatalanguage: this.gettextCatalog.getCurrentLanguage(),
      rvprop: 'content'
    };
    const descriptionGetter = this.$parse('imageinfo[0].extmetadata.ImageDescription.value');
    const authorGetter = this.$parse('imageinfo[0].extmetadata.Artist.value');
    const timestampGetter = this.$parse('imageinfo[0].extmetadata.DateTimeOriginal.value');
    const urlGetter = this.$parse('imageinfo[0].descriptionurl');
    return this.$query<ApiResponse<DetailsPage>>(params).then(data => {
      const page: DetailsPage | undefined =
        data && data.query && data.query.pages && data.query.pages[pageid];
      const categories = ((page && page.categories) || []).map(category =>
        category.title.replace(/^Category:/, '')
      );
      return {
        categories,
        description: this.$sce.trustAsHtml(descriptionGetter(page)),
        author: this.$sce.trustAsHtml(authorGetter(page)),
        timestamp: timestampGetter(page),
        url: urlGetter(page),
        objectLocation: extractObjectLocation(page)
      };
    });

    function extractObjectLocation(page: DetailsPage) {
      try {
        const wikitext: string = page.revisions[0]['*'];
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
        return new LatLng('Object location', {lat, lng});
      } catch (e) {
        return new LatLng('Object location', {});
      }
    }
  }

  getCategoriesForPrefix(prefix: string): ng.IPromise<CommonsTitle[]> {
    const params = {
      list: 'allpages',
      apnamespace: 14,
      aplimit: 30,
      apfrom: prefix,
      apprefix: prefix
    };
    return this.$query<ApiResponse<Page>>(params, {}, () => false).then(data =>
      data.query.allpages.map(i => i.title.replace(/^Category:/, '' as CommonsTitle))
    );
  }

  getFiles({
    files,
    user,
    userLimit,
    userStart,
    userEnd,
    category,
    categoryDepth
  }: {
    files: CommonsTitle[];
    user: string;
    userLimit: number;
    userStart: number;
    userEnd: number;
    category: string;
    categoryDepth: number;
  }): ng.IPromise<CommonsTitle[]> {
    return this.$q((resolve, reject) => {
      if (files) {
        resolve(files);
      } else if (user) {
        this.getFilesForUser(user, userLimit, userStart, userEnd).then(resolve);
      } else if (category) {
        this.getFilesForCategory(category, categoryDepth).then(resolve);
      } else {
        reject();
      }
    });
  }

  getFilesForUser(
    user: string,
    userLimit: number,
    userStart: number,
    userEnd: number
  ): ng.IPromise<CommonsTitle[]> {
    // https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Ballimages
    const params = {
      generator: 'allimages',
      gaiuser: user,
      gailimit: typeof userLimit === 'number' && userLimit <= 500 ? userLimit : 'max',
      gaistart: userEnd, // sic! (due to gaidir)
      gaiend: userStart, // sic! (due to gaidir)
      gaisort: 'timestamp',
      gaidir: 'older'
    };
    const toPageArray = (data: ApiResponse<Page>): Page[] =>
      Object.keys(data.query.pages).map(id => data.query.pages[id]);
    const shouldContinue = (data: ApiResponse<Page>): boolean =>
      data.continue && (!userLimit || toPageArray(data).length < userLimit);
    return this.$query<ApiResponse<Page>>(params, {}, shouldContinue)
      .then(data => toPageArray(data).map(page => page.title as CommonsTitle))
      .then(pages => (userLimit ? this.limitToFilter(pages, userLimit) : pages));
  }

  getFilesForCategory(cat: string, depth = 3): ng.IPromise<CommonsTitle[]> {
    cat = cat.replace(/^Category:/, '');
    return this.successRace([
      this.getFilesForCategory1(cat, depth),
      this.getFilesForCategory3(cat, depth)
    ]);
  }

  getFilesForCategory1(cat: string, depth: number): ng.IPromise<CommonsTitle[]> {
    const params = {
      lang: 'commons',
      cat: cat.replace(/^Category:/, ''),
      type: 6, // File:
      depth: depth,
      json: 1
    };
    return this.$http
      .get<CommonsTitle[]>('https://cats-php.toolforge.org/', {params})
      .then(d => d.data.map(f => `File:${f}`));
  }

  getFilesForCategory3(categories: string, depth: number): ng.IPromise<CommonsTitle[]> {
    const params = {
      language: 'commons',
      project: 'wikimedia',
      depth,
      categories,
      'ns[6]': 1,
      format: 'json',
      sparse: 1,
      doit: 1
    };
    return (
      this.$http
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .get<any>('https://petscan.wmflabs.org/', {params})
        .then(d => d.data['*'][0]['a']['*'] as CommonsTitle[])
    );
  }

  private $query<T extends ApiResponse<any>>(
    query: Record<string, unknown>,
    previousResults = {},
    shouldContinue = (data: T) => !!data.continue
  ): ng.IPromise<T> {
    const data = this.$httpParamSerializer(query);
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    } as angular.IHttpRequestConfigHeaders;
    const params = {
      action: 'query',
      format: 'json',
      origin: '*'
    };
    return this.$http
      .post<T>(API_URL, data, {
        headers,
        params
      })
      .then(d => d.data)
      .then(
        data => deepmerge(previousResults, data, {arrayMerge: (x, y) => [].concat(...x, ...y)}) as T
      )
      .then(data =>
        shouldContinue(data)
          ? this.$query<T>(
              angular.extend(query, {continue: undefined}, data.continue),
              angular.extend(data, {continue: undefined}),
              shouldContinue
            )
          : data
      );
  }

  private successRace<T>(promises: ng.IPromise<T>[]): ng.IPromise<T> {
    return this.$q<T>((resolve, reject) => {
      // resolve first successful one
      promises.forEach(promise => promise.then(resolve));
      // reject when all fail
      this.$q.all(promises).catch(reject);
    });
  }
}
