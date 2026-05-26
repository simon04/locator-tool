import {type ApiResponse} from './ApiResponse';
import {$query, NS_ARTICLE} from './query';

export interface GlobalUsage {
  title: string;
  wiki: string;
  url: string;
}

export async function globalusage(pageid: number, titles: string): Promise<GlobalUsage[]> {
  const data = await $query<ApiResponse<{globalusage: GlobalUsage[]}>>({
    // https://www.mediawiki.org/wiki/API:Globalusage/en
    prop: 'globalusage',
    titles,
    gunamespace: NS_ARTICLE,
    gulimit: 500
  });
  return data?.query?.pages?.[pageid].globalusage;
}
