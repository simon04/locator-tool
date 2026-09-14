import {addLocationToWikiText, type CommonsFile, LatLng} from '../model';
import {REST_PHP_URL} from './commons';
import {editMediaInfo} from './mediainfo';
import {getAuthorizationHeader} from './OAuth2';

export interface Page {
  id: number;
  key: string;
  title: string;
  latest: {
    id: number;
    timestamp: Date;
  };
  content_model: string;
  license: {
    url: string;
    title: string;
  };
  source: string;
}

export async function editLocation(title: CommonsFile, coordinates: LatLng[]): Promise<void> {
  if (!coordinates.length) return;
  await editMediaInfo(title, coordinates);

  // Reference: https://www.mediawiki.org/wiki/API:REST_API/Reference
  const pageUrl = `${REST_PHP_URL}/v1/page/${title.file}`;
  const pageResponse = await fetch(pageUrl, {cache: 'no-cache'});
  if (!pageResponse.ok) throw pageResponse;
  const page: Page = await pageResponse.json();

  const wikitext = coordinates.reduce((text, ll) => addLocationToWikiText(ll, text), page.source);

  const headers = {...(await getAuthorizationHeader()), 'Content-Type': 'application/json'};
  const response = await fetch(pageUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      source: wikitext,
      comment: coordinates.map(({type}) => `{{${type}}}`).join(', '),
      latest: page.latest
    })
  });
  if (!response.ok) throw response;
}
