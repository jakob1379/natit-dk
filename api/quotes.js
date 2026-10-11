const cut = (v, n) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim().slice(0, n).trim() : '');
const web = v => {
  try { const u = new URL(cut(v, 500)); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''; } catch { return ''; }
};

export const toQuotes = records => records.filter(r => r?.fields?.Godkendt === true && r.fields.Samtykke === true).map(({ fields: f }) => {
  const q = { quote: cut(f.Citat, 280).replace(/^["“”„«»]+|["“”„«»]+$/g, '').trim(), name: cut(f.Navn, 80), track: cut(f.Spor, 60), year: cut(f.Årgang, 4), now: cut(f.Nu, 120) };
  const link = web(f.Link);
  return link ? { ...q, link } : q;
}).filter(q => q.quote);

export async function onRequestGet(context) {
  const { request, env } = context;
  const cache = caches.default;
  const key = new Request(new URL('/api/quotes', request.url));
  const hit = await cache.match(key);
  if (hit) return hit;
  try {
    if (!env.TEABLE_TOKEN || !env.TEABLE_TABLE_ID) throw new Error('TEABLE_TOKEN or TEABLE_TABLE_ID missing');
    const base = (env.TEABLE_BASE || 'https://app.teable.ai').replace(/\/+$/, '');
    // ponytail: one page of 100 (Teable's cap for new personal tokens), filtered here; page with skip once the table outgrows it
    const res = await fetch(`${base}/api/table/${encodeURIComponent(env.TEABLE_TABLE_ID)}/record?fieldKeyType=name&take=100`, {
      headers: { Authorization: `Bearer ${env.TEABLE_TOKEN}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Teable ${res.status}`);
    const out = Response.json(toQuotes((await res.json()).records), { headers: { 'Cache-Control': 'public, max-age=600' } });
    context.waitUntil(cache.put(key, out.clone()));
    return out;
  } catch (e) {
    console.error('quotes:', e.message);
    return Response.json([], { headers: { 'Cache-Control': 'no-store' } });
  }
}
