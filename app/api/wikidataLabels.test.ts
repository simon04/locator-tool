import {afterEach, describe, expect, it, vi} from 'vite-plus/test';

import {getLabels} from './wikidataLabels';

function mockFetch(...responses: unknown[]) {
  const fetch = vi.fn(async (_url: string) => ({
    ok: true,
    json: async () => responses.shift() ?? {}
  }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

function requests(fetch: ReturnType<typeof mockFetch>): URL[] {
  return fetch.mock.calls.map(([url]) => new URL(url));
}

afterEach(() => vi.unstubAllGlobals());

describe('getLabels', () => {
  it('prefers the given language and falls back to English', async () => {
    mockFetch({
      entities: {
        P4082: {labels: {de: {language: 'de', value: 'aufgenommen mit'}}},
        P180: {labels: {en: {language: 'en', value: 'depicts'}}},
        Q1146418: {labels: {}}
      }
    });

    expect(await getLabels(['P4082', 'P180', 'Q1146418'], 'de')).toEqual({
      P4082: 'aufgenommen mit',
      P180: 'depicts'
    });
  });

  it('asks wikidata.org for the labels of the given entities', async () => {
    const fetch = mockFetch();

    await getLabels(['P4082'], 'de');

    const [url] = requests(fetch);
    expect(url!.origin + url!.pathname).toBe('https://www.wikidata.org/w/api.php');
    expect(url!.searchParams.get('action')).toBe('wbgetentities');
    expect(url!.searchParams.get('props')).toBe('labels');
    expect(url!.searchParams.get('languages')).toBe('de|en');
    expect(url!.searchParams.get('ids')).toBe('P4082');
  });

  it('does not ask for English twice', async () => {
    const fetch = mockFetch();

    await getLabels(['P4082'], 'en');

    expect(requests(fetch)[0]!.searchParams.get('languages')).toBe('en');
  });

  it('splits the entities into requests of 50', async () => {
    const ids = Array.from({length: 51}, (_, i) => `Q${i + 1}`);
    const fetch = mockFetch();

    await getLabels(ids, 'de');

    expect(requests(fetch).map(url => url.searchParams.get('ids')!.split('|').length)).toEqual([
      50, 1
    ]);
  });
});
