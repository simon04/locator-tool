import {addLocationToWikiText, CommonsFile, LatLng} from '../model';
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

export default class LtDataAuth {
  async editLocation(title: CommonsFile, coordinates: LatLng): Promise<void> {
    // Reference: https://www.mediawiki.org/wiki/API:REST_API/Reference
    const pageUrl = `${API_URL}/v1/page/${title.file}`;
    const pageResponse = await fetch(pageUrl, {cache: 'no-cache'});
    if (!pageResponse.ok) throw pageResponse;
    const page: Page = await pageResponse.json();

    const wikitext = addLocationToWikiText(coordinates, page.source);

    const headers = await getAuthorizationHeader();
    headers['Content-Type'] = 'application/json';
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
}
