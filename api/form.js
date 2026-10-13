const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const go = (request, to) => Response.redirect(new URL(to, request.url), 303);
export const text = (form, key, max) => String(form.get(key) || '').trim().slice(0, max);
export const email = v => {
  const e = String(v || '').trim().toLowerCase();
  return e.length <= 254 && EMAIL.test(e) ? e : null;
};
export const compact = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v != null));
export const teable = (env, path, init = {}) => fetch(`${(env.TEABLE_BASE || 'https://app.teable.ai').replace(/\/+$/, '')}${path}`, {
  ...init,
  headers: { Authorization: `Bearer ${env.TEABLE_TOKEN}`, 'Content-Type': 'application/json' },
  signal: AbortSignal.timeout(5000),
});

export async function list({ request, env, waitUntil }, name, tableId, map) {
  const key = new Request(new URL(`/api/${name}`, request.url));
  const hit = await caches.default.match(key);
  if (hit) return hit;
  try {
    if (!env.TEABLE_TOKEN || !tableId) throw new Error('TEABLE_TOKEN or table ID missing');
    // ponytail: one page of 100 (Teable's cap for new personal tokens), filtered here; page with skip once the table outgrows it
    const res = await teable(env, `/api/table/${encodeURIComponent(tableId)}/record?fieldKeyType=name&take=100`);
    if (!res.ok) throw new Error(`Teable ${res.status}`);
    const out = Response.json(map((await res.json()).records), { headers: { 'Cache-Control': 'public, max-age=600' } });
    waitUntil(caches.default.put(key, out.clone()));
    return out;
  } catch (e) {
    console.error(`${name}:`, e.message);
    return Response.json([], { headers: { 'Cache-Control': 'no-store' } });
  }
}

export const handler = (tableId, done, parse, allow) => async ({ request, env }) => {
  if (+request.headers.get('content-length') > 8192) return go(request, '/fejl');
  let form;
  try { form = await request.formData(); } catch { return go(request, '/fejl'); }
  const fields = parse(form);
  if (!fields) return go(request, '/fejl');
  if (!env.TEABLE_TOKEN) {
    console.error('form: TEABLE_TOKEN missing');
    return go(request, '/fejl');
  }
  try {
    if (allow && !(await allow(fields, env))) return go(request, '/fejl');
    const res = await teable(env, `/api/table/${tableId}/record`, { method: 'POST', body: JSON.stringify({ fieldKeyType: 'id', records: [{ fields }] }) });
    if (!res.ok && (await res.json().catch(() => ({}))).data?.domainCode !== 'validation.field.unique') throw new Error(`Teable ${res.status}`);
    return go(request, done);
  } catch (e) {
    console.error('form:', e.message);
    return go(request, '/fejl');
  }
};
