<!-- eslint-disable vue/no-v-html -->
<template>
  <div v-show="description !== false" v-html="file.description"></div>
  <div v-if="file.timestamp" class="small">
    <svg class="octicon">
      <use xlink:href="#calendar"></use>
    </svg>

    <time v-html="file.timestamp"></time>
  </div>
  <div v-if="file.author" class="small">
    <svg class="octicon">
      <use xlink:href="#person"></use>
    </svg>

    <span v-html="file.author"></span>
  </div>
  <a
    v-for="category in file.categories"
    :key="category"
    class="text-decoration-none"
    :href="`https://commons.wikimedia.org/wiki/Category:${category}`"
    target="_blank"
  >
    <span class="badge bg-secondary me-1 text-truncate" style="max-width: 100%">{{
      category
    }}</span>
  </a>
</template>

<script setup lang="ts">
import type {FileDetails} from '../api/ltData';
defineProps<{
  description?: false;
  file: FileDetails;
}>();
</script>
