<!-- eslint-disable vue/no-v-html -->
<template>
  <h2 class="mt-4 icon-link">
    <GeoAlt />
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
      <a
        href="https://commons.wikimedia.org/w/index.php?title=Special:RecentChanges&amp;tagfilter=OAuth+CID%3A+1857"
        class="icon-link"
      >
        <ClockHistory />
        <span>{{ t('Edits using locator-tool') }}</span>
      </a>
    </li>
    <li>
      <a href="https://www.transifex.com/locator-tool/locator-tool/" class="icon-link">
        <ChatLeft />
        <span>{{ t('Translate locator-tool on Transifex') }}</span>
      </a>
    </li>
    <li>
      <span>{{ t('Version:') }}</span>
      {{ ' ' }}
      <time :datetime="buildDate">{{ buildDate }}</time
      >,
      <a :href="buildVersionLink">
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
import {useAppTitle} from './useAppTitle';
import ClockHistory from 'bootstrap-icons/icons/clock-history.svg?component';
import ChatLeft from 'bootstrap-icons/icons/chat-left.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';

useAppTitle(t('About'));

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
const buildVersionLink = computed(
  () => 'https://github.com/simon04/locator-tool/commit/' + buildVersion
);
</script>

<style>
a[href="https://github.com/simon04/locator-tool"]
{
  background: url(bootstrap-icons/icons/github.svg);
  background-position: center left;
  background-repeat: no-repeat;
  padding-left: 20px;
}
</style>
