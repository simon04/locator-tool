import angular from 'angular';

import LatLng from './LatLng';

data.$inject = ['$http', '$parse', '$sce', '$q'];
export default function data($http, $parse, $sce, $q) {
  const maxTitlesPerRequest = 10;
  return {
    getCoordinates,
    getCategoriesForPrefix,
    getObjectLocation,
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
      prop: 'coordinates|imageinfo|categories',
      clshow: '!hidden',
      titles: titles.join('|'),
      iiprop: 'dimensions|url|extmetadata',
      iiurlwidth: 1024,
      iiextmetadatafilter: 'ImageDescription'
    };
    return $query(params).then(d => {
      const pages = (d.data && d.data.query && d.data.query.pages) || {};
      const descriptionGetter = $parse('imageinfo[0].extmetadata.ImageDescription.value');
      const thumbnailGetter = $parse('imageinfo[0].thumburl');
      const urlGetter = $parse('imageinfo[0].descriptionurl');
      const coordsGetter = $parse('{lat: coordinates[0].lat, lng: coordinates[0].lon}');
      return Object.keys(pages).map(pageid => {
        const page = pages[pageid];
        const imgWidth = page && page.imageinfo && page.imageinfo[0] && page.imageinfo[0].width;
        const categories = ((page && page.categories) || [])
          .map(category => category.title.replace(/^Category:/, ''));
        return {
          pageid: parseInt(pageid),
          file: page.title,
          categories,
          description: $sce.trustAsHtml(descriptionGetter(page)),
          thumbnail: thumbnailGetter(page),
          imageUrl(width) {
            // Mediawiki does not provide an easy way of getting an image in the desired width
            if (!this.thumbnail.match(/\/thumb\//)) {
              return this.thumbnail;
            } else if (width >= imgWidth) {
              return this.thumbnail.replace(/\/thumb\//, '/').replace(/\/[^/]+$/, '');
            } else {
              return this.thumbnail.replace(/\/\d+px([^/]+)$/, `/${width}px$1`);
            }
          },
          url: urlGetter(page),
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
      return array.reduce((a, b) => a.concat(b), []);
    }
  }
  function getObjectLocation(pageid) {
    const params = {
      prop: 'revisions',
      pageids: pageid,
      rvprop: 'content'
    };
    return $query(params).then(d => {
      try {
        const wikitext = d.data.query.pages[pageid].revisions[0]['*'];
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
    });
  }
  function getCategoriesForPrefix(prefix) {
    const params = {
      list: 'allpages',
      apnamespace: 14,
      aplimit: 30,
      apfrom: prefix,
      apprefix: prefix
    };
    return $query(params).then(d =>
      d.data.query.allpages.map(i => i.title.replace(/^Category:/, ''))
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
    return $query(params).then(d => d.data.query.usercontribs.map(i => i.title));
  }
  function getFilesForCategory(cat, depth = 3) {
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
  function $query(params) {
    params = Object.assign(
      {
        action: 'query',
        format: 'json',
        callback: 'JSON_CALLBACK'
      },
      params
    );
    return $http.jsonp('https://commons.wikimedia.org/w/api.php', {params: params});
  }
}
