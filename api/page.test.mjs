import test from 'node:test';
import assert from 'node:assert/strict';
import { isXmas, quoteItem, eventCard, eventChoice } from './page.js';

test('quotes are HTML-escaped and the link is attribute-safe', () => {
  const html = quoteItem({ quote: '<script>alert(1)</script>', name: 'A & "B"', track: 'Kemi', year: '2012', now: '', link: 'https://a.dk/?x="><img src=x onerror=alert(1)>' });
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('<img'), false);
  assert.match(html, /”&lt;script&gt;alert\(1\)&lt;\/script&gt;”/);
  assert.match(html, /A &amp; &quot;B&quot;, Kemi 2012 · <a href="https:\/\/a\.dk\/\?x=&quot;&gt;&lt;img/);
});

test('christmas runs 24 Nov to 26 Dec in Copenhagen time, and ?theme overrides it', () => {
  const u = s => new URL('https://natit.dk/' + s);
  assert.equal(isXmas(u(''), new Date('2026-11-23T22:59:00Z')), false);
  assert.equal(isXmas(u(''), new Date('2026-11-23T23:00:00Z')), true);
  assert.equal(isXmas(u(''), new Date('2026-12-26T22:59:00Z')), true);
  assert.equal(isXmas(u(''), new Date('2026-12-26T23:00:00Z')), false);
  assert.equal(isXmas(u('?theme=christmas'), new Date('2026-06-01')), true);
  assert.equal(isXmas(u('?theme=none'), new Date('2026-12-01')), false);
});

test('events render escaped, in Copenhagen time, with defaults for missing date and place', () => {
  const e = { id: 'recA', name: '<b>Fest</b>', date: '2026-12-05T12:00:00.000Z', place: '', desc: '' };
  const card = eventCard(e);
  assert.equal(card.includes('<b>'), false);
  assert.match(card, /Lørdag 5\. december kl\. 13\.00<\/time>\. Sted kommer senere\./);
  assert.match(eventCard({ ...e, date: '' }), /Dato kommer senere\. Sted kommer senere\./);
  assert.match(eventChoice([e]), /<input type="hidden" name="event" value="recA">/);
  assert.equal((eventChoice([e, { ...e, id: 'recB' }]).match(/type="radio"/g) || []).length, 2);
});
