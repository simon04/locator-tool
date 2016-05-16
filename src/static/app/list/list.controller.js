angular.module('app').controller('ListController', function(
    ltData, $scope, $stateParams, ltDataAuth, $filter, localStorageService) {
  var vm = this;
  vm.editLocation = editLocation;
  ltData.getCoordinates($stateParams.titles).then(function(titles) {
    vm.titles = $filter('orderBy')(titles, 'file');
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
      L.tileLayer('https://tiles.wmflabs.org/osm/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">' +
            'OpenStreetMap</a> contributors'
      })
    ]
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
    vm.mapMarker.lat = $event.latlng.lat;
    vm.mapMarker.lng = $event.latlng.lng;
  };
  vm.mapMarker = {};

  function editLocation(title) {
    var latlng = {lat: vm.mapMarker.lat, lng: vm.mapMarker.lng};
    return ltDataAuth.editLocation(latlng.lat, latlng.lng, title.pageid)
    .then(function() {
      title.coordinates = angular.extend(title.coordinates || {}, latlng);
    });
  }
});
