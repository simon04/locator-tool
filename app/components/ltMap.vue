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
      map.setCenter([lng!, lat!]);
      marker.setLngLat([lng!, lat!]);
    } else if (mapMarker.isDefined) {
      map.setCenter([lng!, lat!]);
      const options: maplibregl.MarkerOptions = {draggable: true};
      if (mapMarker.type !== 'Location') {
        const element = document.createElement('div');
        element.title = 'Object location';
        element.style.color = 'red';
        element.innerHTML = HouseFill;
        options.element = element;
      }
      marker = new maplibregl.Marker(options)
        .setLngLat([lng!, lat!])
        .addTo(map)
        .on('dragend', () => markerDragend(marker!, mapMarker));
    } else if (marker) {
      marker.remove();
      marker = undefined;
    }
  };
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
