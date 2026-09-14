import {useAsyncState} from '@vueuse/core';

import {getProfile, isLoggedIn, type Profile} from '../api/OAuth2';

// Shared state: the navbar and the file selector both greet the logged in user.
const {state: profile} = useAsyncState<Profile | undefined>(
  () => (isLoggedIn() ? getProfile() : Promise.resolve(undefined)),
  undefined
);

export function useProfile() {
  return profile;
}
