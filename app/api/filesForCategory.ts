import type {CommonsTitle} from '../model';
import {type ApiResponse, type Page} from './ApiResponse';
import {fetchJSON} from './fetchJSON';
import {$query, NS_FILE} from './query';
import {removeCommonsPrefix} from './removeCommonsPrefix';
import {toSearchParams} from './toSearchParams';

export async function getFilesForCategory(cat: string, depth = 3): Promise<CommonsTitle[]> {
  cat = removeCommonsPrefix(cat, 'Category:');
  const abort = new AbortController();
  const requests = [
    getFilesForCategory1(cat, depth, abort.signal),
    getFilesForCategory2(cat, depth, abort.signal),
    getFilesForCategory3(cat, depth, abort.signal)
  ];
  if (depth <= 0) {
    requests.unshift(getFilesForCategory0(cat, abort.signal));
  }
  try {
    return await new Promise<CommonsTitle[]>((resolve, reject) => {
      // resolve first successful one
      for (const promise of requests) {
        promise.then(resolve, error => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          console.warn('Error fetching category', cat, error);
        });
      }
      // reject when all fail
      Promise.allSettled(requests).catch(reject);
    });
  } finally {
    abort.abort();
  }
}

export async function getFilesForCategory0(
  cat: string,
  signal?: AbortSignal
): Promise<CommonsTitle[]> {
  const params = {
    list: 'categorymembers',
    cmlimit: 500,
    cmnamespace: NS_FILE,
    cmtitle: 'Category:' + cat
  };
  const data = await $query<ApiResponse<Page>>(params, {}, signal);
  return (data.query.categorymembers || []).map(cm => cm.title);
}

export async function getFilesForCategory1(
  cat: string,
  depth: number,
  signal?: AbortSignal
): Promise<CommonsTitle[]> {
  const params = {
    lang: 'commons',
    cat: cat.replace(/^Category:/, ''),
    type: NS_FILE,
    depth,
    json: 1
  };
  const url = 'https://cats-php.toolforge.org/?' + toSearchParams(params);
  const data = await fetchJSON<CommonsTitle[]>(url, {signal});
  return data.map(f => `File:${f}`);
}

export async function getFilesForCategory2(
  cat: string,
  depth: number,
  signal?: AbortSignal
): Promise<CommonsTitle[]> {
  const params = {
    category: cat.replace(/^Category:/, ''),
    ns: NS_FILE,
    depth
  };
  const url = '/catscan?' + toSearchParams(params);
  const data = await fetchJSON<{pages: CommonsTitle[]}>(url, {signal});
  return data.pages.map(f => `File:${f}`);
}

export async function getFilesForCategory3(
  categories: string,
  depth: number,
  signal?: AbortSignal
): Promise<CommonsTitle[]> {
  const params = {
    language: 'commons',
    project: 'wikimedia',
    depth,
    categories,
    [`ns[${NS_FILE}]`]: 1,
    format: 'json',
    sparse: 1,
    doit: 1
  };
  const url = 'https://petscan.wmcloud.org/?' + toSearchParams(params);
  const data = await fetchJSON<any>(url, {signal});
  return data['*'][0]['a']['*'] as CommonsTitle[];
}
