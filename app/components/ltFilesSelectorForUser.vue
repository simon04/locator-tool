<template>
  <form @submit.stop.prevent="next()">
    <div class="mb-4">
      <label for="inputUser">{{ t('User') }}</label>
      <input
        id="inputUser"
        v-model="user"
        class="form-control"
        list="datalistUser"
        placeholder="User:…"
      />
    </div>
    <div class="row">
      <div class="mb-4 col-sm-4">
        <label for="inputUserLimit" translate-comment="maximum number of files">
          {{ t('Limit') }}
        </label>
        <input id="inputUserLimit" v-model="userLimit" class="form-control" type="number" />
      </div>
      <div class="mb-4 col-sm-4">
        <label for="inputUserStart">{{ t('Start timestamp') }}</label>
        <input id="inputUserStart" v-model="userStart" class="form-control" type="date" />
      </div>
      <div class="mb-4 col-sm-4">
        <label for="inputUserEnd">{{ t('End timestamp') }}</label>
        <input id="inputUserEnd" v-model="userEnd" class="form-control" type="date" />
      </div>
    </div>
    <div class="mb-4">
      <button class="btn btn-success icon-link me-2" :disabled="!user" @click="next()">
        <GeoAlt />
        <span>{{ t('Load User files to geolocate') }}</span>
      </button>
      <button class="btn btn-secondary icon-link me-2" :disabled="!user" @click="next('map')">
        <GlobeEuropeAfrica />
        <span>{{ t('Show User files on map') }}</span>
      </button>
      <button class="btn btn-secondary icon-link me-2" :disabled="!user" @click="next('gallery')">
        <FileImage />
        <span>{{ t('Show User files as gallery') }}</span>
      </button>
      <input class="invisible" type="submit" :disabled="!user" />
      <lt-spinner v-if="isLoading" />
      <datalist id="datalistUser">
        <option v-for="i in userSuggestions" :key="i" :value="i"></option>
      </datalist>
    </div>
  </form>
</template>

<script setup lang="ts">
import {useAsyncState, watchDebounced} from '@vueuse/core';
import FileImage from 'bootstrap-icons/icons/file-image.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import GlobeEuropeAfrica from 'bootstrap-icons/icons/globe-europe-africa.svg?component';
import {ref} from 'vue';
import {useRouter} from 'vue-router';

import * as ltData from '../api/ltData';
import ltSpinner from './ltSpinner.vue';
import {tryParse} from './tryParse';
import {t} from './useI18n';
import {useLtRoute} from './useLtRoute';

const {$query} = useLtRoute();
const $routes = useRouter();

const user = ref<string | undefined>($query.value.user);
const userLimit = ref(tryParse(parseInt, $query.value.userLimit, undefined));
const userStart = ref<string | undefined>($query.value.userStart);
const userEnd = ref<string | undefined>($query.value.userEnd);

const {
  state: userSuggestions,
  execute,
  isLoading
} = useAsyncState(async () => (user.value ? await ltData.getUsersForPrefix(user.value) : []), [], {
  immediate: false
});

watchDebounced(user, () => execute(), {debounce: 500});

function next(name: 'geolocate' | 'map' | 'gallery' = 'geolocate') {
  $routes.push({
    name,
    query: {
      user: user.value,
      userLimit: userLimit.value,
      userStart: userStart.value,
      userEnd: userEnd.value
    }
  });
}
</script>
