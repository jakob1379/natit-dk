import { list } from './form.js';

const cut = (v, n) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim().slice(0, n).trim() : '');
const web = v => {
  try { const u = new URL(cut(v, 500)); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : ''; } catch { return ''; }
};

export const toQuotes = records => records.filter(r => r?.fields?.Godkendt === true && r.fields.Samtykke === true).map(({ fields: f }) => {
  const q = { quote: cut(f.Citat, 280).replace(/^["“”„«»]+|["“”„«»]+$/g, '').trim(), name: cut(f.Navn, 80), track: cut(f.Spor, 60), year: cut(f.Årgang, 4), now: cut(f.Nu, 120) };
  const link = web(f.Link);
  return link ? { ...q, link } : q;
}).filter(q => q.quote);

export const onRequestGet = context => list(context, 'quotes', context.env.TEABLE_TABLE_ID, toQuotes);
