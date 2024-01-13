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
          <!-- prettier-ignore -->
          <span translate="translate">
          Camera location via
<a href="https://commons.wikimedia.org/wiki/Template:Location" target="_blank"><code class="mediawiki-template">Location</code></a></span>
          <abbr
            v-show="!collapseCameraLocation"
            title="{{'Left click on map to set the location.' | translate}}"
          >
            <svg class="octicon"><use xlink:href="#question"></use></svg>
          </abbr>
        </label>
        <div v-show="!collapseCameraLocation">
          <lt-location-input
            v-model="file.coordinates"
            @edit-location="editLocation(file.coordinates)"
          />
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
          <!-- prettier-ignore -->
          <span translate="translate">
          Object location via
<a href="https://commons.wikimedia.org/wiki/Template:Object_location" target="_blank"><code class="mediawiki-template">Object location</code></a></span>
          <abbr
            v-show="!collapseObjectLocation"
            title="{{'Press shift and click on map to set the object location.' | translate}}"
          >
            <svg class="octicon"><use xlink:href="#question"></use></svg>
          </abbr>
        </label>
        <div v-show="!collapseObjectLocation">
          <lt-location-input
            v-model="file.objectLocation"
            @edit-location="editLocation(file.objectLocation)"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-if="error" class="alert alert-danger mt-2">
    <svg class="octicon">
      <use xlink:href="#alert"></use>
    </svg>
    <span translate="translate">Failed to save: {{ error.statusText }}</span>
  </div>

  <div class="card mt-2">
    <h5 class="card-header p-2">
      <strong>{{ file.file }}</strong>
      <small v-if="file.url">
        <a href="{{file.url}}" target="_blank">
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
import {ref, watch} from 'vue';
import * as ltDataAuth from '../api/ltDataAuth';
import {CommonsFile, LatLng} from '../model';
import ltFileMetadata from './ltFileMetadata.vue';
import ltLocationInput from './ltLocationInput.vue';
import {FileDetails} from '../api/ltData';

const props = defineProps<{file: CommonsFile & FileDetails}>();
const error = ref<undefined>(undefined);
const collapseCameraLocation = ref(false);
const collapseObjectLocation = ref(false);

watch(props.file.coordinates, (c1, c2) => console.log(c1, c2));

function editLocation(coordinates: LatLng) {
  error.value = undefined;
  return ltDataAuth.editLocation(props.file, coordinates).then(
    () => {
      if (coordinates.type === 'Location') {
        props.file.coordinates = coordinates.commit();
      } else if (coordinates.type === 'Object location') {
        props.file.objectLocation = coordinates.commit();
      }
    },
    e => {
      error.value = e;
    }
  );
}
</script>