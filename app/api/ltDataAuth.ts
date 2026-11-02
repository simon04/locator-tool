import {StorageSerializers, useFetch, useLocalStorage} from '@vueuse/core';
import {watch} from 'vue';

import {type CommonsFile, LatLng} from '../model';

interface UserApiResponse {
  user: string;
}

interface EditApiResponse {
  result: {
    edit: {
      result: string;
    };
  };
}

interface Token {
  access_token: string;
  expires_at: number;
}

interface PendingLogin {
  state: string;
  verifier: string;
  next: string;
  /** login in a popup window, which closes itself after the callback */
  popup: boolean;
}

const TOKEN_KEY = 'locator-tool.token';
const LOGIN_KEY = 'locator-tool.login';

/** Shared with the login popup via the storage event. */
const token = useLocalStorage<Token | null>(TOKEN_KEY, null, {
  serializer: StorageSerializers.object
});

export function getUserInfo() {
  const result = useFetch<UserApiResponse>(
    '/user',
    {},
    {
      immediate: false,
      beforeFetch({options}) {
        options.headers = authorization();
      }
    }
  ).json<UserApiResponse>();
  // refetch after login or logout, without reloading the page
  watch(
    token,
    () => {
      if (authorization().Authorization) {
        void result.execute();
      } else {
        result.data.value = null;
      }
    },
    {immediate: true}
  );
  return result;
}

export function editLocation(title: CommonsFile, coordinates: LatLng[]) {
  const {pageid} = title;
  return useFetch<EditApiResponse>('/edit', {
    method: 'POST',
    headers: {
      ...authorization(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pageid,
      locations: coordinates.map(({type, lat, lng}) => ({type, lat, lng}))
    })
  }).json();
}

function authorization(): Record<string, string> {
  if (!token.value || token.value.expires_at < Date.now()) {
    return {};
  }
  return {Authorization: 'Bearer ' + token.value.access_token};
}

/**
 * Starts the OAuth 2.0 login on Commons, using PKCE, in a popup window so that the current state
 * is kept. Commons redirects back to /oauth-callback. Falls back to a full-page redirect when the
 * popup is blocked.
 */
export async function login() {
  // open synchronously, while the click still counts as user activation
  const popup = window.open('', 'locator-tool-login', 'popup,width=800,height=700');
  const state = randomString();
  const verifier = randomString();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const pending: PendingLogin = {state, verifier, next: '/' + location.hash, popup: !!popup};
  // localStorage, since the popup does not share this window's sessionStorage
  localStorage.setItem(LOGIN_KEY, JSON.stringify(pending));
  const url = '/login?' + new URLSearchParams({state, code_challenge: base64url(digest)});
  if (popup) {
    popup.location.href = url;
    popup.focus();
  } else {
    location.href = url;
  }
}

export function logout() {
  token.value = null;
}

/**
 * Completes the login when Commons redirected back to /oauth-callback.
 */
export async function handleOAuthCallback() {
  if (location.pathname !== '/oauth-callback') {
    return;
  }
  const params = new URLSearchParams(location.search);
  const pending: PendingLogin | null = JSON.parse(localStorage.getItem(LOGIN_KEY) || 'null');
  localStorage.removeItem(LOGIN_KEY);
  history.replaceState(null, '', pending?.next || '/');
  const code = params.get('code');
  try {
    if (pending && code && params.get('state') === pending.state) {
      await exchangeCode(code, pending.verifier);
    }
  } finally {
    if (pending?.popup) {
      // the opener picks up the token via the storage event
      window.close();
    }
  }
}

async function exchangeCode(code: string, verifier: string) {
  const response = await fetch('/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({code, code_verifier: verifier})
  });
  if (!response.ok) {
    return;
  }
  const {access_token, expires_in} = await response.json();
  token.value = {access_token, expires_at: Date.now() + expires_in * 1000};
}

function randomString(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
}

function base64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}
