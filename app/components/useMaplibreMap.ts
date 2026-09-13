import {useLocalStorage} from '@vueuse/core';
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?raw';
import Search from 'bootstrap-icons/icons/search.svg?raw';
import Stack from 'bootstrap-icons/icons/stack.svg?raw';
import maplibregl from 'maplibre-gl';
import {onMounted, onUnmounted, type Ref} from 'vue';

import {search as nominatimSearch, type NominatimResult} from '../api/nominatim';

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

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'lt-layers-toggle';
    toggle.setAttribute('aria-label', 'Base layer');
    toggle.setAttribute('aria-haspopup', 'true');
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

// https://operations.osmfoundation.org/policies/nominatim/ forbids autocomplete
// (searching on every keystroke) and caps requests at 1/second.
const nominatimMinIntervalMs = 1000;

/** Custom control to search for a place or address, backed by Nominatim. */
class GeocoderControl implements maplibregl.IControl {
  private map?: maplibregl.Map;
  private results?: HTMLElement;
  private requestId = 0;
  private lastRequestAt = 0;

  onAdd(map: maplibregl.Map): HTMLElement {
    this.map = map;
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group lt-geocoder';

    const icon = document.createElement('span');
    icon.className = 'lt-geocoder-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = Search;
    container.append(icon);

    const form = document.createElement('form');
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = '…';
    input.setAttribute('aria-label', 'Search for a place or address');
    form.append(input);
    form.addEventListener('submit', event => {
      event.preventDefault();
      void this.runSearch(input.value);
    });
    container.append(form);

    const results = document.createElement('ul');
    results.className = 'lt-geocoder-results';
    container.append(results);
    this.results = results;

    return container;
  }

  private async runSearch(query: string): Promise<void> {
    const results = this.results;
    if (!results) return;
    results.replaceChildren();
    if (!query.trim()) return;
    if (Date.now() - this.lastRequestAt < nominatimMinIntervalMs) return;
    this.lastRequestAt = Date.now();
    const requestId = ++this.requestId;
    const places = await nominatimSearch(query);
    if (requestId !== this.requestId) return;
    for (const place of places) {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = place.display_name;
      button.addEventListener('click', () => this.select(place));
      li.append(button);
      results.append(li);
    }
  }

  private select(place: NominatimResult): void {
    const [south, north, west, east] = place.boundingbox.map(Number);
    this.map?.fitBounds([
      [west, south],
      [east, north]
    ]);
    this.results?.replaceChildren();
  }

  onRemove(): void {
    this.map = undefined;
    this.results = undefined;
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
      // Shift+drag box zoom swallows the subsequent click (BoxZoomHandler calls
      // suppressClick), which the map uses for the Object location
      boxZoom: false,
      attributionControl: false
    });

    map.addControl(
      new maplibregl.AttributionControl({
        customAttribution: `<a href="https://github.com/simon04/locator-tool/" target="_blank" rel="external noopener">@simon04/locator-tool</a>
        (<a href="https://github.com/simon04/locator-tool/blob/master/LICENSE" target="_blank" rel="external noopener">GPL v3</a>)`
      })
    );
    map.addControl(new maplibregl.NavigationControl(), 'top-left');
    map.addControl(new GeocoderControl(), 'top-left');
    map.addControl(new BaseLayerControl(mapLayer, osm), 'top-right');

    map.on('moveend', () => {
      const {lat, lng} = map.getCenter();
      mapView.value = {lat, lng, zoom: map.getZoom()};
    });
  });

  onUnmounted(() => map?.remove());

  return {
    get map() {
      return map;
    },
    mapLayer,
    mapView
  };
}
