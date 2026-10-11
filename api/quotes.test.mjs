import test from 'node:test';
import assert from 'node:assert/strict';
import { toQuotes } from './quotes.js';

test('only approved and consented records, only public fields, only http(s) links', () => {
  const out = toQuotes([
    { id: 'rec1', fields: { Citat: '  ”Hej <script>x</script>”  ', Navn: 'A', Spor: 'Fysik', Årgang: 2012, 'E-mail': 'a@b.dk', Link: 'https://a.dk/x', Godkendt: true, Samtykke: true } },
    { id: 'rec2', fields: { Citat: 'Nej', Navn: 'B', Godkendt: false } },
    { id: 'rec5', fields: { Citat: 'Uden samtykke', Godkendt: true } },
    { id: 'rec3', fields: { Citat: 'x'.repeat(400), Link: 'javascript:alert(1)', Godkendt: true, Samtykke: true } },
    { id: 'rec4', fields: { Citat: '', Godkendt: true, Samtykke: true } },
  ]);
  assert.deepEqual(out[0], { quote: 'Hej <script>x</script>', name: 'A', track: 'Fysik', year: '2012', now: '', link: 'https://a.dk/x' });
  assert.equal(out.length, 2);
  assert.equal(out[1].quote.length, 280);
  assert.equal('link' in out[1], false);
});
