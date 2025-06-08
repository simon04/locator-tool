import {useRoute} from 'vue-router';
import {FilesOptions} from '../api/ltData';

export function useLtRoute() {
  const $route = useRoute();
  const $query = $route.query as FilesOptions;
  return {...$route, $query};
}
