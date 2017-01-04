import template from './ltMap.html';

class ltMap {
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
    const {latlng: {lat, lng}} = $event;
    if (lat && lng) {
      Object.assign(this.mapMarker, {lat: roundToPrecision(lat), lng: roundToPrecision(lng)});
    }
  }
}

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
