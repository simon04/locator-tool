import angular from 'angular';

export default function($http, $parse, $filter, $sce, $q) {
  var maxTitlesPerRequest = 10;
  return {
    getCoordinates: getCoordinates,
    getCategoriesForPrefix: getCategoriesForPrefix,
    getObjectLocation: getObjectLocation,
    getFilesForUser: getFilesForUser,
    getFilesForCategory: getFilesForCategory
  };

  function getCoordinates(titles) {
    if (angular.isString(titles)) {
      titles = titles.split('|');
    }
    if (titles.length > maxTitlesPerRequest) {
      return getCoordinatesChunkByChunk(titles);
    }
    var params = {
      prop: 'coordinates|imageinfo',
      titles: titles.join('|'),
      iiprop: 'url|extmetadata',
      iiurlwidth: 1024,
      iiextmetadatafilter: 'ImageDescription'
    };
    return $query(params).then(function(d) {
      var pages = d.data && d.data.query && d.data.query.pages || {};
      var descriptionGetter = $parse('imageinfo[0].extmetadata.ImageDescription.value');
      var thumbnailGetter = $parse('imageinfo[0].thumburl');
      var urlGetter = $parse('imageinfo[0].descriptionurl');
      var coordsGetter = $parse('{lat: coordinates[0].lat, lng: coordinates[0].lon}');
      return Object.keys(pages).map(function(pageid) {
        var page = pages[pageid];
        return {
          pageid: pageid,
          file: page.title,
          description: $sce.trustAsHtml(descriptionGetter(page)),
          thumbnail: thumbnailGetter(page),
          url: urlGetter(page),
          coordinates: coordsGetter(page)
        };
      });
    });
  }
  function getCoordinatesChunkByChunk(titles) {
    var t = angular.extend([], titles);
    var requests = [];
    while (t.length) {
      requests.push(t.splice(0, Math.min(maxTitlesPerRequest, t.length)));
    }
    var coordinatesPromises = requests.map(getCoordinates);
    return $q.all(coordinatesPromises).then(flatten);

    function flatten(array) {
      return array.reduce(function(a, b) {
        return a.concat(b);
      }, []);
    }
  }
  function getObjectLocation(pageid) {
    var params = {
      prop: 'revisions',
      pageids: pageid,
      rvprop: 'content'
    };
    return $query(params).then(function(d) {
      try {
        var wikitext = d.data.query.pages[pageid].revisions[0]['*'];
        var loc = wikitext.match(/\{\{Object location( dec)?\s*\|\s*([0-9.]+)\s*\|\s*([0-9.]+)/);
        return {
          lat: parseFloat(loc[2]),
          lng: parseFloat(loc[3])
        };
      } catch (e) {
        return undefined;
      }
    });
  }
  function getCategoriesForPrefix(prefix) {
    var params = {
      list: 'allpages',
      apnamespace: 14,
      aplimit: 30,
      apfrom: prefix,
      apprefix: prefix
    };
    return $query(params).then(function(d) {
      return d.data.query.allpages.map(function(i) {
        return i.title.replace(/^Category:/, '');
      });
    });
  }
  function getFilesForUser(user) {
    var params = {
      list: 'usercontribs',
      ucuser: user,
      ucnamespace: 6,
      ucshow: 'new',
      uclimit: 'max',
      ucprop: 'title'
    };
    return $query(params).then(function(d) {
      return d.data.query.usercontribs.map(function(i) {
        return i.title;
      });
    });
  }
  function getFilesForCategory(cat) {
    var params = {
      'language': 'commons',
      'project': 'wikimedia',
      'categories': cat,
      'negcats': 'Location_not_applicable',
      'ns[6]': 1, // File:
      'depth': 3,
      'output_compatability': 'catscan',
      'sparse': 'on',
      'sortby': 'title',
      'format': 'json',
      'doit': 1
    };
    return $http.get('https://petscan.wmflabs.org/', {params: params}).then(function(d) {
      return d.data['*'][0].a['*'];
    });
  }
  function $query(params) {
    params = angular.extend({
      action: 'query',
      format: 'json',
      callback: 'JSON_CALLBACK'
    }, params);
    return $http.jsonp('https://commons.wikimedia.org/w/api.php', {params: params});
  }
}
