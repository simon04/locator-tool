<template>
  <img
    ref="img"
    class="img-fluid img-thumbnail fade-in-image"
    loading="lazy"
    :src="thumbnailUrl"
    :lazy-srcset="thumbnailUrls"
    :sizes="sizes"
    style="max-height: 100%; cursor: zoom-in; width: 100%"
    @click="modalDialogFile = file"
    @load="setLazyImg($event)"
  />
</template>

<script setup lang="ts">
import {useElementSize} from '@vueuse/core';
import {computed, useTemplateRef} from 'vue';

import type {FileDetails} from '../api/imageinfo';
import {imageUrl, imageUrls, type CommonsFile} from '../model';
import {useModalDialog} from './useModalDialog';

const {modalDialogFile, setLazyImg} = useModalDialog();

const props = defineProps<{
  file: CommonsFile & FileDetails;
}>();

const thumbnailUrl = computed(() => imageUrl(props.file, 500));

const thumbnailUrls = computed(() => imageUrls(props.file));

// `sizes="auto"` would make the intrinsic size depend on the layout size,
// which collapses the aspect ratio in the flexbox layout of lt-geolocate
const img = useTemplateRef<HTMLImageElement>('img');
const {width} = useElementSize(img);
const sizes = computed(() => `${Math.ceil(width.value) || 500}px`);
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
