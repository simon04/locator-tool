<template>
  <button
    class="btn btn-success form-control"
    type="button"
    :disabled="!(file.coordinates?.isChanged || file.objectLocation?.isChanged)"
    @click="editLocation()"
  >
    <Save class="me-1" />
    {{ t('Save') }}
  </button>
  <div class="card mt-2">
    <div class="card-body p-2">
      <div>
        <label @click="collapseCameraLocation = !collapseCameraLocation">
          <span v-show="!collapseCameraLocation" class="text-secondary me-1">▼</span>
          <span v-show="collapseCameraLocation" class="text-secondary me-1">▶</span>
          <CameraFill class="me-1" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="msgCameraLocation"></span>
          <abbr
            v-show="!collapseCameraLocation"
            :title="t('Left click on map to set the location.')"
          >
            <QuestionCircle />
          </abbr>
        </label>
        <div v-show="!collapseCameraLocation">
          <!-- eslint-disable vue/no-mutating-props -->
          <lt-location-input
            v-model="file.coordinates"
            @edit-location="editLocation([file.coordinates])"
          />
          <!-- eslint-enable vue/no-mutating-props -->
        </div>
      </div>
    </div>
  </div>

  <div class="card mt-2">
    <div class="card-body p-2">
      <div>
        <label @click="collapseObjectLocation = !collapseObjectLocation">
          <span v-show="!collapseObjectLocation" class="text-secondary me-1">▼</span>
          <span v-show="collapseObjectLocation" class="text-secondary me-1">▶</span>
          <HouseFill class="me-1" />
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="msgObjectLocation"></span>
          <abbr
            v-show="!collapseObjectLocation"
            :title="t('Press shift and click on map to set the object location.')"
          >
            <QuestionCircle />
          </abbr>
        </label>
        <div v-show="!collapseObjectLocation">
          <!-- eslint-disable vue/no-mutating-props -->
          <lt-location-input
            v-model="file.objectLocation"
            @edit-location="editLocation([file.objectLocation])"
          />
          <!-- eslint-enable vue/no-mutating-props -->
        </div>
      </div>
    </div>
  </div>

  <div v-if="error" class="alert alert-danger mt-2">
    <ExclamationTriangleFill class="me-1" />
    <span>{{ msgErrorStatusText }}</span>
  </div>

  <div class="card mt-2">
    <h5 class="card-header p-2">
      <strong>{{ file.file }}</strong>
      {{ ' ' }}
      <small v-if="file.url">
        <a :href="file.url" target="_blank">
          <BoxArrowUpRight />
        </a>
      </small>
    </h5>
    <div class="card-body p-2">
      <lt-file-metadata :file="file" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import * as ltDataAuth from '../api/ltDataAuth';
import {CommonsFile, LatLng} from '../model';
import ltFileMetadata from './ltFileMetadata.vue';
import ltLocationInput from './ltLocationInput.vue';
import {FileDetails} from '../api/ltData';
import {t} from './useI18n';
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component';
import CameraFill from 'bootstrap-icons/icons/camera-fill.svg?component';
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
import HouseFill from 'bootstrap-icons/icons/house-fill.svg?component';
import QuestionCircle from 'bootstrap-icons/icons/question-circle.svg?component';
import Save from 'bootstrap-icons/icons/save.svg?component';

const props = defineProps<{file: CommonsFile & FileDetails}>();
const error = ref<undefined>(undefined);
const collapseCameraLocation = ref(false);
const collapseObjectLocation = ref(false);

const msgCameraLocation = computed(() =>
  t(
    'Camera location via\n<a href="https://commons.wikimedia.org/wiki/Template:Location" target="_blank"><code class="mediawiki-template">Location</code></a>'
  )
);
const msgObjectLocation = computed(() =>
  t(
    'Object location via\n<a href="https://commons.wikimedia.org/wiki/Template:Object_location" target="_blank"><code class="mediawiki-template">Object location</code></a>'
  )
);
const msgErrorStatusText = computed(() =>
  t('Failed to save: {{$ctrl.error.statusText}}').replace(
    '{{$ctrl.error.statusText}}',
    error.value?.statusText
  )
);

watch(props.file.coordinates, (c1, c2) => console.log(c1, c2));

function editLocation(coordinates?: LatLng[]) {
  error.value = undefined;
  if (coordinates === undefined) {
    coordinates = [];
    if (props.file?.coordinates?.isChanged) {
      coordinates.push(props.file.coordinates);
    }
    if (props.file?.objectLocation?.isChanged) {
      coordinates.push(props.file.objectLocation);
    }
  }
  return ltDataAuth.editLocation(props.file, coordinates).then(
    () => {
      coordinates.forEach(c => {
        if (c.type === 'Location') {
          // eslint-disable-next-line vue/no-mutating-props
          props.file.coordinates = c.commit();
        } else if (c.type === 'Object location') {
          // eslint-disable-next-line vue/no-mutating-props
          props.file.objectLocation = c.commit();
        }
      });
    },
    e => {
      error.value = e;
    }
  );
}
</script>
