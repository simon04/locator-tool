import {afterEach, describe, expect, it, vi} from 'vite-plus/test';

import {getStatements} from './statements';

function mockFetch(...responses: unknown[]) {
  const fetch = vi.fn(async (_url: string) => ({
    ok: true,
    json: async () => responses.shift() ?? {}
  }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

function requestedIds(fetch: ReturnType<typeof mockFetch>): string[][] {
  return fetch.mock.calls.map(([url]) => {
    const {searchParams} = new URL(url);
    expect(searchParams.get('action')).toBe('wbgetentities');
    expect(searchParams.get('props')).toBe('claims');
    return searchParams.get('ids')!.split('|');
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('getStatements', () => {
  it('asks for the mediainfo entities of the given pages', async () => {
    const statements = {P4082: [{mainsnak: {property: 'P4082'}}]};
    const fetch = mockFetch({entities: {M1: {id: 'M1', statements}, M2: {id: 'M2', statements}}});

    expect(await getStatements([1, 2])).toEqual({1: statements, 2: statements});
    expect(requestedIds(fetch)).toEqual([['M1', 'M2']]);
  });

  it('reports a file without structured data as having no statements', async () => {
    // the API answers with an empty array rather than an empty object
    mockFetch({entities: {M1: {id: 'M1', statements: []}, M2: {id: 'M2', missing: ''}}});

    expect(await getStatements([1, 2])).toEqual({1: {}, 2: {}});
  });

  it('splits the pages into requests of 50', async () => {
    const pageids = Array.from({length: 120}, (_, i) => i + 1);
    const fetch = mockFetch();

    await getStatements(pageids);

    expect(requestedIds(fetch).map(ids => ids.length)).toEqual([50, 50, 20]);
    expect(requestedIds(fetch).flat()).toEqual(pageids.map(pageid => `M${pageid}`));
  });
});
