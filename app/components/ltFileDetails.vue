<template>
  <div class="card">
    <div class="card-body p-2">
      <div>
        <label @click="collapseCameraLocation = !collapseCameraLocation">
          <span v-show="!collapseCameraLocation" class="text-secondary">▼</span>
          <span v-show="collapseCameraLocation" class="text-secondary">▶</span>
          <svg class="octicon">
            <use xlink:href="#device-camera"></use>
          </svg>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="msgCameraLocation"></span>
          <abbr
            v-show="!collapseCameraLocation"
            :title="t('Left click on map to set the location.')"
          >
            <svg class="octicon"><use xlink:href="#question"></use></svg>
          </abbr>
        </label>
        <div v-show="!collapseCameraLocation">
          <!-- eslint-disable vue/no-mutating-props -->
          <lt-location-input
            v-model="file.coordinates"
            @edit-location="editLocation(file.coordinates)"
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
          <span v-show="!collapseObjectLocation" class="text-secondary">▼</span>
          <span v-show="collapseObjectLocation" class="text-secondary">▶</span>
          <svg class="octicon">
            <use xlink:href="#squirrel"></use>
          </svg>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <span v-html="msgObjectLocation"></span>
          <abbr
            v-show="!collapseObjectLocation"
            :title="t('Press shift and click on map to set the object location.')"
          >
            <svg class="octicon"><use xlink:href="#question"></use></svg>
          </abbr>
        </label>
        <div v-show="!collapseObjectLocation">
          <!-- eslint-disable vue/no-mutating-props -->
          <lt-location-input
            v-model="file.objectLocation"
            @edit-location="editLocation(file.objectLocation)"
          />
          <!-- eslint-enable vue/no-mutating-props -->
        </div>
      </div>
    </div>
  </div>

  <div v-if="error" class="alert alert-danger mt-2">
    <svg class="octicon">
      <use xlink:href="#alert"></use>
    </svg>
    <span>{{ msgErrorStatusText }}</span>
  </div>

  <div class="card mt-2">
    <h5 class="card-header p-2">
      <strong>{{ file.file }}</strong>
      <small v-if="file.url">
        <a :href="file.url" target="_blank">
          <svg class="octicon">
            <use xlink:href="#link-external"></use>
          </svg>
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

function editLocation(coordinates: LatLng) {
  error.value = undefined;
  return ltDataAuth.editLocation(props.file, coordinates).then(
    () => {
      if (coordinates.type === 'Location') {
        // eslint-disable-next-line vue/no-mutating-props
        props.file.coordinates = coordinates.commit();
      } else if (coordinates.type === 'Object location') {
        // eslint-disable-next-line vue/no-mutating-props
        props.file.objectLocation = coordinates.commit();
      }
    },
    e => {
      error.value = e;
    }
  );
}
</script>
