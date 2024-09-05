<!-- eslint-disable vue/no-v-html -->
<template>
  <h2 v-if="!userInfo?.user" class="mt-4">{{ t('Sign in') }}</h2>
  <p v-if="!userInfo?.user">
    <span>
      {{ t('In order to allow locator-tool to modify file description pages, sign in first:') }}
    </span>
    <a class="btn btn-success ms-2" :href="loginURL()">
      <DoorOpen class="me-1" />
      <span>{{ t('Log in') }}</span>
    </a>
  </p>
  <p v-if="userInfo?.user" class="mt-4">{{ msgLoggedIn }}</p>
  <h2>{{ t('Select files to geolocate') }}</h2>
  <ul class="nav nav-pills my-3">
    <li class="nav-item">
      <button
        class="nav-link"
        :class="{active: $tab === Tab.CATEGORY}"
        @click="$tab = Tab.CATEGORY"
      >
        {{ t('Category') }}
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" :class="{active: $tab === Tab.USER}" @click="$tab = Tab.USER">
        {{ t('User files') }}
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" :class="{active: $tab === Tab.FILES}" @click="$tab = Tab.FILES">
        {{ t('File list') }}
      </button>
    </li>
  </ul>
  <form v-show="$tab === Tab.USER" @submit.stop.prevent="nextForCategory()">
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
      <button class="btn btn-success me-2" :disabled="!user" @click="nextForUser()">
        <GeoAlt class="me-1" />
        <span>{{ t('Load User files to geolocate') }}</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!user" @click="nextForUser('map')">
        <GlobeEuropeAfrica class="me-1" />
        <span>{{ t('Show User files on map') }}</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!user" @click="nextForUser('gallery')">
        <FileImage class="me-1" />
        <span>{{ t('Show User files as gallery') }}</span>
      </button>
      <input class="invisible" type="submit" :disabled="!user" />
      <lt-spinner v-if="isLoading" />
      <datalist id="datalistUser">
        <option v-for="i in userSuggestions" :key="i" :value="i"></option>
      </datalist>
    </div>
  </form>
  <form v-show="$tab === Tab.CATEGORY" @submit.stop.prevent="nextForCategory()">
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
      <button class="btn btn-success me-2" :disabled="!category" @click="nextForCategory()">
        <GeoAlt class="me-1" />
        <span>{{ t('Load Category to geolocate') }}</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!category" @click="nextForCategory('map')">
        <GlobeEuropeAfrica class="me-1" />
        <span>{{ t('Show Category on map') }}</span>
      </button>
      <button
        class="btn btn-secondary me-2"
        :disabled="!category"
        @click="nextForCategory('gallery')"
      >
        <FileImage class="me-1" />
        <span>{{ t('Show Category as gallery') }}</span>
      </button>
      <input class="invisible" type="submit" :disabled="!category" />
    </div>
    <lt-spinner v-if="isLoading" />
    <datalist id="datalistCategory">
      <option v-for="i in categorySuggestions" :key="i" :value="i"></option>
    </datalist>
  </form>
  <form v-show="$tab === Tab.FILES" @submit.stop.prevent="nextForCategory()">
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
      <button class="btn btn-success me-2" :disabled="!titleList.length" @click="next()">
        <GeoAlt class="me-1" />
        <span>{{ msgLoadGeolocate }}</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!titleList.length" @click="next('map')">
        <GlobeEuropeAfrica class="me-1" />
        <span>{{ msgShowMap }}</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!titleList.length" @click="next('gallery')">
        <FileImage class="me-1" />
        <span>{{ msgShowGallery }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {watchDebounced} from '@vueuse/core';
import * as ltData from '../api/ltData';
import {getUserInfo, loginURL} from '../api/ltDataAuth';
import {useRoute, useRouter} from 'vue-router';
import ltSpinner from './ltSpinner.vue';
import {t} from './useI18n';
import DoorOpen from 'bootstrap-icons/icons/door-open.svg?component';
import FileImage from 'bootstrap-icons/icons/file-image.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import GlobeEuropeAfrica from 'bootstrap-icons/icons/globe-europe-africa.svg?component';

enum Tab {
  CATEGORY = 1,
  USER = 2,
  FILES = 3
}

const $route = useRoute();
const $routes = useRouter();

const isLoading = ref(false);
const $tab = ref<Tab>($route.query.user ? Tab.USER : Tab.CATEGORY);
const category = ref<string>($route.query.category as string);
const categoryDepth = ref(tryParse(parseInt, $route.query.categoryDepth as string, 3));
const categorySuggestions = ref<string[]>([]);
const user = ref<string>($route.query.user as string);
const userLimit = ref(tryParse(parseInt, $route.query.userLimit as string, undefined));
const userStart = ref<string>($route.query.userStart as string);
const userEnd = ref<string>($route.query.userEnd as string);
const userSuggestions = ref<string[]>([]);
const titles = ref<string>('');

function tryParse<T>(parser: (string: string) => T, text: string, fallback: T): T {
  if (!text) {
    return fallback;
  }
  try {
    return parser(text as string);
  } catch {
    return fallback;
  }
}

const {data: userInfo} = getUserInfo();

watchDebounced(
  category,
  async category => {
    isLoading.value = true;
    try {
      categorySuggestions.value = await ltData.getCategoriesForPrefix(category);
    } finally {
      isLoading.value = false;
    }
  },
  {debounce: 500}
);

watchDebounced(
  user,
  async user => {
    isLoading.value = true;
    try {
      userSuggestions.value = await ltData.getUsersForPrefix(user);
      console.log(userSuggestions.value);
    } finally {
      isLoading.value = false;
    }
  },
  {debounce: 500}
);

function next(name = 'geolocate') {
  const files = titleList.value.join('|');
  $routes.push({name, query: {files}});
}

function nextForUser(name = 'geolocate') {
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

function nextForCategory(name = 'geolocate') {
  $routes.push({
    name,
    query: {
      category: category.value,
      categoryDepth: categoryDepth.value
    }
  });
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

const msgLoggedIn = computed(() =>
  t('Hello {{$ctrl.userInfo}}!').replace('{{$ctrl.userInfo}}', userInfo.value?.user)
);
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
