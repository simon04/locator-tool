<template>
  <div ref="mapRef" class="map h-100" style="min-height: 300px"></div>
</template>

<script setup lang="ts">
import * as L from 'leaflet';
import {LatLng} from '../model';
import {onMounted, ref, watch} from 'vue';
import {useLeafletMap} from './useLeafletMap';
import type {MapView} from './useLeafletMap';
import HouseFill from 'bootstrap-icons/icons/house-fill.svg?raw';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png?no-inline';
import iconUrl from 'leaflet/dist/images/marker-icon.png?no-inline';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png?no-inline';

const coordinates = defineModel<LatLng>('coordinates', {required: true});
const objectLocation = defineModel<LatLng>('objectLocation', {required: true});

defineEmits<{
  mapViewChanged: [mapView: MapView];
}>();

const mapRef = ref<HTMLElement | null>(null);

onMounted(() => {
  const {map} = useLeafletMap(mapRef);

  map.on('click', $event => mapClick($event));

  watch(coordinates, mapMarkerUpdater(map), {immediate: true});
  watch(objectLocation, mapMarkerUpdater(map), {immediate: true});
});

function mapMarkerUpdater(map: L.Map): (mapMarker: LatLng) => void {
  let marker: L.Marker | undefined;
  return mapMarker => {
    const {lat, lng} = mapMarker;
    if (mapMarker.isDefined && marker) {
      map.setView({lat, lng});
      marker.setLatLng({lat, lng});
    } else if (mapMarker.isDefined) {
      map.setView({lat, lng});
      const icon =
        mapMarker.type === 'Location'
          ? new L.Icon({
              iconRetinaUrl,
              iconUrl,
              shadowUrl,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              tooltipAnchor: [16, -28],
              shadowSize: [41, 41]
            })
          : new L.DivIcon({
              className: 'b-0',
              html: `<div title="Object location" style="color: red">${HouseFill}</div>`,
              iconAnchor: [6, 6],
              iconSize: [12, 12]
            });
      marker = new L.Marker({lat, lng}, {draggable: true, icon})
        .on('moveend', $event => markerMoveend($event as L.LeafletMouseEvent, mapMarker))
        .addTo(map);
    } else if (marker) {
      marker.remove();
      marker = undefined;
    }
  };
}

function mapClick($event: L.LeafletMouseEvent): void {
  // http://leafletjs.com/reference.html#mouse-event
  const {
    latlng: {lat, lng},
    originalEvent: {shiftKey}
  } = $event;
  if (!lat || !lng) return;
  setLatLng(shiftKey ? 'Object location' : 'Location', lat, lng);
}

function markerMoveend($event: L.LeafletMouseEvent, target: LatLng): void {
  const {lat, lng} = ($event.target as L.Marker).getLatLng();
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
