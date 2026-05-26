import {toSearchParams} from './toSearchParams';

export function buildQuery(
  query: Record<string, unknown> = {},
  API_URL = 'https://commons.wikimedia.org/w/api.php'
) {
  const params = {
    action: 'query',
    format: 'json',
    origin: '*',
    ...query
  };
  const url = API_URL + '?' + toSearchParams(params);
  return url;
}
