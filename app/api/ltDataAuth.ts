import {useFetch} from '@vueuse/core';
import {CommonsFile, LatLng} from '../model';

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

export function getUserInfo() {
  return useFetch<UserApiResponse>('/user', {
    headers: {
      'X-XSRF-TOKEN': xsrfToken() || ''
    }
  }).json();
}

export function editLocation(title: CommonsFile, coordinates: LatLng) {
  const {pageid} = title;
  const {type, lat, lng} = coordinates;
  return useFetch<EditApiResponse>(
    '/edit',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': xsrfToken() || ''
      },
      body: JSON.stringify({type, lat, lng, pageid})
    },
    {
      afterFetch(ctx) {
        const {data} = ctx;
        if (!data.result || !data.result.edit || data.result.edit.result !== 'Success') {
          throw data;
        }
        return ctx;
      }
    }
  );
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
