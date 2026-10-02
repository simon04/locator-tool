import {describe, expect, it} from 'vite-plus/test';

import {authorUser} from './author';

describe('authorUser', () => {
  it('extracts the user of a user page', () => {
    expect(
      authorUser(
        '<a href="//commons.wikimedia.org/wiki/User:GPSLeo" title="User:GPSLeo">Leonhard Lenz</a>'
      )
    ).toBe('GPSLeo');
  });

  it('extracts the user of a red link', () => {
    expect(
      authorUser(
        '<a href="//commons.wikimedia.org/w/index.php?title=User:Ajznponar&amp;action=edit&amp;redlink=1" class="new" title="User:Ajznponar (page does not exist)">Ajznponar</a>'
      )
    ).toBe('Ajznponar');
  });

  it('decodes the user', () => {
    expect(
      authorUser('<a href="//commons.wikimedia.org/wiki/User:Jos%C3%A9_Luis/Gallery">José</a>')
    ).toBe('José Luis');
  });

  it('extracts the user of the text', () => {
    expect(
      authorUser(
        '<div class="fn value">\n<div>Simon Legner (<a href="https://de.wikipedia.org/wiki/Benutzer:Simon04" class="extiw" title="de:Benutzer:Simon04">User:simon04</a>)</div>OpenStreetMap contributors</div>'
      )
    ).toBe('Simon04');
    expect(authorUser('Simon Legner (User:simon04)')).toBe('Simon04');
  });

  it('ignores authors without user', () => {
    expect(
      authorUser(
        '<a href="https://de.wikipedia.org/wiki/Benutzer:Simon04" class="extiw" title="de:Benutzer:Simon04">Simon Legner</a>'
      )
    ).toBeUndefined();
    expect(authorUser('Simon Legner')).toBeUndefined();
    expect(authorUser(undefined)).toBeUndefined();
  });
});
