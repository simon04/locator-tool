import {useFetch} from '@vueuse/core';
import {addLocationToWikiText, CommonsFile, LatLng} from '../model';

interface UserApiResponse {
  user: string;
}
import {API_URL, getAuthorizationHeader} from './OAuth2';

export interface Page {
  id: number;
  key: string;
  title: string;
  latest: {
    id: number;
    timestamp: Date;
  };
  content_model: string;
  license: {
    url: string;
    title: string;
  };
  source: string;
}

export async function editLocation(title: CommonsFile, coordinates: LatLng): Promise<void> {
  // Reference: https://www.mediawiki.org/wiki/API:REST_API/Reference
  const pageUrl = `${API_URL}/v1/page/${title.file}`;
  const pageResponse = await fetch(pageUrl);
  if (!pageResponse.ok) throw Error(pageResponse.statusText);
  const page: Page = await pageResponse.json();

  const wikitext = addLocationToWikiText(coordinates, page.source);

  const headers = await getAuthorizationHeader();
  headers['Content-Type'] = 'application/json';
  const response = await fetch(pageUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      source: wikitext,
      comment: `{{${coordinates.type}}}`,
      latest: page.latest
    })
  });
  if (!response.ok) throw Error(response.statusText);
}

function xsrfToken() {
  return document.cookie
    .split(';')
    .find(item => item.trim().startsWith('XSRF-TOKEN='))
    ?.trim()
    ?.slice('XSRF-TOKEN='.length);
}

export function loginURL(): string {
  return '/login?next=' + encodeURIComponent('/' + location.hash);
}

export function logoutURL(): string {
  return '/logout?next=' + encodeURIComponent('/' + location.hash);
}
