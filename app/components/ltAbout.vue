<!-- eslint-disable vue/no-v-html -->
<template>
  <h2 class="mt-4">
    <svg class="octicon">
      <use xlink:href="#location"></use>
    </svg>
    <span>{{ t('locator-tool') }}</span>
  </h2>
  <p v-html="msg.summary"></p>
  <h2>{{ t('Usage') }}</h2>
  <ol>
    <li>{{ t('Log in using the button on the upper right corner') }}</li>
    <li>
      <span v-html="msg.geolocate[0]"></span>
      {{ ' ' }}
      <router-link :to="{name: 'select'}">{{ msg.geolocate[1] }}</router-link>
      {{ ' ' }}
      <span v-html="msg.geolocate[2]"></span>
    </li>
    <li>
      {{
        t(
          'From the list of files provided, select one and click its location on an interactive map.'
        )
      }}
    </li>
    <li>{{ t('Repeat …') }}</li>
  </ol>
  <p>
    <span>{{ t('Tutorial') }}</span>
    {{ ' ' }}
    <span v-html="msg.help"></span>
  </p>
  <h2>{{ t('About') }}</h2>
  <ul>
    <li v-html="msg.creator"></li>
    <li v-html="msg.code"></li>
    <li>
      <svg class="octicon">
        <use xlink:href="#history"></use>
      </svg>
      <span>
        <a
          href="https://commons.wikimedia.org/w/index.php?title=Special:RecentChanges&amp;tagfilter=OAuth+CID%3A+1857"
        >
          <span>{{ t('Edits using locator-tool') }}</span>
        </a>
      </span>
    </li>
    <li>
      <svg class="octicon">
        <use xlink:href="#comment"></use>
      </svg>
      <span>
        <a href="https://www.transifex.com/locator-tool/locator-tool/">
          <span>{{ t('Translate locator-tool on Transifex') }}</span>
        </a>
      </span>
    </li>
    <li>
      <span>{{ t('Version:') }}</span>
      {{ ' ' }}
      <time :datetime="buildDate">{{ buildDate }}</time
      >,
      <a ng-href="https://github.com/simon04/locator-tool/commit/{{buildVersion}}">
        <code>{{ buildVersion }}</code>
      </a>
    </li>
    <li>
      <ul class="list-inline">
        <li class="list-inline-item">
          <span>{{ t('Open Source Licenses:') }}</span>
        </li>
        <li v-for="dependency in appDependencies" :key="dependency.name" class="list-inline-item">
          <a :href="dependency.homepage" target="_blank" rel="external noopener noreferrer">{{
            dependency.name
          }}</a>
          {{ dependency.version }} ({{ dependency.license }})
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {t} from './useI18n';

const msg = computed(() => ({
  summary: t(
    'This tool helps to add <code class="mediawiki-template">Coordinate</code> information to images on <a href="https://commons.wikimedia.org/">Wikimedia Commons</a>.'
  ),
  geolocate: t(
    '<a ui-sref="select">Select files to geolocate</a> by querying a category or inputting a list of <code>File:</code>s.'
  ).split(/<a ui-sref="select">|<\/a>/),
  help: t(
    '→ <a href="https://commons.wikimedia.org/wiki/Commons:Locator-tool">Commons:Locator-tool</a>'
  ),
  creator: t('This tool has been created by <a href="https://github.com/simon04/">simon04</a>.'),
  code: t(
    'Its source code is available on <a href="https://github.com/simon04/locator-tool">GitHub</a> and <a href="https://www.gnu.org/licenses/gpl.html">GPL v3</a> licensed.'
  )
}));

const appDependencies = JSON.parse(import.meta.env.VITE_APP_DEPENDENCIES);
const buildDate = import.meta.env.VITE_BUILD_DATE;
const buildVersion = import.meta.env.VITE_BUILD_VERSION;
</script>
