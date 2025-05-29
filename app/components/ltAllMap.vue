<template>
  <div ref="mapRef" class="map h-100" style="min-height: 300px"></div>
</template>

<script setup lang="ts">
import {App, createApp, onMounted, reactive, ref} from 'vue';
import {useRoute} from 'vue-router';
import * as L from 'leaflet';
import * as ltData from '../api/ltData';
import {useLeafletMap} from './useLeafletMap';
import {t} from './useI18n';
import {useAppTitle, routeTitlePart} from './useAppTitle';
import LtGalleryCard from './ltGalleryCard.vue';
import type {CommonsFile} from '../model';

const $route = useRoute();
const mapRef = ref<HTMLElement | null>(null);

useAppTitle(routeTitlePart(), t('Map'));

onMounted(async () => {
  const {map} = useLeafletMap(mapRef);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const titles = await ltData.getFiles($route.query as any);
  const files = await ltData.getCoordinates(titles);
  const bounds = files.flatMap(title => {
    if (!title.coordinates.isDefined) return [];
    const {lat, lng} = title.coordinates;
    const marker = new L.CircleMarker({lat, lng}, {color: '#2a4b8d'})
      .bindTooltip(title.file)
      .bindPopup(buildPopup(title))
      .addTo(map);
    return [marker.getLatLng()];
  });
  map.fitBounds(bounds);
});

function buildPopup(title: CommonsFile): L.Popup {
  let app: App;
  let div: HTMLDivElement;
  const popup = new L.Popup({minWidth: 400});
  popup.setContent(() => {
    title = reactive(title);
    app = createApp(LtGalleryCard, {title});
    ltData.getFileDetails(title.pageid, 'categories|imageinfo', 'extmetadata').then(fileDetails => {
      Object.assign(title, fileDetails);
    });
    div = document.createElement('div');
    return div;
  });
  popup.on('add', () => app.mount(div));
  popup.on('remove', () => app.unmount());
  return popup;
}
</script>

<style scoped>
.map {
  margin-left: calc(var(--bs-gutter-x) * -0.5);
  margin-right: calc(var(--bs-gutter-x) * -0.5);
}
:deep(.leaflet-popup-content-wrapper) {
  background-color: var(--bs-body-bg);
}
:deep(.leaflet-popup-content) {
  margin: 0.5rem;
}
</style>
