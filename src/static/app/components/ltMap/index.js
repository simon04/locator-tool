import template from './ltMap.html';

class ltMap {
  constructor($scope) {
    this.$scope = $scope;
  }

  mapInit(L, map) {
    const attribution = `<a href="https://www.openstreetmap.org/copyright" target="_blank">
      OpenStreetMap</a> contributors`;
    const wm = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: 'Wikimedia maps | Map data &copy; ' + attribution
    });
    const osm = L.tileLayer('https://tiles.wmflabs.org/osm/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution
    });
    const osmOrg = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution
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
  }

  mapClick($event) {
    // http://leafletjs.com/reference.html#mouse-event
    const {latlng: {lat, lng}, originalEvent: {shiftKey}} = $event;
    if (lat && lng) {
      const target = shiftKey ? this.mapObjectLocation : this.mapMarker;
      const coordinates = target.withLatLng({
        lat: roundToPrecision(lat),
        lng: roundToPrecision(lng)
      });
      this.$scope.$emit('coordinatesChanged', coordinates);
    }
  }
}
ltMap.$inject = ['$scope'];

export default {
  bindings: {
    mapView: '<',
    mapMarker: '<',
    mapObjectLocation: '<'
  },
  template,
  controller: ltMap
};

function roundToPrecision(value, precision = 10e7) {
  return (value * precision) % 1 ? Math.round(value * precision) / precision : value;
}
