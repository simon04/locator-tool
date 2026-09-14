<template>
  <div ref="mapRef" class="map h-100" style="min-height: 300px"></div>
</template>

<script setup lang="ts">
import HouseFill from 'bootstrap-icons/icons/house-fill.svg?raw';
import maplibregl from 'maplibre-gl';
import {onMounted, ref, watch} from 'vue';

import {LatLng} from '../model';
import {useMaplibreMap} from './useMaplibreMap';

const coordinates = defineModel<LatLng>('coordinates', {required: true});
const objectLocation = defineModel<LatLng>('objectLocation', {required: true});

const mapRef = ref<HTMLElement | null>(null);
const mapState = useMaplibreMap(mapRef);

onMounted(() => {
  const {map} = mapState;

  map.on('click', $event => mapClick($event));

  watch(coordinates, mapMarkerUpdater(map), {immediate: true});
  watch(objectLocation, mapMarkerUpdater(map), {immediate: true});
});

function mapMarkerUpdater(map: maplibregl.Map): (mapMarker: LatLng) => void {
  let marker: maplibregl.Marker | undefined;
  return mapMarker => {
    const {lat, lng} = mapMarker;
    if (mapMarker.isDefined && marker) {
      recenter(map, [lng!, lat!]);
      marker.setLngLat([lng!, lat!]);
    } else if (mapMarker.isDefined) {
      recenter(map, [lng!, lat!]);
      const options: maplibregl.MarkerOptions = {draggable: true};
      if (mapMarker.type !== 'Location') {
        const element = document.createElement('div');
        element.title = 'Object location';
        element.style.color = 'red';
        element.innerHTML = HouseFill;
        options.element = element;
      }
      const newMarker = new maplibregl.Marker(options).setLngLat([lng!, lat!]).addTo(map);
      // Evented.on returns a Subscription, hence it must not be chained onto the marker
      newMarker.on('dragend', () => markerDragend(newMarker, mapMarker));
      // Markers live inside the canvas container, hence a click on the marker would
      // bubble up to the map and move the Location to the position under the cursor
      newMarker.getElement().addEventListener('click', $event => $event.stopPropagation());
      marker = newMarker;
    } else if (marker) {
      marker.remove();
      marker = undefined;
    }
  };
}

function recenter(map: maplibregl.Map, center: maplibregl.LngLatLike): void {
  // A position within the current viewport was typically picked interactively (by clicking
  // the map or dragging a marker) and is plainly visible, hence leave the view alone
  if (map.getBounds().contains(center)) return;
  map.flyTo({center});
}

function mapClick($event: maplibregl.MapMouseEvent): void {
  const {
    lngLat: {lat, lng},
    originalEvent: {shiftKey}
  } = $event;
  if (!lat || !lng) return;
  setLatLng(shiftKey ? 'Object location' : 'Location', lat, lng);
}

function markerDragend(marker: maplibregl.Marker, target: LatLng): void {
  const {lat, lng} = marker.getLngLat();
  if (!lat || !lng) return;
  setLatLng(target.type, lat, lng);
}

function setLatLng(type: LatLng['type'], lat: number, lng: number) {
  if (type === 'Object location') {
    objectLocation.value = objectLocation.value.withLatLng(lat, lng).roundToPrecision();
  } else {
    coordinates.value = coordinates.value.withLatLng(lat, lng).roundToPrecision();
  }
}
</script>
