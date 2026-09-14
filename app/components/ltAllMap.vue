<template>
  <div ref="mapRef" class="map h-100" style="min-height: 300px"></div>
</template>

<script setup lang="ts">
import maplibregl from 'maplibre-gl';
import {type App, createApp, onMounted, reactive, ref} from 'vue';

import * as getCoordinates from '../api/coordinates';
import * as getFiles from '../api/files';
import {geosearch as runGeosearch} from '../api/geosearch';
import {getFileDetails} from '../api/imageinfo';
import type {CommonsFile} from '../model';
import {useRouter} from '../router';
import LtGalleryCard from './ltGalleryCard.vue';
import {useAppTitle, routeTitlePart} from './useAppTitle';
import {t} from './useI18n';
import {useLtRoute} from './useLtRoute';
import {useMaplibreMap} from './useMaplibreMap';

const {$query, hasFilesUserCategory} = useLtRoute();
const $router = useRouter();
const mapRef = ref<HTMLElement | null>(null);
const mapState = useMaplibreMap(mapRef);

let markers: maplibregl.Marker[] = [];

useAppTitle(routeTitlePart(), t('Map'));

onMounted(async () => {
  const {map} = mapState;
  if (hasFilesUserCategory.value) {
    const titles = await getFiles.getFiles($query.value);
    const files = await getCoordinates.getCoordinates(titles);
    const bounds = new maplibregl.LngLatBounds();
    files.forEach(title => {
      const marker = addMarker(map, title);
      if (marker) bounds.extend(marker.getLngLat());
    });
    if (!bounds.isEmpty()) map.fitBounds(bounds, {padding: 40});
  } else {
    geosearch(map);
    map.on('moveend', () => geosearch(map));
  }
});

async function geosearch(map: maplibregl.Map) {
  const files = await runGeosearch(map.getBounds());
  markers = markers.filter(marker => {
    if (marker.getPopup()?.isOpen()) return true;
    marker.remove();
    return false;
  });
  files.forEach(f => addMarker(map, f));
}

function addMarker(map: maplibregl.Map, title: CommonsFile): maplibregl.Marker | undefined {
  if (!title.coordinates.isDefined) return;
  const {lat, lng} = title.coordinates;
  const element = document.createElement('div');
  element.className = 'lt-circle-marker';
  element.title = title.file;
  const marker = new maplibregl.Marker({element})
    .setLngLat([lng!, lat!])
    .setPopup(buildPopup(title))
    .addTo(map);
  markers.push(marker);
  return marker;
}

function buildPopup(title: CommonsFile): maplibregl.Popup {
  let app: App | undefined;
  const div = document.createElement('div');
  const popup = new maplibregl.Popup({maxWidth: '400px'}).setDOMContent(div);
  popup.on('open', () => {
    title = reactive(title);
    title.$geolocate = $router.resolve({
      name: 'geolocate',
      query: {files: title.file}
    }).href;
    app = createApp(LtGalleryCard, {title});
    getFileDetails(title.pageid, 'categories|imageinfo', 'extmetadata').then(fileDetails => {
      Object.assign(title, fileDetails);
    });
    app.mount(div);
    // Popup.addTo computes the anchor (and focuses the first element) before firing `open`,
    // i.e. while the content is still empty — measure it again now that the card is mounted
    popup.setDOMContent(div);
  });
  popup.on('close', () => app?.unmount());
  return popup;
}
</script>

<style scoped>
.map {
  margin-left: calc(var(--bs-gutter-x) * -0.5);
  margin-right: calc(var(--bs-gutter-x) * -0.5);
}
:deep(.lt-circle-marker) {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #2a4b8d;
  opacity: 0.5;
  cursor: pointer;
}
:deep(.maplibregl-popup-content) {
  background-color: var(--bs-body-bg);
  padding: 0.5rem;
}
:deep(.maplibregl-popup-anchor-top .maplibregl-popup-tip),
:deep(.maplibregl-popup-anchor-top-left .maplibregl-popup-tip),
:deep(.maplibregl-popup-anchor-top-right .maplibregl-popup-tip) {
  border-bottom-color: var(--bs-body-bg);
}
:deep(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip),
:deep(.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip),
:deep(.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip) {
  border-top-color: var(--bs-body-bg);
}
:deep(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
  border-right-color: var(--bs-body-bg);
}
:deep(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
  border-left-color: var(--bs-body-bg);
}
</style>
