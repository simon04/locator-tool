<template>
  <div v-if="isLoading" class="row mt-3">
    <div class="col-sm-12">
      <div class="jumbotron">
        <p>{{ t('Loading file details …') }}</p>
        <lt-spinner />
      </div>
    </div>
  </div>

  <div v-if="!isLoading && !$titles?.length" class="row mt-3">
    <div class="col-sm-12">
      <div class="alert alert-warning">
        <ExclamationTriangleFill class="me-1" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="category" v-html="msgNoFilesForCategory"></span>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="user" v-html="msgNoFilesForUser"></span>
      </div>
    </div>
  </div>

  <div
    v-if="!isLoading && $titles?.length"
    class="row flex-grow-1 mt-3"
    style="--bs-gutter-x: 0.5rem"
  >
    <div
      class="col-lg-3 col-xl-2 mt-3 mt-lg-0 h-100 col-lg-h40"
      style="overflow-y: scroll; overflow-x: hidden"
    >
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          :style="{width: titlesDefinedAndSavedPercent + '%'}"
        >
          {{ titlesDefinedAndSaved.length }} / {{ $titles?.length }}
        </div>
      </div>
      <div class="form-group">
        <div class="checkbox">
          <label>
            <input v-model="$showGeolocated" type="checkbox" />
            <span>{{ t('Also show geolocated files') }}</span>
          </label>
        </div>
      </div>
      <div class="input-group">
        <div class="input-group-text">
          <Search />
        </div>
        <input v-model="$filter" class="form-control" type="text" />
      </div>
      <div tabindex="1" @keydown="keyPressedInList($event)">
        <TransitionGroup tag="ul" name="list" class="list-group">
          <li
            v-for="title in filteredTitles"
            :key="title.file"
            class="list-group-item py-1 px-2 text-truncate"
            :class="{'list-group-item-info': $title === title}"
            role="button"
            @click="$title = title"
          >
            <span class="icon-link">
              <abbr v-if="title.coordinates.isDefinedAndSaved" title="Location ✔">
                <CameraFill />
              </abbr>
              <abbr v-if="title.objectLocation.isDefinedAndSaved" title="Object location ✔">
                <HouseFill />
              </abbr>
              <span>{{ title.file }}</span>
            </span>
          </li>
        </TransitionGroup>
      </div>
    </div>

    <div
      v-if="$title"
      class="col-lg-9 col-xl-3 mt-3 mt-lg-0 h-100 col-lg-h40"
      style="overflow-y: scroll; overflow-x: hidden"
    >
      <div class="row">
        <div class="col-lg-5 col-xl-12">
          <lt-file-details
            v-model:coordinates="$title.coordinates"
            v-model:object-location="$title.objectLocation"
            :file="$title"
          />
        </div>
        <div class="col-lg-7 col-xl-12 mt-2">
          <lt-file-thumbnail :file="$title" />
        </div>
      </div>
    </div>

    <div v-if="$title" class="col-lg-12 col-xl-7 mt-3 mt-lg-0 h-100 col-lg-h60">
      <lt-map
        v-model:coordinates="$title.coordinates"
        v-model:object-location="$title.objectLocation"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';
import * as ltData from '../api/ltData';
import {CommonsFile} from '../model';
import ltSpinner from './ltSpinner.vue';
import ltFileDetails from './ltFileDetails.vue';
import ltFileThumbnail from './ltFileThumbnail.vue';
import ltMap from './ltMap.vue';
import {t} from './useI18n';
import {useAppTitle, routeTitlePart} from './useAppTitle';
import CameraFill from 'bootstrap-icons/icons/camera-fill.svg?component';
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
import HouseFill from 'bootstrap-icons/icons/house-fill.svg?component';
import Search from 'bootstrap-icons/icons/search.svg?component';

const $route = useRoute();
const category = ($route.query as ltData.FilesOptions).category;
const user = ($route.query as ltData.FilesOptions).user;
const $error = ref<unknown>();
const $filter = ref('');
const $showGeolocated = ref(false);
const $title = ref<CommonsFile | undefined>(undefined);
const $titles = ref<CommonsFile[] | undefined>(undefined);
const isLoading = ref(false);

useAppTitle(routeTitlePart(), t('Geolocate files'));

onMounted(async () => {
  isLoading.value = true;
  const titles0 = await ltData.getFiles($route.query as ltData.FilesOptions);
  const titles = await ltData.getCoordinates(titles0);
  $titles.value = titles.sort((t1, t2) => t1.file.localeCompare(t2.file));
  $showGeolocated.value = $titles.value.length <= 5;
  $title.value = filteredTitles.value[0]; // select first visible title
  isLoading.value = false;
});

watch($title, title => title && titleChanged(title));

function _hasLocation(title: CommonsFile) {
  return title.coordinates.isDefinedAndSaved || title.objectLocation.isDefinedAndSaved;
}

const filteredTitles = computed((): CommonsFile[] => {
  let titles = $titles.value || [];
  titles = $showGeolocated.value ? titles : titles.filter(t => !_hasLocation(t));
  titles = titles.filter(t => JSON.stringify(t).includes($filter.value));
  return titles;
});

const titlesDefinedAndSaved = computed((): CommonsFile[] => {
  return $titles.value ? $titles.value.filter(t => _hasLocation(t)) : [];
});

const titlesDefinedAndSavedPercent = computed((): number => {
  return (100 * titlesDefinedAndSaved.value.length) / ($titles.value || []).length;
});

function keyPressedInList($event: KeyboardEvent): void {
  const titles = filteredTitles.value;
  const direction = keydownToDirection($event);
  if (direction === undefined || $title.value === undefined) {
    return;
  }
  const index = titles.indexOf($title.value);
  const newIndex = direction + index;
  if (newIndex >= 0 && titles[newIndex]) {
    $title.value = titles[newIndex];
    const target = $event.target as HTMLElement;
    window.requestAnimationFrame(() =>
      target.querySelectorAll('.list-group-item')?.[newIndex]?.scrollIntoView?.({block: 'center'})
    );
  }
}

function titleChanged(title: CommonsFile): void {
  $error.value = undefined;
  // if (title?.coordinates) {
  //   updateMapView(title.coordinates);
  // }
  if (title?.pageid) {
    ltData.getFileDetails(title.pageid).then(fileDetails => {
      Object.assign(title, fileDetails);
      // const {lat, lng} = title.objectLocation;
      // if (!title.coordinates?.lat) {
      //   updateMapView({lat, lng});
      // }
    });
  }
}

function keydownToDirection($event: KeyboardEvent) {
  if ($event && $event.key) {
    switch ($event.key) {
      case 'Right':
      case 'ArrowRight':
      case 'Down':
      case 'ArrowDown':
        $event.preventDefault();
        return 1;
      case 'Left':
      case 'ArrowLeft':
      case 'Up':
      case 'ArrowUp':
        $event.preventDefault();
        return -1;
    }
  }
}

const msgNoFilesForCategory = computed(() =>
  t('Fetched 0 files for category <code>{{$ctrl.category}}</code>!').replace(
    '{{$ctrl.category}}',
    category
  )
);
const msgNoFilesForUser = computed(() =>
  t('Fetched 0 files for user <code>{{$ctrl.user}}</code>!').replace('{{$ctrl.user}}', user)
);
</script>

<style scoped>
@media (min-width: 768px) and (max-width: 1199px) {
  .col-lg-h40 {
    height: 40%;
  }
  .col-lg-h60 {
    height: 60%;
  }
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  line-height: 0;
}
</style>
