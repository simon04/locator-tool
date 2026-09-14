import {beforeEach, expect, test, vi} from 'vite-plus/test';

import {type CommonsFile, LatLng} from '../model';
import type {MediaInfo} from '../model/mediainfo';
import {editMediaInfo} from './mediainfo';

vi.mock('./commons', () => ({
  API_PHP_URL: 'https://commons.example/w/api.php',
  REST_PHP_URL: 'https://commons.example/w/rest.php'
}));
vi.mock('./OAuth2', () => ({
  getAuthorizationHeader: () => Promise.resolve({Authorization: 'Bearer token'})
}));

const file = {pageid: 42, file: 'File:Test.jpg'} as CommonsFile;
const location = new LatLng('Location', 12.3, 45.6);

let requests: {url: string; init?: RequestInit}[];

function mockFetch(mediainfo?: Partial<MediaInfo>) {
  requests = [];
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => {
    requests.push({url: String(url), init});
    const json = String(url).includes('meta=tokens')
      ? {query: {tokens: {csrftoken: 'csrf+\\'}}}
      : init?.method === 'POST'
        ? {success: 1}
        : {
            query: {
              pages: {
                42: {
                  pageid: 42,
                  ...(mediainfo
                    ? {revisions: [{slots: {mediainfo: {'*': JSON.stringify(mediainfo)}}}]}
                    : {})
                }
              }
            }
          };
    return Promise.resolve({ok: true, json: () => Promise.resolve(json)});
  });
}

function body(index: number): URLSearchParams {
  return new URLSearchParams(requests[index]!.init!.body as URLSearchParams);
}

beforeEach(() => vi.unstubAllGlobals());

test('leaves files without structured data alone', async () => {
  mockFetch();
  await editMediaInfo(file, [location]);
  expect(requests.filter(r => r.init?.method === 'POST')).toEqual([]);
});

test('updates an existing claim', async () => {
  mockFetch({id: 'M42', statements: {P1259: [{id: 'M42$abc'} as never]}});
  await editMediaInfo(file, [location]);
  expect(body(2).get('action')).toBe('wbsetclaimvalue');
  expect(body(2).get('claim')).toBe('M42$abc');
  expect(JSON.parse(body(2).get('value')!)).toEqual({
    latitude: 12.3,
    longitude: 45.6,
    globe: 'http://www.wikidata.org/entity/Q2',
    precision: 0.000001
  });
  expect(body(2).get('token')).toBe('csrf+\\');
});

test('creates a missing claim', async () => {
  mockFetch({id: 'M42', statements: {}});
  await editMediaInfo(file, [new LatLng('Object location', 1, 2)]);
  expect(body(2).get('action')).toBe('wbcreateclaim');
  expect(body(2).get('entity')).toBe('M42');
  expect(body(2).get('property')).toBe('P9149');
});

test('authenticates cross-origin without cookies', async () => {
  mockFetch({id: 'M42', statements: {}});
  await editMediaInfo(file, [location]);
  for (const {url, init} of requests.slice(1)) {
    expect(new URL(url).searchParams.has('crossorigin')).toBe(true);
    expect((init!.headers as Record<string, string>).Authorization).toBe('Bearer token');
    expect(init!.credentials).toBe('omit');
  }
});
