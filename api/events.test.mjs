import test from 'node:test';
import assert from 'node:assert/strict';
import { toEvents } from './events.js';

test('only open, upcoming events with a name, public fields only, soonest first, tba means no place', () => {
  const now = Date.parse('2026-10-12T00:00:00Z');
  const out = toEvents([
    { id: 'recB', fields: { Navn: 'Senere', Dato: '2027-01-01T12:00:00.000Z', Sted: 'HCØ', 'Tilmelding åben': true, Tilmeldinger: [{ id: 'recX', title: 'Amalie' }] } },
    { id: 'recA', fields: { Navn: 'Julefrokost', Dato: '2026-12-05T12:00:00.000Z', Sted: 'tba', Beskrivelse: 'Hej', 'Tilmelding åben': true } },
    { id: 'recC', fields: { Navn: 'Uden dato', 'Tilmelding åben': true } },
    { id: 'recD', fields: { Navn: 'Lukket', Dato: '2026-12-01T12:00:00.000Z' } },
    { id: 'recE', fields: { Navn: 'Forbi', Dato: '2026-10-01T12:00:00.000Z', 'Tilmelding åben': true } },
    { id: 'recF', fields: { Navn: '', 'Tilmelding åben': true } },
    { id: 'bad"id', fields: { Navn: 'Snyd', 'Tilmelding åben': true } },
  ], now);
  assert.deepEqual(out, [
    { id: 'recA', name: 'Julefrokost', date: '2026-12-05T12:00:00.000Z', place: '', desc: 'Hej' },
    { id: 'recB', name: 'Senere', date: '2027-01-01T12:00:00.000Z', place: 'HCØ', desc: '' },
    { id: 'recC', name: 'Uden dato', date: '', place: '', desc: '' },
  ]);
});
