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

.lt-layers .lt-layers-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 29px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}
.lt-layers .lt-layers-toggle svg {
  width: 18px;
  height: 18px;
}
.lt-layers .lt-layers-list {
  display: none;
  padding: 6px 10px;
  white-space: nowrap;
}
.lt-layers:hover .lt-layers-toggle {
  display: none;
}
.lt-layers:hover .lt-layers-list,
.lt-layers:focus-within .lt-layers-list {
  display: block;
}
.lt-layers .lt-layers-list label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: normal;
  margin: 0;
}
.lt-layers .lt-layers-list svg {
  width: 1em;
  height: 1em;
}

.flex-grow-1 {
  /* https://stackoverflow.com/a/36247448 */
  min-height: 0;
}
</style>
