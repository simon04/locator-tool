import {toSearchParams} from './toSearchParams';

export const API_PHP_URL = 'https://commons.wikimedia.org/w/api.php';

export function buildQuery(query: Record<string, unknown> = {}, API_URL = API_PHP_URL) {
  const params = {
    action: 'query',
    format: 'json',
    origin: '*',
    ...query
  };
  const url = API_URL + '?' + toSearchParams(params);
  return url;
}
