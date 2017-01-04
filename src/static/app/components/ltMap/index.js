import template from './ltMap.html';

export default {
  bindings: {
    mapView: '<',
    mapMarker: '<',
    mapObjectLocation: '<'
  },
  template,
  controller: ltMap
};

function ltMap() {
  const vm = this;
  vm.mapInit = function(L, map) {
    const wm = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Wikimedia maps | Map data &copy; ' +
          '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const osm = L.tileLayer('https://tiles.wmflabs.org/osm/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">' +
          'OpenStreetMap</a> contributors'
    });
    const osmOrg = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '<a href="https://www.openstreetmap.org/copyright" target="_blank">' +
          'OpenStreetMap</a> contributors'
    });
    L.control.layers({
      'OSM': osmOrg,
      'OSM @wmflabs.org': osm,
      'Wikimedia maps': wm
    }).addTo(map);
    osm.addTo(map);
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
