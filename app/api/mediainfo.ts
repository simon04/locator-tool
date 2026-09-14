import {type CommonsFile, LatLng, WikidataProperty} from '../model';
import type {MediaInfo} from '../model/mediainfo';
import type {ApiResponse} from './ApiResponse';
import {API_PHP_URL} from './buildQuery';
import {getAuthorizationHeader} from './OAuth2';
import {$query} from './query';
import {toSearchParams} from './toSearchParams';

// Authenticated cross-origin requests to api.php require `crossorigin=` next to the
// bearer token: https://www.mediawiki.org/wiki/API:Cross-site_requests
const CROSS_ORIGIN = {crossorigin: ''};

interface MediaInfoPage {
  pageid: number;
  wbentityusage?: Record<string, unknown>;
  revisions?: {slots: {mediainfo?: {'*': string}}}[];
}

type FileMediaInfo = Pick<MediaInfo, 'id' | 'statements'>;

/**
 * Adds the location to the structured data of the file, as
 * coordinates of the point of view (P1259) or of the depicted place (P9149).
 *
 * Files without structured data are left alone, as is the wikitext-only case.
 */
export async function editMediaInfo(file: CommonsFile, ll: LatLng): Promise<void> {
  if (ll.lat === undefined || ll.lng === undefined) return;
  const mediainfo = await getMediaInfo(file.pageid);
  if (!mediainfo) return;

  const property = WikidataProperty[ll.type];
  const claim = mediainfo.statements?.[property]?.[0];
  const value = JSON.stringify({
    latitude: ll.lat,
    longitude: ll.lng,
    globe: 'http://www.wikidata.org/entity/Q2',
    precision: 0.000001
  });

  // https://www.wikidata.org/w/api.php?action=help&modules=wbsetclaimvalue
  // https://www.wikidata.org/w/api.php?action=help&modules=wbcreateclaim
  await post(
    claim
      ? {action: 'wbsetclaimvalue', claim: claim.id, snaktype: 'value', value}
      : {
          action: 'wbcreateclaim',
          entity: mediainfo.id,
          property,
          snaktype: 'value',
          value
        }
  );
}

async function getMediaInfo(pageid: number): Promise<FileMediaInfo | undefined> {
  const data = await $query<ApiResponse<MediaInfoPage>>({
    prop: 'revisions|wbentityusage',
    pageids: pageid,
    rvslots: 'mediainfo',
    rvprop: 'content'
  });
  const page = data?.query?.pages?.[pageid];
  const json = page?.revisions?.[0]?.slots?.mediainfo?.['*'];
  if (json) return JSON.parse(json) as FileMediaInfo;
  // The entity may exist without a mediainfo slot being served
  const id = Object.keys(page?.wbentityusage ?? {}).find(key => key.startsWith('M'));
  return id ? {id, statements: {}} : undefined;
}

async function post(params: Record<string, string>): Promise<void> {
  const headers = await getAuthorizationHeader();
  const token = await getCsrfToken(headers);
  const response = await fetch(`${API_PHP_URL}?${toSearchParams(CROSS_ORIGIN)}`, {
    method: 'POST',
    headers: {...headers, 'Content-Type': 'application/x-www-form-urlencoded'},
    body: toSearchParams({format: 'json', formatversion: 2, ...params, token})
  });
  if (!response.ok) throw response;
  // api.php reports failures with HTTP 200
  const data = await response.json();
  if (data.error) throw Error(`${data.error.code}: ${data.error.info}`);
}

async function getCsrfToken(headers: {Authorization: string}): Promise<string> {
  const params = toSearchParams({
    action: 'query',
    meta: 'tokens',
    type: 'csrf',
    format: 'json',
    formatversion: 2,
    ...CROSS_ORIGIN
  });
  const response = await fetch(`${API_PHP_URL}?${params}`, {cache: 'no-cache', headers});
  if (!response.ok) throw response;
  const data = await response.json();
  const token = data?.query?.tokens?.csrftoken;
  if (!token) throw Error('Failed to obtain a CSRF token');
  return token;
}
