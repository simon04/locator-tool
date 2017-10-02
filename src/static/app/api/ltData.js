import angular from 'angular';
import deepmerge from 'deepmerge';

import LatLng from './LatLng';

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
      titles: titles.join('|').replace(/_/g, ' ')
    };
    return $query(params).then(data => {
      const pages = (data && data.query && data.query.pages) || {};
      const coordsGetter = $parse('{lat: coordinates[0].lat, lng: coordinates[0].lon}');
      return Object.keys(pages).map(pageid => {
        const page = pages[pageid];
        return {
          pageid: parseInt(pageid),
          file: page.title,
          imageUrl(width) {
            const file = this.file.replace(/^File:/, '');
            const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}`;
            if (width >= 2048) {
              return url;
            } else if (width >= 1280) {
              return `${url}?width=2048`;
            } else {
              return `${url}?width=1024`;
            }
          },
          coordinates: new LatLng('Location', coordsGetter(page)),
          objectLocation: new LatLng('Object location', {})
        };
      });
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
      iiextmetadatafilter: 'ImageDescription',
      rvprop: 'content'
    };
    return $query(params).then(data => {
      const page = (data && data.query && data.query.pages && data.query.pages[pageid]) || {};
      const categories = ((page && page.categories) || [])
        .map(category => category.title.replace(/^Category:/, ''));
      const descriptionGetter = $parse('imageinfo[0].extmetadata.ImageDescription.value');
      const urlGetter = $parse('imageinfo[0].descriptionurl');
      return {
        categories,
        description: $sce.trustAsHtml(descriptionGetter(page)),
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
    const params = {
      list: 'usercontribs',
      ucuser: user,
      ucnamespace: 6,
      ucshow: 'new',
      uclimit: userLimit || 'max',
      ucstart: userEnd, // sic! (due to ucdir)
      ucend: userStart, // sic! (due to ucdir)
      ucdir: 'older',
      ucprop: 'title'
    };
    const shouldContinue = data =>
      data.continue && (!userLimit || data.query.usercontribs.length < userLimit);
    return $query(params, {}, shouldContinue)
      .then(data => data.query.usercontribs.map(i => i.title))
      .then(usercontribs => (userLimit ? limitToFilter(usercontribs, userLimit) : usercontribs));
  }
  function getFilesForCategory(cat, depth = 3) {
    return $q.race([getFilesForCategory1(cat, depth), getFilesForCategory2(cat, depth)]);
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
    return $http
      .get('/render/tlgbe/tlgwsgi.py', {params, transformResponse})
      .then(d => d.data.filter(x => !!x.page).map(x => x.page.page_title));
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
}
