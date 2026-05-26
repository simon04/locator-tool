export function toSearchParams(
  query: Record<string, undefined | string | number>
): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    searchParams.append(key, String(value));
  }
  return searchParams;
}
