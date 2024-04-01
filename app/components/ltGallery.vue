<template>
  <div v-if="isLoading" class="mt-3 row">
    <div class="col-sm-12">
      <div class="jumbotron">
        <p>{{ t('Loading file details …') }}</p>
        <lt-spinner />
      </div>
    </div>
  </div>

  <div v-if="!isLoading" class="mt-3 row">
    <div class="col-sm-12">
      <label class="me-3">{{ t('Sorting') }}:</label>
      <div v-for="column in sortColumns" :key="column.key" class="form-check form-check-inline">
        <label class="form-check-label">
          <svg v-if="column.icon" class="octicon"><use :xlink:href="column.icon"></use></svg>
          {{ column.label }}
          <input
            v-model="sortColumn"
            class="form-check-input"
            type="radio"
            name="sortColumn"
            :value="column.key"
          />
        </label>
      </div>
    </div>
  </div>

  <div class="mt-3 row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
    <div v-for="title in sortedTitles" :key="title" class="col">
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
import {useSorted} from '@vueuse/core';
import {FileDetails, getFileDetails} from '../api/ltData';
import {getCoordinates} from '../api/ltData';
import {getFiles} from '../api/ltData';
import {CommonsFile} from '../model';
import ltFileMetadata from './ltFileMetadata.vue';
import ltFileThumbnail from './ltFileThumbnail.vue';
import ltSpinner from './ltSpinner.vue';
import {t} from './useI18n';
import {useAppTitle, routeTitlePart} from './useAppTitle';

const $route = useRoute();
const isLoading = ref(true);
const titles = ref<(CommonsFile & FileDetails)[]>([]);

type SortColumn = keyof Pick<
  CommonsFile & FileDetails,
  'file' | 'description' | 'author' | 'timestamp'
>;
const sortColumns: {key: SortColumn; label: string; icon?: string}[] = [
  {key: 'file', label: t('Title'), icon: undefined},
  {key: 'description', label: t('Description'), icon: undefined},
  {key: 'author', label: t('Author'), icon: '#person'},
  {key: 'timestamp', label: t('Date'), icon: '#calendar'}
];
const sortColumn = ref<SortColumn>('file');
const sortDirection = ref(1);
const sortedTitles = useSorted(
  titles,
  (t1, t2) => sortDirection.value * t1[sortColumn.value]?.localeCompare(t2[sortColumn.value]) ?? 0
);

useAppTitle(routeTitlePart(), t('Gallery'));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
getFiles($route.query as any)
  .then(t => getCoordinates(t))
  .then(t => (titles.value = t as unknown as (CommonsFile & FileDetails)[]))
  .finally(() => {
    isLoading.value = false;
    titles.value.forEach(title =>
      getFileDetails(title.pageid, 'categories|imageinfo', 'extmetadata').then(fileDetails =>
        Object.assign(title, fileDetails)
      )
    );
  });
</script>
