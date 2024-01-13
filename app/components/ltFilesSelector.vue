<template>
  <h2 v-show="!userInfo" class="mt-4" translate="translate">Sign in</h2>
  <p v-show="!userInfo">
    <span translate="translate">
      In order to allow locator-tool to modify file description pages, sign in first:
    </span>
    <a class="btn btn-success ms-2" :href="loginURL()">
      <svg class="octicon">
        <use xlink:href="#sign-in"></use>
      </svg>
      <span translate="translate">Log in</span>
    </a>
  </p>
  <p v-show="userInfo?.user" translate="translate">Hello {{ userInfo?.user }}!</p>
  <h2 translate="translate">Select files to geolocate</h2>
  <ul class="nav nav-pills my-3">
    <li class="nav-item">
      <button
        class="nav-link"
        translate="translate"
        :class="{active: $tab === Tab.CATEGORY}"
        @click="$tab = Tab.CATEGORY"
      >
        Category
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link"
        translate="translate"
        :class="{active: $tab === Tab.USER}"
        @click="$tab = Tab.USER"
      >
        User files
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link"
        translate="translate"
        :class="{active: $tab === Tab.FILES}"
        @click="$tab = Tab.FILES"
      >
        File list
      </button>
    </li>
  </ul>
  <form v-show="$tab === Tab.USER" name="formUser" @submit="nextForUser()">
    <div class="mb-4">
      <label for="inputUser" translate="translate">User</label>
      <input id="inputUser" v-model="user" class="form-control" placeholder="User:…" />
    </div>
    <div class="row">
      <div class="mb-4 col-sm-4">
        <label
          for="inputUserLimit"
          translate="translate"
          translate-comment="maximum number of files"
        >
          Limit
        </label>
        <input id="inputUserLimit" v-model="userLimit" class="form-control" type="number" />
      </div>
      <div class="mb-4 col-sm-4">
        <label for="inputUserStart" translate="translate">Start timestamp</label>
        <input id="inputUserStart" v-model="userStart" class="form-control" type="date" />
      </div>
      <div class="mb-4 col-sm-4">
        <label for="inputUserEnd" translate="translate">End timestamp</label>
        <input id="inputUserEnd" v-model="userEnd" class="form-control" type="date" />
      </div>
    </div>
    <div class="mb-4">
      <button class="btn btn-success me-2" :disabled="!user" @click="nextForUser()">
        <svg class="octicon">
          <use xlink:href="#location"></use>
        </svg>
        <span translate="translate">Load User files to geolocate</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!user" @click="nextForUser('map')">
        <svg class="octicon">
          <use xlink:href="#globe"></use>
        </svg>
        <span translate="translate">Show User files on map</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!user" @click="nextForUser('gallery')">
        <svg class="octicon">
          <use xlink:href="#file-media"></use>
        </svg>
        <span translate="translate">Show User files as gallery</span>
      </button>
      <input class="invisible" type="submit" :disabled="!user" />
    </div>
    <lt-spinner v-if="getFilesForUser$q && !getFilesForUser$q.$$state.status" />
  </form>
  <form v-show="$tab === Tab.CATEGORY" name="formCategory" @submit="nextForCategory()">
    <div class="row">
      <div class="mb-4 col-lg-10">
        <label for="inputCategory" translate="translate">Category</label>
        <input
          id="inputCategory"
          v-model="category"
          :model-options="{updateOn: 'default blur', debounce: {default: 500, change: 0, blur: 0}}"
          class="form-control"
          list="datalistCategory"
          placeholder="Category:…"
          @change="getCategoriesForPrefix()"
        />
      </div>
      <div class="mb-4 col-lg-2">
        <label
          for="inputCategoryDepth"
          translate-comment="Depth of category tree"
          translate-context="Category"
          translate="translate"
        >
          Depth
        </label>
        <input id="inputCategoryDepth" v-model="categoryDepth" class="form-control" type="number" />
      </div>
    </div>
    <div class="mb-4">
      <button class="btn btn-success me-2" :disabled="!category" @click="nextForCategory()">
        <svg class="octicon">
          <use xlink:href="#location"></use>
        </svg>
        <span translate="translate">Load Category to geolocate</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!category" @click="nextForCategory('map')">
        <svg class="octicon">
          <use xlink:href="#globe"></use>
        </svg>
        <span translate="translate">Show Category on map</span>
      </button>
      <button
        class="btn btn-secondary me-2"
        :disabled="!category"
        @click="nextForCategory('gallery')"
      >
        <svg class="octicon">
          <use xlink:href="#file-media"></use>
        </svg>
        <span translate="translate">Show Category as gallery</span>
      </button>
      <input class="invisible" type="submit" :disabled="!category" />
    </div>
    <lt-spinner v-if="getFilesForCategory$q && !getFilesForCategory$q.$$state.status" />
    <datalist id="datalistCategory">
      <option v-for="i in categorySuggestions" :key="i" :value="i"></option>
    </datalist>
  </form>
  <form v-show="$tab === Tab.FILES" name="formTitles">
    <div class="mb-4">
      <label for="inputTitles" translate="translate">File list</label>
      <textarea
        id="inputTitles"
        v-model="titles"
        class="form-control"
        rows="10"
        placeholder="File:…"
        @paste="onFilesPaste($event)"
      ></textarea>
      <!-- prettier-ignore -->
      <p class="form-text" translate="translate">When a clipboard content containing HTML code (for instance a copied selection from a Commons gallery) is pasted here, locator-tool tries to extract <code>File:</code>s from the code.</p>
    </div>
    <div class="mb-4">
      <button class="btn btn-success me-2" :disabled="!titleList.length" @click="next()">
        <svg class="octicon">
          <use xlink:href="#location"></use>
        </svg>
        <span translate="translate">Load {{ titleList.length }} files to geolocate</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!titleList.length" @click="next('map')">
        <svg class="octicon">
          <use xlink:href="#globe"></use>
        </svg>
        <span translate="translate">Show {{ titleList.length }} files on map</span>
      </button>
      <button class="btn btn-secondary me-2" :disabled="!titleList.length" @click="next('gallery')">
        <svg class="octicon">
          <use xlink:href="#file-media"></use>
        </svg>
        <span translate="translate">Show {{ titleList.length }} files as gallery</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import * as ltData from '../api/ltData';
