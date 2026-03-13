export function tryParse<T>(parser: (string: string) => T, text: string, fallback: T): T {
  if (!text) {
    return fallback;
  }
  try {
    return parser(text as string);
  } catch {
    return fallback;
  }
}
