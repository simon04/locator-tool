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

.lt-geocoder {
  display: flex;
  align-items: center;
  position: relative;
  background: var(--bs-body-bg);
}
.lt-geocoder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 29px;
  flex: none;
}
.lt-geocoder-icon svg {
  width: 14px;
  height: 14px;
}
.lt-geocoder form {
  display: flex;
  flex: 1;
}
.lt-geocoder input {
  width: 180px;
  border: none;
  outline: none;
  background: none;
  padding: 0 8px 0 0;
}
.lt-geocoder-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 280px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
  background: var(--bs-body-bg);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  max-height: 200px;
  overflow-y: auto;
}
.lt-geocoder-results:empty {
  display: none;
}
.lt-geocoder-results button {
  display: block;
  width: 100%;
  border: none;
  background: none;
  text-align: left;
  padding: 6px 10px;
  white-space: normal;
}
.lt-geocoder-results button:hover,
.lt-geocoder-results button:focus {
  background: rgba(0, 0, 0, 0.08);
}

.flex-grow-1 {
  /* https://stackoverflow.com/a/36247448 */
  min-height: 0;
}
</style>
