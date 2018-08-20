import angular from 'angular';
import deepmerge from 'deepmerge';

import LatLng from './LatLng';
import {getFilePath} from './Commons';

data.$inject = ['$http', '$httpParamSerializer', '$parse', '$sce', '$q', 'limitToFilter'];
export default function data($http, $httpParamSerializer, $parse, $sce, $q, limitToFilter) {
  const maxTitlesPerRequest = 50;
  return {
    getCoordinates,
    getCategoriesForPrefix,
    getFileDetails,
    getFiles,
    getFilesForUser,
    getFilesForCategory
  };

  function getCoordinates(titles) {
    if (angular.isString(titles)) {
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
    return $query(params).then(data => {
      const pages = (data && data.query && data.query.pages) || {};
      return Object.keys(pages).map(pageid => {
        const page = pages[pageid];
        const coordinates = page.coordinates || [];
        return {
          pageid: parseInt(pageid),
          file: page.title,
          url: `https://commons.wikimedia.org/wiki/${page.title}`,
          imageUrl(width) {
            return getFilePath(this.file, width);
          },
          coordinates: new LatLng(
            'Location',
            toLatLng(coordinates.find(c => c.primary === '' && c.type === 'camera'))
          ),
          objectLocation: new LatLng(
            'Object location',
            toLatLng(coordinates.find(c => c.type === 'object'))
          )
        };
      });
      function toLatLng(c) {
        return angular.isObject(c) ? {lat: c.lat, lng: c.lon} : {};
      }
    });
  }
  function getCoordinatesChunkByChunk(titles) {
    const t = Object.assign([], titles);
    const requests = [];
    while (t.length) {
      requests.push(t.splice(0, Math.min(maxTitlesPerRequest, t.length)));
    }
    const coordinatesPromises = requests.map(getCoordinates);
    return $q.all(coordinatesPromises).then(flatten);

    function flatten(array) {
      return [].concat(...array);
    }
  }
  function getFileDetails(pageid) {
    const params = {
      prop: 'categories|imageinfo|revisions',
      clshow: '!hidden',
      pageids: pageid,
      iiprop: 'url|extmetadata',
      iiextmetadatafilter: 'ImageDescription|Artist|DateTimeOriginal',
      rvprop: 'content'
    };
    const descriptionGetter = $parse('imageinfo[0].extmetadata.ImageDescription.value');
    const authorGetter = $parse('imageinfo[0].extmetadata.Artist.value');
    const timestampGetter = $parse('imageinfo[0].extmetadata.DateTimeOriginal.value');
    const urlGetter = $parse('imageinfo[0].descriptionurl');
    return $query(params).then(data => {
      const page = (data && data.query && data.query.pages && data.query.pages[pageid]) || {};
      const categories = ((page && page.categories) || []).map(category =>
        category.title.replace(/^Category:/, '')
      );
      return {
        categories,
        description: $sce.trustAsHtml(descriptionGetter(page)),
        author: $sce.trustAsHtml(authorGetter(page)),
        timestamp: timestampGetter(page),
        url: urlGetter(page),
        objectLocation: extractObjectLocation(page)
      };
    });

    function extractObjectLocation(page) {
      try {
        const wikitext = page.revisions[0]['*'];
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
  function getCategoriesForPrefix(prefix) {
    const params = {
      list: 'allpages',
      apnamespace: 14,
      aplimit: 30,
      apfrom: prefix,
      apprefix: prefix
    };
    return $query(params).then(data =>
      data.query.allpages.map(i => i.title.replace(/^Category:/, ''))
    );
  }
  function getFiles({files, user, userLimit, userStart, userEnd, category, categoryDepth}) {
    return $q((resolve, reject) => {
      if (files) {
        resolve(files);
      } else if (user) {
        getFilesForUser(user, userLimit, userStart, userEnd).then(resolve);
      } else if (category) {
        getFilesForCategory(category, categoryDepth).then(resolve);
      } else {
        reject();
      }
    });
  }
  function getFilesForUser(user, userLimit, userStart, userEnd) {
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
    const toPageArray = data => Object.keys(data.query.pages).map(id => data.query.pages[id]);
    const shouldContinue = data =>
      data.continue && (!userLimit || toPageArray(data).length < userLimit);
    return $query(params, {}, shouldContinue)
      .then(data => toPageArray(data).map(page => page.title))
      .then(pages => (userLimit ? limitToFilter(pages, userLimit) : pages));
  }
  function getFilesForCategory(cat, depth = 3) {
    cat = cat.replace(/^Category:/, '');
    return successRace([getFilesForCategory1(cat, depth), getFilesForCategory2(cat, depth)]);
  }
  function getFilesForCategory1(cat, depth) {
    const params = {
      lang: 'commons',
      cat: cat.replace(/^Category:/, ''),
      type: 6, // File:
      depth: depth,
      json: 1
    };
    return $http
      .get('https://tools.wmflabs.org/cats-php/', {params})
      .then(d => d.data.map(f => `File:${f}`));
  }
  function getFilesForCategory2(cat, depth) {
    const params = {
      action: 'query',
      lang: 'commons',
      query: cat,
      querydepth: depth,
      flaws: 'ALL',
      format: 'json'
    };
    return $http.get('/render/tlgbe/tlgwsgi.py', {params, transformResponse}).then(d => {
      const exceptions = d.data.filter(x => !!x.exception).map(x => x.exception);
      if (exceptions.length) {
        throw new Error(exceptions[0]);
      }
      return d.data.filter(x => !!x.page).map(x => x.page.page_title);
    });
    function transformResponse(value) {
      // tlgwsgi returns one JSON object per line w/o commas in between
      const array = `[${value.replace(/\n/g, ',').replace(/,$/, '')}]`;
      return JSON.parse(array);
    }
  }
  function $query(query, previousResults = {}, shouldContinue = data => !!data.continue) {
    const data = $httpParamSerializer(query);
    const params = {
      action: 'query',
      format: 'json',
      origin: '*'
    };
    return $http
      .post('https://commons.wikimedia.org/w/api.php', data, {params})
      .then(d => d.data)
      .then(data => deepmerge(previousResults, data, {arrayMerge: (x, y) => [].concat(...x, ...y)}))
      .then(
        data =>
          shouldContinue(data)
            ? $query(
                Object.assign(query, {continue: undefined}, data.continue),
                Object.assign(data, {continue: undefined}),
                shouldContinue
              )
            : data
      );
  }
  function successRace(promises) {
    return $q((resolve, reject) => {
      // resolve first successful one
      promises.forEach(promise => promise.then(resolve));
      // reject when all fail
      $q.all(promises).catch(reject);
    });
  }
}
