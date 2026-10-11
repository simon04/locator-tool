<template>
  <dialog
    v-if="modalDialogFile"
    ref="dialog"
    class="dialog dialog-fullscreen"
    data-bs-theme="dark"
    autofocus
    style="cursor: zoom-out"
    @click="dialog?.close()"
    @close="modalDialogFile = undefined"
  >
    <div class="carousel carousel-overlay h-100">
      <div class="carousel-inner h-100">
        <div class="carousel-item h-100 active">
          <img
            :src="thumbnailUrl"
            :lazy-srcset="thumbnailUrls"
            sizes="auto"
            @load="setLazyImg($event)"
            class="d-block w-100 h-100 object-fit-contain"
          />
        </div>
      </div>
      <div class="lt-caption d-none md:d-block p-5 rounded-5 bg-black bg-50 text-center">
        <h5>{{ modalDialogFile.file }}</h5>
        <lt-file-metadata :file="modalDialogFile" />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import {useMagicKeys} from '@vueuse/core';
import {computed, onUnmounted, useTemplateRef, watch} from 'vue';

import {imageUrl, imageUrls} from '../model';
import ltFileMetadata from './ltFileMetadata.vue';
import {useModalDialog} from './useModalDialog';

const {modalDialogFile, setLazyImg} = useModalDialog();

// the native <dialog> provides the backdrop, the focus trap and closing on Escape
const dialog = useTemplateRef<HTMLDialogElement>('dialog');
watch(dialog, d => d?.showModal());
// no close event fires when unmounted while open (e.g. on navigation), hence reset the shared state
onUnmounted(() => (modalDialogFile.value = undefined));

const thumbnailUrl = computed(() =>
  modalDialogFile.value ? imageUrl(modalDialogFile.value, 1280) : undefined
);

const thumbnailUrls = computed(() =>
  modalDialogFile.value ? imageUrls(modalDialogFile.value) : ''
);

const emit = defineEmits<{
  prev: [];
  next: [];
}>();

const keys = useMagicKeys();
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

<style scoped>
/* v6 removed .carousel-caption, hence position the caption the way it used to be */
.lt-caption {
  position: absolute;
  inset-inline: 15%;
  inset-block-end: 4.5rem;
}
.lt-caption :deep(a) {
  color: var(--bs-white);
}
</style>
