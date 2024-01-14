<template>
  <div ref="mapRef" class="map fill" style="min-height: 300px"></div>
</template>

<script setup lang="ts">
import L from 'leaflet';
import {LatLng} from '../model';
import {onMounted, ref, watch} from 'vue';
import {useLeafletMap} from './useLeafletMap';
import type {MapView} from './useLeafletMapView';

const props = defineProps<{
  mapView: MapView;
  mapMarker: LatLng;
  mapObjectLocation: LatLng;
}>();

const emit = defineEmits<{
  coordinatesChanged: [coordinates: LatLng, $event: L.LeafletMouseEvent];
  mapViewChanged: [mapView: MapView];
}>();

const mapRef = ref<HTMLElement | null>(null);

onMounted(() => {
  const map = useLeafletMap(mapRef);

  map.on('click', $event => mapClick($event));
  map.on('zoomend modeend', () => {
    emit('mapViewChanged', {
      lat: map.getCenter().lat,
      lng: map.getCenter().lng,
      zoom: map.getZoom()
    });
  });
  watch(
    () => props.mapView,
    mapView => map.setView([mapView.lat, mapView.lng], mapView.zoom),
    {immediate: true}
  );

  watch(() => props.mapMarker, mapMarkerUpdater(map));
  watch(() => props.mapObjectLocation, mapMarkerUpdater(map));
});

function mapMarkerUpdater(map: L.Map): (mapMarker: LatLng) => void {
  let marker: L.Marker | undefined;
  return mapMarker => {
    const {lat, lng} = mapMarker;
    if (mapMarker.isDefined && marker) {
      marker.setLatLng({lat, lng});
    } else if (mapMarker.isDefined) {
      const icon = L.divIcon({
        className: 'b-0',
        html: `<div title="Object location"><svg class="octicon" style="color: red"><use xlink:href="#squirrel"></use></svg></div>`,
        iconAnchor: [6, 6],
        iconSize: [12, 12]
      });
      marker = L.marker(
        {lat, lng},
        mapMarker.type === 'Location' ? {draggable: true} : {draggable: true, icon}
      )
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
  const target = shiftKey ? props.mapObjectLocation : props.mapMarker;
  const coordinates = target.withLatLng(lat, lng).roundToPrecision();
  emit('coordinatesChanged', coordinates, $event);
}

function markerMoveend($event: L.LeafletMouseEvent, target: LatLng): void {
  const {lat, lng} = ($event.target as L.Marker).getLatLng();
  if (!lat || !lng) return;
  const coordinates = target.withLatLng(lat, lng).roundToPrecision();
  emit('coordinatesChanged', coordinates, $event);
}
</script>
