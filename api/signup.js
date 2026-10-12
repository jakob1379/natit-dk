import { handler, email, text, compact, teable } from './form.js';

const KOMMER = new Set(['Ja', 'Måske', 'Nej']);
const KOST = new Set(['Vegetar', 'Vegansk', 'Glutenfri', 'Laktosefri', 'Nødder', 'Fisk og skaldyr', 'Intet svinekød']);

export const onRequestPost = handler('tblDziiPvSXuOwfHtmM', '/#tak-tilmelding', form => {
  const navn = text(form, 'navn', 200), kommer = text(form, 'kommer', 10), event = text(form, 'event', 40), mail = text(form, 'email', 254);
  const kost = [...new Set(form.getAll('kost').map(String))];
  const e = mail ? email(mail) : '';
  if (!navn || !KOMMER.has(kommer) || !/^rec[A-Za-z0-9]+$/.test(event) || e === null || !kost.every(k => KOST.has(k))) return null;
  return compact({
    fldbQRz7MyIYFrvjAOa: navn,
    fldZBYy9loY1AKCMFp8: { id: event },
    fldPl4G6NSeaLAwYIwn: kommer,
    fldOSOs92nios4yjoyp: e,
    fldZi27oUycy6ltbo3o: kost.length ? kost : '',
    fldqY45gb1NJAkJCXZG: text(form, 'bemaerkning', 1000),
  });
}, async (fields, env) => {
  const res = await teable(env, `/api/table/tbldAIQvH0lucSpwhjo/record/${fields.fldZBYy9loY1AKCMFp8.id}?fieldKeyType=id`);
  return res.ok && (await res.json()).fields?.fldksmMgIzszasDc6Yc === true;
});
