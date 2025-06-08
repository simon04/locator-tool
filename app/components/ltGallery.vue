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
          <span class="icon-link">
            <component :is="column.icon" v-if="column.icon" />
            {{ column.label }}
          </span>
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
      <lt-gallery-card :title="title" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useSorted} from '@vueuse/core';
import {FileDetails, getFileDetails} from '../api/ltData';
import {getCoordinates} from '../api/ltData';
import {getFiles} from '../api/ltData';
import {CommonsFile} from '../model';
import ltSpinner from './ltSpinner.vue';
import {t} from './useI18n';
import {useAppTitle, routeTitlePart} from './useAppTitle';
import CalendarEvent from 'bootstrap-icons/icons/calendar-event.svg?component';
import PersonFill from 'bootstrap-icons/icons/person-fill.svg?component';
import ltGalleryCard from './ltGalleryCard.vue';
import {useLtRoute} from './useLtRoute';

const {$query} = useLtRoute();
const isLoading = ref(true);
const titles = ref<(CommonsFile & FileDetails)[]>([]);

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

onMounted(async () => {
  const titles0 = await getFiles($query);
  const titles1 = await getCoordinates(titles0);
  titles.value = titles1 as unknown as (CommonsFile & FileDetails)[];
  isLoading.value = false;
  for (const title of titles.value) {
    getFileDetails(title.pageid, 'categories|imageinfo', 'extmetadata').then(fileDetails =>
      Object.assign(title, fileDetails)
    );
  }
});
</script>
