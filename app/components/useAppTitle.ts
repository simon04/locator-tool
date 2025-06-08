import {MaybeRef, computed, unref} from 'vue';
import {t} from './useI18n';
import {useTitle} from '@vueuse/core';
import {useRoute} from 'vue-router';
import {FilesOptions} from '../api/ltData';

export function useAppTitle(...titles: MaybeRef<string | null | undefined>[]) {
  const title = computed(() =>
    [...titles.map(t => unref(t)).filter(t => !!t), t('locator-tool')].join(' • ')
  );
  return useTitle(title, {
    restoreOnUnmount: originalTitle => originalTitle
  });
}

export function routeTitlePart() {
  const $route = useRoute();
  return computed(
    () =>
      ($route.query as FilesOptions).category?.replace(/_/, ' ') ||
      ($route.query as FilesOptions).user?.replace(/_/, ' ') ||
      undefined
  );
}
