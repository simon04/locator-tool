import type {CommonsTitle} from '../model';
import {getFilesForCategory} from './filesForCategory';
import {getFilesForUser} from './filesForUser';

export type FilesOptions = {
  files?: CommonsTitle | CommonsTitle[];
  user?: string;
  userLimit?: string;
  userStart?: string;
  userEnd?: string;
  category?: string;
  categoryDepth?: string;
};

export async function getFiles({
  files,
  user,
  userLimit,
  userStart,
  userEnd,
  category,
  categoryDepth
}: FilesOptions & {userLimit?: string | number; categoryDepth?: string | number}): Promise<
  CommonsTitle[]
> {
  if (typeof files === 'string') {
    files = files.split('|');
  }
  if (files) {
    return files.map(file => (file.startsWith('File:') ? file : `File:${file}`));
  } else if (user) {
    const userLimit0 = typeof userLimit === 'string' ? +userLimit : userLimit;
    return getFilesForUser(user, userLimit0, userStart, userEnd);
  } else if (category) {
    const categoryDepth0 = typeof categoryDepth === 'string' ? +categoryDepth : categoryDepth;
    return getFilesForCategory(category, categoryDepth0);
  } else {
    throw new Error();
  }
}
