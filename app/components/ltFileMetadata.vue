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
  <ltFileMetadataGlobalUsage :file="file" />
  <!-- a single child of the flex column .card-body, so that the badges flow inline -->
  <div v-if="file.categories?.length">
    <a
      v-for="category in file.categories"
      :key="category"
      class="text-decoration-none"
      :href="`https://commons.wikimedia.org/wiki/Category:${category}`"
      target="_blank"
    >
      <span class="badge theme-secondary me-1 text-truncate" style="max-width: 100%">
        {{ category }}
      </span>
    </a>
  </div>
</template>

<script setup lang="ts">
import CalendarEvent from 'bootstrap-icons/icons/calendar-event.svg?component';
import PersonFill from 'bootstrap-icons/icons/person-fill.svg?component';

import type {FileDetails} from '../api/imageinfo';
import type {CommonsFile} from '../model';
import ltFileMetadataGlobalUsage from './ltFileMetadataGlobalUsage.vue';

defineProps<{
  description?: false;
  file: CommonsFile & FileDetails;
}>();
</script>
