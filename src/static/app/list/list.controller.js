angular.module('app').controller('ListController', function(
    ltData, $scope, $stateParams, ltDataAuth, $filter, localStorageService) {
  var vm = this;
  vm.mapMarker = {};
  vm.mapObjectLocation = {};
  vm.editLocation = editLocation;
  ltData.getCoordinates($stateParams.titles).then(function(titles) {
    vm.titles = $filter('orderBy')(titles, 'file');
  });

  $scope.$watch('$ctrl.title', function(title) {
    vm.error = undefined;
    if (title && title.pageid) {
      ltData.getObjectLocation(title.pageid).then(function(objectLocation) {
        setLatLng(vm.mapObjectLocation, objectLocation || {lat: undefined, lng: undefined});
        if (!title.coordinates || !title.coordinates.lat) {
          setLatLng(vm.mapView, objectLocation);
        }
      });
    }
  });
  $scope.$watch('$ctrl.title.coordinates', function(coords) {
    if (coords && coords.lat) {
      setLatLng(vm.mapView, coords);
    }
    setLatLng(vm.mapMarker, coords);
  });
  $scope.$watchGroup(['$ctrl.mapMarker.lat', '$ctrl.mapMarker.lng'], function roundToPrecision() {
    var precision = 10e7;
    if ((vm.mapMarker.lat * precision) % 1) {
      vm.mapMarker.lat = Math.round(vm.mapMarker.lat * precision) / precision;
    }
    if ((vm.mapMarker.lng * precision) % 1) {
      vm.mapMarker.lng = Math.round(vm.mapMarker.lng * precision) / precision;
    }
  });

  vm.mapInit = function(L, map) {
    L.tileLayer('https://tiles.wmflabs.org/osm/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">' +
          'OpenStreetMap</a> contributors'
    }).addTo(map);
    new L.Control.GeoSearch({
      provider: new L.GeoSearch.Provider.OpenStreetMap(),
      showMarker: false
    }).addTo(map);
  };

  vm.mapView = localStorageService.get('mapView') || {
    lat: 51.505,
    lng: -0.09,
    zoom: 13
  };
  $scope.$watch('$ctrl.mapView', function(mapView) {
    localStorageService.set('mapView', mapView);
  }, true);

  vm.mapClick = function($event) {
    setLatLng(vm.mapMarker, $event.latlng);
  };

  function editLocation(title) {
    vm.error = undefined;
    var latlng = {lat: vm.mapMarker.lat, lng: vm.mapMarker.lng};
    return ltDataAuth.editLocation(latlng.lat, latlng.lng, title.pageid)
    .then(function() {
      title.coordinates = angular.extend(title.coordinates || {}, latlng);
    }, function(error) {
      vm.error = error;
    });
  }

  function setLatLng(from, to) {
    if (from && to) {
      from.lat = to.lat;
      from.lng = to.lng;
    }
  }
});
