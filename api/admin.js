import { db, hash, getSite, cleanSite, cleanApps, slugify, checkLogin, sessionCookie, isAdmin, body, ip, limit, send, rid, clean, hasDb } from './_lib.js';

export default async function handler(req, res) {
  const action = String(req.query?.action || '');
  const b = body(req);
  try {
    if (action === 'login' && req.method === 'POST') {
      const allowed = await limit('rl:login:' + ip(req), 8, 600, true);
      if (!allowed) return send(res, 429, { error: 'Too many login attempts. Try again in a few minutes.' });
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
    if (action === 'appSave') {
      const site = await getSite();
      const appData = b.app || {};
      const name = clean(appData.name, 100);
      if (!name) return send(res, 400, { error: 'Application name is required.' });

      let apps = Array.isArray(site.apps) ? [...site.apps] : [];
      const id = clean(appData.id, 50) || rid('app_');
      const existingIdx = apps.findIndex((a) => a.id === id);

      const updated = {
        id,
        name,
        slug: slugify(appData.slug || name),
        icon: clean(appData.icon, 300) || 'android',
        shortDescription: clean(appData.shortDescription || appData.desc, 300),
        category: clean(appData.category, 60) || 'General',
        repositoryOwner: clean(appData.repositoryOwner, 60),
        repositoryName: clean(appData.repositoryName, 100),
        published: appData.published !== false,
        featured: !!appData.featured,
        relatedAppIds: Array.isArray(appData.relatedAppIds) ? appData.relatedAppIds.slice(0, 10).map((x) => clean(x, 50)).filter(Boolean) : [],
        uses: Array.isArray(appData.uses) ? appData.uses.slice(0, 10).map((x) => clean(x, 150)).filter(Boolean) : [],
        req: clean(appData.req, 100) || 'Android 7.0 or later',
        createdAt: existingIdx >= 0 ? apps[existingIdx].createdAt : Date.now(),
        updatedAt: Date.now()
      };

      if (existingIdx >= 0) apps[existingIdx] = updated;
      else apps.push(updated);

      site.apps = cleanApps(apps);
      const cleaned = cleanSite(site);
      const s = JSON.stringify(cleaned);
      if (s.length > 900000) return send(res, 400, { error: 'Payload too large.' });
      await db('SET', 'site', s);
      return send(res, 200, { ok: true, site: cleaned, app: updated });
    }
    if (action === 'appDelete') {
      const site = await getSite();
      const id = String(b.id || '');
      site.apps = (site.apps || []).filter((a) => a.id !== id);
      const cleaned = cleanSite(site);
      await db('SET', 'site', JSON.stringify(cleaned));
      return send(res, 200, { ok: true, site: cleaned });
    }
    if (action === 'appTogglePublish') {
      const site = await getSite();
      const id = String(b.id || '');
      const a = (site.apps || []).find((x) => x.id === id);
      if (!a) return send(res, 404, { error: 'Application not found' });
      a.published = !a.published;
      const cleaned = cleanSite(site);
      await db('SET', 'site', JSON.stringify(cleaned));
      return send(res, 200, { ok: true, site: cleaned });
    }
    if (action === 'appSetFeatured') {
      const site = await getSite();
      const id = String(b.id || '');
      (site.apps || []).forEach((a) => { a.featured = (a.id === id); });
      const cleaned = cleanSite(site);
      await db('SET', 'site', JSON.stringify(cleaned));
      return send(res, 200, { ok: true, site: cleaned });
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
