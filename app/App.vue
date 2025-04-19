<template>
  <lt-navbar></lt-navbar>
  <div class="d-flex flex-grow-1 container-fluid flex-column">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import ltNavbar from './components/ltNavbar.vue';
</script>

<style>
.mediawiki-template::before {
  content: '{{';
}
.mediawiki-template::after {
  content: '}}';
}

label {
  font-weight: bold;
}

.leaflet-control-geocoder-form input {
  color: var(--bs-black);
}

.flex-grow-1 {
  /* https://stackoverflow.com/a/36247448 */
  min-height: 0;
}
</style>
