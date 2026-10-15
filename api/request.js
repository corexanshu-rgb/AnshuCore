import { db, body, ip, limit, send, rid, clean } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });
  const b = body(req);
  if (b.website) return send(res, 200, { ok: true });
  const name = clean(b.name, 80), phone = clean(b.phone, 20).replace(/[^\d+]/g, ''), email = clean(b.email, 120);
  if (name.length < 2) return send(res, 400, { error: 'Please enter your name.' });
  const phoneOk = /^\+?\d{10,14}$/.test(phone), emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!phoneOk && !emailOk) return send(res, 400, { error: 'Enter a valid phone number or email.' });
  const budgetNum = Math.round(Number(b.budgetNum));
  if (!(budgetNum >= 1000 && budgetNum <= 100000000)) return send(res, 400, { error: 'Please choose or enter a budget.' });
  try {
    if (!(await limit('rl:req:' + ip(req), 6, 3600))) return send(res, 429, { error: 'Too many requests. Please try again later.' });
    const id = rid('r');
    const r = {
      id, ts: Date.now(), status: 'New',
      name, phone: phoneOk ? phone : '', email: emailOk ? email : '',
      service: clean(b.service, 80) || 'Other',
      features: (Array.isArray(b.features) ? b.features : []).slice(0, 30).map((x) => clean(x, 120)).filter(Boolean),
      budgetNum, budgetType: b.budgetType === 'custom' ? 'custom' : 'preset',
      timeline: clean(b.timeline, 60), via: ['Call', 'WhatsApp', 'Email'].includes(b.via) ? b.via : 'Call',
      msg: clean(b.msg, 2000)
    };
    await db('HSET', 'req', id, JSON.stringify(r));
    send(res, 200, { ok: true, id });
  } catch (e) {
    send(res, 500, { error: 'Could not save your request. Please try again or email directly.' });
  }
}
