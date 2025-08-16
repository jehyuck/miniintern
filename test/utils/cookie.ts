import type request from 'supertest';

export function getCookie(res: request.Response, name: string): string | undefined {
  const set = res.get('set-cookie') ?? [];
  for (const cookie of set) {
    const first = cookie.split(';', 1)[0]; // "name=value"
    const eq = first.indexOf('=');
    if (eq === -1) continue;
    const k = first.slice(0, eq);
    const v = first.slice(eq + 1);
    if (k === name) return decodeURIComponent(v);
  }
  return undefined;
}
