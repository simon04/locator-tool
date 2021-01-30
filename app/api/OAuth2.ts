import {LoginToken} from './LoginToken';
import {PKCE} from './PKCE';

const API_URL = 'https://meta.wikimedia.beta.wmflabs.org/w/rest.php';
const config = {
  client_id: '19fa35277a8db0be5742d1b32c5f7083',
  // redirect_uri: 'http://localhost:8184/callback',
  authorization_endpoint: `${API_URL}/oauth2/authorize`,
  token_endpoint: `${API_URL}/oauth2/access_token`,
  profile_endpoint: `${API_URL}/oauth2/resource/profile`
};

export async function startAuthorization(): Promise<void> {
  const pkce = PKCE.generate().save();
  const url =
    config.authorization_endpoint +
    '?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: config.client_id,
      // redirect_uri: config.redirect_uri,
      state: pkce.state,
      code_challenge: await pkce.code_challenge,
      code_challenge_method: pkce.code_challenge_method
    });
  window.location.replace(url);
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
      // redirect_uri: config.redirect_uri,
      code,
      code_verifier: pkce.code_verifier
    })
  });
  await extractTokens(response);
}

async function getOrRefreshAccessToken(): Promise<LoginToken> {
  const tokens = LoginToken.load();
  if (Date.now() <= tokens.access_token_expires_at) {
    return Promise.resolve(tokens);
  }
  const pkce = PKCE.load();
  const response = await fetch(config.token_endpoint, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.client_id,
      // redirect_uri: config.redirect_uri,
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
  window.location.replace('/');
}
