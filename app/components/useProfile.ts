import {computedAsync} from '@vueuse/core';

import {getProfile, isLoggedIn, type Profile} from '../api/OAuth2';

// Shared state: the navbar and the file selector both greet the logged in user.
// Re-evaluates when the session appears or is dropped, e.g. by a failed refresh.
const profile = computedAsync<Profile | undefined>(
  () => (isLoggedIn.value ? getProfile() : undefined),
  undefined,
  {onError: error => console.warn('Failed to load the profile', error)}
);

export function useProfile() {
  return profile;
}
