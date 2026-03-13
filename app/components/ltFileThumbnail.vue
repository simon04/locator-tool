<template>
  <img
    class="img-fluid img-thumbnail fade-in-image"
    loading="lazy"
    :src="lazyUrl"
    :lazy-img="thumbnailUrl"
    style="max-height: 100%; cursor: zoom-in; width: 100%"
    @click="modalDialogFile = file"
    @load="setLazyImg($event)"
  />
</template>

<script setup lang="ts">
import {computed} from 'vue';

import type {FileDetails} from '../api/ltData';
import type {CommonsFile} from '../model';
import {useModalDialog} from './useModalDialog';

const {modalDialogFile, setLazyImg} = useModalDialog();

const props = defineProps<{
  file: CommonsFile & FileDetails;
}>();

const lazyUrl = computed(() => props.file.imageUrl(120));

const thumbnailUrl = computed(() => props.file.imageUrl(1280));
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
