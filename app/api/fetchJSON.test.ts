// @vitest-environment happy-dom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test';

import {clearCache, fetchJSON} from './fetchJSON';

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), init);
}

function mockFetch(...responses: Response[]) {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) => responses.shift()!);
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

// every test uses a host of its own, since the concurrent requests are limited per host
let host = 0;
function url(path = '/api'): string {
  return `https://host${host}.example.org${path}`;
}

beforeEach(() => {
  host++;
  sessionStorage.clear();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchJSON', () => {
  it('fetches the JSON', async () => {
    const fetch = mockFetch(json({foo: 'bar'}));
    expect(await fetchJSON(url())).toEqual({foo: 'bar'});
    expect(fetch).toHaveBeenCalledWith(url(), {
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
        'Api-User-Agent': expect.stringMatching(
          /^locator-tool\/.* \(https:\/\/locator-tool.toolforge.org\/; https:\/\/github.com\/simon04\/locator-tool\)$/
        )
      }
    });
  });

  it('passes the options', async () => {
    const fetch = mockFetch(json({}));
    const {signal} = new AbortController();
    await fetchJSON(url(), {signal});
    expect(fetch.mock.calls[0][1]).toMatchObject({cache: 'no-cache', signal});
  });

  it('caches the responses in the session storage', async () => {
    const fetch = mockFetch(json({foo: 'bar'}), json({foo: 'baz'}));
    expect(await fetchJSON(url())).toEqual({foo: 'bar'});
    expect(await fetchJSON(url())).toEqual({foo: 'bar'});
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(sessionStorage.getItem(url())!)).toEqual({foo: 'bar'});
    // other URLs are fetched
    expect(await fetchJSON(url('/other'))).toEqual({foo: 'baz'});
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('fetches again after clearing the cache', async () => {
    const fetch = mockFetch(json({foo: 'bar'}), json({foo: 'baz'}));
    expect(await fetchJSON(url())).toEqual({foo: 'bar'});
    clearCache();
    expect(sessionStorage.length).toBe(0);
    expect(await fetchJSON(url())).toEqual({foo: 'baz'});
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does not cache errors', async () => {
    const fetch = mockFetch(json({}, {status: 404, statusText: 'Not Found'}), json({foo: 'bar'}));
    await expect(fetchJSON(url())).rejects.toThrow('Not Found');
    expect(await fetchJSON(url())).toEqual({foo: 'bar'});
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('reports the status without status text', async () => {
    mockFetch(json({}, {status: 500}));
    await expect(fetchJSON(url())).rejects.toThrow('HTTP 500');
  });

  it('retries after the time given by Retry-After', async () => {
    vi.useFakeTimers();
    const fetch = mockFetch(
      json({}, {status: 429, headers: {'Retry-After': '5'}}),
      json({foo: 'bar'})
    );
    const result = fetchJSON(url());
    await vi.advanceTimersByTimeAsync(4999);
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(await result).toEqual({foo: 'bar'});
  });

  it('retries with an exponential backoff', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const fetch = mockFetch(
      json({}, {status: 503}),
      json({}, {status: 503}),
      json({}, {status: 429}),
      json({foo: 'bar'})
    );
    const result = fetchJSON(url());
    for (const [ms, calls] of [
      [1000, 2],
      [2000, 3],
      [4000, 4]
    ]) {
      await vi.advanceTimersByTimeAsync(ms - 1);
      expect(fetch).toHaveBeenCalledTimes(calls - 1);
      await vi.advanceTimersByTimeAsync(1);
      expect(fetch).toHaveBeenCalledTimes(calls);
    }
    expect(await result).toEqual({foo: 'bar'});
  });

  it('gives up after 3 retries', async () => {
    vi.useFakeTimers();
    const fetch = mockFetch(
      ...Array.from({length: 5}, () =>
        json({}, {status: 429, statusText: 'Too Many Requests', headers: {'Retry-After': '1'}})
      )
    );
    const result = fetchJSON(url());
    const assertion = expect(result).rejects.toThrow('Too Many Requests');
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('stops retrying when aborted', async () => {
    vi.useFakeTimers();
    const fetch = mockFetch(json({}, {status: 429, headers: {'Retry-After': '5'}}));
    const abort = new AbortController();
    const result = fetchJSON(url(), {signal: abort.signal});
    const assertion = expect(result).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(1000);
    abort.abort();
    await assertion;
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('limits the concurrent requests to 3 per host', async () => {
    const pending: (() => void)[] = [];
    const fetch = vi.fn(
      (_url: string) =>
        new Promise<Response>(resolve => pending.push(() => resolve(json({url: _url}))))
    );
    vi.stubGlobal('fetch', fetch);

    const results = [1, 2, 3, 4, 5].map(i => fetchJSON(url(`/${i}`)));
    const otherHost = fetchJSON(`https://other${host}.example.org/api`);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));
    expect(fetch.mock.calls.map(([u]) => u)).toEqual([
      url('/1'),
      url('/2'),
      url('/3'),
      `https://other${host}.example.org/api`
    ]);

    // a finished request lets the next one of its host start
    pending[0]();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(5));
    expect(fetch.mock.calls[4][0]).toBe(url('/4'));

    pending[1]();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(6));
    expect(fetch.mock.calls[5][0]).toBe(url('/5'));
    pending.slice(2).forEach(resolve => resolve());
    expect(await Promise.all(results)).toEqual([1, 2, 3, 4, 5].map(i => ({url: url(`/${i}`)})));
    expect(await otherHost).toEqual({url: `https://other${host}.example.org/api`});
  });
});
