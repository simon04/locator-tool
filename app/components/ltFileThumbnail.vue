<template>
  <img
    class="img-fluid img-thumbnail fade-in-image"
    loading="lazy"
    :src="thumbnailUrl"
    :lazy-srcset="thumbnailUrls"
    sizes="auto"
    style="max-height: 100%; cursor: zoom-in; width: 100%"
    @click="modalDialogFile = file"
    @load="setLazyImg($event)"
  />
</template>

<script setup lang="ts">
import {computed} from 'vue';

import type {FileDetails} from '../api/imageinfo';
import {imageUrl, imageUrls, type CommonsFile} from '../model';
import {useModalDialog} from './useModalDialog';

const {modalDialogFile, setLazyImg} = useModalDialog();

const props = defineProps<{
  file: CommonsFile & FileDetails;
}>();

const thumbnailUrl = computed(() => imageUrl(props.file, 500));

const thumbnailUrls = computed(() => imageUrls(props.file));
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
