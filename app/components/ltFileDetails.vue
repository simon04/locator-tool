<template>
  <button
    class="btn btn-success form-control"
    type="button"
    :disabled="!(coordinates?.isChanged || objectLocation?.isChanged)"
    @click="editLocation()"
  >
    <span class="icon-link">
      <Save />
      {{ t('Save') }}
      <kbd v-if="isMacOS">⌘ + S</kbd>
      <kbd v-else>Ctrl + S</kbd>
    </span>
  </button>
  <div class="card mt-2">
    <div class="card-body p-2">
      <div>
        <label class="icon-link" @click="collapseCameraLocation = !collapseCameraLocation">
          <CaretRight v-if="collapseCameraLocation" />
          <CaretDown v-else />
          <CameraFill />
          <span v-html="msgCameraLocation"></span>
          <abbr
            v-show="!collapseCameraLocation"
            :title="t('Left click on map to set the location.')"
          >
            <QuestionCircle />
          </abbr>
        </label>
        <div v-show="!collapseCameraLocation">
          <lt-location-input v-model="coordinates" @edit-location="editLocation([coordinates])" />
        </div>
      </div>
    </div>
  </div>

  <div class="card mt-2">
    <div class="card-body p-2">
      <div>
        <label class="icon-link" @click="collapseObjectLocation = !collapseObjectLocation">
          <CaretRight v-if="collapseObjectLocation" />
          <CaretDown v-else />
          <HouseFill />
          <span v-html="msgObjectLocation"></span>
          <abbr
            v-show="!collapseObjectLocation"
            :title="t('Press shift and click on map to set the object location.')"
          >
            <QuestionCircle />
          </abbr>
        </label>
        <div v-show="!collapseObjectLocation">
          <lt-location-input
            v-model="objectLocation"
            @edit-location="editLocation([objectLocation])"
          />
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
import {useMagicKeys, whenever} from '@vueuse/core';
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component';
import CameraFill from 'bootstrap-icons/icons/camera-fill.svg?component';
import CaretDown from 'bootstrap-icons/icons/caret-down.svg?component';
import CaretRight from 'bootstrap-icons/icons/caret-right.svg?component';
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?component';
import HouseFill from 'bootstrap-icons/icons/house-fill.svg?component';
import QuestionCircle from 'bootstrap-icons/icons/question-circle.svg?component';
import Save from 'bootstrap-icons/icons/save.svg?component';
import {computed, ref} from 'vue';

import type {FileDetails} from '../api/ltData';
import * as ltDataAuth from '../api/ltDataAuth';
import {type CommonsFile, LatLng} from '../model';
import ltFileMetadata from './ltFileMetadata.vue';
import ltLocationInput from './ltLocationInput.vue';
import {t} from './useI18n';

const coordinates = defineModel<LatLng>('coordinates', {required: true});
const objectLocation = defineModel<LatLng>('objectLocation', {required: true});
const props = defineProps<{file: CommonsFile & FileDetails}>();
const error = ref<unknown>(undefined);
const statusCode = ref<number | null>(0);
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
    statusCode.value + ' ' + JSON.stringify(error.value)
  )
);

const isMacOS = computed(() => navigator.platform.toUpperCase().includes('MAC'));

const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.type === 'keydown' && e.key === 's' && (e.ctrlKey || e.metaKey)) {
      // Prevent default save action
      e.preventDefault();
    }
  }
});
whenever(keys['Ctrl+S'], () => editLocation());
whenever(keys['Meta+S'], () => editLocation());

async function editLocation(cc?: LatLng[]) {
  cc ??= [coordinates.value, objectLocation.value].filter(c => c.isChanged);
  try {
    error.value = undefined;
    const {
      data,
      error: error0,
      statusCode: statusCode0
    } = await ltDataAuth.editLocation(props.file, cc);
    statusCode.value = statusCode0.value;
    if (data.value?.result?.edit?.result !== 'Success') {
      error.value = error0.value || data.value;
      return;
    }
    for (const c of cc!) {
      if (c.type === 'Location') {
        coordinates.value = c.commit();
      } else if (c.type === 'Object location') {
        objectLocation.value = c.commit();
      }
    }
  } catch (e) {
    error.value = e;
  }
}
</script>
