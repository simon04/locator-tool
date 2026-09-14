import {useLocalStorage} from '@vueuse/core';
import * as oauth from 'oauth4webapi';
import {computed} from 'vue';

import {COMMONS_URL, OAUTH_CLIENT_ID, OAUTH_REDIRECT_URI, REST_PHP_URL} from './commons';

// MediaWiki publishes no authorization server metadata, hence the endpoints by hand
const server = {
  issuer: COMMONS_URL,
  authorization_endpoint: `${REST_PHP_URL}/oauth2/authorize`,
  token_endpoint: `${REST_PHP_URL}/oauth2/access_token`
} satisfies oauth.AuthorizationServer;
const client: oauth.Client = {client_id: OAUTH_CLIENT_ID};
// A public (non-confidential) client has no secret to authenticate with
const clientAuth = oauth.None();
const profile_endpoint = `${REST_PHP_URL}/oauth2/resource/profile`;

interface Session {
  access_token?: string;
  refresh_token?: string;
  /** when the access token expires, in milliseconds since the epoch */
  expires_at?: number;
  /** guards the callback against forgery, see RFC 6749 §4.1.1 */
  state?: string;
  /** redeemed for the tokens, see RFC 7636 §4.1 and §4.5 */
  code_verifier?: string;
  /** where the user was when the login started */
  next?: string;
}

/** The login in progress and its tokens, kept across the redirect and across reloads. */
const session = useLocalStorage<Session>('oauth2', {});

export const isLoggedIn = computed(() => !!session.value.refresh_token);

// Refresh early: a token that expires while the request is in flight is of no use,
// and an edit may well be the first thing to notice.
const EXPIRY_MARGIN = 60_000;

export async function startAuthorization(next?: string): Promise<void> {
  if (!client.client_id) {
    throw Error(
      'Missing VITE_OAUTH_CLIENT_ID: register an OAuth 2.0 client for ' + server.token_endpoint
    );
  }
  const state = oauth.generateRandomState();
  const code_verifier = oauth.generateRandomCodeVerifier();
  // The authorization server redirects back to the registered URI, so remember
  // where the user was in order to return them there afterwards.
  session.value = {...session.value, state, code_verifier, next};
  const url = new URL(server.authorization_endpoint);
  url.search = String(
    new URLSearchParams({
      response_type: 'code',
      client_id: client.client_id,
      redirect_uri: OAUTH_REDIRECT_URI,
      state,
      code_challenge: await oauth.calculatePKCECodeChallenge(code_verifier),
      code_challenge_method: 'S256'
    })
  );
  window.location.replace(url);
}

/**
 * Completes the login when the authorization server redirects back with `?code=…&state=…`,
 * and restores the location the user started from. A no-op on any other page load.
 */
export async function handleAuthorizationCallback(): Promise<void> {
  const query = new URLSearchParams(location.search);
  if (!query.has('code') || !query.has('state')) return;
  // Read before the exchange: a successful one spends the session it is stored in
  const next = session.value.next || '#/';
  try {
    await finishAuthorization(query);
  } catch (error) {
    console.error('Authorization failed', error);
  }
  history.replaceState(null, '', location.pathname + next);
}

async function finishAuthorization(callbackParameters: URLSearchParams): Promise<void> {
  const {state, code_verifier} = session.value;
  if (!state || !code_verifier) {
    throw Error('No authorization in progress');
  }
  const params = oauth.validateAuthResponse(server, client, callbackParameters, state);
  const response = await oauth.authorizationCodeGrantRequest(
    server,
    client,
    clientAuth,
    params,
    OAUTH_REDIRECT_URI,
    code_verifier
  );
  saveTokens(await oauth.processAuthorizationCodeResponse(server, client, response));
}

let refreshing: Promise<string> | undefined;

export async function getAuthorizationHeader(): Promise<{Authorization: string}> {
  const {access_token, refresh_token, expires_at = 0} = session.value;
  if (access_token && Date.now() + EXPIRY_MARGIN <= expires_at) {
    return {Authorization: `Bearer ${access_token}`};
  }
  if (!refresh_token) {
    throw Error('Not logged in');
  }
  // A refresh token can only be redeemed once, so parallel edits share one refresh
  // instead of invalidating each other's token.
  refreshing ??= refreshAccessToken(refresh_token).finally(() => (refreshing = undefined));
  return {Authorization: `Bearer ${await refreshing}`};
}

async function refreshAccessToken(refresh_token: string): Promise<string> {
  try {
    const response = await oauth.refreshTokenGrantRequest(
      server,
      client,
      clientAuth,
      refresh_token
    );
    const result = await oauth.processRefreshTokenResponse(server, client, response);
    saveTokens(result);
    return result.access_token;
  } catch (error) {
    // Expired, revoked or already redeemed: the tokens are spent, ask for a new login
    session.value = {};
    throw error;
  }
}

function saveTokens(result: oauth.TokenEndpointResponse): void {
  session.value = {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_at: Date.now() + (result.expires_in ?? 0) * 1000.0
  };
}

export interface Profile {
  sub: number;
  username: string;
  editcount: number;
  confirmed_email: boolean;
  blocked: boolean;
  registered: string;
  groups: string[];
  rights: string[];
  grants: string[];
}

export async function getProfile(): Promise<Profile> {
  const headers = await getAuthorizationHeader();
  const response = await fetch(profile_endpoint, {headers});
  return response.json();
}

export function logout(): void {
  session.value = {};
  window.location.replace('/');
}