import {getUserInfo, loginURL} from '../api/ltDataAuth';
import {useRoute, useRouter} from 'vue-router';
import ltSpinner from './ltSpinner.vue';

enum Tab {
  CATEGORY = 1,
  USER = 2,
  FILES = 3
}

const $route = useRoute();
const $routes = useRouter();

const $tab = ref<Tab>($route.query.user ? Tab.USER : Tab.CATEGORY);
const category = ref<string>($route.query.category as string);
const categoryDepth = ref(tryParse(parseInt, $route.query.categoryDepth as string, 3));
const categorySuggestions = ref<string[]>([]);
const user = ref<string>($route.query.user as string);
const userLimit = ref(tryParse(parseInt, $route.query.userLimit as string, undefined));
const userStart = ref<Date | undefined>(
  tryParse(s => new Date(s), $route.query.userStart as string, undefined)
);
const userEnd = ref<Date | undefined>(
  tryParse(s => new Date(s), $route.query.userEnd as string, undefined)
);
const titles = ref<string>('');

function tryParse<T>(parser: (string: string) => T, text: string, fallback: T): T {
  if (!text) {
    return fallback;
  }
  try {
    return parser(text as string);
  } catch (ex) {
    return fallback;
  }
}

const {data: userInfo} = getUserInfo();

function getCategoriesForPrefix() {
  ltData.getCategoriesForPrefix(category.value).then(categories => {
    categorySuggestions.value = categories;
  });
}

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
      userStart: userStart.value instanceof Date ? userStart.value.toISOString() : undefined,
      userEnd: userEnd.value instanceof Date ? userEnd.value.toISOString() : undefined
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
</script>
