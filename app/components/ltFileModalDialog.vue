<template>
  <div
    v-if="modalDialogFile"
    class="modal"
    style="display: block; cursor: zoom-out; background: rgba(0, 0, 0, 0.5)"
    @click="modalDialogFile = undefined"
  >
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="carousel slide w-100 h-100">
          <div class="carousel-inner w-100 h-100">
            <div class="carousel-item w-100 h-100 active">
              <img
                :src="thumbnailUrl"
                :lazy-img="imageUrl"
                @load="setLazyImg($event)"
                class="img-fluid d-block mx-auto my-auto"
                style="
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                  max-width: 100vw;
                  max-height: 100vh;
                "
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
import {useModalDialog} from './useModalDialog';
import ltFileMetadata from './ltFileMetadata.vue';

const {modalDialogFile, setLazyImg} = useModalDialog();

const thumbnailUrl = computed(() => modalDialogFile.value?.imageUrl(1280));

const imageUrl = computed(() => {
  const width = window.innerWidth * (window.devicePixelRatio || 1);
  // https://www.mediawiki.org/wiki/Common_thumbnail_sizes
  // Current standard sizes in Wikimedia production: 20px, 40px, 60px, 120px, 250px, 330px, 500px, 960px, 1280px, 1920px, 3840px
  return modalDialogFile.value?.imageUrl(width > 1280 ? undefined : 1280);
});

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
