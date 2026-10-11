import { handler, email } from './form.js';

export const onRequestPost = handler('tblQF46ewA23Jf3XTDC', form => {
  const e = email(form.get('email'));
  return e && { fldMEzaBmY41wYSo5sn: e };
});
