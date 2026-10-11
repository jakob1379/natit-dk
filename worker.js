import { onRequestGet as quotes } from './api/quotes.js';
import { onRequestPost as subscribe } from './api/subscribe.js';
import { onRequestPost as unsubscribe } from './api/unsubscribe.js';
import { onRequestPost as quote } from './api/quote.js';
import { onRequestPost as signup } from './api/signup.js';

const routes = {
  'GET /api/quotes': quotes,
  'POST /api/subscribe': subscribe,
  'POST /api/unsubscribe': unsubscribe,
  'POST /api/quote': quote,
  'POST /api/signup': signup,
};

export default {
  async fetch(request, env, ctx) {
    const route = routes[`${request.method} ${new URL(request.url).pathname}`];
    if (!route) return Response.json({ error: 'not found' }, { status: 404 });
    if (request.method === 'POST' && !(await env.LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') || '' })).success) {
      return Response.json({ error: 'rate' }, { status: 429 });
    }
    return route({ request, env, waitUntil: p => ctx.waitUntil(p) });
  },
};
