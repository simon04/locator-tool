<template>
  <div class="progress" role="progressbar" aria-label="Loading" aria-busy="true">
    <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
  </div>
  <div class="ticker" aria-hidden="true">
    <code :key="url">{{ url }}</code>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';

import {lastFetchedUrl} from '../api/fetchJSON';

const url = computed(() => {
  try {
    return decodeURI(lastFetchedUrl.value);
  } catch {
    return lastFetchedUrl.value;
  }
});
</script>

<style scoped>
.ticker {
  height: 1.5rem;
  line-height: 1.5rem;
  margin-top: 0.25rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.75rem;
  opacity: 0.6;
}
.ticker code {
  display: inline;
  animation: ticker-in 0.2s ease-out;
}
@keyframes ticker-in {
  from {
    opacity: 0;
  }
}
</style>
