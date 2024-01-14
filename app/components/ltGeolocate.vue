<template>
  <div v-if="isLoading" class="row mt-3">
    <div class="col-sm-12">
      <div class="jumbotron">
        <p translate="translate">Loading file details …</p>
        <lt-spinner />
      </div>
    </div>
  </div>

  <div v-if="!isLoading && !$titles?.length" class="row mt-3">
    <div class="col-sm-12">
      <div class="alert alert-warning">
        <svg class="octicon">
          <use xlink:href="#alert"></use>
        </svg>
        <!-- prettier-ignore -->
        <span v-if="category" translate="translate">Fetched 0 files for category <code>{{category}}</code>!</span>
        <!-- prettier-ignore -->
        <span v-if="user" translate="translate">Fetched 0 files for user <code>{{user}}</code>!</span>
      </div>
    </div>
  </div>

  <div
    v-if="!isLoading && $titles?.length"
    class="row flex-grow-1 mt-3"
    style="--bs-gutter-x: 0.5rem"
  >
    <div
      class="col-lg-3 col-xl-2 mt-3 mt-lg-0 fill col-lg-h40"
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
            <span translate="translate">Also show geolocated files</span>
          </label>
        </div>
      </div>
      <div class="input-group">
        <div class="input-group-text">
          <svg class="octicon">
            <use xlink:href="#search"></use>
          </svg>
        </div>
        <input v-model="$filter" class="form-control" type="text" />
      </div>
      <div tabindex="1" @keydown="keyPressedInList($event)">
        <ul class="list-group">
          <li
            v-for="t in filteredTitles"
            :key="t.file"
            class="list-group-item py-1 px-2 text-truncate"
            :class="{'list-group-item-info': $title === t}"
            @click="$title = t"
          >
            <abbr v-if="t.coordinates.isDefinedAndSaved" title="Location ✔">
              <svg class="octicon">
                <use xlink:href="#device-camera"></use>
              </svg>
            </abbr>
            <abbr v-if="t.objectLocation.isDefinedAndSaved" title="Object location ✔">
              <svg class="octicon">
                <use xlink:href="#squirrel"></use>
              </svg>
            </abbr>
            <span>{{ t.file }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div
      v-if="$title"
      class="col-lg-9 col-xl-3 mt-3 mt-lg-0 fill col-lg-h40"
      style="overflow-y: scroll; overflow-x: hidden"
    >
      <div class="row">
        <div class="col-lg-5 col-xl-12">
          <lt-file-details :file="$title" />
        </div>
        <div class="col-lg-7 col-xl-12 mt-2">
          <lt-file-thumbnail :file="$title" />
        </div>
      </div>
    </div>

    <div v-if="$title" class="col-lg-12 col-xl-7 mt-3 mt-lg-0 fill col-lg-h60">
      <lt-map
        :map-view="$mapView"
        :map-marker="$title.coordinates"
        :map-object-location="$title.objectLocation"
        @coordinates-changed="coordinatesChanged"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue';
import {useRoute} from 'vue-router';
import * as ltData from '../api/ltData';
import {CommonsFile, LatLng} from '../model';
import ltSpinner from './ltSpinner.vue';
import ltFileDetails from './ltFileDetails.vue';
import ltFileThumbnail from './ltFileThumbnail.vue';
import ltMap from './ltMap.vue';
import {useLeafletMapView} from './useLeafletMapView';

const $route = useRoute();
const category: string = $route.query.category as string;
const user: string = $route.query.user as string;
const $error = ref<unknown>();
const $filter = ref('');
const $mapView = useLeafletMapView();
const $showGeolocated = ref(false);
const $title = ref<CommonsFile | undefined>(undefined);
const $titles = ref<CommonsFile[] | undefined>(undefined);
const isLoading = ref(false);

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const files$q = ltData.getFiles($route.query as any);
  const fileDetails$q = files$q
    .then(titles => ltData.getCoordinates(titles))
    .then(titles => {
      $titles.value = titles.sort((t1, t2) => t1.file.localeCompare(t2.file));
      $showGeolocated.value = $titles.value.length <= 5;
      // select first visible title
      $title.value = filteredTitles.value[0];
    });
  isLoading.value = true;
  Promise.all([files$q, fileDetails$q]).finally(() => (isLoading.value = false));
});

watch($title, title => title && titleChanged(title));
watch($mapView, mapView => mapViewChanged(mapView));

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
    window.requestAnimationFrame(
      () =>
        target.querySelectorAll('.list-group-item')?.[newIndex]?.scrollIntoView?.({block: 'center'})
    );
  }
}

function titleChanged(title: CommonsFile): void {
  $error.value = undefined;
  if (title?.coordinates) {
    updateMapView(title.coordinates);
  }
  if (title?.pageid) {
    ltData.getFileDetails(title.pageid).then(fileDetails => {
      Object.assign(title, fileDetails);
      const {lat, lng} = title.objectLocation;
      if (!title.coordinates?.lat) {
        updateMapView({lat, lng});
      }
    });
  }
}

function mapViewChanged(mapView: MapView): void {
  $mapView.value = mapView;
}

function updateMapView({lat, lng}: {lat?: number; lng?: number}): void {
  if (lat && lng) {
    $mapView.value = {...$mapView.value, lat, lng};
  }
}

function coordinatesChanged(coordinates: LatLng, $event?: L.LeafletMouseEvent): void {
  if (!coordinates || !$title.value) {
    return;
  } else if (coordinates.type === 'Location') {
    $title.value.coordinates = $title.value.coordinates.withLatLng(
      coordinates.lat,
      coordinates.lng
    );
  } else if (coordinates.type === 'Object location') {
    $title.value.objectLocation = $title.value.objectLocation.withLatLng(
      coordinates.lat,
      coordinates.lng
    );
  }
  if (!$event?.type) {
    updateMapView(coordinates);
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
</script>
