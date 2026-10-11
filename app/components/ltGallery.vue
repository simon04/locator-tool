<template>
  <div v-if="isLoading" class="mt-5 row">
    <div class="sm:col-12">
      <p>{{ t('Loading file details …') }}</p>
      <lt-spinner />
    </div>
  </div>

  <div v-else-if="!isReady" class="row mt-5">
    <div class="sm:col-12">
      <div class="alert theme-warning">
        <ExclamationTriangleFill class="me-1" />
        {{ error }}
      </div>
    </div>
  </div>

  <div v-else class="mt-5 row">
    <div class="sm:col-12 d-flex flex-wrap align-items-center gap-5">
      <label>{{ t('Sorting') }}:</label>
      <div v-for="column in sortColumns" :key="column.key" class="form-field">
        <input
          :id="`sortColumn-${column.key}`"
          v-model="sortColumn"
          class="radio"
          type="radio"
          name="sortColumn"
          :value="column.key"
        />
        <label :for="`sortColumn-${column.key}`" class="icon-link">
          <component :is="column.icon" v-if="column.icon" />
          {{ column.label }}
        </label>
      </div>
      <div class="form-field">
        <input
          id="sortDirection"
          v-model="sortDirection"
          class="check"
          type="checkbox"
          :true-value="-1"
          :false-value="1"
        />
        <label for="sortDirection">
          <SortUp />
          <span class="visually-hidden">{{ t('Inverse sorting') }}</span>
        </label>
      </div>
    </div>
  </div>

  <div class="mt-5 row row-cols-1 md:row-cols-2 lg:row-cols-3 xl:row-cols-4 g-7">
    <div v-for="title in sortedTitles" :key="title.file" class="col">
      <lt-gallery-card :title="title" />
    </div>
  </div>

  <lt-file-modal-dialog @prev="prevImage(sortedTitles)" @next="nextImage(sortedTitles)" />
</template>

<script setup lang="ts">
import {useAsyncState, useSorted} from '@vueuse/core';
import CalendarEvent from 'bootstrap-icons/icons/calendar-event.svg?component';
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
import PersonFill from 'bootstrap-icons/icons/person-fill.svg?component';
import SortUp from 'bootstrap-icons/icons/sort-up.svg?component';
import {onMounted, ref} from 'vue';

import {getCoordinates} from '../api/coordinates';
import {getFiles} from '../api/files';
import type {FileDetails} from '../api/imageinfo';
import type {CommonsFile} from '../model';
import ltFileModalDialog from './ltFileModalDialog.vue';
import ltGalleryCard from './ltGalleryCard.vue';
import ltSpinner from './ltSpinner.vue';
import {useAppTitle, routeTitlePart} from './useAppTitle';
import {t} from './useI18n';
import {useLtRoute} from './useLtRoute';
import {useModalDialog} from './useModalDialog';

const {$query} = useLtRoute();
const {
  error,
  isLoading,
  isReady,
  execute,
  state: titles
} = useAsyncState(() => getFiles($query.value).then(t => getCoordinates(t)), [], {
  immediate: false
});

const {prevImage, nextImage} = useModalDialog();

type SortColumn = keyof Pick<
  CommonsFile & FileDetails,
  'file' | 'description' | 'author' | 'timestamp'
>;
const sortColumns: {key: SortColumn; label: string; icon?: string}[] = [
  {key: 'file', label: t('Title'), icon: undefined},
  {key: 'description', label: t('Description'), icon: undefined},
  {key: 'author', label: t('Author'), icon: PersonFill},
  {key: 'timestamp', label: t('Date'), icon: CalendarEvent}
];
const sortColumn = ref<SortColumn>('file');
const sortDirection = ref(1);
const sortedTitles = useSorted(
  titles,
  (t1, t2) => sortDirection.value * (t1[sortColumn.value]?.localeCompare(t2[sortColumn.value]) ?? 0)
);

useAppTitle(routeTitlePart(), t('Gallery'));

onMounted(() => execute());
</script>
