import {chunk} from 'es-toolkit';

import {buildQuery} from './buildQuery';
import {fetchJSON} from './fetchJSON';

const API_URL = 'https://www.wikidata.org/w/api.php';

interface LabelsResponse {
  entities?: Record<string, {labels?: Record<string, {language: string; value: string}>}>;
}

// Labels for the properties and items used by the structured data, e.g. P4082 → "captured with"
// https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels&ids=P4082
export async function getLabels(ids: string[], language: string): Promise<Record<string, string>> {
  const chunks = await Promise.all(chunk(ids, 50).map(ids0 => getLabelsChunk(ids0, language)));
  return Object.assign({}, ...chunks);
}

async function getLabelsChunk(ids: string[], language: string): Promise<Record<string, string>> {
  const data = await fetchJSON<LabelsResponse>(
    buildQuery(
      {
        action: 'wbgetentities',
        props: 'labels',
        languages: [...new Set([language, 'en'])].join('|'),
        languagefallback: 1,
        ids: ids.join('|')
      },
      API_URL
    )
  );
  return Object.fromEntries(
    Object.entries(data.entities ?? {})
      .map(([id, entity]) => [id, (entity.labels?.[language] ?? entity.labels?.en)?.value])
      .filter(([, label]) => !!label)
  );
}
