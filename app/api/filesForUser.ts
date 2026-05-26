import type {CommonsTitle} from '../model';
import {type ApiResponse, type Page} from './ApiResponse';
import {$query} from './query';
import {removeCommonsPrefix} from './removeCommonsPrefix';

export async function getFilesForUser(
  user: string,
  userLimit: number | undefined,
  userStart: string | undefined,
  userEnd: string | undefined
): Promise<CommonsTitle[]> {
  user = removeCommonsPrefix(user, 'User:');
  // https://commons.wikimedia.org/w/api.php?action=help&modules=query%2Ballimages
  const params = {
    generator: 'allimages',
    gaiuser: user,
    gailimit: typeof userLimit === 'number' && userLimit <= 500 ? userLimit : 'max',
    gaistart: userEnd ? new Date(userEnd).toISOString() : undefined, // sic! (due to gaidir)
    gaiend: userStart ? new Date(userStart).toISOString() : undefined, // sic! (due to gaidir)
    gaisort: 'timestamp',
    gaidir: 'older'
  };
  const toPageArray = (data: ApiResponse<Page>): Page[] => Object.values(data.query.pages);
  const shouldContinue = (data: ApiResponse<Page>): boolean =>
    data.continue ? !userLimit || toPageArray(data).length < userLimit : false;
  const data = await $query<ApiResponse<Page>>(params, {}, undefined, shouldContinue);
  const pages = toPageArray(data).map(page => page.title as CommonsTitle);
  return userLimit ? pages.slice(0, userLimit) : pages;
}
