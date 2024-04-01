<template>
  <div ref="mapRef" class="map fill" style="min-height: 300px"></div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import L from 'leaflet';
import * as ltData from '../api/ltData';
import {useLeafletMap} from './useLeafletMap';
import {t} from './useI18n';
import {useAppTitle, routeTitlePart} from './useAppTitle';

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
    const marker = L.circleMarker({lat, lng}, {color: '#2a4b8d'})
      .bindTooltip(title.file)
      .bindPopup(
        () => `
<div style="width: 300px">
  <p><a href="${title.url}" target="_blank">${title.file}</a></p>
  <img src="${title.imageUrl(300)}" style="width: 100%" />
</div>`
      )
      .addTo(map);
    return [marker.getLatLng()];
  });
  map.fitBounds(bounds);
});
</script>
