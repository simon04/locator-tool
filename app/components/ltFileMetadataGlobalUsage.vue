<template>
  <a
    v-if="badge && globalUsage.count !== undefined"
    class="text-decoration-none"
    :href="globalUsage.link"
    target="_blank"
    :title="globalUsage.tooltip"
  >
    <span class="badge" :class="globalUsage.count ? 'bg-danger' : 'bg-secondary'">
      {{ globalUsage.count }}
    </span>
  </a>
  <div v-else-if="!badge && globalUsage.count" class="small" :title="globalUsage.tooltip">
    <span class="icon-link">
      <ShareFill />
      <abbr>
        <a :href="globalUsage.link" target="_blank">
          {{ globalUsage.count }}
        </a>
      </abbr>
    </span>
  </div>
</template>

<script setup lang="ts">
import ShareFill from 'bootstrap-icons/icons/share-fill.svg?component';
import {computed} from 'vue';

import type {FileDetails} from '../api/imageinfo';
import {removeCommonsPrefix} from '../api/removeCommonsPrefix';
import type {CommonsFile} from '../model';

const props = defineProps<{
  file: CommonsFile & FileDetails;
  // displays the count as badge, also when the file is unused
  badge?: boolean;
}>();

const globalUsage = computed(() => ({
  count: props.file?.globalUsage?.length,
  tooltip: `Global usage\n${props.file?.globalUsage?.map(u => `${u.wiki}: ${u.title}`).join('\n')}`,
  link: `https://commons.wikimedia.org/wiki/Special:GlobalUsage/${removeCommonsPrefix(
    props.file?.file,
    'File:'
  )}`
}));
</script>
