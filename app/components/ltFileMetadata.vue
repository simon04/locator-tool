<template>
  <div v-show="description !== false" v-html="file.description"></div>
  <div v-if="file.timestamp" class="small">
    <span class="icon-link">
      <CalendarEvent />
      <time v-html="file.timestamp"></time>
    </span>
  </div>
  <div v-if="file.author" class="small">
    <span class="icon-link">
      <PersonFill />
      <span v-html="file.author"></span>
    </span>
  </div>
  <a
    v-for="category in file.categories"
    :key="category"
    class="text-decoration-none"
    :href="`https://commons.wikimedia.org/wiki/Category:${category}`"
    target="_blank"
  >
    <span class="badge bg-secondary me-1 text-truncate" style="max-width: 100%">
      {{ category }}
    </span>
  </a>
</template>

<script setup lang="ts">
import type {FileDetails} from '../api/ltData';
import CalendarEvent from 'bootstrap-icons/icons/calendar-event.svg?component';
import PersonFill from 'bootstrap-icons/icons/person-fill.svg?component';

defineProps<{
  description?: false;
  file: FileDetails;
}>();
</script>
