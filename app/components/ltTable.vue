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

  <div v-else class="mt-5">
    <div ref="columnsElement" class="position-relative mb-3 text-end">
      <button
        class="btn-outline btn-sm theme-secondary"
        type="button"
        :aria-expanded="columnsOpen"
        @click="columnsOpen = !columnsOpen"
      >
        {{ t('Columns') }}
        <CaretDownFill />
      </button>
      <!-- bootstrap.js (whose Floating UI would position the menu) is not loaded -->
      <div
        class="menu top-100 end-0 mt-1"
        :class="{show: columnsOpen}"
        data-bs-placement="bottom-end"
      >
        <label v-for="column in columns" :key="column.key" class="menu-item">
          <input v-model="visibleColumns" class="check" type="checkbox" :value="column.key" />
          {{ column.label }}
        </label>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th v-for="column in visibleColumnsInOrder" :key="column.key" scope="col">
              <button
                v-if="isSortable(column.key)"
                type="button"
                class="btn-link p-0 fw-bold fg-body text-decoration-none"
                style="--bs-btn-min-height: 0; --bs-btn-border-width: 0"
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
            </td>
            <td v-if="isVisible('description')" style="min-width: 15rem">
              <span v-html="title.description"></span>
            </td>
            <td v-if="isVisible('author')">
              <span class="icon-link">
                <span v-html="title.author"></span>
                <router-link
                  v-if="authorUser(title.author)"
                  :to="{name: 'geolocate', query: {user: authorUser(title.author), userLimit: 100}}"
                >
                  <GeoAlt />
                </router-link>
              </span>
            </td>
            <td v-if="isVisible('timestamp')"><time v-html="title.timestamp"></time></td>
            <td v-if="isVisible('categories')" style="min-width: 10rem">
              <a
                v-for="category in title.categories"
                :key="category"
                class="text-decoration-none"
                :href="`https://commons.wikimedia.org/wiki/Category:${category}`"
                target="_blank"
              >
                <span class="badge theme-secondary me-1">{{ category }}</span>
              </a>
            </td>
            <td v-if="isVisible('coordinates')" class="small text-nowrap">
              <div v-if="title.coordinates.csv"><CameraFill /> {{ title.coordinates.csv }}</div>
              <div v-if="title.objectLocation.csv">
                <HouseFill /> {{ title.objectLocation.csv }}
              </div>
            </td>
            <td v-if="isVisible('globalUsage')">
              <lt-file-metadata-global-usage :file="title" badge />
            </td>
            <td v-if="isVisible('mediaViews')" class="text-end">
              <a
                v-if="title.mediaViews !== undefined"
                :href="mediaViewsUrl(title)"
                target="_blank"
                class="text-decoration-none"
              >
                {{ title.mediaViews.toLocaleString(language.replace('_', '-')) }}
              </a>
            </td>
            <td v-for="property in visibleProperties" :key="property">
              <div v-for="statement in statements[title.pageid]?.[property]" :key="statement.id">
                <a
                  v-if="entityId(statement)"
                  :href="`https://www.wikidata.org/wiki/${entityId(statement)}`"
                  target="_blank"
                >
                  {{ formatStatement(statement, labels) }}
                </a>
                <span v-else>{{ formatStatement(statement, labels) }}</span>
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
import {onClickOutside, useAsyncState, useLocalStorage, useSorted} from '@vueuse/core';
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component';
import CalendarEvent from 'bootstrap-icons/icons/calendar-event.svg?component';
import CameraFill from 'bootstrap-icons/icons/camera-fill.svg?component';
import CaretDownFill from 'bootstrap-icons/icons/caret-down-fill.svg?component';
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
import EyeFill from 'bootstrap-icons/icons/eye-fill.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import HouseFill from 'bootstrap-icons/icons/house-fill.svg?component';
import PersonFill from 'bootstrap-icons/icons/person-fill.svg?component';
import ShareFill from 'bootstrap-icons/icons/share-fill.svg?component';
import SortDown from 'bootstrap-icons/icons/sort-down.svg?component';
import SortUp from 'bootstrap-icons/icons/sort-up.svg?component';
import {type Component, computed, onMounted, ref, watch} from 'vue';

import {getCoordinates} from '../api/coordinates';
import {getFiles} from '../api/files';
import {globalusage} from '../api/globalusage';
import type {FileDetails} from '../api/imageinfo';
import {mediaviews, MEDIAVIEWS_DAYS} from '../api/mediaviews';
import {getStatements, type Statements} from '../api/statements';
import {getLabels} from '../api/wikidataLabels';
import type {CommonsFile} from '../model';
import {authorUser} from '../model/author';
import {
  entityId,
  EXPOSURE_TIME,
  F_NUMBER,
  formatStatement,
  ISO_SPEED,
  type Statement
} from '../model/mediainfo';
import ltFileMetadataGlobalUsage from './ltFileMetadataGlobalUsage.vue';
import ltFileModalDialog from './ltFileModalDialog.vue';
import ltFileThumbnail from './ltFileThumbnail.vue';
import ltSpinner from './ltSpinner.vue';
import {useAppTitle, routeTitlePart} from './useAppTitle';
import {language, t} from './useI18n';
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
  () => getFiles($query.value).then(t => getCoordinates(t)),
  [],
  // shallow: false, so that the global usage assigned below is reactive
  {immediate: false, shallow: false}
);

