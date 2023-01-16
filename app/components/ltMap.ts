import template from './ltMap.html?raw';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import {LatLng} from '../model';
import {MapView} from './ltAllMap';
import ControlGeocoder from 'leaflet-control-geocoder';

let layerFromLocalStorage: string;

export class LtMapController implements ng.IComponentController {
  mapView!: MapView;
  mapMarker!: LatLng;
  mapObjectLocation!: LatLng;

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
      [osm]: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        ...maxZoomOptions,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      OpenTopoMap: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        ...maxZoomOptions,
        maxNativeZoom: 17,
        attribution:
          '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>), <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }),
      ['Wikimedia Maps']: L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
        ...maxZoomOptions,
        maxNativeZoom: 19,
        attribution:
          '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
      }),
      ['Esri World Imagery']: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        ...maxZoomOptions,
        maxNativeZoom: 19,
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
      [`basemap.at 🇦🇹 ${external}`]: L.tileLayer(
        `//maps.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg`,
        {
          ...maxZoomOptions,
          maxZoom: 19,
          attribution: '&copy; <a href="https://basemap.at/">basemap.at</a>'
        }
      )
    };
    const layersControl = L.control.layers().addTo(map);
    Object.entries(layers).forEach(([name, layer]) => layersControl.addBaseLayer(layer, name));
    (layers[layerFromLocalStorage] || layers[osm]).addTo(map);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geocoder = new ControlGeocoder({
      placeholder: '…',
      position: 'topleft',
      defaultMarkGeocode: false
    });
    geocoder.on('markgeocode', result => map.fitBounds(result.geocode.bbox));
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
      const coordinates = target.withLatLng(lat, lng).roundToPrecision();
      this.$scope.$emit('coordinatesChanged', coordinates);
    }
  }

  markerMoveend($event: L.LeafletMouseEvent, target: LatLng): void {
    const {lat, lng} = ($event.target as L.Marker).getLatLng();
    if (lat && lng) {
      const coordinates = target.withLatLng(lat, lng).roundToPrecision();
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
