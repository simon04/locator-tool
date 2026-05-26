import getFilePath from 'wikimedia-commons-file-path';

import {fetchJSON} from './fetchJSON';
import {removeCommonsPrefix} from './removeCommonsPrefix';

export async function fetchMediaRequests(title: string) {
  // https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/media-files.html
  // https://gerrit.wikimedia.org/r/plugins/gitiles/generated-data-platform/aqs/media-analytics/+/refs/heads/main/docs/swagger.json
  const fileURL = getFilePath(title);
  const filePath = encodeURIComponent(removeCommonsPrefix(fileURL, 'https://upload.wikimedia.org'));
  const url = `https://wikimedia.org/api/rest_v1/metrics/mediarequests/per-file/all-referers/all-agents/${filePath}/monthly/20260101/20270101`;
  return fetchJSON(url);
}
