import { handler, email, text, compact } from './form.js';

const SPOR = new Set(['Fysik', 'Geografi', 'Geologi', 'Kemi', 'Matematik', 'Molekylærbiologi og bioteknologi', 'Økologi og natur']);

export const onRequestPost = handler('tblFW1AiHL2M6sQvuZd', '/#tak-citat', form => {
  const citat = text(form, 'citat', 280), navn = text(form, 'navn', 80), spor = text(form, 'spor', 60);
  const aar = text(form, 'aargang', 4), link = text(form, 'link', 500), mail = text(form, 'email', 254);
  const e = mail ? email(mail) : '';
  if (!citat || !navn || form.get('samtykke') !== 'ja' || e === null) return null;
  if (spor && !SPOR.has(spor)) return null;
  if (aar && !(/^\d{4}$/.test(aar) && +aar >= 1990 && +aar <= 2100)) return null;
  if (link && !/^https?:\/\/\S+$/i.test(link)) return null;
  return compact({
    fldJdyojNUZW0pn2dN9: citat,
    fldTcoMSOISzLx12oZI: navn,
    fldOpq13iGpBKTdsFm8: spor,
    fld2Wcj1cAVuaoLwOWd: aar && +aar,
    fldpFeW5YS7qvvJdcfS: text(form, 'nu', 120),
    fldPZvcMdBv5g2ogi2A: link,
    fld3ZIm6tSBYzbJeeVk: e,
    fldIOLbj9TOEVM2Qd5w: true,
  });
});
