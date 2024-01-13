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
        <span translate="translate">locator-tool</span>
      </router-link>
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link
            class="nav-link"
            :to="{name: 'select', params: $route.query}"
            title="{{'Select files to geolocate' | translate}}"
          >
            <svg class="octicon">
              <use xlink:href="#tasklist"></use>
            </svg>
            <span translate="translate">Select files</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            v-show="activateLinks"
            class="nav-link"
            :to="{name: 'geolocate', params: $route.query}"
          >
            <svg class="octicon">
              <use xlink:href="#location"></use>
            </svg>
            <span translate="translate">Geolocate files</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            v-show="activateLinks"
            class="nav-link"
            :to="{name: 'map', params: $route.query}"
          >
            <svg class="octicon">
              <use xlink:href="#globe"></use>
            </svg>
            <span translate="translate">Map</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            v-show="activateLinks"
            class="nav-link"
            :to="{name: 'gallery', params: $route.query}"
          >
            <svg class="octicon">
              <use xlink:href="#file-media"></use>
            </svg>
            <span translate="translate">Gallery</span>
          </router-link>
        </li>
        <li class="nav-item" title="{{'About locator-tool' | translate}}">
          <router-link class="nav-link" :to="{name: 'about'}">
            <span translate="translate">About</span>
          </router-link>
        </li>
      </ul>
      <div class="ms-auto"></div>
      <div class="ms-2"><lt-language-selector /></div>
      <lt-user-info />
    </div>
  </nav>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import ltLanguageSelector from './ltLanguageSelector.vue';
import ltUserInfo from './ltUserInfo.vue';

const $route = useRoute();
const activateLinks = computed(
  () => $route.params?.files || $route.params?.user || $route.params?.category
);
</script>
