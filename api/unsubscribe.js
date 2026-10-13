import { handler, email, teable } from './form.js';

const EMAIL = 'fldTPvuAu5W4G7IYK3F';

export const onRequestPost = handler('tblc0NbT3ShlCxvUuPN', '/#afmeldt', form => {
  const e = email(form.get('email'));
  return e && { e };
}, null, async (env, tableId, { e }) => {
  const filter = encodeURIComponent(JSON.stringify({ conjunction: 'and', filterSet: [{ fieldId: EMAIL, operator: 'is', value: e }] }));
  const res = await teable(env, `/api/table/${tableId}/record?fieldKeyType=id&take=100&filter=${filter}`);
  if (!res.ok) throw new Error(`Teable ${res.status}`);
  for (const { id } of (await res.json()).records) {
    const del = await teable(env, `/api/table/${tableId}/record/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!del.ok) throw new Error(`Teable ${del.status}`);
  }
});
