import crypto from 'node:crypto';
import { DEFAULTS } from './_defaults.js';

const E = process.env;
const pick = (re) => { const k = Object.keys(E).find((x) => re.test(x) && !/READ_ONLY/.test(x)); return k ? E[k] : undefined; };
const URL_ = E.UPSTASH_REDIS_REST_URL || E.KV_REST_API_URL || pick(/REST(_API)?_URL$/);
const TOK = E.UPSTASH_REDIS_REST_TOKEN || E.KV_REST_API_TOKEN || pick(/REST(_API)?_TOKEN$/);
const mem = globalThis.__mem || (globalThis.__mem = { s: new Map(), h: new Map() });
export const hasDb = !!URL_;

export async function db(...c) {
  if (URL_) {
    const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify(c) });
    const j = await r.json().catch(() => ({ error: 'Database returned an invalid response' }));
    if (j.error) throw new Error('Database error: ' + j.error);
    return j.result;
  }
  if (process.env.VERCEL) throw new Error('Database is not connected. Connect Upstash Redis in Vercel Storage and redeploy.');
  const [op, k, ...a] = c;
  if (op === 'GET') return mem.s.get(k) ?? null;
  if (op === 'SET') { mem.s.set(k, a[0]); return 'OK'; }
  if (op === 'HSET') { const m = mem.h.get(k) || new Map(); m.set(a[0], a[1]); mem.h.set(k, m); return 1; }
  if (op === 'HGETALL') { const m = mem.h.get(k); return m ? [...m].flat() : []; }
  if (op === 'HDEL') { const m = mem.h.get(k); return m && m.delete(a[0]) ? 1 : 0; }
  if (op === 'INCR') { const v = (+mem.s.get(k) || 0) + 1; mem.s.set(k, String(v)); return v; }
  if (op === 'EXPIRE') return 1;
  throw new Error('Unsupported');
}

export async function hash(key) {
  const a = await db('HGETALL', key);
  const out = [];
  for (let i = 0; i < (a || []).length; i += 2) { try { out.push(JSON.parse(a[i + 1])); } catch {} }
  return out;
}

