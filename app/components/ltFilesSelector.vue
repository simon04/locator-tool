<template>
  <h2 class="mt-4" v-hide="userInfo" translate="translate">Sign in</h2>
  <p v-hide="userInfo">
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
        @click="$tab = Tab.CATEGORY"
        :class="{active: $tab === Tab.CATEGORY}"
      >
        Category
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link"
        translate="translate"
        @click="$tab = Tab.USER"
        :class="{active: $tab === Tab.USER}"
      >
        User files
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link"
        translate="translate"
        @click="$tab = Tab.FILES"
        :class="{active: $tab === Tab.FILES}"
      >
        File list
      </button>
    </li>
  </ul>
  <form name="formUser" @submit="nextForUser()" v-show="$tab === Tab.USER">
    <div class="mb-4">
      <label for="inputUser" translate="translate">User</label>
      <input class="form-control" id="inputUser" v-model="user" placeholder="User:…" />
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
        <input class="form-control" id="inputUserLimit" v-model="userLimit" type="number" />
      </div>
      <div class="mb-4 col-sm-4">
        <label for="inputUserStart" translate="translate">Start timestamp</label>
        <input class="form-control" id="inputUserStart" v-model="userStart" type="date" />
      </div>
      <div class="mb-4 col-sm-4">
        <label for="inputUserEnd" translate="translate">End timestamp</label>
        <input class="form-control" id="inputUserEnd" v-model="userEnd" type="date" />
      </div>
    </div>
    <div class="mb-4">
      <button class="btn btn-success" @click="nextForUser()" :disabled="!user">
        <svg class="octicon">
          <use xlink:href="#location"></use>
        </svg>
        <span translate="translate">Load User files to geolocate</span>
      </button>
      <button class="btn btn-secondary" @click="nextForUser('map')" :disabled="!user">
        <svg class="octicon">
          <use xlink:href="#globe"></use>
        </svg>
        <span translate="translate">Show User files on map</span>
      </button>
      <button class="btn btn-secondary" @click="nextForUser('gallery')" :disabled="!user">
        <svg class="octicon">
          <use xlink:href="#file-media"></use>
        </svg>
        <span translate="translate">Show User files as gallery</span>
      </button>
      <input class="invisible" type="submit" :disabled="!user" />
    </div>
    <lt-spinner v-if="getFilesForUser$q && !getFilesForUser$q.$$state.status"></lt-spinner>
  </form>
  <form name="formCategory" @submit="nextForCategory()" v-show="$tab === Tab.CATEGORY">
    <div class="row">
      <div class="mb-4 col-lg-10">
        <label for="inputCategory" translate="translate">Category</label>
        <input
          class="form-control"
          id="inputCategory"
          list="datalistCategory"
          v-model="category"
          v-model-options="{updateOn: 'default blur', debounce: {default: 500, change: 0, blur: 0}}"
          @change="getCategoriesForPrefix()"
          placeholder="Category:…"
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
        <input class="form-control" id="inputCategoryDepth" type="number" v-model="categoryDepth" />
      </div>
    </div>
    <div class="mb-4">
      <button class="btn btn-success" @click="nextForCategory()" :disabled="!category">
        <svg class="octicon">
          <use xlink:href="#location"></use>
        </svg>
        <span translate="translate">Load Category to geolocate</span>
      </button>
      <button class="btn btn-secondary" @click="nextForCategory('map')" :disabled="!category">
        <svg class="octicon">
          <use xlink:href="#globe"></use>
        </svg>
        <span translate="translate">Show Category on map</span>
      </button>
      <button class="btn btn-secondary" @click="nextForCategory('gallery')" :disabled="!category">
        <svg class="octicon">
          <use xlink:href="#file-media"></use>
        </svg>
        <span translate="translate">Show Category as gallery</span>
      </button>
      <input class="invisible" type="submit" :disabled="!category" />
    </div>
    <lt-spinner v-if="getFilesForCategory$q && !getFilesForCategory$q.$$state.status"></lt-spinner>
    <datalist id="datalistCategory">
      <option v-for="i in categorySuggestions" :value="i"></option>
    </datalist>
  </form>
  <form name="formTitles" v-show="$tab === Tab.FILES">
    <div class="mb-4">
      <label for="inputTitles" translate="translate">File list</label>
      <textarea
        class="form-control"
        id="inputTitles"
        rows="10"
        v-model="titles"
        placeholder="File:…"
        @paste="onFilesPaste($event)"
      ></textarea>
      <!-- prettier-ignore -->
      <p class="form-text" translate="translate">When a clipboard content containing HTML code (for instance a copied selection from a Commons gallery) is pasted here, locator-tool tries to extract <code>File:</code>s from the code.</p>
    </div>
    <div class="mb-4">
      <button class="btn btn-success pointer" :disabled="!titleList.length" @click="next()">
        <svg class="octicon">
          <use xlink:href="#location"></use>
        </svg>
        <span translate="translate">Load {{ titleList.length }} files to geolocate</span>
      </button>
      <button class="btn btn-secondary" :disabled="!titleList.length" @click="next('map')">
        <svg class="octicon">
          <use xlink:href="#globe"></use>
        </svg>
        <span translate="translate">Show {{ titleList.length }} files on map</span>
      </button>
      <button class="btn btn-secondary" :disabled="!titleList.length" @click="next('gallery')">
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
import {getUserInfo, loginURL} from '../api/ltDataAuth';
import {useRoute, useRouter} from 'vue-router';

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
// categorySuggestions: string[] = [];
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
  this.ltData.getCategoriesForPrefix(this.category).then(categories => {
    this.categorySuggestions = categories;
  });
}

function next(name = 'geolocate') {
  const files = titleList.value.join('|');
  $routes.push({name, params: {files}});
}

function nextForUser(name = 'geolocate') {
  const {user, userLimit} = this;
  const userStart = this.userStart instanceof Date ? this.userStart.toISOString() : undefined;
  const userEnd = this.userEnd instanceof Date ? this.userEnd.toISOString() : undefined;
  $routes.push({name, params: {user, userLimit, userStart, userEnd}});
}

function nextForCategory(name = 'geolocate') {
  const {category, categoryDepth} = this;
  $routes.push({name, params: {category, categoryDepth}});
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
  /* eslint-env browser */
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