const {prevImage, nextImage} = useModalDialog();

const statements = ref<Record<number, Statements>>({});
const labels = ref<Record<string, string>>({});

type SortColumn = keyof Pick<
  CommonsFile & FileDetails,
  'file' | 'description' | 'author' | 'timestamp'
>;
const baseColumns: {key: string; label: string; icon?: Component}[] = [
  {key: 'image', label: t('Image'), icon: undefined},
  {key: 'file', label: t('Title'), icon: undefined},
  {key: 'description', label: t('Description'), icon: undefined},
  {key: 'author', label: t('Author'), icon: PersonFill},
  {key: 'timestamp', label: t('Date'), icon: CalendarEvent},
  {key: 'categories', label: t('Category'), icon: undefined},
  {key: 'coordinates', label: t('Coordinates'), icon: undefined},
  {key: 'globalUsage', label: t('Global usage'), icon: ShareFill},
  {key: 'mediaViews', label: t('Media views (30 days)'), icon: EyeFill}
];
// every property used by the structured data of the loaded files becomes a column of its own
const properties = computed(() =>
  [...new Set(Object.values(statements.value).flatMap(s => Object.keys(s)))].sort(
    (p1, p2) => +p1.slice(1) - +p2.slice(1)
  )
);
const columns = computed(() => [
  ...baseColumns,
  ...properties.value.map(property => ({
    key: property,
    label: labels.value[property] ?? property,
    icon: undefined
  }))
]);
// structured data uses far too many properties to show them all: exposure time, ISO speed
// and f-number are displayed by default, the remaining ones are offered by the menu;
// the media views require one request per file, hence they are offered by the menu, too
const visibleColumns = useLocalStorage<string[]>('tableColumns', [
  ...baseColumns.map(column => column.key).filter(key => key !== 'mediaViews'),
  EXPOSURE_TIME,
  ISO_SPEED,
  F_NUMBER
]);
const visibleColumnsInOrder = computed(() => columns.value.filter(c => isVisible(c.key)));
const visibleProperties = computed(() => properties.value.filter(isVisible));
const columnsElement = ref<HTMLElement | null>(null);
const columnsOpen = ref(false);
onClickOutside(columnsElement, () => (columnsOpen.value = false));

function isVisible(column: string): boolean {
  return visibleColumns.value.includes(column);
}

function isSortable(column: string): boolean {
  return column !== 'image' && column !== 'categories' && column !== 'coordinates';
}

function isFileDetail(column: string): column is SortColumn {
  return (
    column === 'file' || column === 'description' || column === 'author' || column === 'timestamp'
  );
}

function sortValue(title: CommonsFile & FileDetails, column: string): string {
  if (column === 'globalUsage') return String(title.globalUsage?.length ?? 0);
  if (column === 'mediaViews') return String(title.mediaViews ?? 0);
  return isFileDetail(column)
    ? (title[column] ?? '')
    : (statements.value[title.pageid]?.[column] ?? [])
        .map(statement => formatStatement(statement, labels.value))
        .join(', ');
}

const sortColumn = useLocalStorage<string>('tableSortColumn', 'file');
const sortDirection = useLocalStorage('tableSortDirection', 1);
const sortedTitles = useSorted(
  titles,
  (t1, t2) =>
    sortDirection.value *
    // numeric, so that the quantities of the structured data (width, ISO value, …) sort by value
    sortValue(t1, sortColumn.value).localeCompare(sortValue(t2, sortColumn.value), undefined, {
      numeric: true
    })
);

function sortBy(column: string) {
  if (!isSortable(column)) return;
  sortDirection.value = sortColumn.value === column ? -sortDirection.value : 1;
  sortColumn.value = column;
}

useAppTitle(routeTitlePart(), t('Table'));

function mediaViewsUrl(title: CommonsFile & FileDetails): string {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - MEDIAVIEWS_DAYS + 1);
  const params = new URLSearchParams({
    project: 'commons.wikimedia.org',
    referer: 'all-referers',
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    files: title.file.replace(/^File:/, '')
  });
  return `https://pageviews.wmcloud.org/mediaviews?${params}`;
}

// one request per file, hence only queried when the column is shown
function loadMediaViews() {
  if (!isReady.value || !isVisible('mediaViews')) return;
  for (const title of titles.value) {
    if (!title.fileUrl || title.mediaViews !== undefined) continue;
    mediaviews(title.fileUrl).then(
      views => (title.mediaViews = views),
      e => console.warn('Failed to obtain media views', title.file, e)
    );
  }
}
watch(() => isVisible('mediaViews'), loadMediaViews);

onMounted(async () => {
  await execute();
  const pageids = titles.value.map(title => title.pageid);
  globalusage(pageids).then(usages => {
    for (const title of titles.value) {
      title.globalUsage = usages[title.pageid];
    }
  });
  loadMediaViews();
  statements.value = await getStatements(pageids);
  const ids = new Set<string>();
  for (const fileStatements of Object.values(statements.value)) {
    for (const [property, propertyStatements] of Object.entries(fileStatements)) {
      ids.add(property);
      for (const statement of propertyStatements) {
        const id = entityId(statement);
        if (id) ids.add(id);
      }
    }
  }
  // 'fa_IR' and the like are no Wikidata language codes
  labels.value = await getLabels([...ids], language.value.split('_')[0]);
});
</script>
