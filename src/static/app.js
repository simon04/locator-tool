angular.module('app', ['ui.router', 'll-leaflet']);

angular.module('app').config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('input', {
    url: '/input',
    templateUrl: 'partials/input.html',
    controllerAs: '$ctrl',
    controller: function(ltData, $state) {
      var vm = this;
      vm.getFilesForCategory = function() {
        ltData.getFilesForCategory(vm.category).then(function(files) {
          vm.titles = files && files.join('\n');
        });
      };
      vm.next = function() {
        $state.go('list', {titles: vm.titles.split('\n').join('|')});
      };
    }
  });

  $stateProvider.state('list', {
    url: '/list?titles',
    templateUrl: 'partials/list.html',
    controllerAs: '$ctrl',
    controller: function(ltData, $scope, $stateParams, ltDataAuth) {
      var vm = this;
      vm.editLocation = ltDataAuth.editLocation;
      ltData.getCoordinates($stateParams.titles).then(function(titles) {
        vm.titles = titles;
      });

      $scope.$watch('$ctrl.title.coordinates', function(coords) {
        var lat = coords && coords.lat;
        var lng = coords && coords.lng;
        if (lat && lng) {
          vm.mapView.lat = lat;
          vm.mapView.lng = lng;
        }
        vm.mapMarker.lat = lat;
        vm.mapMarker.lng = lng;
      });

      /* global L */
      vm.mapOptions = {
        layers: [
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">' +
                'OpenStreetMap</a> contributors'
          })
        ]
      };
      vm.mapView = {
        lat: 51.505,
        lng: -0.09,
        zoom: 13
      };
      vm.mapClick = function($event) {
        vm.mapMarker.lat = $event.latlng.lat;
        vm.mapMarker.lng = $event.latlng.lng;
      };
      vm.mapMarker = {};
    }
  });

  $urlRouterProvider.otherwise('/input');
});

angular.module('app').factory('ltDataAuth', function($http, $httpParamSerializer) {
  return {
    getUserInfo: function() {
      return $http.get('/locator-tool/user').then(function(d) {
        return d.data && d.data.user;
      });
    },
    editLocation: function(lat, lng, pageid) {
      return $http({
        method: 'POST',
        url: '/locator-tool/edit',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $httpParamSerializer({
          lat: lat,
          lng: lng,
          pageid: pageid
        })
      });
    }
  };
});

angular.module('app').factory('ltData', function($http, $parse) {
  return {
    getCoordinates: function(titles) {
      var params = {
        prop: 'coordinates|imageinfo',
        titles: titles,
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
            description: descriptionGetter(page),
            thumbnail: thumbnailGetter(page),
            url: urlGetter(page),
            coordinates: coordsGetter(page)
          };
        });
      });
    },
    getFilesForCategory: function(cat) {
      var params = {
        lang: 'commons',
        type: 6,
        cat: cat
      };
      return $http.get('/cats-php/', {params: params}).then(function(d) {
        return d.data.map(function(i) {
          return 'File:' + i;
        });
      });
    }
  };

  function $query(params) {
    params = angular.extend({
      action: 'query',
      format: 'json',
      callback: 'JSON_CALLBACK'
    }, params);
    return $http.jsonp('https://commons.wikimedia.org/w/api.php', {params: params});
  }
});

angular.module('app').component('ltUserInfo', {
  template: [
    '<a ng-hide="$ctrl.user" class="btn btn-default navbar-btn">Sign in</a>',
    '<p ng-show="$ctrl.user" class="navbar-text">Signed in as {{$ctrl.user}}</p>'].join(''),
  controller: function(ltDataAuth) {
    var vm = this;
    ltDataAuth.getUserInfo().then(function(user) {
      vm.user = user;
    });
  }
});
