import {type MaybeRef, computed, unref} from 'vue';
import {t} from './useI18n';
import {useTitle} from '@vueuse/core';
import {useLtRoute} from './useLtRoute';

export function useAppTitle(...titles: MaybeRef<string | null | undefined>[]) {
  const title = computed(() =>
    [...titles.map(t => unref(t)).filter(t => !!t), t('locator-tool')].join(' • ')
  );
  return useTitle(title, {
    restoreOnUnmount: originalTitle => originalTitle
  });
}

export function routeTitlePart() {
  const {$query} = useLtRoute();
  return computed(
    () =>
      $query.value.category?.replace(/_/, ' ') || $query.value.user?.replace(/_/, ' ') || undefined
  );
}
