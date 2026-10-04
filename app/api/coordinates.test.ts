// @vitest-environment happy-dom
import {afterEach, describe, expect, it, vi} from 'vite-plus/test';

import {getCoordinates} from './coordinates';
import {fetchJSON} from './fetchJSON';

vi.mock('./fetchJSON', () => ({fetchJSON: vi.fn()}));

function requestedParams(): URLSearchParams[] {
  return vi.mocked(fetchJSON).mock.calls.map(([url]) => new URL(url).searchParams);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('getCoordinates', () => {
  it('queries 50 titles per request', async () => {
    vi.mocked(fetchJSON).mockResolvedValue({query: {pages: {}}});
    const titles = Array.from({length: 120}, (_, i) => `File:${i}.jpg`);
    await getCoordinates(titles);
    expect(requestedParams().map(params => params.get('titles')!.split('|').length)).toEqual([
      50, 50, 20
    ]);
  });

  it('limits the length of the URL', async () => {
    vi.mocked(fetchJSON).mockResolvedValue({query: {pages: {}}});
    const titles = Array.from({length: 50}, (_, i) => `File:${i}${'x'.repeat(200)}.jpg`);
    await getCoordinates(titles);
    expect(fetchJSON).toHaveBeenCalledTimes(2);
    for (const [url] of vi.mocked(fetchJSON).mock.calls) {
      expect(url.length).toBeLessThan(8000);
    }
  });

  it('fetches the file details along with the coordinates', async () => {
    vi.mocked(fetchJSON).mockResolvedValue({
      query: {
        pages: {
          42: {
            pageid: 42,
            title: 'File:Foo bar.jpg',
            coordinates: [{lat: 47.1, lon: 11.2, primary: '', type: 'camera'}],
            categories: [{title: 'Category:Baz'}],
            imageinfo: [
              {
                descriptionurl: 'https://commons.wikimedia.org/wiki/File:Foo_bar.jpg',
                thumburl: 'https://thumb.wikimedia.org/500px-Foo_bar.jpg',
                width: 4000,
                height: 3000,
                extmetadata: {Artist: {value: 'Jane'}}
              }
            ]
          }
        }
      }
    });
    const [file] = await getCoordinates(['File:Foo_bar.jpg']);
    const [params] = requestedParams();
    expect(params.get('titles')).toBe('File:Foo bar.jpg');
    expect(params.get('prop')).toBe('coordinates|categories|imageinfo');
    expect(params.get('iiprop')).toBe('url|extmetadata|size');
    expect(file).toMatchObject({
      pageid: 42,
      file: 'File:Foo bar.jpg',
      coordinates: {lat: 47.1, lng: 11.2},
      categories: ['Baz'],
      author: 'Jane',
      thumbUrl: 'https://thumb.wikimedia.org/500px-Foo_bar.jpg',
      width: 4000,
      height: 3000
    });
  });
});
