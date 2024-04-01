import {MaybeRef, computed, unref} from 'vue';
import {t} from './useI18n';
import {useTitle} from '@vueuse/core';
import {useRoute} from 'vue-router';

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
      ($route.query.category as string)?.replace(/_/, ' ') ||
      ($route.query.user as string)?.replace(/_/, ' ') ||
      undefined
  );
}
