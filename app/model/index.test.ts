import {describe, expect, it} from 'vite-plus/test';

import {imageUrl, imageUrls} from './index';

const thumbUrl =
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Example.svg/500px-Example.svg.png?utm_source=commons.wikimedia.org';

describe('imageUrl', () => {
  it('returns the thumbnail URL of the API', () => {
    expect(imageUrl({thumbUrl})).toBe(thumbUrl);
  });

  it('replaces the width of the thumbnail URL', () => {
    expect(imageUrl({thumbUrl}, 1280)).toBe(
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Example.svg/1280px-Example.svg.png?utm_source=commons.wikimedia.org'
    );
  });

  it('replaces the width of multi-page files only', () => {
    const dir = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/500px-Foo.pdf';
    const pdf = {thumbUrl: `${dir}/page1-500px-500px-Foo.pdf.jpg`};
    expect(imageUrl(pdf, 960)).toBe(`${dir}/page1-960px-500px-Foo.pdf.jpg`);
  });

  it('returns undefined without thumbnail URL', () => {
    expect(imageUrl({}, 1280)).toBeUndefined();
  });
});

describe('imageUrls', () => {
  it('returns the standard sizes', () => {
    expect(imageUrls({thumbUrl}).split(', ')).toEqual([
      expect.stringMatching(/\/500px-Example\.svg\.png\?.* 500w$/),
      expect.stringMatching(/\/960px-Example\.svg\.png\?.* 960w$/),
      expect.stringMatching(/\/1280px-Example\.svg\.png\?.* 1280w$/),
      expect.stringMatching(/\/1920px-Example\.svg\.png\?.* 1920w$/),
      expect.stringMatching(/\/3840px-Example\.svg\.png\?.* 3840w$/)
    ]);
  });

  it('returns no sizes for unscaled originals', () => {
    const original = {thumbUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg'};
    expect(imageUrls(original)).toBe('');
  });
});
