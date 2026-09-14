import {addLocationToWikiText, type CommonsFile, LatLng} from '../model';
import {editMediaInfo} from './mediainfo';
import {API_URL, getAuthorizationHeader} from './OAuth2';

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

export async function editLocation(title: CommonsFile, coordinates: LatLng): Promise<void> {
  await editMediaInfo(title, coordinates);

  // Reference: https://www.mediawiki.org/wiki/API:REST_API/Reference
  const pageUrl = `${API_URL}/v1/page/${title.file}`;
  const pageResponse = await fetch(pageUrl, {cache: 'no-cache'});
  if (!pageResponse.ok) throw pageResponse;
  const page: Page = await pageResponse.json();

  const wikitext = addLocationToWikiText(coordinates, page.source);

  const headers = {...(await getAuthorizationHeader()), 'Content-Type': 'application/json'};
  const response = await fetch(pageUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      source: wikitext,
      comment: `{{${coordinates.type}}}`,
      latest: page.latest
    })
  });
  if (!response.ok) throw response;
}
