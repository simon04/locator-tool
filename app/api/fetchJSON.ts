import {delay} from 'es-toolkit';

// https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits
const RETRY_STATUS = [429, 503];
const RETRIES = 3;

export async function fetchJSON<T>(url: RequestInfo, options?: RequestInit): Promise<T> {
  console.log('Fetching', url);
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
        'Api-User-Agent': `locator-tool/${import.meta.env.VITE_BUILD_VERSION} (https://locator-tool.toolforge.org/; https://github.com/simon04/locator-tool)`
      },
      ...options
    });
    if (res.ok) {
      return res.json();
    } else if (attempt >= RETRIES || !RETRY_STATUS.includes(res.status)) {
      // HTTP/2 has no status text
      throw new Error(res.statusText || `HTTP ${res.status}`);
    }
    const ms = retryAfter(res, attempt);
    console.warn('Retrying', url, 'in', ms, 'ms, status', res.status);
    await delay(ms, {signal: options?.signal ?? undefined});
  }
}

// the API exposes Retry-After to CORS requests; without it, back off exponentially
function retryAfter(res: Response, attempt: number): number {
  const seconds = Number(res.headers.get('Retry-After'));
  return seconds > 0 ? seconds * 1000 : 2 ** attempt * 1000 * (1 + Math.random());
}