export async function getCache(key) {
  try {
    const raw = await db('GET', key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCache(key, val, ttlSecs = 900) {
  try {
    const s = JSON.stringify(val);
    await db('SET', key, s);
    if (ttlSecs > 0) await db('EXPIRE', key, ttlSecs);
  } catch {}
}

export function parseGithubRepo(v) {
  if (!v || typeof v !== 'string') return null;
  const clean = v.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
  const parts = clean.split('/');
  if (parts.length !== 2) return null;
  const safeRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
  const owner = parts[0].trim();
  const repo = parts[1].trim();
  if (!safeRegex.test(owner) || !safeRegex.test(repo)) return null;
  return { owner, repo, full: `${owner}/${repo}` };
}

export function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'app';
}

function merge(d, s) {
  if (Array.isArray(d) || typeof d !== 'object' || d === null) return s === undefined ? d : s;
  const o = { ...d };
  if (s && typeof s === 'object') for (const k of Object.keys(s)) o[k] = merge(d[k], s[k]);
  return o;
}

function migrateApps(saved) {
  let apps = Array.isArray(saved.apps) ? saved.apps : [];
  if (apps.length === 0 && saved.apk && (saved.apk.repo || saved.apk.title)) {
    const gh = parseGithubRepo(saved.apk.repo);
    apps = [{
      id: 'app_migrated_' + (saved.apk.title ? slugify(saved.apk.title) : 'default'),
      slug: slugify(saved.apk.title || 'anshucore-app'),
      name: saved.apk.title || 'AnshuCore Android App',
      icon: 'android',
      shortDescription: saved.apk.desc || 'Manage your requests and projects from your phone.',
      category: 'Business & Management',
      repositoryOwner: gh ? gh.owner : '',
      repositoryName: gh ? gh.repo : '',
      published: true,
      featured: true,
      relatedAppIds: [],
      uses: Array.isArray(saved.apk.uses) ? saved.apk.uses : ['Manage requests and projects on the go', 'Quick access to your dashboard', 'Direct updates through GitHub releases'],
      req: saved.apk.req || 'Android 7.0 or later',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }];
  } else if (apps.length === 0 && Array.isArray(DEFAULTS.apps)) {
    apps = JSON.parse(JSON.stringify(DEFAULTS.apps));
  }

  // Enforce single featured app constraint
  let featuredIndex = apps.findIndex((a) => a.featured);
  if (featuredIndex === -1 && apps.length > 0) {
    const firstPub = apps.findIndex((a) => a.published !== false);
    featuredIndex = firstPub >= 0 ? firstPub : 0;
  }
  apps.forEach((a, idx) => { a.featured = idx === featuredIndex; });
  return apps;
}

export async function getSite() {
  let saved = null;
  const raw = await db('GET', 'site');
  if (raw) {
    try { saved = JSON.parse(raw); } catch (e) { throw new Error('Stored site data is corrupted'); }
  }
  const site = merge(DEFAULTS, saved || {});
  site.apps = migrateApps(site);
  
  // Backward compatibility: keep site.apk synchronized with the featured app
  const featured = site.apps.find((a) => a.featured) || site.apps[0];
  if (featured) {
    const repoStr = featured.repositoryOwner && featured.repositoryName ? `${featured.repositoryOwner}/${featured.repositoryName}` : '';
    site.apk = {
      repo: repoStr,
      title: featured.name,
      desc: featured.shortDescription,
      uses: featured.uses || [],
      req: featured.req || 'Android 7.0 or later'
    };
  }
  return site;
}

const str = (v, n) => String(v ?? '').trim().slice(0, n);
const arr = (v, f) => (Array.isArray(v) ? v.slice(0, 60).map(f) : []);
const url = (v) => { v = str(v, 300); if (!v) return ''; if (/^(https?:\/\/|mailto:|tel:)/i.test(v)) return v; if (/^[\w.-]+\.[a-z]{2,}/i.test(v)) return 'https://' + v; return ''; };

export function cleanApps(list) {
  if (!Array.isArray(list)) return [];
  const usedSlugs = new Set();
  const cleaned = [];
  
  for (let i = 0; i < Math.min(list.length, 50); i++) {
    const a = list[i];
    if (!a || typeof a !== 'object') continue;
    const name = str(a.name, 100);
    if (!name) continue;
    
    let baseSlug = slugify(a.slug || name);
    let s = baseSlug;
    let counter = 1;
    while (usedSlugs.has(s)) {
      s = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(s);
    
    let ghOwner = '', ghRepo = '';
    if (a.repositoryOwner && a.repositoryName) {
      const gh = parseGithubRepo(`${a.repositoryOwner}/${a.repositoryName}`);
      if (gh) { ghOwner = gh.owner; ghRepo = gh.repo; }
    } else if (a.repo) {
      const gh = parseGithubRepo(a.repo);
      if (gh) { ghOwner = gh.owner; ghRepo = gh.repo; }
    }
    
    cleaned.push({
      id: str(a.id, 50) || rid('app_'),
      slug: s,
      name,
      icon: str(a.icon, 300) || 'android',
      shortDescription: str(a.shortDescription || a.desc, 300),
      category: str(a.category, 60) || 'General',
      repositoryOwner: ghOwner,
      repositoryName: ghRepo,
      published: a.published !== false,
      featured: !!a.featured,
      relatedAppIds: Array.isArray(a.relatedAppIds) ? a.relatedAppIds.slice(0, 10).map((x) => str(x, 50)).filter(Boolean) : [],
      uses: Array.isArray(a.uses) ? a.uses.slice(0, 10).map((x) => str(x, 150)).filter(Boolean) : [],
      req: str(a.req, 100) || 'Android 7.0 or later',
      createdAt: Number(a.createdAt) || Date.now(),
      updatedAt: Date.now()
    });
  }

  // Enforce single Super APK
  let featuredIndex = cleaned.findIndex((a) => a.featured);
  if (featuredIndex === -1 && cleaned.length > 0) {
    const firstPub = cleaned.findIndex((a) => a.published);
    featuredIndex = firstPub >= 0 ? firstPub : 0;
  }
  cleaned.forEach((a, idx) => { a.featured = idx === featuredIndex; });
  return cleaned;
}

export function cleanSite(b) {
  const m = b.me || {}, h = b.hero || {}, a = b.apk || {}, p = b.pages || {};
  const photo = typeof m.photo === 'string' && (m.photo === '' || /^data:image\/(jpeg|png|webp);base64,/.test(m.photo)) && m.photo.length < 400000 ? m.photo : '';
  const show = {}; for (const k of Object.keys(DEFAULTS.show)) show[k] = b.show && b.show[k] === 0 ? 0 : 1;
  const apps = cleanApps(b.apps || []);
  
  // Sync legacy apk field with featured app
  const featured = apps.find((x) => x.featured) || apps[0];
  const legacyApk = featured ? {
    repo: featured.repositoryOwner && featured.repositoryName ? `${featured.repositoryOwner}/${featured.repositoryName}` : str(a.repo, 200),
    title: featured.name,
    desc: featured.shortDescription,
    uses: featured.uses || [],
    req: featured.req || 'Android 7.0 or later'
  } : {
    repo: str(a.repo, 200),
    title: str(a.title, 100),
    desc: str(a.desc, 600),
    uses: arr(a.uses, (x) => str(x, 150)).filter(Boolean),
    req: str(a.req, 100)
  };

  return {
    me: { name: str(m.name, 80), title: str(m.title, 100), bio: str(m.bio, 1200), photo, email: str(m.email, 120), phone: str(m.phone, 30), whatsapp: str(m.whatsapp, 30), address: str(m.address, 200) },
    hero: { badge: str(h.badge, 80), h: str(h.h, 160), p: str(h.p, 400) },
    show,
    budget: { presets: (Array.isArray(b.budget?.presets) ? b.budget.presets : DEFAULTS.budget.presets).map(Number).filter((n) => n >= 1000 && n <= 10000000).slice(0, 6) },
    services: arr(b.services, (s) => ({ icon: str(s.icon, 40) || 'widgets', name: str(s.name, 80), short: str(s.short, 200), details: str(s.details, 2000), features: arr(s.features, (x) => str(x, 120)).filter(Boolean) })).filter((s) => s.name),
    why: arr(b.why, (s) => ({ icon: str(s.icon, 40) || 'check_circle', title: str(s.title, 80), short: str(s.short, 200), details: str(s.details, 3000), points: arr(s.points, (x) => str(x, 120)).filter(Boolean) })).filter((s) => s.title),
    projects: arr(b.projects, (s) => ({ name: str(s.name, 100), cat: str(s.cat, 60), url: url(s.url), desc: str(s.desc, 1500) })).filter((s) => s.name),
    faq: arr(b.faq, (s) => ({ c: str(s.c, 40) || 'General', q: str(s.q, 200), a: str(s.a, 1500) })).filter((s) => s.q && s.a),
    social: arr(b.social, (s) => ({ url: url(s.url), label: str(s.label, 40) })).filter((s) => s.url),
    apps,
    apk: legacyApk,
    pages: { about: str(p.about, 8000), privacy: str(p.privacy, 12000) }
  };
}

const sig = (p) => crypto.createHmac('sha256', process.env.SESSION_SECRET || '').update(p).digest('hex');
const eq = (a, b) => { const A = Buffer.from(String(a)), B = Buffer.from(String(b)); return A.length === B.length && crypto.timingSafeEqual(A, B); };
const sha = (t) => crypto.createHash('sha256').update(t).digest('hex');
export function checkLogin(email, pass) {
  const E = process.env.ADMIN_EMAIL, P = process.env.ADMIN_PASSWORD;
  if (!E || !P || !process.env.SESSION_SECRET) return false;
  const a = eq(sha(String(email).trim().toLowerCase()), sha(E.trim().toLowerCase()));
  const b = eq(sha(String(pass)), sha(P));
  return a && b;
}
export function sessionCookie(on) {
  const exp = Date.now() + 7 * 864e5;
  const v = on ? exp + '.' + sig(String(exp)) : '';
  return `admin=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${on ? 604800 : 0}`;
}
export function isAdmin(req) {
  const m = /(?:^|;\s*)admin=([^;]+)/.exec(req.headers.cookie || '');
  if (!m || !process.env.SESSION_SECRET) return false;
  const [p, s] = m[1].split('.');
  return !!(p && s && +p > Date.now() && eq(s, sig(p)));
}
export const body = (req) => { let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } } return b && typeof b === 'object' ? b : {}; };
export const ip = (req) => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
export async function limit(key, max, secs, failClosed = false) {
  try {
    const n = await db('INCR', key);
    if (n === 1) await db('EXPIRE', key, secs);
    return n <= max;
  } catch {
    return !failClosed;
  }
}
export const send = (res, code, data) => { res.status(code).setHeader('Cache-Control', 'no-store'); res.json(data); };
export const rid = (p) => p + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
export const clean = str;
