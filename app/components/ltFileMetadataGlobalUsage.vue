<template>
  <div v-if="globalUsage.count" class="small" :title="globalUsage.tooltip">
    <span class="icon-link">
      <ShareFill />
      <abbr>
        <a :href="globalUsage.link">
          {{ globalUsage.count }}
        </a>
      </abbr>
    </span>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';

import type {FileDetails} from '../api/imageinfo';
import type {CommonsFile} from '../model';

const props = defineProps<{
  file: CommonsFile & FileDetails;
}>();

const globalUsage = computed(() => ({
  count: props.file?.globalUsage?.length,
  tooltip: `Global usage\n${props.file?.globalUsage?.map(u => `${u.wiki}: ${u.title}`).join('\n')}`,
  link: `https://commons.wikimedia.org/wiki/Special:GlobalUsage/${props.file?.file.replace(/^File:/, '')}`
}));
</script>
