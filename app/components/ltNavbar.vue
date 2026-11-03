<template>
  <nav
    class="navbar md:navbar-expand bg-1 shadow border-bottom border-3"
    style="--bs-border-color: #2a4b8d"
  >
    <div class="container-fluid">
      <router-link class="navbar-brand" :to="{name: 'select'}">
        <img src="../../locator-tool.svg" style="height: 30px" />
      </router-link>
      <router-link class="navbar-brand" :to="{name: 'select'}">
        <span>{{ t('locator-tool') }}</span>
      </router-link>
      <button
        class="btn-icon navbar-toggler"
        type="button"
        data-bs-toggle="drawer"
        data-bs-target="#navbarDrawer"
        aria-controls="navbarDrawer"
        aria-expanded="false"
        :aria-label="t('Menu')"
      >
        <span class="navbar-toggler-icon" aria-hidden="true"></span>
      </button>
      <dialog
        id="navbarDrawer"
        class="drawer drawer-end"
        tabindex="-1"
        aria-labelledby="navbarDrawerLabel"
        @click="closeOnLink"
      >
        <div class="drawer-header">
          <h5 id="navbarDrawerLabel" class="drawer-title">{{ t('locator-tool') }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="drawer"
            :aria-label="t('Close')"
          ></button>
        </div>
        <div class="drawer-body">
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
            <li v-show="hasFilesUserCategory" class="nav-item">
              <router-link class="nav-link icon-link" :to="{name: 'geolocate', query: $query}">
                <GeoAlt />
                <span>{{ t('Geolocate files') }}</span>
              </router-link>
            </li>
            <li v-show="hasFilesUserCategory" class="nav-item">
              <router-link class="nav-link icon-link" :to="{name: 'map', query: $query}">
                <GlobeEuropeAfrica />
                <span>{{ t('Map') }}</span>
              </router-link>
            </li>
            <li v-show="hasFilesUserCategory" class="nav-item">
              <router-link class="nav-link icon-link" :to="{name: 'gallery', query: $query}">
                <FileImage />
                <span>{{ t('Gallery') }}</span>
              </router-link>
            </li>
            <li v-show="hasFilesUserCategory" class="nav-item">
              <router-link class="nav-link icon-link" :to="{name: 'table', query: $query}">
                <TableIcon />
                <span>{{ t('Table') }}</span>
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
          <div class="ms-3"><lt-language-selector /></div>
          <lt-user-info />
        </div>
      </dialog>
    </div>
  </nav>
</template>

<script setup lang="ts">
import FileImage from 'bootstrap-icons/icons/file-image.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import GlobeEuropeAfrica from 'bootstrap-icons/icons/globe-europe-africa.svg?component';
import ListTask from 'bootstrap-icons/icons/list-task.svg?component';
import TableIcon from 'bootstrap-icons/icons/table.svg?component';
import Drawer from 'bootstrap/js/dist/drawer.js';

import ltDarkModeToggle from './ltDarkModeToggle.vue';
import ltLanguageSelector from './ltLanguageSelector.vue';
import ltUserInfo from './ltUserInfo.vue';
import {t} from './useI18n';
import {useLtRoute} from './useLtRoute';

const {$query, hasFilesUserCategory} = useLtRoute();

// navigating via a link inside the drawer does not close it on its own
function closeOnLink(event: MouseEvent) {
  if ((event.target as HTMLElement).closest('a'))
    Drawer.getInstance(event.currentTarget as HTMLElement)?.hide();
}
</script>
