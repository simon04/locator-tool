import {useLocalStorage} from '@vueuse/core';
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?raw';
import Stack from 'bootstrap-icons/icons/stack.svg?raw';
import maplibregl from 'maplibre-gl';
import {onMounted, type Ref} from 'vue';

import 'maplibre-gl/dist/maplibre-gl.css';

export type MapView = {
  lat: number;
  lng: number;
  zoom: number;
};

const external = BoxArrowUpRight;
const osm = `OSM ${external}`;

const maxZoom = 21;

type BaseLayer = {
  name: string;
  tiles: string[];
  maxNativeZoom: number;
  attribution: string;
};

const baseLayers: BaseLayer[] = [
  {
    name: osm,
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    maxNativeZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: 'OpenTopoMap',
    tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
    maxNativeZoom: 17,
    attribution:
      '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>), <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  },
  {
    name: 'Wikimedia Maps',
    tiles: ['https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'],
    maxNativeZoom: 19,
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>'
  },
  {
    name: 'Esri World Imagery',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    ],
    maxNativeZoom: 19,
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  {
    name: `basemap.at 🇦🇹 ${external}`,
    tiles: [
      'https://mapsneu.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg'
    ],
    maxNativeZoom: 19,
    attribution: '&copy; <a href="https://basemap.at/">basemap.at</a>'
  }
];

function buildStyle(activeLayer: string): maplibregl.StyleSpecification {
  const sources: maplibregl.StyleSpecification['sources'] = {};
  const layers: maplibregl.LayerSpecification[] = [];
  baseLayers.forEach((layer, index) => {
    const id = `base-${index}`;
    sources[id] = {
      type: 'raster',
      tiles: layer.tiles,
      tileSize: 256,
      maxzoom: layer.maxNativeZoom,
      attribution: layer.attribution
    };
    layers.push({
      id,
      type: 'raster',
      source: id,
      layout: {visibility: layer.name === activeLayer ? 'visible' : 'none'}
    });
  });
  return {version: 8, sources, layers};
}

/** Custom control switching the visible base (raster) layer. */
class BaseLayerControl implements maplibregl.IControl {
  private map?: maplibregl.Map;

  constructor(
    private readonly active: Ref<string>,
    private readonly fallback: string
  ) {}

  onAdd(map: maplibregl.Map): HTMLElement {
    this.map = map;
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group lt-layers';

    const toggle = document.createElement('div');
    toggle.className = 'lt-layers-toggle';
    toggle.innerHTML = Stack;
    container.append(toggle);

    const list = document.createElement('div');
    list.className = 'lt-layers-list';
    const selected = baseLayers.some(l => l.name === this.active.value)
      ? this.active.value
      : this.fallback;
    for (const layer of baseLayers) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'lt-base-layer';
      input.checked = layer.name === selected;
      input.addEventListener('change', () => this.select(layer.name));
      const span = document.createElement('span');
      span.innerHTML = ` ${layer.name}`;
      label.append(input, span);
      list.append(label);
    }
    container.append(list);
    return container;
  }

  private select(name: string): void {
    for (const [index, layer] of baseLayers.entries()) {
      this.map?.setLayoutProperty(
        `base-${index}`,
        'visibility',
        layer.name === name ? 'visible' : 'none'
      );
    }
    this.active.value = name;
  }

  onRemove(): void {
    this.map = undefined;
  }
}

export function useMaplibreMap(mapRef: Ref<HTMLElement | null>) {
  const mapLayer = useLocalStorage('mapLayer', '');
  const mapView = useLocalStorage<MapView>('mapView', {
    lat: 51.505,
    lng: -0.09,
    zoom: 13
  });

  let map!: maplibregl.Map;

  onMounted(() => {
    const activeLayer = baseLayers.some(l => l.name === mapLayer.value) ? mapLayer.value : osm;

    map = new maplibregl.Map({
      container: mapRef.value!,
      style: buildStyle(activeLayer),
      center: [mapView.value.lng, mapView.value.lat],
      zoom: mapView.value.zoom,
      maxZoom,
      attributionControl: false
    });

    map.addControl(
      new maplibregl.AttributionControl({
        customAttribution: `<a href="https://github.com/simon04/locator-tool/" target="_blank" rel="external noopener">@simon04/locator-tool</a>
        (<a href="https://github.com/simon04/locator-tool/blob/master/LICENSE" target="_blank" rel="external noopener">GPL v3</a>)`
      })
    );
    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    map.addControl(new BaseLayerControl(mapLayer, osm), 'top-right');

    map.on('moveend', () => {
      const {lat, lng} = map.getCenter();
      mapView.value = {lat, lng, zoom: map.getZoom()};
    });
  });

  return {
    get map() {
      return map;
    },
    mapLayer,
    mapView
  };
}
