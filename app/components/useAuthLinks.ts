import {useBrowserLocation} from '@vueuse/core';
import {computed} from 'vue';

import {useRouter} from '../router';

export function useAuthLinks() {
  const router = useRouter();
  const browser = useBrowserLocation();
  // Returning to /login or /logout would start the dance all over again.
  const next = computed(() =>
    ['login', 'logout'].includes(router.currentRoute.name ?? '') ? undefined : browser.value.hash
  );
  const loginURL = computed(() => router.resolve({name: 'login', query: {next: next.value}}).href);
  const logoutURL = computed(() => router.resolve({name: 'logout'}).href);
  return {loginURL, logoutURL};
}
