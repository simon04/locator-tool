<template>
  <form @submit.stop.prevent="next()">
    <div class="mb-4">
      <label for="inputTitles">{{ t('File list') }}</label>
      <textarea
        id="inputTitles"
        v-model="titles"
        class="form-control"
        rows="10"
        placeholder="File:…"
        @paste="onFilesPaste($event)"
      ></textarea>
      <p
        class="form-text"
        v-html="
          t(
            'When a clipboard content containing HTML code (for instance a copied selection from a Commons gallery) is pasted here, locator-tool tries to extract <code>File:</code>s from the code.'
          )
        "
      ></p>
    </div>
    <div class="mb-4">
      <button class="btn btn-success icon-link me-2" :disabled="!titleList.length" @click="next()">
        <GeoAlt />
        <span>{{ msgLoadGeolocate }}</span>
      </button>
      <button
        class="btn btn-secondary icon-link me-2"
        :disabled="!titleList.length"
        @click="next('map')"
      >
        <GlobeEuropeAfrica />
        <span>{{ msgShowMap }}</span>
      </button>
      <button
        class="btn btn-secondary icon-link me-2"
        :disabled="!titleList.length"
        @click="next('gallery')"
      >
        <FileImage />
        <span>{{ msgShowGallery }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useRouter} from 'vue-router';
import {t} from './useI18n';
import FileImage from 'bootstrap-icons/icons/file-image.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import GlobeEuropeAfrica from 'bootstrap-icons/icons/globe-europe-africa.svg?component';

const $routes = useRouter();

const titles = ref<string>('');

function next(name: 'geolocate' | 'map' | 'gallery' = 'geolocate') {
  const files = titleList.value.join('|');
  $routes.push({name, query: {files}});
}

const titleList = computed<string[]>({
  get: () =>
    titles.value
      .split('\n')
      .map(file => file?.split('|')[0])
      .filter(x => x),
  set: files => (titles.value = files?.join('\n'))
});

function onFilesPaste($event: ClipboardEvent) {
  try {
    if (!$event.clipboardData) return;
    const html = $event.clipboardData.getData('text/html');
    if (!html || !/<a/.test(html)) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.getElementsByTagName('a');
    const files: Record<string, boolean> = {};
    [...links]
      .map(a => decodeURI(a.href))
      .filter(href => !!href)
      .map(href => href.replace(/.*File:/, 'File:'))
      .forEach(file => (files[file] = true));
    titleList.value = Object.keys(files);
    $event.preventDefault();
  } catch (ex) {
    console.warn('Could not parse HTML clipboard content', ex);
  }
}

const msgLoadGeolocate = computed(() =>
  t('Load {{$ctrl.titleList.length}} files to geolocate').replace(
    '{{$ctrl.titleList.length}}',
    titleList.value.length
  )
);
const msgShowMap = computed(() =>
  t('Show {{$ctrl.titleList.length}} files on map').replace(
    '{{$ctrl.titleList.length}}',
    titleList.value.length
  )
);
const msgShowGallery = computed(() =>
  t('Show {{$ctrl.titleList.length}} files as gallery').replace(
    '{{$ctrl.titleList.length}}',
    titleList.value.length
  )
);
</script>
