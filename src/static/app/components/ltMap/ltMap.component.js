angular.module('app').component('ltMap', {
  bindings: {
    mapView: '<',
    mapMarker: '<',
    mapObjectLocation: '<'
  },
  templateUrl: 'app/components/ltMap/ltMap.html',
  controller: ltMap
});

function ltMap() {
  var vm = this;
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

  vm.mapClick = function($event) {
    if ($event.latlng) {
      vm.mapMarker.lat = $event.latlng.lat;
      vm.mapMarker.lng = $event.latlng.lng;
    }
  };
}
