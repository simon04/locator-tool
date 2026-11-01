import {useFetch} from '@vueuse/core';

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
}

const TOKEN_KEY = 'locator-tool.token';
const LOGIN_KEY = 'locator-tool.login';

export function getUserInfo() {
  return useFetch<UserApiResponse>('/user', {headers: authorization()}).json();
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
  const token: Token | null = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
  if (!token || token.expires_at < Date.now()) {
    return {};
  }
  return {Authorization: 'Bearer ' + token.access_token};
}

/**
 * Starts the OAuth 2.0 login on Commons, using PKCE. Commons redirects back to /oauth-callback.
 */
export async function login() {
  const state = randomString();
  const verifier = randomString();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const pending: PendingLogin = {state, verifier, next: '/' + location.hash};
  sessionStorage.setItem(LOGIN_KEY, JSON.stringify(pending));
  location.href = '/login?' + new URLSearchParams({state, code_challenge: base64url(digest)});
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  location.reload();
}

/**
 * Completes the login when Commons redirected back to /oauth-callback.
 */
export async function handleOAuthCallback() {
  if (location.pathname !== '/oauth-callback') {
    return;
  }
  const params = new URLSearchParams(location.search);
  const pending: PendingLogin | null = JSON.parse(sessionStorage.getItem(LOGIN_KEY) || 'null');
  sessionStorage.removeItem(LOGIN_KEY);
  history.replaceState(null, '', pending?.next || '/');
  const code = params.get('code');
  if (!pending || !code || params.get('state') !== pending.state) {
    return;
  }
  const response = await fetch('/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({code, code_verifier: pending.verifier})
  });
  if (!response.ok) {
    return;
  }
  const {access_token, expires_in} = await response.json();
  const token: Token = {access_token, expires_at: Date.now() + expires_in * 1000};
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
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
