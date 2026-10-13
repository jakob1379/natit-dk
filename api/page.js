import { onRequestGet as quotes } from './quotes.js';
import { onRequestGet as events } from './events.js';

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

const WHEN = new Intl.DateTimeFormat('da-DK', { timeZone: 'Europe/Copenhagen', weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
const info = e => `${e.date ? `<time datetime="${esc(e.date)}">${esc(WHEN.format(new Date(e.date)).replace(/^./, c => c.toUpperCase()))}</time>` : 'Dato kommer senere'}. ${esc(e.place || 'Sted kommer senere')}.`;

export const eventCard = e => `<h3>${esc(e.name)}</h3><p>${info(e)}</p>${e.desc ? `<p>${esc(e.desc)}</p>` : ''}<button type="button" class="btn" popovertarget="arrangement">Tilmeld dig</button>`;

export const eventChoice = list => list.length === 1
  ? `<h2 id="arrangement-h">${esc(list[0].name)}</h2><p class="sub">${info(list[0])}</p><input type="hidden" name="event" value="${esc(list[0].id)}">`
  : `<h2 id="arrangement-h">Tilmeld dig</h2><fieldset><legend>Hvilket arrangement?</legend><div class="checks">${list.map(e => `<label><input type="radio" name="event" value="${esc(e.id)}" required> ${esc(e.name)}</label>`).join('')}</div></fieldset>`;

export async function render(request, env, ctx) {
  const url = new URL(request.url);
  const context = { request, env, waitUntil: p => ctx.waitUntil(p) };
  const [asset, list, open] = await Promise.all([
    env.ASSETS.fetch(new URL('/', url)),
    quotes(context).then(r => r.json()).catch(() => []),
    events(context).then(r => r.json()).catch(() => []),
  ]);
  const page = new Response(asset.body, asset);
  page.headers.delete('ETag');
  page.headers.set('Cache-Control', 'no-cache');
  const names = new Set(list.map(q => q.name));
  const items = list.map(quoteItem);
  const rw = new HTMLRewriter()
    .on('.strip-list > li[data-name]', { element: e => { if (names.has(e.getAttribute('data-name'))) e.remove(); } })
    .on('.strip-list > li.open', { element: e => e.before(items.splice(0, 2).join(''), { html: true }) })
    .on('.strip-list', { element: e => e.onEndTag(t => t.before(items.splice(0).join(''), { html: true })) })
    .on('#tak-tilmelding', { element: e => { if (open.length) e.after(`${open.map(eventCard).join('<hr>')}<hr>`, { html: true }); } })
    .on('#arrangement', { element: e => { if (!open.length) e.remove(); } })
    .on('#arrangement .valg', { element: e => e.replace(eventChoice(open), { html: true }) });
  if (isXmas(url)) {
    rw.on('html', { element: e => e.setAttribute('class', 'no-js xmas') })
      .on('[data-jul]', { element: e => e.setInnerContent(e.getAttribute('data-jul')) })
      .on('meta[name=theme-color]', { element: e => e.setAttribute('content', '#0B5130') });
  }
  return rw.transform(page);
}
