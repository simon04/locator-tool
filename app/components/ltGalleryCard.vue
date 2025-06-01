<template>
  <div class="card">
    <div class="card-img-top">
      <lt-file-thumbnail :file="title" />
    </div>
    <div class="card-body">
      <h5 class="card-title">
        {{ title.file }}
        {{ ' ' }}
        <a :href="title.url" target="_blank">
          <BoxArrowUpRight />
        </a>
        {{ ' ' }}
        <a v-if="title.$geolocate" :href="title.$geolocate">
          <GeoAlt />
        </a>
        <router-link v-else :to="{name: 'geolocate', query: {files: title.file}}">
          <GeoAlt />
        </router-link>
      </h5>
      <div class="card-text">
        <lt-file-metadata :file="title" :description="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BoxArrowUpRight from 'bootstrap-icons/icons/box-arrow-up-right.svg?component';
import GeoAlt from 'bootstrap-icons/icons/geo-alt.svg?component';
import {FileDetails} from '../api/ltData';
import {CommonsFile} from '../model';
import ltFileMetadata from './ltFileMetadata.vue';
import ltFileThumbnail from './ltFileThumbnail.vue';

defineProps<{
  title: CommonsFile & FileDetails;
}>();
</script>
