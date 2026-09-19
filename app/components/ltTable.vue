<template>
  <div v-if="isLoading" class="mt-3 row">
    <div class="col-sm-12">
      <div class="jumbotron">
        <p>{{ t('Loading file details …') }}</p>
        <lt-spinner />
      </div>
    </div>
  </div>

  <div v-else-if="!isReady" class="row mt-3">
    <div class="col-sm-12">
      <div class="alert alert-warning">
        <ExclamationTriangleFill class="me-1" />
        {{ error }}
      </div>
    </div>
  </div>

  <div v-else class="mt-3 table-responsive">
    <table class="table table-striped table-hover align-middle">
      <thead>
        <tr>
          <th scope="col" style="width: 180px"></th>
          <th v-for="column in sortColumns" :key="column.key" scope="col">
            <button
              type="button"
              class="btn btn-link icon-link p-0 text-body text-decoration-none"
              @click="sortBy(column.key)"
            >
              <component :is="column.icon" v-if="column.icon" />
              <span>{{ column.label }}</span>
              <SortUp v-if="sortColumn === column.key && sortDirection === 1" />
              <SortDown v-else-if="sortColumn === column.key" />
            </button>
          </th>
          <th scope="col">{{ t('Category') }}</th>
          <th scope="col">
            <span class="icon-link">
              <abbr title="Location"><CameraFill /></abbr>
              <abbr title="Object location"><HouseFill /></abbr>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="title in sortedTitles" :key="title.file">
          <td><lt-file-thumbnail :file="title" /></td>
          <td>
            <span class="icon-link">
              <span>{{ title.file }}</span>
              <a :href="title.url" target="_blank">
                <BoxArrowUpRight />
              </a>
              <router-link :to="{name: 'geolocate', query: {files: title.file}}">
                <GeoAlt />
              </router-link>
            </span>
            <lt-file-metadata-global-usage :file="title" />
          </td>
          <td style="min-width: 15rem"><span v-html="title.description"></span></td>
          <td><span v-html="title.author"></span></td>
          <td><time v-html="title.timestamp"></time></td>
          <td style="min-width: 10rem">
            <a
              v-for="category in title.categories"
              :key="category"
              class="text-decoration-none"
              :href="`https://commons.wikimedia.org/wiki/Category:${category}`"
              target="_blank"
            >
              <span class="badge bg-secondary me-1">{{ category }}</span>
            </a>
          </td>
          <td class="small text-nowrap">
            <div v-if="title.coordinates.csv"><CameraFill /> {{ title.coordinates.csv }}</div>
            <div v-if="title.objectLocation.csv"><HouseFill /> {{ title.objectLocation.csv }}</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <lt-file-modal-dialog @prev="prevImage(sortedTitles)" @next="nextImage(sortedTitles)" />
</template>

<script setup lang="ts">
import {useAsyncState, useSorted} from '@vueuse/core';
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component';
import CalendarEvent from 'bootstrap-icons/icons/calendar-event.svg?component';
import CameraFill from 'bootstrap-icons/icons/camera-fill.svg?component';
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import HouseFill from 'bootstrap-icons/icons/house-fill.svg?component';
import PersonFill from 'bootstrap-icons/icons/person-fill.svg?component';
import SortDown from 'bootstrap-icons/icons/sort-down.svg?component';
import SortUp from 'bootstrap-icons/icons/sort-up.svg?component';
import {type Component, onMounted, ref} from 'vue';

import {getCoordinates} from '../api/coordinates';
import {getFiles} from '../api/files';
import {type FileDetails, getFileDetails} from '../api/imageinfo';
import type {CommonsFile} from '../model';
import ltFileMetadataGlobalUsage from './ltFileMetadataGlobalUsage.vue';
import ltFileModalDialog from './ltFileModalDialog.vue';
import ltFileThumbnail from './ltFileThumbnail.vue';
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
} = useAsyncState(
  () =>
    getFiles($query.value)
      .then(t => getCoordinates(t))
      .then(t => t as (CommonsFile & FileDetails)[]),
  [],
  // shallow: false, so that the file details assigned below are reactive
  {immediate: false, shallow: false}
);

const {prevImage, nextImage} = useModalDialog();

type SortColumn = keyof Pick<
  CommonsFile & FileDetails,
  'file' | 'description' | 'author' | 'timestamp'
>;
const sortColumns: {key: SortColumn; label: string; icon?: Component}[] = [
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

function sortBy(column: SortColumn) {
  sortDirection.value = sortColumn.value === column ? -sortDirection.value : 1;
  sortColumn.value = column;
}

useAppTitle(routeTitlePart(), t('Table'));

onMounted(async () => {
  await execute();
  for (const title of titles.value) {
    // without `revisions`, getFileDetails reports an empty object location, which would
    // overwrite the one obtained from getCoordinates
    getFileDetails(title.pageid, 'categories|imageinfo', 'extmetadata').then(
      ({objectLocation: _, ...fileDetails}) => Object.assign(title, fileDetails)
    );
  }
});
</script>
