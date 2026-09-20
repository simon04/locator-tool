import {StorageSerializers, useSessionStorage} from '@vueuse/core';
import {delay} from 'es-toolkit';

// https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits
const RETRY_STATUS = [429, 503];
const RETRIES = 3;

// responses are cached for the session, so that switching between the views does not query
// the API over and over again
export function clearCache(): void {
  sessionStorage.clear();
}

export async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const cached = useSessionStorage<T | null>(url, null, {
    listenToStorageChanges: false,
    serializer: StorageSerializers.object,
    shallow: true,
    // the session storage is full, drop the cached responses and start over
    onError: clearCache
  });
  if (cached.value) {
    return cached.value;
  }
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
      const json: T = await res.json();
      cached.value = json;
      return json;
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
