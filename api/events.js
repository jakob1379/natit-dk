import { list } from './form.js';

const cut = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n).trim() : '');

export const toEvents = (records, now = Date.now()) => records
  .filter(r => r?.fields?.['Tilmelding åben'] === true && /^rec[A-Za-z0-9]+$/.test(r.id) && !(Date.parse(r.fields.Dato) < now))
  .map(({ id, fields: f }) => ({ id, name: cut(f.Navn, 120), date: Number.isNaN(Date.parse(f.Dato)) ? '' : new Date(f.Dato).toISOString(), place: /^tba$/i.test(cut(f.Sted, 200)) ? '' : cut(f.Sted, 200), desc: cut(f.Beskrivelse, 500) }))
  .filter(e => e.name)
  .sort((a, b) => (a.date || '9').localeCompare(b.date || '9'));

export const onRequestGet = context => list(context, 'events', 'tbldAIQvH0lucSpwhjo', toEvents);
