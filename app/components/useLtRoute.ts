import {computed} from 'vue';

import type {FilesOptions} from '../api/files';
import {useRoute} from '../router';

export function useLtRoute() {
  const $route = useRoute();
  const $query = computed(() => $route.query as FilesOptions);
  const hasFilesUserCategory = computed(
    () => $query.value?.files || $query.value?.user || $query.value?.category
  );
  return {...$route, $query, hasFilesUserCategory};
}
