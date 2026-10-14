import {fetchJSON} from './fetchJSON';

// https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/media-files.html
const MEDIAREQUESTS =
  'https://wikimedia.org/api/rest_v1/metrics/mediarequests/per-file/all-referers/all-agents';

export const MEDIAVIEWS_DAYS = 30;

interface MediaRequests {
  items: {timestamp: string; requests: number}[];
}

// the number of requests of the original file (https://upload.wikimedia.org/…) in the last days
export async function mediaviews(fileUrl: string, days = MEDIAVIEWS_DAYS): Promise<number> {
  const path = decodeURIComponent(new URL(fileUrl).pathname);
  // the data of the current day is incomplete
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const url = `${MEDIAREQUESTS}/${encodeURIComponent(path)}/daily/${toTimestamp(start)}/${toTimestamp(end)}`;
  try {
    const data = await fetchJSON<MediaRequests>(url);
    return data.items.reduce((sum, item) => sum + item.requests, 0);
  } catch (e) {
    // the API responds with 404 Not Found for files without any requests
    if (e instanceof Error && /404|Not Found/.test(e.message)) return 0;
    throw e;
  }
}

function toTimestamp(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '') + '00';
}
