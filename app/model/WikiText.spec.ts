import {addLocationToWikiText, LatLng, LocationType} from '.';

function testLocation({
  type,
  lat,
  lng,
  text,
  expected
}: {
  type: LocationType;
  lat: number;
  lng: number;
  text: string;
  expected: string;
}) {
  const ll = new LatLng(type, {lat, lng});
  const actual = addLocationToWikiText(ll, text);
  expect(actual).toBe(expected);
}

test('', () =>
  testLocation({
    type: 'Location',
    lat: 12.3,
    lng: 45.6,
    text: '',
    expected: '{{Location|12.3|45.6}}'
  }));

test('', () =>
  testLocation({
    type: 'Location',
    lat: 12.3,
    lng: 45.6,
    text: '{{Information}}{{Location|87.65|-43.21|region:XY-Z}}',
    expected: '{{Information}}{{Location|12.3|45.6|region:XY-Z}}'
  }));

test('', () =>
  testLocation({
    type: 'Location',
    lat: 12.3,
    lng: 45.6,
    text: '{{Information}}{{Location|34|1|27.37|N|116|9|29.88|W|region:XY}}',
    expected: '{{Information}}{{Location|12.3|45.6|region:XY}}'
  }));

test('', () =>
  testLocation({
    type: 'Location',
    lat: 12.3,
    lng: 45.6,
    text: 'Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}Bar',
    expected: 'Foo\n{{Information|foo={{de|sdf}}|bar={{lic}}}}\n{{Location|12.3|45.6}}\nBar'
  }));

test('', () =>
  testLocation({
    type: 'Location',
    lat: 12.3,
    lng: 45.6,
    text: 'Foo\n{{Information\n|foo={{de|sdf}}\n|bar={{lic}}}}Bar',
    expected: 'Foo\n{{Information\n|foo={{de|sdf}}\n|bar={{lic}}}}\n{{Location|12.3|45.6}}\nBar'
  }));

test('', () =>
  testLocation({
    type: 'Location',
    lat: 12.3,
    lng: 45.6,
    text: 'X\n{{Location dec|50.917385|13.342268}}\nX',
    expected: 'X\n{{Location|12.3|45.6}}\nX'
  }));

test('', () =>
  testLocation({
    type: 'Location',
    lat: 12.3,
    lng: 45.6,
    text: '{{location dec|43.599468|1.445375|region:FR}}\n',
    expected: '{{Location|12.3|45.6|region:FR}}\n'
  }));

test('', () =>
  testLocation({
    type: 'Object location',
    lat: 12.3,
    lng: 45.6,
    text: '',
    expected: '{{Object location|12.3|45.6}}'
  }));

test('', () =>
  testLocation({
    type: 'Object location',
    lat: 12.3,
    lng: 45.6,
    text:
      '{{Information}}{{Location|9.99|9.99|region:XY-Z}}{{Object location|87.65|-43.21|region:XY-Z}}',
    expected:
      '{{Information}}{{Location|9.99|9.99|region:XY-Z}}{{Object location|12.3|45.6|region:XY-Z}}'
  }));

test('', () =>
  testLocation({
    type: 'Object location',
    lat: 12.3,
    lng: 45.6,
    text: '{{object location|87.65|-43.21|region:XY-Z}}',
    expected: '{{Object location|12.3|45.6|region:XY-Z}}'
  }));

test('', () =>
  testLocation({
    type: 'Location',
    lat: 12.3,
    lng: 45.6,
    text: '{{Location |1=47.27 |2=11.426944444444 }}',
    expected: '{{Location|12.3|45.6}}'
  }));
