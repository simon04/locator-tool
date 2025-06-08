<template>
  <nav
    class="navbar navbar-expand-md bg-body-tertiary shadow border-bottom border-3"
    style="--bs-border-color: #2a4b8d"
  >
    <div class="container-fluid">
      <router-link class="navbar-brand" :to="{name: 'select'}">
        <img src="../../locator-tool.svg" style="height: 30px" />
      </router-link>
      <router-link class="navbar-brand" :to="{name: 'select'}">
        <span>{{ t('locator-tool') }}</span>
      </router-link>
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link
            class="nav-link icon-link"
            :to="{name: 'select', query: $query}"
            :title="t('Select files to geolocate')"
          >
            <ListTask />
            <span>{{ t('Select files') }}</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            v-show="activateLinks"
            class="nav-link icon-link"
            :to="{name: 'geolocate', query: $query}"
          >
            <GeoAlt />
            <span>{{ t('Geolocate files') }}</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            v-show="activateLinks"
            class="nav-link icon-link"
            :to="{name: 'map', query: $query}"
          >
            <GlobeEuropeAfrica />
            <span>{{ t('Map') }}</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            v-show="activateLinks"
            class="nav-link icon-link"
            :to="{name: 'gallery', query: $query}"
          >
            <FileImage />
            <span>{{ t('Gallery') }}</span>
          </router-link>
        </li>
        <li class="nav-item" :title="t('About locator-tool')">
          <router-link class="nav-link" :to="{name: 'about'}">
            <span>{{ t('About') }}</span>
          </router-link>
        </li>
      </ul>
      <div class="ms-auto"></div>
      <ul class="navbar-nav">
        <li class="nav-item">
          <lt-dark-mode-toggle />
        </li>
      </ul>
      <div class="ms-2"><lt-language-selector /></div>
      <lt-user-info />
    </div>
  </nav>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import ltDarkModeToggle from './ltDarkModeToggle.vue';
import ltLanguageSelector from './ltLanguageSelector.vue';
import ltUserInfo from './ltUserInfo.vue';
import {t} from './useI18n';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import GlobeEuropeAfrica from 'bootstrap-icons/icons/globe-europe-africa.svg?component';
import FileImage from 'bootstrap-icons/icons/file-image.svg?component';
import ListTask from 'bootstrap-icons/icons/list-task.svg?component';
import {useLtRoute} from './useLtRoute';

const {$query} = useLtRoute();
const activateLinks = computed(() => $query?.files || $query?.user || $query?.category);
</script>
