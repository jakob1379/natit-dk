import { render } from './api/page.js';
import { onRequestPost as subscribe } from './api/subscribe.js';
import { onRequestPost as unsubscribe } from './api/unsubscribe.js';
import { onRequestPost as quote } from './api/quote.js';
import { onRequestPost as signup } from './api/signup.js';

const routes = {
  'POST /api/subscribe': subscribe,
  'POST /api/unsubscribe': unsubscribe,
  'POST /api/quote': quote,
  'POST /api/signup': signup,
};

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) return render(request, env, ctx);
    const route = routes[`${request.method} ${pathname}`];
    if (!route) return Response.json({ error: 'not found' }, { status: 404 });
    if (!(await env.LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') || '' })).success) {
      return Response.redirect(new URL('/fejl', request.url), 303);
    }
    return route({ request, env, waitUntil: p => ctx.waitUntil(p) });
  },
};
