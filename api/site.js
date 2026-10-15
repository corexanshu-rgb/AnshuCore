import { getSite, hash, send } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
  try {
    const site = await getSite();
    let list = [];
    try { list = (await hash('rat')).filter((r) => r.approved).sort((a, b) => b.ts - a.ts); } catch {}
    const dist = [0, 0, 0, 0, 0, 0];
    list.forEach((r) => { dist[r.stars]++; });
    const count = list.length;
    const avg = count ? list.reduce((a, r) => a + r.stars, 0) / count : 0;
    const items = list.slice(0, 40).map((r) => ({ id: r.id, name: r.name, stars: r.stars, text: r.text, ts: r.ts }));

    const publicSite = {
      ...site,
      apps: (site.apps || []).filter((a) => a.published !== false)
    };

    res.status(200).setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=30');
    res.json({ site: publicSite, ratings: { avg, count, dist, items } });
  } catch (e) {
    send(res, 500, { error: 'Could not load site' });
  }
}
