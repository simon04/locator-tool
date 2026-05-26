import type {CommonsTitle} from '../model';
import {type ApiResponse, type Page} from './ApiResponse';
import {NS_CATEGORY, $query} from './query';
import {removeCommonsPrefix} from './removeCommonsPrefix';

export async function getCategoriesForPrefix(prefix: string): Promise<CommonsTitle[]> {
  const params = {
    list: 'allpages',
    apnamespace: NS_CATEGORY,
    aplimit: 30,
    apfrom: prefix,
    apprefix: prefix
  };
  const data = await $query<ApiResponse<Page>>(params, {}, undefined, () => false);
  return (data.query.allpages || []).map(
    i => removeCommonsPrefix(i.title, 'Category:') as CommonsTitle
  );
}
