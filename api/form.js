const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const reply = (status, body) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
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

export const handler = (tableId, parse, allow) => async ({ request, env }) => {
  if (+request.headers.get('content-length') > 8192) return reply(413, { error: 'size' });
  let form;
  try { form = await request.formData(); } catch { return reply(400, { error: 'invalid' }); }
  const fields = parse(form);
  if (!fields) return reply(400, { error: 'invalid' });
  if (!env.TEABLE_TOKEN) {
    console.error('form: TEABLE_TOKEN missing');
    return reply(500, { error: 'config' });
  }
  try {
    if (allow && !(await allow(fields, env))) return reply(400, { error: 'invalid' });
    const res = await teable(env, `/api/table/${tableId}/record`, { method: 'POST', body: JSON.stringify({ fieldKeyType: 'id', records: [{ fields }] }) });
    if (!res.ok && (await res.json().catch(() => ({}))).data?.domainCode !== 'validation.field.unique') throw new Error(`Teable ${res.status}`);
    return reply(200, { ok: true });
  } catch (e) {
    console.error('form:', e.message);
    return reply(502, { error: 'upstream' });
  }
};
