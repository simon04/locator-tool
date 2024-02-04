<template>
  <div v-if="isLoading" class="mt-3 row">
    <div class="col-sm-12">
      <div class="jumbotron">
        <p>{{ t('Loading file details …') }}</p>
        <lt-spinner />
      </div>
    </div>
  </div>

  <div class="mt-3 row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
    <div v-for="title in titles" :key="title" class="col">
      <div class="card">
        <div class="card-img-top">
          <lt-file-thumbnail :file="title" />
        </div>
        <div class="card-body">
          <h5 class="card-title">
            {{ title.file }}
            {{ ' ' }}
            <small
              ><a :href="title.url" target="_blank">
                <svg class="octicon">
                  <use xlink:href="#link-external"></use>
                </svg> </a
            ></small>
          </h5>
          <div class="card-text">
            <lt-file-metadata :file="title" :description="false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {useRoute} from 'vue-router';
import {getFileDetails} from '../api/ltData';
import {getCoordinates} from '../api/ltData';
import {getFiles} from '../api/ltData';
import {CommonsFile} from '../model';
import ltFileMetadata from './ltFileMetadata.vue';
import ltFileThumbnail from './ltFileThumbnail.vue';
import ltSpinner from './ltSpinner.vue';
import {t} from './useI18n';

const $route = useRoute();
const isLoading = ref(true);
const titles = ref<CommonsFile[]>([]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
getFiles($route.query as any)
  .then(t => getCoordinates(t))
  .then(t => (titles.value = t))
  .finally(() => {
    isLoading.value = false;
    titles.value.forEach(title =>
      getFileDetails(title.pageid, 'categories|imageinfo', 'extmetadata').then(fileDetails =>
        Object.assign(title, fileDetails)
      )
    );
  });
</script>
