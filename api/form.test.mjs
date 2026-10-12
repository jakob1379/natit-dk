import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost as subscribe } from './subscribe.js';
import { onRequestPost as quote } from './quote.js';
import { onRequestPost as signup } from './signup.js';

const env = { TEABLE_TOKEN: 't' };
const post = (handler, fields, e = env) => {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) for (const x of [].concat(v)) body.append(k, x);
  return handler({ env: e, request: new Request('https://natit.dk/api/x', { method: 'POST', body }) });
};
const stub = (teable, event = { fields: { fldksmMgIzszasDc6Yc: true } }) => {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (!init?.method) return Response.json(event);
    return teable();
  };
  return calls;
};
const to = res => [res.status, new URL(res.headers.get('location')).pathname + new URL(res.headers.get('location')).hash];
const created = () => Response.json({ records: [{ id: 'rec1' }] }, { status: 201 });
const sent = calls => JSON.parse(calls.at(-1).init.body).records[0].fields;

test('subscribe stores a valid signup lowercased with only the email and name fields', async () => {
  const calls = stub(created);
  const res = await post(subscribe, { email: ' Jakob@Example.COM ', name: ' Jakob ', Godkendt: 'true' });
  assert.deepEqual(to(res), [303, '/#tilmeldt']);
  assert.deepEqual(sent(calls), { fldTPvuAu5W4G7IYK3F: 'jakob@example.com', fldP8QgK7Fe5Uqz1iZO: 'Jakob' });
});

test('rejects bad input before any network call', async () => {
  const calls = stub(created);
  assert.deepEqual(to(await post(subscribe, { email: 'nope' })), [303, '/fejl']);
  assert.equal(calls.length, 0);
});

test('duplicate signup looks like success; other Teable errors and missing config send people to /fejl', async () => {
  stub(() => Response.json({ data: { domainCode: 'validation.field.unique' } }, { status: 400 }));
  assert.deepEqual(to(await post(subscribe, { email: 'a@b.dk' })), [303, '/#tilmeldt']);
  stub(() => Response.json({}, { status: 500 }));
  assert.deepEqual(to(await post(subscribe, { email: 'a@b.dk' })), [303, '/fejl']);
  assert.deepEqual(to(await post(subscribe, { email: 'a@b.dk' }, {})), [303, '/fejl']);
});

test('quote needs consent, never sets Godkendt, and rejects unsafe links and unknown tracks', async () => {
  const calls = stub(created);
  const ok = { citat: 'Vi kan begge dele', navn: 'A', spor: 'Kemi', aargang: '2012', link: 'https://a.dk', samtykke: 'ja', godkendt: 'true' };
  assert.deepEqual(to(await post(quote, ok)), [303, '/#tak-citat']);
  assert.deepEqual(sent(calls), { fldJdyojNUZW0pn2dN9: 'Vi kan begge dele', fldTcoMSOISzLx12oZI: 'A', fldOpq13iGpBKTdsFm8: 'Kemi', fld2Wcj1cAVuaoLwOWd: 2012, fldPZvcMdBv5g2ogi2A: 'https://a.dk', fldIOLbj9TOEVM2Qd5w: true });
  for (const bad of [{ samtykke: '' }, { link: 'javascript:alert(1)' }, { spor: 'Jura' }, { aargang: '12' }, { email: 'x' }]) {
    assert.deepEqual(to(await post(quote, { ...ok, ...bad })), [303, '/fejl'], JSON.stringify(bad));
  }
});

test('signup links the event, keeps only known diet choices, and refuses closed events', async () => {
  const calls = stub(created);
  const ok = { navn: 'B', kommer: 'Ja', event: 'recMnXWr0zAMUocMaW2', kost: ['Vegetar', 'Nødder'] };
  assert.deepEqual(to(await post(signup, ok)), [303, '/#tak-tilmelding']);
  assert.deepEqual(sent(calls), { fldbQRz7MyIYFrvjAOa: 'B', fldZBYy9loY1AKCMFp8: { id: 'recMnXWr0zAMUocMaW2' }, fldPl4G6NSeaLAwYIwn: 'Ja', fldZi27oUycy6ltbo3o: ['Vegetar', 'Nødder'] });
  assert.deepEqual(to(await post(signup, { ...ok, kost: ['Gift'] })), [303, '/fejl']);
  assert.deepEqual(to(await post(signup, { ...ok, kommer: 'Altid' })), [303, '/fejl']);
  stub(created, { fields: {} });
  assert.deepEqual(to(await post(signup, ok)), [303, '/fejl']);
});
