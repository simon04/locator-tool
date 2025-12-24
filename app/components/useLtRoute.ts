import {useRoute} from 'vue-router';
import type {FilesOptions} from '../api/ltData';
import {computed} from 'vue';

export function useLtRoute() {
  const $route = useRoute();
  const $query = computed(() => $route.query as FilesOptions);
  const hasFilesUserCategory = computed(
    () => $query.value?.files || $query.value?.user || $query.value?.category
  );
  return {...$route, $query, hasFilesUserCategory};
}
