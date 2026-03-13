<template>
  <form @submit.stop.prevent="next()">
    <div class="row">
      <div class="mb-4 col-lg-10">
        <label for="inputCategory">{{ t('Category') }}</label>
        <input
          id="inputCategory"
          v-model="category"
          class="form-control"
          list="datalistCategory"
          placeholder="Category:…"
        />
      </div>
      <div class="mb-4 col-lg-2">
        <label
          for="inputCategoryDepth"
          translate-comment="Depth of category tree"
          translate-context="Category"
        >
          {{ t('Depth') }}
        </label>
        <input id="inputCategoryDepth" v-model="categoryDepth" class="form-control" type="number" />
      </div>
    </div>
    <div class="mb-4">
      <button class="btn btn-success icon-link me-2" :disabled="!category" @click="next()">
        <GeoAlt />
        <span>{{ t('Load Category to geolocate') }}</span>
      </button>
      <button class="btn btn-secondary icon-link me-2" :disabled="!category" @click="next('map')">
        <GlobeEuropeAfrica />
        <span>{{ t('Show Category on map') }}</span>
      </button>
      <button
        class="btn btn-secondary icon-link me-2"
        :disabled="!category"
        @click="next('gallery')"
      >
        <FileImage />
        <span>{{ t('Show Category as gallery') }}</span>
      </button>
      <input class="invisible" type="submit" :disabled="!category" />
    </div>
    <lt-spinner v-if="isLoading" />
    <datalist id="datalistCategory">
      <option v-for="i in categorySuggestions" :key="i" :value="i"></option>
    </datalist>
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

const category = ref<string | undefined>($query.value.category);
const categoryDepth = ref(tryParse(parseInt, $query.value.categoryDepth, 3));

const {
  state: categorySuggestions,
  execute,
  isLoading
} = useAsyncState(
  async () => (category.value ? await ltData.getCategoriesForPrefix(category.value) : []),
  [],
  {immediate: false}
);

watchDebounced(category, () => execute(), {debounce: 500});

function next(name: 'geolocate' | 'map' | 'gallery' = 'geolocate') {
  $routes.push({
    name,
    query: {
      category: category.value,
      categoryDepth: categoryDepth.value
    }
  });
}
</script>
