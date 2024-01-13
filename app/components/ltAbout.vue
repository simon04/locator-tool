<template>
  <h2 class="mt-4">
    <svg class="octicon">
      <use xlink:href="#location"></use>
    </svg>
    <span translate="translate">locator-tool</span>
  </h2>
  <!-- prettier-ignore -->
  <p translate="translate">This tool helps to add <code class="mediawiki-template">Coordinate</code> information to images on <a href="https://commons.wikimedia.org/">Wikimedia Commons</a>.</p>
  <h2 translate="translate">Usage</h2>
  <ol>
    <li translate="translate">Log in using the button on the upper right corner</li>
    <!-- prettier-ignore -->
    <li translate="translate"><router-link :to="{name:'select'}">Select files to geolocate</router-link> by querying a category or inputting a list of <code>File:</code>s.</li>
    <!-- prettier-ignore -->
    <li translate="translate">From the list of files provided, select one and click its location on an interactive map.</li>
    <li translate="translate">Repeat …</li>
  </ol>
  <p>
    <span translate="translate">Tutorial</span>
    <!-- prettier-ignore -->
    <span translate="translate">→ <a href="https://commons.wikimedia.org/wiki/Commons:Locator-tool">Commons:Locator-tool</a></span>
  </p>
  <h2 translate="translate">About</h2>
  <ul>
    <!-- prettier-ignore -->
    <li translate="translate">This tool has been created by <a href="https://github.com/simon04/">simon04</a>.</li>
    <!-- prettier-ignore -->
    <li translate="translate">Its source code is available on <a href="https://github.com/simon04/locator-tool">GitHub</a> and <a href="https://www.gnu.org/licenses/gpl.html">GPL v3</a> licensed.</li>
    <li>
      <svg class="octicon">
        <use xlink:href="#history"></use>
      </svg>
      <span>
        <a
          href="https://commons.wikimedia.org/w/index.php?title=Special:RecentChanges&amp;tagfilter=OAuth+CID%3A+1857"
        >
          <span translate="translate">Edits using locator-tool</span>
        </a>
      </span>
    </li>
    <li>
      <svg class="octicon">
        <use xlink:href="#comment"></use>
      </svg>
      <span>
        <a href="https://www.transifex.com/locator-tool/locator-tool/">
          <span translate="translate">Translate locator-tool on Transifex</span>
        </a>
      </span>
    </li>
    <li>
      <span translate="translate">Version:</span>&nbsp;
      <time :datetime="buildDate">{{ buildDate }}</time
      >,
      <a ng-href="https://github.com/simon04/locator-tool/commit/{{buildVersion}}">
        <code>{{ buildVersion }}</code>
      </a>
    </li>
    <li>
      <ul class="list-inline">
        <li class="list-inline-item"><span translate="translate">Open Source Licenses:</span></li>
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
const appDependencies = JSON.parse(import.meta.env.VITE_APP_DEPENDENCIES);
const buildDate = import.meta.env.VITE_BUILD_DATE;
const buildVersion = import.meta.env.VITE_BUILD_VERSION;
</script>
