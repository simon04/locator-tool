import template from './ltMap.html';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import {LatLng} from '../model';
import {MapView} from './ltAllMap';

let layerFromLocalStorage: string;

export class LtMapController implements ng.IComponentController {
  mapView: MapView;
  mapMarker: LatLng;
  mapObjectLocation: LatLng;

  public static $inject = ['$scope', 'localStorageService'];
  constructor(
    private $scope: ng.IScope,
    private localStorageService: angular.local.storage.ILocalStorageService
  ) {
    layerFromLocalStorage = this.localStorageService.get('mapLayer') || 'OSM';
  }

  mapInit(_L: unknown, map: L.Map): void {
    LtMapController._mapInit(map);
  }

  static _mapInit(map: L.Map): void {
    // https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-269750768
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl
    });
    map.attributionControl.setPrefix(
      [
        '<a href="https://github.com/simon04/locator-tool/" ',
        'target="_blank">@simon04/locator-tool</a>',
        '(<a href="https://github.com/simon04/locator-tool/blob/master/LICENSE" ',
        'target="_blank">GPL v3</a>)'
      ].join(' ')
    );
    const external = '<svg class="octicon"><use xlink:href="#link-external"></use></svg>';
    const osm = `OSM ${external}`;
    const maxZoomOptions = {
      maxZoom: 21,
      maxNativeZoom: 19
    };
    const layers = {
      [osm]: L.tileLayer.provider('OpenStreetMap', maxZoomOptions),
      ['OSM @wmflabs.org']: L.tileLayer.provider('HikeBike', {
        name: 'OSM @wmflabs.org',
        variant: 'osm'
      }),
      ['Wikimedia Maps']: L.tileLayer.provider('Wikimedia', maxZoomOptions),
      [`basemap.at 🇦🇹 ${external}`]: L.tileLayer.provider('BasemapAT.orthofoto', maxZoomOptions),
      [`Mapy.cz Photo 🇨🇿 ${external}`]: L.tileLayer.provider('mapyCZ')
    };
    const layersControl = L.control.layers().addTo(map);
    Object.keys(layers).forEach(name => layersControl.addBaseLayer(layers[name], name));
    (layers[layerFromLocalStorage] || layers[osm]).addTo(map);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geocoder = new (L.Control as any).Geocoder({
      placeholder: '…',
      position: 'topleft',
      defaultMarkGeocode: false
    });
    geocoder.on('markgeocode', result => map.fitBounds((result.geocode || result).bbox));
    geocoder.addTo(map);
  }

  mapClick($event: L.LeafletMouseEvent): void {
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

  markerMoveend($event: L.LeafletMouseEvent, target: LatLng): void {
    const {lat, lng} = ($event.target as L.Marker).getLatLng();
    if (lat && lng) {
      const coordinates = target.withLatLng({
        lat: roundToPrecision(lat),
        lng: roundToPrecision(lng)
      });
      this.$scope.$emit('coordinatesChanged', coordinates);
    }
  }

  mapLayerChange($event: L.LayersControlEvent): void {
    this.localStorageService.set('mapLayer', $event.name);
  }
}

export default {
  bindings: {
    mapView: '<',
    mapMarker: '<',
    mapObjectLocation: '<'
  },
  template,
  controller: LtMapController
} as ng.IComponentOptions;

function roundToPrecision(value?: number, fractionDigits = 5): number {
  return typeof value === 'number' ? +value.toFixed(fractionDigits) : value;
}
