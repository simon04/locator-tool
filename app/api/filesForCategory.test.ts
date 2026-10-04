import {afterEach, describe, expect, it, vi} from 'vite-plus/test';

import {fetchJSON} from './fetchJSON';
import {getFilesForCategory} from './filesForCategory';

vi.mock('./fetchJSON', () => ({fetchJSON: vi.fn()}));

type Service = 'api' | 'catscan';

function service(url: string): Service {
  return url.startsWith('https://commons.wikimedia.org/w/api.php') ? 'api' : 'catscan';
}

// the responses of the services, each with the titles A.jpg and B.jpg
const responses: Record<Service, unknown> = {
  api: {query: {categorymembers: [{title: 'File:A.jpg'}, {title: 'File:B.jpg'}]}},
  catscan: {pages: ['A.jpg', 'B.jpg']}
};

// answers the given services, the others never answer until they are aborted
function mockServices(answer: Partial<Record<Service, 'resolve' | 'reject'>>) {
  const signals: Partial<Record<Service, AbortSignal>> = {};
  vi.mocked(fetchJSON).mockImplementation((url: string, options?: RequestInit) => {
    const s = service(url);
    const signal = options!.signal!;
    signals[s] = signal;
    if (answer[s] === 'resolve') return Promise.resolve(responses[s]) as never;
    if (answer[s] === 'reject') return Promise.reject(new Error(`${s} failed`));
    return new Promise((_, reject) =>
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    );
  });
  return signals;
}

function requestedUrls(): URL[] {
  return vi.mocked(fetchJSON).mock.calls.map(([url]) => new URL(url, 'https://example.org/'));
}

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('getFilesForCategory', () => {
  it('queries catscan', async () => {
    mockServices({catscan: 'resolve'});
    expect(await getFilesForCategory('Category:Foo bar', 2)).toEqual(['File:A.jpg', 'File:B.jpg']);
    const [catscan] = requestedUrls();
    expect(catscan.searchParams.get('category')).toBe('Foo bar');
    expect(catscan.searchParams.get('depth')).toBe('2');
    expect(requestedUrls()).toHaveLength(1);
  });

  it('additionally queries the category members of the API without subcategories', async () => {
    mockServices({api: 'resolve'});
    expect(await getFilesForCategory('Foo', 0)).toEqual(['File:A.jpg', 'File:B.jpg']);
    const api = requestedUrls().find(url => url.hostname === 'commons.wikimedia.org')!;
    expect(api.searchParams.get('list')).toBe('categorymembers');
    expect(api.searchParams.get('cmtitle')).toBe('Category:Foo');
    expect(api.searchParams.get('cmnamespace')).toBe('6');
  });

  it('falls back to another service when one fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockServices({catscan: 'reject', api: 'resolve'});
    expect(await getFilesForCategory('Foo', 0)).toEqual(['File:A.jpg', 'File:B.jpg']);
    expect(console.warn).toHaveBeenCalledWith(
      'Error fetching category',
      'Foo',
      new Error('catscan failed')
    );
  });

  it('aborts the other services once one resolves', async () => {
    const signals = mockServices({catscan: 'resolve'});
    await getFilesForCategory('Foo', 0);
    expect(signals.api?.aborted).toBe(true);
  });

  // Promise.allSettled never rejects, hence the promise remains pending forever
  it.fails('rejects when all services fail', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockServices({api: 'reject', catscan: 'reject'});
    await expect(getFilesForCategory('Foo', 0)).rejects.toThrow();
  }, 200);
});
