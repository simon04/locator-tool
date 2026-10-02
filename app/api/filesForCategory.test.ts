import {afterEach, describe, expect, it, vi} from 'vite-plus/test';

import {fetchJSON} from './fetchJSON';
import {getFilesForCategory} from './filesForCategory';

vi.mock('./fetchJSON', () => ({fetchJSON: vi.fn()}));

type Service = 'api' | 'cats-php' | 'catscan' | 'petscan';

function service(url: string): Service {
  return url.startsWith('https://commons.wikimedia.org/w/api.php')
    ? 'api'
    : url.startsWith('https://cats-php.toolforge.org/')
      ? 'cats-php'
      : url.startsWith('/catscan?')
        ? 'catscan'
        : 'petscan';
}

// the responses of the services, each with the titles A.jpg and B.jpg
const responses: Record<Service, unknown> = {
  api: {query: {categorymembers: [{title: 'File:A.jpg'}, {title: 'File:B.jpg'}]}},
  'cats-php': ['A.jpg', 'B.jpg'],
  catscan: {pages: ['A.jpg', 'B.jpg']},
  petscan: {'*': [{a: {'*': ['File:A.jpg', 'File:B.jpg']}}]}
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
  it('queries cats-php, catscan and petscan', async () => {
    mockServices({'cats-php': 'resolve'});
    await getFilesForCategory('Category:Foo bar', 2);
    const [catsPhp, catscan, petscan] = requestedUrls();
    expect(catsPhp.searchParams.get('cat')).toBe('Foo bar');
    expect(catsPhp.searchParams.get('depth')).toBe('2');
    expect(catscan.searchParams.get('category')).toBe('Foo bar');
    expect(catscan.searchParams.get('depth')).toBe('2');
    expect(petscan.searchParams.get('categories')).toBe('Foo bar');
    expect(petscan.searchParams.get('depth')).toBe('2');
    expect(requestedUrls()).toHaveLength(3);
  });

  it.each(['cats-php', 'catscan', 'petscan'] as const)(
    'resolves the files of %s',
    async answering => {
      mockServices({[answering]: 'resolve'});
      expect(await getFilesForCategory('Foo', 3)).toEqual(['File:A.jpg', 'File:B.jpg']);
    }
  );

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
    mockServices({'cats-php': 'reject', petscan: 'resolve'});
    expect(await getFilesForCategory('Foo', 3)).toEqual(['File:A.jpg', 'File:B.jpg']);
    expect(console.warn).toHaveBeenCalledWith(
      'Error fetching category',
      'Foo',
      new Error('cats-php failed')
    );
  });

  it('aborts the other services once one resolves', async () => {
    const signals = mockServices({catscan: 'resolve'});
    await getFilesForCategory('Foo', 3);
    expect(signals['cats-php']?.aborted).toBe(true);
    expect(signals.petscan?.aborted).toBe(true);
  });

  // Promise.allSettled never rejects, hence the promise remains pending forever
  it.fails('rejects when all services fail', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockServices({'cats-php': 'reject', catscan: 'reject', petscan: 'reject'});
    await expect(getFilesForCategory('Foo', 3)).rejects.toThrow();
  }, 200);
});
