import { handler, email, text, compact } from './form.js';

export const onRequestPost = handler('tblc0NbT3ShlCxvUuPN', form => {
  const e = email(form.get('email'));
  return e && compact({ fldTPvuAu5W4G7IYK3F: e, fldP8QgK7Fe5Uqz1iZO: text(form, 'name', 200) });
});
