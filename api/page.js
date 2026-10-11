import { onRequestGet as quotes } from './quotes.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const isXmas = (url, now = new Date()) => {
  const theme = url.searchParams.get('theme');
  if (theme) return theme === 'christmas';
  const [m, d] = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Copenhagen', month: 'numeric', day: 'numeric' }).format(now).split('/').map(Number);
  return (m === 11 && d >= 24) || (m === 12 && d <= 26);
};

export const quoteItem = q => {
  const who = [q.name, [q.track, q.year].filter(Boolean).join(' '), q.now].filter(Boolean).map(esc).join(', ');
  const link = q.link ? `${who ? ' · ' : ''}<a href="${esc(q.link)}" rel="noopener">Se det</a>` : '';
  return `<li><figure><blockquote><p class="q">”${esc(q.quote)}”</p></blockquote><figcaption>${who}${link}</figcaption></figure></li>`;
};

export async function render(request, env, ctx) {
  const url = new URL(request.url);
  const [asset, list] = await Promise.all([
    env.ASSETS.fetch(new URL('/', url)),
    quotes({ request, env, waitUntil: p => ctx.waitUntil(p) }).then(r => r.json()).catch(() => []),
  ]);
  const page = new Response(asset.body, asset);
  page.headers.delete('ETag');
  page.headers.set('Cache-Control', 'no-cache');
  const names = new Set(list.map(q => q.name));
  const items = list.map(quoteItem);
  const rw = new HTMLRewriter()
    .on('.strip-list > li[data-name]', { element: e => { if (names.has(e.getAttribute('data-name'))) e.remove(); } })
    .on('.strip-list > li.open', { element: e => e.before(items.splice(0, 2).join(''), { html: true }) })
    .on('.strip-list', { element: e => e.onEndTag(t => t.before(items.splice(0).join(''), { html: true })) });
  if (isXmas(url)) {
    rw.on('html', { element: e => e.setAttribute('class', 'no-js xmas') })
      .on('[data-jul]', { element: e => e.setInnerContent(e.getAttribute('data-jul')) })
      .on('meta[name=theme-color]', { element: e => e.setAttribute('content', '#0B5130') });
  }
  return rw.transform(page);
}
