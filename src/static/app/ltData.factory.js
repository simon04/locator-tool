angular.module('app').factory('ltData', function($http, $parse, $filter, $sce, $q) {
  var maxTitlesPerRequest = 10;
  return {
    getCoordinates: getCoordinates,
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
  function getFilesForCategory(cat) {
    var params = {
      lang: 'commons',
      type: 6,
      cat: cat
    };
    return $http.get('/cats-php/', {params: params}).then(function(d) {
      return $filter('orderBy')(d.data.map(function(i) {
        return 'File:' + i;
      }));
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
});
