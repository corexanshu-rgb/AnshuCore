import { db, hash, getSite, cleanSite, checkLogin, sessionCookie, isAdmin, body, ip, limit, send, rid, clean, hasDb } from './_lib.js';

export default async function handler(req, res) {
  const action = String(req.query?.action || '');
  const b = body(req);
  try {
    if (action === 'login' && req.method === 'POST') {
      try { if (!(await limit('rl:login:' + ip(req), 8, 600))) return send(res, 429, { error: 'Too many attempts. Try again in a few minutes.' }); } catch {}
      if (!checkLogin(b.email || '', b.password || '')) return send(res, 401, { error: 'Incorrect email or password.' });
      res.setHeader('Set-Cookie', sessionCookie(true));
      return send(res, 200, { ok: true });
    }
    if (action === 'logout') { res.setHeader('Set-Cookie', sessionCookie(false)); return send(res, 200, { ok: true }); }
    if (action === 'me') {
      let dbOk = false, dbErr = '';
      try { await db('GET', 'ping'); dbOk = true; } catch (e) { dbErr = e.message; }
      return send(res, 200, { admin: isAdmin(req), db: dbOk, dbErr, configured: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET) });
    }
    if (!isAdmin(req)) return send(res, 401, { error: 'Not signed in' });

    if (action === 'data' && req.method === 'GET') {
      const site = await getSite();
      let requests = [], ratings = [], dbError = '';
      try { [requests, ratings] = await Promise.all([hash('req'), hash('rat')]); } catch (e) { dbError = e.message; }
      requests.sort((a, c) => c.ts - a.ts); ratings.sort((a, c) => c.ts - a.ts);
      return send(res, 200, { site, requests, ratings, dbError });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
    if (action === 'save') {
      const site = cleanSite(b.site || {});
      const s = JSON.stringify(site);
      if (s.length > 900000) return send(res, 400, { error: 'Content is too large. Use a smaller photo.' });
      await db('SET', 'site', s);
      return send(res, 200, { ok: true, site });
    }
    if (action === 'reqStatus') {
      const all = await hash('req'), r = all.find((x) => x.id === b.id);
      if (!r) return send(res, 404, { error: 'Not found' });
      if (!['New', 'Contacted', 'In progress', 'Done'].includes(b.status)) return send(res, 400, { error: 'Bad status' });
      r.status = b.status; await db('HSET', 'req', r.id, JSON.stringify(r));
      return send(res, 200, { ok: true });
    }
    if (action === 'reqDelete') { await db('HDEL', 'req', String(b.id)); return send(res, 200, { ok: true }); }
    if (action === 'ratingSet') {
      const all = await hash('rat'), r = all.find((x) => x.id === b.id);
      if (!r) return send(res, 404, { error: 'Not found' });
      r.approved = !!b.approved; await db('HSET', 'rat', r.id, JSON.stringify(r));
      return send(res, 200, { ok: true });
    }
    if (action === 'ratingDelete') { await db('HDEL', 'rat', String(b.id)); return send(res, 200, { ok: true }); }
    if (action === 'ratingAdd') {
      const stars = Math.round(Number(b.stars)), name = clean(b.name, 60);
      if (!(stars >= 1 && stars <= 5) || name.length < 2) return send(res, 400, { error: 'Name and rating are required.' });
      const id = rid('v'), r = { id, ts: Date.now(), name, stars, text: clean(b.text, 500), approved: true };
      await db('HSET', 'rat', id, JSON.stringify(r));
      return send(res, 200, { ok: true, rating: r });
    }
    return send(res, 400, { error: 'Unknown action' });
  } catch (e) {
    return send(res, 500, { error: e.message || 'Server error' });
  }
}
