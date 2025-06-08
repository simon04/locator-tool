import {useRoute} from 'vue-router';
import {FilesOptions} from '../api/ltData';
import {computed} from 'vue';

export function useLtRoute() {
  const $route = useRoute();
  const $query = computed(() => $route.query as FilesOptions);
  return {...$route, $query};
}
