import {chunk} from 'es-toolkit';

import {type ApiResponse} from './ApiResponse';
import {$query, NS_ARTICLE} from './query';

export interface GlobalUsage {
  title: string;
  wiki: string;
  url: string;
}

export async function globalusage(pageids: number[]): Promise<Record<number, GlobalUsage[]>> {
  // the API accepts 50 pageids per request
  if (pageids.length > 50) {
    const usages = await Promise.all(chunk(pageids, 50).map(pageids0 => globalusage(pageids0)));
    return Object.assign({}, ...usages);
  }
  const data = await $query<ApiResponse<{globalusage?: GlobalUsage[]}>>({
    // https://www.mediawiki.org/wiki/API:Globalusage/en
    prop: 'globalusage',
    pageids: pageids.join('|'),
    gunamespace: NS_ARTICLE,
    // gulimit applies to the request as a whole, not to each file
    gulimit: 'max'
  });
  const pages = data?.query?.pages ?? {};
  return Object.fromEntries(
    Object.entries(pages).map(([pageid, page]) => [pageid, page.globalusage ?? []])
  );
}
