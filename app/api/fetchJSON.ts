export async function fetchJSON<T>(url: RequestInfo, options?: RequestInit): Promise<T> {
  console.log('Fetching', url);
  const res = await fetch(url, {
    cache: 'no-cache',
    headers: {
      Accept: 'application/json',
      'Api-User-Agent': 'locator-tool (https://locator-tool.toolforge.org/)'
    },
    ...options
  });
  if (res.ok) {
    return res.json();
  } else {
    throw new Error(res.statusText);
  }
}
