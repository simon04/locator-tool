import {chunk} from 'es-toolkit';

import type {MediaInfo} from '../model/mediainfo';
import {buildQuery} from './buildQuery';
import {fetchJSON} from './fetchJSON';

export type Statements = MediaInfo['statements'];

interface EntitiesResponse {
  entities?: Record<string, {id: string; missing?: string; statements?: Statements | []}>;
}

// Structured data on Commons: the mediainfo entity of the File: page with pageid N is M<N>.
// https://commons.wikimedia.org/w/api.php?action=wbgetentities&props=claims&ids=M1234
export async function getStatements(pageids: number[]): Promise<Record<number, Statements>> {
  // wbgetentities accepts 50 ids per request
  const chunks = await Promise.all(chunk(pageids, 50).map(getStatementsChunk));
  return Object.assign({}, ...chunks);
}

async function getStatementsChunk(pageids: number[]): Promise<Record<number, Statements>> {
  const data = await fetchJSON<EntitiesResponse>(
    buildQuery({
      action: 'wbgetentities',
      props: 'claims',
      ids: pageids.map(pageid => `M${pageid}`).join('|')
    })
  );
  return Object.fromEntries(
    Object.entries(data.entities ?? {}).map(([id, entity]) => [
      +id.slice(1),
      // a file without structured data reports an empty array instead of an empty object
      Array.isArray(entity.statements) ? {} : (entity.statements ?? {})
    ])
  );
}
