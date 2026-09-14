import {OAUTH_CLIENT_ID, OAUTH_REDIRECT_URI, REST_PHP_URL} from './commons';
import {LoginToken} from './LoginToken';
import {PKCE} from './PKCE';

const config = {
  client_id: OAUTH_CLIENT_ID,
  redirect_uri: OAUTH_REDIRECT_URI,
  authorization_endpoint: `${REST_PHP_URL}/oauth2/authorize`,
  token_endpoint: `${REST_PHP_URL}/oauth2/access_token`,
  profile_endpoint: `${REST_PHP_URL}/oauth2/resource/profile`
};

const NEXT_KEY = 'oauth2_next';

// Refresh early: a token that expires while the request is in flight is of no use,
// and an edit may well be the first thing to notice.
const EXPIRY_MARGIN = 60_000;

export async function startAuthorization(next?: string): Promise<void> {
  // The authorization server redirects back to the registered URI, so remember
  // where the user was in order to return them there afterwards.
  if (!config.client_id) {
    throw Error(
      'Missing VITE_OAUTH_CLIENT_ID: register an OAuth 2.0 client for ' + config.token_endpoint
    );
  }
  localStorage.setItem(NEXT_KEY, next ?? '');
  const pkce = PKCE.generate().save();
  const url =
    config.authorization_endpoint +
    '?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      state: pkce.state,
      code_challenge: await pkce.code_challenge,
      code_challenge_method: pkce.code_challenge_method
    });
  window.location.replace(url);
}

/**
 * Completes the login when the authorization server redirects back with `?code=…&state=…`,
 * and restores the location the user started from. A no-op on any other page load.
 */
export async function handleAuthorizationCallback(): Promise<void> {
  const query = new URLSearchParams(location.search);
  const code = query.get('code');
  const state = query.get('state');
  if (!code || !state) return;
  try {
    await finishAuthorization(code, state);
  } catch (error) {
    console.error('Authorization failed', error);
  }
  const next = localStorage.getItem(NEXT_KEY) || '#/';
  localStorage.removeItem(NEXT_KEY);
  history.replaceState(null, '', location.pathname + next);
}

export async function finishAuthorization(code: string, state: string): Promise<void> {
  const pkce = PKCE.load();
  if (pkce.state !== state) {
    console.warn('Invalid state', {pkce, state});
    throw Error('Invalid state');
  }
  const response = await fetch(config.token_endpoint, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      code,
      code_verifier: pkce.code_verifier
    })
  });
  await extractTokens(response);
}

export function isLoggedIn(): boolean {
  return !!LoginToken.load().access_token;
}

let refreshing: Promise<LoginToken> | undefined;

async function getOrRefreshAccessToken(): Promise<LoginToken> {
  const tokens = LoginToken.load();
  if (Date.now() + EXPIRY_MARGIN <= tokens.access_token_expires_at) {
    return Promise.resolve(tokens);
  }
  // A refresh token can only be redeemed once, so parallel edits share one refresh
  // instead of invalidating each other's token.
  refreshing ??= refreshAccessToken(tokens).finally(() => (refreshing = undefined));
  return await refreshing;
}

async function refreshAccessToken(tokens: LoginToken): Promise<LoginToken> {
  const pkce = PKCE.load();
  const response = await fetch(config.token_endpoint, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.client_id,
      refresh_token: tokens.refresh_token,
      code_verifier: pkce.code_verifier
    })
  });
  return await extractTokens(response);
}

export async function getAuthorizationHeader(): Promise<{Authorization: string}> {
  const tokens = await getOrRefreshAccessToken();
  return {
    Authorization: `Bearer ${tokens.access_token}`
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
  const response = await fetch(config.profile_endpoint, {headers});
  return response.json();
}

async function extractTokens(response: Response): Promise<LoginToken> {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const {access_token, refresh_token, expires_in} = await response.json();
  const access_token_expires_at = Date.now() + expires_in * 1000.0;
  return new LoginToken(access_token, refresh_token, access_token_expires_at).save();
}

export function logout(): void {
  PKCE.clear();
  LoginToken.clear();
  localStorage.removeItem(NEXT_KEY);
  window.location.replace('/');
}
