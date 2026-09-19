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
            <td v-for="property in visibleProperties" :key="property">
              <div v-for="statement in statements[title.pageid]?.[property]" :key="statement.id">
                <a
                  v-if="entityId(statement)"
                  :href="`https://www.wikidata.org/wiki/${entityId(statement)}`"
                  target="_blank"
                >
                  {{ formatStatement(statement) }}
                </a>
                <span v-else>{{ formatStatement(statement) }}</span>
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
import {getStatements, type Statements} from '../api/statements';
import {getLabels} from '../api/wikidataLabels';
import type {CommonsFile} from '../model';
import type {Statement} from '../model/mediainfo';
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
  () =>
    getFiles($query.value)
      .then(t => getCoordinates(t))
      .then(t => t as (CommonsFile & FileDetails)[]),
  [],
  // shallow: false, so that the file details assigned below are reactive
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
  {key: 'coordinates', label: t('Coordinates'), icon: undefined}
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
// and f-number are displayed by default, the remaining ones are offered by the dropdown
const visibleColumns = useLocalStorage<string[]>('tableColumns', [
  ...baseColumns.map(column => column.key),
  'P6757',
  'P6789',
  'P6790'
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
  return isFileDetail(column)
    ? (title[column] ?? '')
    : (statements.value[title.pageid]?.[column] ?? []).map(formatStatement).join(', ');
}

function entityId(statement: Statement): string | undefined {
  const datavalue = statement.mainsnak.datavalue;
  return datavalue?.type === 'wikibase-entityid' ? datavalue.value.id : undefined;
}

function formatStatement(statement: Statement): string {
  // a `somevalue` statement carries its value as a qualifier, e.g. the name of the creator
  const datavalue =
    statement.mainsnak.datavalue ??
    Object.values(statement.qualifiers ?? {})
      .flat()
      .find(snak => snak.datavalue?.type === 'string')?.datavalue;
  switch (datavalue?.type) {
    case 'string':
      return datavalue.value;
    case 'wikibase-entityid':
      return labels.value[datavalue.value.id] ?? datavalue.value.id;
    case 'time':
      return datavalue.value.time.replace(/^\+/, '').replace(/T.*/, '');
    case 'quantity':
      return datavalue.value.amount.replace(/^\+/, '');
    case 'globecoordinate':
      return `${datavalue.value.latitude}, ${datavalue.value.longitude}`;
    default:
      return '';
  }
}

const sortColumn = ref<string>('file');
const sortDirection = ref(1);
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

onMounted(async () => {
  await execute();
  for (const title of titles.value) {
    // without `revisions`, getFileDetails reports an empty object location, which would
    // overwrite the one obtained from getCoordinates
    getFileDetails(title.pageid, 'categories|imageinfo', 'extmetadata').then(
      ({objectLocation: _, ...fileDetails}) => Object.assign(title, fileDetails)
    );
  }
  statements.value = await getStatements(titles.value.map(title => title.pageid));
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
