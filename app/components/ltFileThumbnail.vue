<template>
  <img
    class="img-fluid img-thumbnail fade-in-image"
    loading="lazy"
    :src="lazyUrl"
    :lazy-img="thumbnailUrl"
    style="max-height: 100%; cursor: zoom-in; width: 100%"
    @click="dialogShown = true"
    @load="setLazyImg($event)"
  />
  <div
    v-if="dialogShown"
    class="modal"
    style="display: block; cursor: zoom-out; background: rgba(0, 0, 0, 0.5)"
    @click="dialogShown = false"
  >
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-body text-center">
          <img
            class="img-fluid"
            loading="lazy"
            :src="thumbnailUrl"
            :lazy-img="imageUrl"
            style="width: 100%; height: 100%; object-fit: contain"
            @load="setLazyImg($event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue';
import type {CommonsFile} from '../model';

const dialogShown = ref(false);

const props = defineProps<{
  file: CommonsFile;
}>();

const lazyUrl = computed(() => props.file.imageUrl(120));

const thumbnailUrl = computed(() => props.file.imageUrl(1024));

const imageUrl = computed(() => {
  const width = window.innerWidth * (window.devicePixelRatio || 1);
  // use widths from UploadThumbnailRenderMap = [320, 640, 800, 1280] and MediaViewerThumbnailBucketSizes settings
  return props.file.imageUrl(width > 1280 ? undefined : 1280);
});

function setLazyImg($event: Event) {
  const img = $event.target as HTMLImageElement;
  const lazy = img.getAttribute('lazy-img');
  if (!lazy || img.src === lazy) return;
  img.src = lazy;
}
</script>

<style scoped>
.fade-in-image {
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
