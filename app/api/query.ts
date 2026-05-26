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
  const url = query instanceof URL ? query.toString() : buildQuery(query);
  let data = await fetchJSON<T>(url, {
    signal
  });
  data = mergeWith(previousResults, data, (x, y) => {
    if (Array.isArray(x) && Array.isArray(y)) {
      return [].concat(...x, ...y);
    }
  }) as T;
  if (shouldContinue(data)) {
    return $query<T>(
      {...query, continue: undefined, ...data.continue},
      {...data, continue: undefined},
      signal,
      shouldContinue
    );
  }
  return data;
}
