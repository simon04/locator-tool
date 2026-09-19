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

  <div v-else class="mt-3">
    <div ref="columnsElement" class="dropdown mb-2 text-end">
      <button
        class="btn btn-sm btn-outline-secondary dropdown-toggle"
        type="button"
        :aria-expanded="columnsOpen"
        @click="columnsOpen = !columnsOpen"
      >
        {{ t('Columns') }}
      </button>
      <!-- bootstrap.css places the menu below the toggle for popper-positioned menus only,
           and bootstrap.js (which would set the attribute) is not loaded -->
      <ul
        class="dropdown-menu dropdown-menu-end"
        :class="{show: columnsOpen}"
        data-bs-popper="static"
      >
        <li v-for="column in columns" :key="column.key">
          <label class="dropdown-item">
            <input
              v-model="visibleColumns"
              class="form-check-input me-2"
              type="checkbox"
              :value="column.key"
            />
            {{ column.label }}
          </label>
        </li>
      </ul>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th v-for="column in visibleColumnsInOrder" :key="column.key" scope="col">
              <button
                v-if="isSortable(column.key)"
                type="button"
                class="btn btn-link icon-link p-0 text-body text-decoration-none"
                @click="sortBy(column.key)"
              >
                <component :is="column.icon" v-if="column.icon" />
                <span>{{ column.label }}</span>
                <SortUp v-if="sortColumn === column.key && sortDirection === 1" />
                <SortDown v-else-if="sortColumn === column.key" />
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="title in sortedTitles" :key="title.file">
            <td v-if="isVisible('image')" style="width: 180px">
              <lt-file-thumbnail :file="title" />
            </td>
            <td v-if="isVisible('file')">
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
            <td v-if="isVisible('description')" style="min-width: 15rem">
              <span v-html="title.description"></span>
            </td>
            <td v-if="isVisible('author')"><span v-html="title.author"></span></td>
            <td v-if="isVisible('timestamp')"><time v-html="title.timestamp"></time></td>
            <td v-if="isVisible('categories')" style="min-width: 10rem">
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
            <td v-if="isVisible('coordinates')" class="small text-nowrap">
              <div v-if="title.coordinates.csv"><CameraFill /> {{ title.coordinates.csv }}</div>
              <div v-if="title.objectLocation.csv">
                <HouseFill /> {{ title.objectLocation.csv }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <lt-file-modal-dialog @prev="prevImage(sortedTitles)" @next="nextImage(sortedTitles)" />
</template>

<script setup lang="ts">
import {onClickOutside, useAsyncState, useSorted} from '@vueuse/core';
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component';
import CalendarEvent from 'bootstrap-icons/icons/calendar-event.svg?component';
import CameraFill from 'bootstrap-icons/icons/camera-fill.svg?component';
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import HouseFill from 'bootstrap-icons/icons/house-fill.svg?component';
import PersonFill from 'bootstrap-icons/icons/person-fill.svg?component';
import SortDown from 'bootstrap-icons/icons/sort-down.svg?component';
import SortUp from 'bootstrap-icons/icons/sort-up.svg?component';
import {type Component, computed, onMounted, ref} from 'vue';

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
type Column = 'image' | SortColumn | 'categories' | 'coordinates';
const columns: {key: Column; label: string; icon?: Component}[] = [
  {key: 'image', label: t('Image'), icon: undefined},
  {key: 'file', label: t('Title'), icon: undefined},
  {key: 'description', label: t('Description'), icon: undefined},
  {key: 'author', label: t('Author'), icon: PersonFill},
  {key: 'timestamp', label: t('Date'), icon: CalendarEvent},
  {key: 'categories', label: t('Category'), icon: undefined},
  {key: 'coordinates', label: t('Coordinates'), icon: undefined}
];
const visibleColumns = ref<Column[]>(columns.map(column => column.key));
const visibleColumnsInOrder = computed(() => columns.filter(column => isVisible(column.key)));
const columnsElement = ref<HTMLElement | null>(null);
const columnsOpen = ref(false);
onClickOutside(columnsElement, () => (columnsOpen.value = false));

function isVisible(column: Column): boolean {
  return visibleColumns.value.includes(column);
}

function isSortable(column: Column): column is SortColumn {
  return column !== 'image' && column !== 'categories' && column !== 'coordinates';
}

const sortColumn = ref<SortColumn>('file');
const sortDirection = ref(1);
const sortedTitles = useSorted(
  titles,
  (t1, t2) => sortDirection.value * (t1[sortColumn.value]?.localeCompare(t2[sortColumn.value]) ?? 0)
);

function sortBy(column: Column) {
  if (!isSortable(column)) return;
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
