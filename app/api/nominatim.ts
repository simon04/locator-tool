import {fetchJSON} from './fetchJSON';

export interface NominatimResult {
  display_name: string;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
}

export async function search(query: string, signal?: AbortSignal): Promise<NominatimResult[]> {
  if (!query.trim()) return [];
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '5');
  return fetchJSON<NominatimResult[]>(url.toString(), {signal});
}
