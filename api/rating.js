import { db, body, ip, limit, send, rid, clean } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = body(req);
  if (b.website) return send(res, 200, { ok: true });
  const stars = Math.round(Number(b.stars)), name = clean(b.name, 60), text = clean(b.text, 500);
  if (!(stars >= 1 && stars <= 5)) return send(res, 400, { error: 'Please choose a star rating.' });
  if (name.length < 2) return send(res, 400, { error: 'Please enter your name.' });
  try {
    if (!(await limit('rl:rat:' + ip(req), 3, 3600))) return send(res, 429, { error: 'Too many submissions. Please try again later.' });
    const id = rid('v');
    await db('HSET', 'rat', id, JSON.stringify({ id, ts: Date.now(), name, stars, text, approved: false }));
    send(res, 200, { ok: true });
  } catch (e) {
    send(res, 500, { error: 'Could not save your review. Please try again.' });
  }
}
