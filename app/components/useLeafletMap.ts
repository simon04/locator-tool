import {Ref, watch} from 'vue';
import {useLocalStorage} from '@vueuse/core';
import * as L from 'leaflet';
import ControlGeocoder from 'leaflet-control-geocoder';
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?raw';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/style.css';

export type MapView = {
  lat: number;
  lng: number;
  zoom: number;
};

export function useLeafletMap(mapRef: Ref<HTMLElement | null>) {
  const map = new L.Map(mapRef.value!).fitWorld();

  const mapLayer = useLocalStorage('mapLayer', '');
  const mapView = useLocalStorage<MapView>('mapView', {
    lat: 51.505,
    lng: -0.09,
    zoom: 13
  });

  map.attributionControl.setPrefix(
    `<a href="https://github.com/simon04/locator-tool/" target="_blank" rel="external noopener">@simon04/locator-tool</a>
    (<a href="https://github.com/simon04/locator-tool/blob/master/LICENSE" target="_blank" rel="external noopener">GPL v3</a>)`
  );

  const external = BoxArrowUpRight;
  const osm = `OSM ${external}`;
  const maxZoomOptions = {
    maxZoom: 21,
    maxNativeZoom: 19
  };
  const layers = {
    [osm]: new L.TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      ...maxZoomOptions,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    OpenTopoMap: new L.TileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      ...maxZoomOptions,
      maxNativeZoom: 17,
      attribution:
        '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>), <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }),
    ['Wikimedia Maps']: new L.TileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
      ...maxZoomOptions,
      maxNativeZoom: 19,
      attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
    }),
    ['Esri World Imagery']: new L.TileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        ...maxZoomOptions,
        maxNativeZoom: 19,
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }
    ),
    [`basemap.at 🇦🇹 ${external}`]: new L.TileLayer(
      `https://mapsneu.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg`,
      {
        ...maxZoomOptions,
        maxNativeZoom: 19,
        attribution: '&copy; <a href="https://basemap.at/">basemap.at</a>'
      }
    )
  };
  const layersControl = new L.Control.Layers().addTo(map);
  for (const [name, layer] of Object.entries(layers)) {
    layersControl.addBaseLayer(layer, name);
  }
  (layers[mapLayer.value as keyof typeof layers] || layers[osm]).addTo(map);

  const geocoder = new ControlGeocoder({
    placeholder: '…',
    position: 'topleft',
    defaultMarkGeocode: false
  });
  geocoder.on('markgeocode', result => map.fitBounds(result.geocode.bbox));
  geocoder.addTo(map);

  map.on('baselayerchange', $event => (mapLayer.value = $event.name));

  map.on('zoomend modeend', () => {
    mapView.value = {
      lat: map.getCenter().lat,
      lng: map.getCenter().lng,
      zoom: map.getZoom()
    };
  });
  watch(
    mapView,
    mapView => {
      map.setView([mapView.lat, mapView.lng], mapView.zoom);
    },
    {immediate: true}
  );

  return {map, mapLayer, mapView};
}
