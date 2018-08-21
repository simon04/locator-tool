import template from './ltMap.pug';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

let layerFromLocalStorage;

class ltMap {
  constructor($scope, localStorageService) {
    Object.assign(this, {$scope, localStorageService});
    layerFromLocalStorage = this.localStorageService.get('mapLayer') || 'OSM';
  }

  mapInit(L, map) {
    ltMap._mapInit(L, map);
  }

  static _mapInit(L, map) {
    // https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-269750768
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl
    });

    map.attributionControl.setPrefix(false);
    const external = '<svg class="octicon"><use xlink:href="#link-external"></use></svg>';
    const wm = L.tileLayer.provider('Wikimedia', {
      name: 'Wikimedia Maps'
    });
    const osm = L.tileLayer.provider('HikeBike', {
      name: 'OSM @wmflabs.org',
      variant: 'osm'
    });
    const osmOrg = L.tileLayer.provider('OpenStreetMap', {
      name: `OSM ${external}`
    });
    const basemap = L.tileLayer.provider('BasemapAT.orthofoto', {
      name: `basemap.at 🇦🇹 ${external}`
    });
    const mapyCzPhoto = L.tileLayer.provider('mapyCZ', {
      name: `Mapy.cz Photo 🇨🇿 ${external}`
    });
    const layersControl = L.control.layers().addTo(map);
    const layers = [osmOrg, osm, wm, basemap, mapyCzPhoto];
    layers.forEach(l => layersControl.addBaseLayer(l, l.options.name));
    const activeLayer = layers.filter(l => l.options.name === layerFromLocalStorage).shift() || osm;
    activeLayer.addTo(map);
    const geocoder = new L.Control.Geocoder({
      collapsed: false,
      placeholder: '…',
      position: 'topleft',
      defaultMarkGeocode: false
    });
    geocoder.on('markgeocode', result => map.fitBounds((result.geocode || result).bbox));
    geocoder.addTo(map);
  }

  mapClick($event) {
    // http://leafletjs.com/reference.html#mouse-event
    const {
      latlng: {lat, lng},
      originalEvent: {shiftKey}
    } = $event;
    if (lat && lng) {
      const target = shiftKey ? this.mapObjectLocation : this.mapMarker;
      const coordinates = target.withLatLng({
        lat: roundToPrecision(lat),
        lng: roundToPrecision(lng)
      });
      this.$scope.$emit('coordinatesChanged', coordinates);
    }
  }

  markerMoveend($event, target) {
    const {lat, lng} = $event.target.getLatLng();
    if (lat && lng) {
      const coordinates = target.withLatLng({
        lat: roundToPrecision(lat),
        lng: roundToPrecision(lng)
      });
      this.$scope.$emit('coordinatesChanged', coordinates);
    }
  }

  mapLayerChange($event) {
    this.localStorageService.set('mapLayer', $event.name);
  }
}
ltMap.$inject = ['$scope', 'localStorageService'];

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
