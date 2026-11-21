/** SSRF allowlist for Laya base URLs — loopback HTTP only. */
export function isAllowedLayaBaseUrl(baseUrl: string): boolean {
  if (!baseUrl) return false;
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'http:') return false;
  if (parsed.username !== '' || parsed.password !== '') return false;
  const host = parsed.hostname;
  return host === '127.0.0.1' || host === 'localhost';
}
