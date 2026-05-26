import {type ApiResponse} from './ApiResponse';
import {$query} from './query';

export interface User {
  userid: number;
  name: string;
}

export async function getUsersForPrefix(prefix: string): Promise<string[]> {
  const params = {
    list: 'allusers',
    aulimit: 30,
    aufrom: prefix,
    apuprefix: prefix
  };
  const data = await $query<ApiResponse<User>>(params, {}, undefined, () => false);
  return (data.query.allusers || []).map(i => i.name);
}
