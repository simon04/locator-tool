<template>
  <div
    v-if="modalDialogFile"
    class="modal"
    data-bs-theme="dark"
    style="display: block; cursor: zoom-out; background: rgba(0, 0, 0, 0.5)"
    @click="modalDialogFile = undefined"
  >
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content" data-bs-theme="light">
        <div class="carousel slide w-100 h-100">
          <div class="carousel-inner w-100 h-100">
            <div class="carousel-item w-100 h-100 active">
              <img
                :src="thumbnailUrl"
                :lazy-srcset="thumbnailUrls"
                sizes="auto"
                @load="setLazyImg($event)"
                class="img-fluid d-block w-100 h-100 mx-auto my-auto"
                style="object-fit: contain; max-width: 100vw; max-height: 100vh"
              />
              <div class="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-3">
                <h5>{{ modalDialogFile.file }}</h5>
                <p></p>
                <lt-file-metadata :file="modalDialogFile" />
              </div>
            </div>
          </div>

          <button class="carousel-control-prev" type="button" @click.stop="emit('prev')">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>

          <button class="carousel-control-next" type="button" @click.stop="emit('next')">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useMagicKeys} from '@vueuse/core';
import {computed, watch} from 'vue';

import {imageUrl, imageUrls} from '../model';
import ltFileMetadata from './ltFileMetadata.vue';
import {useModalDialog} from './useModalDialog';

const {modalDialogFile, setLazyImg} = useModalDialog();

const thumbnailUrl = computed(() =>
  modalDialogFile.value ? imageUrl(modalDialogFile.value, 1280) : ''
);

const thumbnailUrls = computed(() =>
  modalDialogFile.value ? imageUrls(modalDialogFile.value) : ''
);

const emit = defineEmits<{
  prev: [];
  next: [];
}>();

const keys = useMagicKeys();
watch(keys['Escape'], () => {
  modalDialogFile.value = undefined;
});
watch(keys['ArrowLeft'], v => {
  if (modalDialogFile.value && v) {
    emit('prev');
  }
});
watch(keys['ArrowRight'], v => {
  if (modalDialogFile.value && v) {
    emit('next');
  }
});
</script>

<style lang="css" scoped>
:deep(.carousel-caption a) {
  color: rgba(var(--bs-white-rgb), var(--bs-text-opacity));
}
</style>
