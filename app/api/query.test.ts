import {afterEach, describe, expect, it, vi} from 'vite-plus/test';

import {fetchJSON} from './fetchJSON';
import {$query} from './query';

vi.mock('./fetchJSON', () => ({fetchJSON: vi.fn()}));

function mockResponses(...responses: unknown[]) {
  for (const response of responses) {
    vi.mocked(fetchJSON).mockResolvedValueOnce(response);
  }
}

function requestedParams(): Record<string, string>[] {
  return vi
    .mocked(fetchJSON)
    .mock.calls.map(([url]) => Object.fromEntries(new URL(url).searchParams));
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('$query', () => {
  it('merges the continued responses', async () => {
    mockResponses(
      {continue: {cmcontinue: 'B', continue: '-||'}, query: {categorymembers: [{title: 'A'}]}},
      {query: {categorymembers: [{title: 'B'}]}}
    );
    const data = await $query({list: 'categorymembers', cmtitle: 'Category:Foo'});
    expect(data).toEqual({query: {categorymembers: [{title: 'A'}, {title: 'B'}]}});
    expect(requestedParams()).toEqual([
      expect.objectContaining({list: 'categorymembers', cmtitle: 'Category:Foo'}),
      expect.objectContaining({cmtitle: 'Category:Foo', cmcontinue: 'B', continue: '-||'})
    ]);
  });

  it('continues a query given as URL', async () => {
    mockResponses(
      {continue: {cocontinue: '1|2', continue: '||'}, query: {pages: {}}},
      {query: {pages: {}}}
    );
    const url = new URL('https://commons.wikimedia.org/w/api.php?action=query&titles=File:A.jpg');
    await $query(url);
    expect(requestedParams()[1]).toEqual({
      action: 'query',
      titles: 'File:A.jpg',
      cocontinue: '1|2',
      continue: '||'
    });
  });

  it('drops the continue parameters of earlier responses', async () => {
    mockResponses(
      {continue: {iicontinue: 'A', continue: '||'}, query: {pages: {}}},
      {continue: {clcontinue: 'B', continue: '||imageinfo'}, query: {pages: {}}},
      {query: {pages: {}}}
    );
    await $query({prop: 'categories|imageinfo'});
    expect(requestedParams()[2]).toMatchObject({clcontinue: 'B', continue: '||imageinfo'});
    expect(requestedParams()[2]).not.toHaveProperty('iicontinue');
  });

  it('stops when it should not continue', async () => {
    mockResponses({continue: {cmcontinue: 'B', continue: '-||'}, query: {categorymembers: []}});
    await $query({list: 'categorymembers'}, {}, undefined, () => false);
    expect(fetchJSON).toHaveBeenCalledTimes(1);
  });
});
