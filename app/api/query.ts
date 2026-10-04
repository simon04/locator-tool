import {mergeWith} from 'es-toolkit';

import type {ApiResponse} from './ApiResponse';
import {buildQuery} from './buildQuery';
import {fetchJSON} from './fetchJSON';

export const NS_ARTICLE = 0;
export const NS_FILE = 6;
export const NS_CATEGORY = 14;

export async function $query<T extends ApiResponse<any>>(
  query: URL | Record<string, unknown>,
  previousResults = {},
  signal?: AbortSignal,
  shouldContinue = (data: T) => !!data.continue
): Promise<T> {
  let result = previousResults as T;
  let continueParams: Record<string, string> | undefined;
  do {
    // each request consists of the original query and the continue parameters of the previous
    // response only, see https://www.mediawiki.org/wiki/API:Continue
    const url = new URL(query instanceof URL ? query : buildQuery(query));
    for (const [key, value] of Object.entries(continueParams ?? {})) {
      url.searchParams.set(key, value);
    }
    const data = await fetchJSON<T>(url.toString(), {signal});
    result = mergeWith(result, data, (x, y) => {
      if (Array.isArray(x) && Array.isArray(y)) {
        return [].concat(...x, ...y);
      }
    }) as T;
    // mergeWith keeps the continue parameters of a previous response
    result.continue = continueParams = data.continue;
  } while (shouldContinue(result));
  return result;
}
