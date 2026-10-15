import { esc, mi, inr, LOGO, api, stars, rich, socials } from './lib.js';

const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const app = $('#app');
let S, R, K = null, APPS = [], SUPER = null, APP_DETAIL = null;
let catSearchQ = '', catFilter = 'All';

const TECH = ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Android', 'GitHub', 'REST APIs', 'Responsive design'].map((t) => `<span>${t}</span>`).join('');
const date = (t) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const size = (b) => (b / 1048576).toFixed(1) + ' MB';
const more = (t) => `<span class="more">${t}${mi('arrow_forward')}</span>`;
const head = (t, s) => `<div class="sh rv"><h2>${t}</h2>${s ? `<p>${s}</p>` : ''}</div>`;
const list = (a) => `<ul class="ft">${a.map((x) => `<li>${mi('check_circle')}${esc(x)}</li>`).join('')}</ul>`;
const pg = (b) => `<div class="w"><div class="page">${b}</div></div>`;
const back = (href, t = 'Back') => `<a class="back" href="${href}">${mi('arrow_back')}${t}</a>`;
const sec = (k, al, body) => (S.show[k] ? `<section class="sec${al ? ' al' : ''}" id="${k}"><div class="w">${body}</div></section>` : '');
const ph = () => (S.me.photo ? `<img alt="${esc(S.me.name)}" src="${S.me.photo}">` : `<div>${mi('person')}<br>Photo</div>`);

function appIco(icon, cls = '') {
  if (typeof icon === 'string' && (icon.startsWith('data:image/') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/'))) {
    return `<div class="app-ico ${cls}"><img src="${esc(icon)}" alt=""></div>`;
  }
  return `<div class="app-ico ${cls}">${mi(icon || 'android')}</div>`;
}

/* ---------- boot ---------- */
async function boot() {
  try {
    const d = await api('/api/site');
    S = d.site;
    R = d.ratings;
  } catch {
    app.innerHTML = '<div class="w page"><h2>The site is unavailable</h2><p class="sub">Please try again in a moment.</p></div>';
    return;
  }

  api('/api/apk').then((k) => {
    K = k;
    APPS = k.apps || [];
    SUPER = k.featuredApp || null;
    const cur = parse();
    if (['home', 'apk'].includes(cur.k)) render(true);
  }).catch(() => {});

  document.addEventListener('click', onClick);
  addEventListener('popstate', () => {
    APP_DETAIL = null;
    render();
  });
  render();
}

const parse = () => {
  const s = location.pathname.split('/').filter(Boolean);
  return { k: s[0] || 'home', a: s[1], sub: s[2] };
};

function nav(url) {
  history.pushState({}, '', url);
  APP_DETAIL = null;
  render();
}

function onClick(e) {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || /^\/(api|admin)/.test(u.pathname)) return;
  e.preventDefault();
  const sec = a.dataset.s;
  nav(u.pathname + u.search);
  if (sec) setTimeout(() => { const el = document.getElementById(sec); if (el) el.scrollIntoView(); }, 40);
  $('#nv')?.classList.remove('open');
}

/* ---------- layout ---------- */
function layout(inner) {
  const links = [
    ['/', 'Services', 'services', 1],
    ['/work', 'Work', '', S.projects.length && S.show.projects],
    ['/about', 'About', '', 1],
    ['/reviews', 'Reviews', '', S.show.reviews],
    ['/faq', 'FAQ', '', S.show.faq && S.faq.length]
  ].filter((l) => l[3]).map((l) => `<a href="${l[0]}"${l[2] ? ` data-s="${l[2]}"` : ''}>${l[1]}</a>`).join('');

  const apkBtn = S.show.apk ? `<a class="btn s" href="/apk">${mi('android')}Apps</a>` : '';
  const superName = SUPER ? SUPER.name : 'Android applications';

  return `${S.show.apk ? `<div class="ann">${mi('android')}${esc(superName)} &mdash; direct APK distribution via GitHub.<a href="/apk">Browse apps</a></div>` : ''}
<header><div class="w bar"><a class="brand" href="/">${LOGO}AnshuCore</a><nav id="nv">${links}${apkBtn}<a class="btn p s" href="/request" style="color:#fff">Start a project</a></nav><button class="ib" id="mb" aria-label="Menu">${mi('menu')}</button></div></header>
${S.social.length ? `<div class="fsoc">${socials(S.social, '')}</div>` : ''}
${inner}
<footer><div class="w fg"><div><div class="brand">${LOGO}AnshuCore</div><p>Websites, software, and native Android applications for libraries, schools, and growing businesses.</p>${S.social.length ? `<div class="sl">${socials(S.social, '')}</div>` : ''}</div>
<div><b>Explore</b><a href="/" data-s="services">Services</a>${S.projects.length ? '<a href="/work">Work</a>' : ''}<a href="/reviews">Reviews</a><a href="/faq">FAQ</a></div>
<div><b>Company</b><a href="/about">About us</a><a href="/privacy">Privacy policy</a><a href="/request">Start a project</a>${S.show.apk ? '<a href="/apk">Android Apps</a>' : ''}</div>
<div><b>Contact</b><a href="mailto:${esc(S.me.email)}">${esc(S.me.email)}</a>${S.me.phone ? `<a href="tel:${esc(S.me.phone)}">${esc(S.me.phone)}</a>` : ''}${S.me.address ? `<span>${esc(S.me.address)}</span>` : ''}</div></div>
<div class="w fb"><span>&copy; ${new Date().getFullYear()} AnshuCore. All rights reserved.</span><a href="/privacy">Privacy policy</a></div></footer>`;
}

/* ---------- home ---------- */
function statsHtml() {
  const a = [];
  if (S.projects.length) a.push([S.projects.length, 'Projects delivered']);
  if (R.count) { a.push([R.avg.toFixed(1), 'Average rating']); a.push([R.count, 'Client reviews']); }
  return a.length ? `<div class="stats rv" style="--n:${a.length}">${a.map((x) => `<div><b class="cn" data-v="${x[0]}">0</b><span>${x[1]}</span></div>`).join('')}</div>` : '';
}

function reviewCards(n) {
  return R.items.slice(0, n).map((r, i) => `<div class="card rv" style="--d:${i * .06}s">${stars(r.stars)}<p style="color:var(--tx);margin:12px 0 16px">${esc(r.text) || 'Rated ' + r.stars + ' out of 5.'}</p><h3 style="font-size:16px">${esc(r.name)}</h3><p style="margin:0">${date(r.ts)}</p></div>`).join('');
}

function ratingSummary() {
  return `<div class="panel-r rb rv"><div><b>${R.avg.toFixed(1)}</b>${stars(R.avg)}<div class="sub" style="font-size:14px">${R.count} review${R.count === 1 ? '' : 's'}</div></div><div>${[5, 4, 3, 2, 1].map((n) => `<div class="bar2"><span>${n}</span><i><s style="width:${R.count ? R.dist[n] / R.count * 100 : 0}%"></s></i><span>${R.dist[n]}</span></div>`).join('')}</div></div>`;
}

function rateForm() {
  return `<form class="fm rv" id="rtf" novalidate><h3 style="margin-bottom:4px">Rate your experience</h3><p class="sub" style="font-size:14px">Your review appears on the site after approval.</p>
<label>Your rating</label><div class="stin" id="stin">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-v="${i}" aria-label="${i} star${i > 1 ? 's' : ''}">${mi('star')}</button>`).join('')}</div>
<label for="rn">Name</label><input id="rn" maxlength="60" autocomplete="name"><label for="rt">Your review (optional)</label><textarea id="rt" rows="3" maxlength="500"></textarea>
<input class="hp" id="rw" tabindex="-1" autocomplete="off"><p id="re" style="color:#B91C1C;font-size:13px;margin-top:8px"></p><button class="btn p" style="margin-top:10px" type="submit">Submit review${mi('send')}</button></form>`;
}

/* Genuine, dynamic featured app block on homepage */
function apkBlock() {
  const feat = APPS.find((a) => a.featured) || APPS[0] || (SUPER ? { ...SUPER, slug: SUPER.slug || 'app' } : null);
  const total = K && K.total ? K.total : (feat && feat.totalDownloads ? feat.totalDownloads : null);
  const title = feat ? feat.name : (S.apk ? S.apk.title : 'Android Software');
  const desc = feat ? feat.shortDescription : (S.apk ? S.apk.desc : 'Native Android applications distributed through official GitHub releases.');
  const uses = feat && feat.uses && feat.uses.length ? feat.uses : (S.apk && S.apk.uses ? S.apk.uses : ['Native Android application', 'Direct updates via GitHub Releases']);

  return `<div class="ak">
    <div class="rv">
      <span class="pill"><i></i>Android application</span>
      <h2>${esc(title)}</h2>
      <p class="sub" style="margin:12px 0 4px;max-width:46ch">${esc(desc)}</p>
      ${list(uses)}
      ${total ? `<p style="margin-bottom:20px"><span class="big">${total.toLocaleString('en-IN')}</span> <span class="sub">downloads on GitHub</span></p>` : ''}
      <div class="row">
        ${feat ? `<a class="btn p" href="/apk/${esc(feat.slug)}">${mi('arrow_forward')}Application Details</a>` : ''}
        <a class="btn" href="/apk">${mi('apps')}Browse All Apps</a>
      </div>
    </div>
    <div class="rv" style="--d:.15s">
      <div class="hero-app-card" style="box-shadow:0 24px 50px -20px rgba(37,99,235,.3)">
        <div class="hero-app-head">
          ${appIco(feat?.icon, 'lg')}
          <div>
            <span class="super-badge"><i></i>Super APK</span>
            <h3 style="margin:2px 0 0;font-size:20px">${esc(title)}</h3>
            <span class="sub" style="font-size:13px">${esc(feat?.category || 'Business & Management')}</span>
          </div>
        </div>
        <p class="sub" style="margin:0;font-size:14px">${esc(desc)}</p>
        <div class="hero-app-meta">
          <div>
            <b>${esc(feat?.latestVersion || 'Latest')}</b>
            <span>Release</span>
          </div>
          <div>
            <b>${total ? total.toLocaleString('en-IN') : 'Direct'}</b>
            <span>Downloads</span>
          </div>
        </div>
        <div class="row" style="margin-top:2px">
          ${feat ? `<a class="btn p s" href="/apk/${esc(feat.slug)}" style="flex:1;color:#fff">${mi('download')}Get APK</a>` : ''}
          <a class="btn s" href="/apk" style="flex:1">View Catalog</a>
        </div>
      </div>
    </div>
  </div>`;
}

function home() {
  const sv = S.services.map((s, i) => `<a class="card rv" style="--d:${i * .06}s" href="/services/${i}"><div class="ico">${mi(s.icon)}</div><h3>${esc(s.name)}</h3><p>${esc(s.short)}</p>${more('View details')}</a>`).join('');
  const pj = S.projects.map((p, i) => `<a class="card rv" style="--d:${i * .06}s" href="/work/${i}"><span class="tg">${esc(p.cat || 'Project')}</span><h3 style="margin-top:14px">${esc(p.name)}</h3><p>${esc(p.desc.slice(0, 120))}</p>${more('View project')}</a>`).join('');
  const wy = S.why.map((w, i) => `<a class="card rv" style="--d:${i * .06}s" href="/why/${i}"><div class="ico">${mi(w.icon)}</div><h3>${esc(w.title)}</h3><p>${esc(w.short)}</p>${more('Read more')}</a>`).join('');
  const fq = S.faq.slice(0, 6).map((f) => `<details class="rv"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');

  const feat = APPS.find((a) => a.featured) || APPS[0] || (SUPER ? { ...SUPER, slug: SUPER.slug || 'app' } : null);

  return `<div class="w">
  <section class="hero">
    <div>
      ${S.hero.badge ? `<div class="pill a"><i></i>${esc(S.hero.badge)}</div>` : ''}
      <h1 class="a">${esc(S.hero.h)}</h1>
      <p class="lead a" style="--d:.12s">${esc(S.hero.p)}</p>
      <div class="row a" style="--d:.24s">
        <a class="btn p" href="/request">Start a project${mi('arrow_forward')}</a>
        ${S.show.apk ? `<a class="btn" href="/apk">${mi('android')}Browse Android Apps</a>` : ''}
      </div>
    </div>
    <div class="a" style="--d:.2s">
      <div class="hero-app-card">
        <div class="hero-app-head">
          ${appIco(feat?.icon, 'lg')}
          <div>
            <span class="super-badge"><i></i>Featured Application</span>
            <h3 style="margin:2px 0 0;font-size:20px">${esc(feat?.name || 'AnshuCore Software')}</h3>
            <span class="sub" style="font-size:13px">${esc(feat?.category || 'Business & Management')}</span>
          </div>
        </div>
        <p class="sub" style="margin:0;font-size:14.5px">${esc(feat?.shortDescription || S.hero.p)}</p>
        <div class="hero-app-meta">
          <div>
            <b>${esc(feat?.latestVersion || 'Latest')}</b>
            <span>Release</span>
          </div>
          <div>
            <b>${feat?.totalDownloads ? feat.totalDownloads.toLocaleString('en-IN') : 'Direct'}</b>
            <span>GitHub downloads</span>
          </div>
        </div>
        <div class="row" style="margin-top:2px">
          ${feat ? `<a class="btn p s" href="/apk/${esc(feat.slug)}" style="flex:1;color:#fff">${mi('arrow_forward')}View Details</a>` : ''}
          <a class="btn s" href="/apk" style="flex:1">Catalog</a>
        </div>
      </div>
    </div>
  </section>
  ${statsHtml()}
</div>
<div class="mq"><div class="mt">${TECH}${TECH}</div></div>
${sec('services', 0, head('What I build', 'Pick a service to see the details and send a request.') + `<div class="grid">${sv}</div>`)}
${S.projects.length ? sec('projects', 1, head('Selected work', 'Websites and software delivered to clients.') + `<div class="grid">${pj}</div>`) : ''}
${S.why.length ? sec('why', S.projects.length ? 0 : 1, head('Why work with me') + `<div class="grid">${wy}</div>`) : ''}
${sec('about', 0, `<div class="about"><div class="photo rv">${ph()}</div><div class="rv"><h2>Hi, I am ${esc(S.me.name)}.</h2><p class="sub" style="margin-top:14px;font-size:17px">${esc(S.me.bio)}</p><div class="tags"><span>HTML</span><span>CSS</span><span>JavaScript</span><span>TypeScript</span><span>React</span><span>Android</span></div><a class="btn" href="/about">About us${mi('arrow_forward')}</a></div></div>`)}
${sec('process', 1, head('How it works') + `<div class="steps rv"><div><b>Choose a service</b><p>Select what you need and the features you want.</p></div><div><b>Send your request</b><p>Set a budget and share the details.</p></div><div><b>Plan and demo</b><p>Get a quote, a plan and a working demo.</p></div><div><b>Build and launch</b><p>Go live with support after delivery.</p></div></div>`)}
${sec('reviews', 0, head('Ratings and reviews', 'What clients say, and a place for your own rating.') + `<div class="sg">${R.count ? `<div>${ratingSummary()}<div class="grid">${reviewCards(3)}</div>${R.count > 3 ? `<p style="margin-top:20px"><a class="btn" href="/reviews">All reviews${mi('arrow_forward')}</a></p>` : ''}</div>` : '<div class="rv"><p class="sub">No reviews yet. Be the first to rate.</p></div>'}${rateForm()}</div>`)}
${sec('apk', 1, apkBlock())}
${S.show.faq && S.faq.length ? sec('faq', 0, head('Frequently asked questions') + `${fq}<p style="margin-top:20px"><a class="btn" href="/faq">See all questions${mi('arrow_forward')}</a></p>`) : ''}
<section class="sec" id="start"><div class="w"><div class="cta rv"><div><h2>Have a project in mind?</h2><p>Choose a service, pick your features and set a budget starting at ${inr(S.budget.presets[0] || 5000)}.</p></div><a class="btn p" href="/request">Start a project${mi('arrow_forward')}</a></div></div></section>`;
}

/* ---------- detail pages ---------- */
function svcPage(i) {
  const s = S.services[i]; if (!s) return nf();
  return pg(`${back('/', 'All services')}<div class="ico">${mi(s.icon)}</div><h2>${esc(s.name)}</h2><p class="sub" style="margin-top:8px;max-width:60ch">${esc(s.short)}</p>
<div class="two" style="margin-top:32px;align-items:start;gap:40px"><div class="rich">${rich(s.details)}</div><div class="fm"><h3>What is included</h3>${list(s.features)}<a class="btn p" style="width:100%" href="/request?s=${i}">Request this${mi('arrow_forward')}</a><p class="sub" style="font-size:13px;margin-top:12px">Projects start at ${inr(S.budget.presets[0] || 5000)}.</p></div></div>`);
}

function whyPage(i) {
  const w = S.why[i]; if (!w) return nf();
  return pg(`${back('/#why', 'Back')}<div class="ico">${mi(w.icon)}</div><h2>${esc(w.title)}</h2><p class="sub" style="margin-top:8px;max-width:60ch">${esc(w.short)}</p><div style="max-width:680px;margin-top:24px"><div class="rich">${rich(w.details)}</div>${w.points.length ? list(w.points) : ''}<a class="btn p" href="/request">Start a project${mi('arrow_forward')}</a></div>`);
}

function workPage(i) {
  if (i === undefined) return pg(`${back('/', 'Home')}${head('Selected work', 'Websites and software delivered to clients.')}<div class="grid">${S.projects.map((p, j) => `<a class="card" href="/work/${j}"><span class="tg">${esc(p.cat || 'Project')}</span><h3 style="margin-top:14px">${esc(p.name)}</h3><p>${esc(p.desc.slice(0, 120))}</p>${more('View project')}</a>`).join('') || '<p class="sub">No projects added yet.</p>'}</div>`);
  const p = S.projects[+i]; if (!p) return nf();
  return pg(`${back('/work', 'All work')}<span class="tg">${esc(p.cat || 'Project')}</span><h2 style="margin-top:14px">${esc(p.name)}</h2><div class="rich" style="margin-top:16px;max-width:680px">${rich(p.desc)}</div>${p.url ? `<p style="margin-top:20px"><a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${mi('open_in_new')}Visit website</a></p>` : ''}<a class="btn p" style="margin-top:28px" href="/request">Start a similar project</a>`);
}

const nf = () => pg(`<h2>Page not found</h2><p class="sub" style="margin:8px 0 20px">The page you are looking for does not exist.</p><a class="btn p" href="/">Go home</a>`);

function reviewsPage() {
  return pg(`${back('/', 'Home')}${head('Ratings and reviews')}<div class="sg"><div>${R.count ? ratingSummary() + `<div class="grid">${reviewCards(40)}</div>` : '<p class="sub">No reviews yet. Be the first to rate.</p>'}</div>${rateForm()}</div>`);
}

let faqCat = 'All', faqQ = '';
function faqList() {
  const l = S.faq.filter((f) => (faqCat === 'All' || f.c === faqCat) && (f.q + f.a).toLowerCase().includes(faqQ));
  return l.length ? l.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('') : '<p class="sub">No questions match your search.</p>';
}

function faqPage() {
  const cats = ['All', ...new Set(S.faq.map((f) => f.c))];
  return pg(`${back('/', 'Home')}${head('Frequently asked questions', 'Cannot find your answer? Send a request and I will reply.')}<input id="fq" placeholder="Search questions" style="max-width:420px;margin-bottom:16px"><div class="tabs" id="fc">${cats.map((c) => `<button class="${c === faqCat ? 'on' : ''}">${esc(c)}</button>`).join('')}</div><div id="fl" style="max-width:820px">${faqList()}</div><a class="btn p" style="margin-top:24px" href="/request">Ask or start a project</a>`);
}

function aboutPage() {
  return pg(`${back('/', 'Home')}<div class="about"><div class="photo">${ph()}</div><div><h2>${esc(S.me.name)}</h2><p class="sub">${esc(S.me.title)}</p><p style="margin:16px 0;font-size:17px">${esc(S.me.bio)}</p><div class="tags"><span>HTML</span><span>CSS</span><span>JavaScript</span><span>TypeScript</span><span>React</span><span>Android</span></div></div></div><div class="rich" style="margin-top:48px">${rich(S.pages.about)}</div><a class="btn p" style="margin-top:24px" href="/request">Work with me</a>`);
}

const privacyPage = () => pg(`${back('/', 'Home')}<h2>Privacy policy</h2><div class="rich" style="margin-top:20px">${rich(S.pages.privacy)}</div>`);

/* ---------- APK Catalog View (/apk) ---------- */
function apkCatalogPage() {
  const pubApps = APPS.length ? APPS : (S.apps || []);
  const superApp = pubApps.find((a) => a.featured) || null;
  const cats = ['All', ...new Set(pubApps.map((a) => a.category).filter(Boolean))];

  // Filter apps matching search & category
  const filtered = pubApps.filter((a) => {
    const q = catSearchQ.trim().toLowerCase();
    const qMatch = !q || (a.name + ' ' + (a.category || '') + ' ' + (a.shortDescription || '')).toLowerCase().includes(q);
    const catMatch = catFilter === 'All' || a.category === catFilter;
    return qMatch && catMatch;
  });

  // Strict Super APK behavior: do NOT duplicate Super APK in the catalog grid below
  const catalogList = filtered.filter((a) => a.id !== superApp?.id);

  // Super APK card HTML
  const superHtml = superApp ? `<div class="super-card rv">
    <div class="super-badge"><i></i>Super APK &middot; Featured Application</div>
    <div class="row" style="align-items:flex-start;gap:20px">
      ${appIco(superApp.icon, 'lg')}
      <div style="flex:1">
        <div class="row" style="align-items:center;gap:10px;margin-bottom:6px">
          <h2 style="font-size:26px;margin:0">${esc(superApp.name)}</h2>
          <span class="tg">${esc(superApp.category || 'Featured')}</span>
        </div>
        <p class="sub" style="font-size:15px;margin:0 0 12px;max-width:54ch">${esc(superApp.shortDescription || '')}</p>
        <div class="row" style="align-items:center;gap:16px;font-size:13.5px;color:var(--mu);margin-bottom:16px">
          ${superApp.latestVersion ? `<span>${mi('layers')}<b>${esc(superApp.latestVersion)}</b></span>` : ''}
          ${superApp.totalDownloads ? `<span>${mi('download')}<b>${superApp.totalDownloads.toLocaleString('en-IN')}</b> downloads</span>` : ''}
          ${superApp.req ? `<span>${mi('smartphone')}${esc(superApp.req)}</span>` : ''}
        </div>
        <div class="row">
          <a class="btn p s" href="/apk/${esc(superApp.slug)}" style="color:#fff">${mi('arrow_forward')}View Details &amp; Download</a>
        </div>
      </div>
    </div>
  </div>` : '';

  const gridHtml = catalogList.length ? `<div class="app-grid">${catalogList.map((a) => `<a class="app-card rv" href="/apk/${esc(a.slug)}">
    <div class="app-card-top">
      ${appIco(a.icon)}
      <div style="flex:1;min-width:0">
        <h3 style="margin:0;font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.name)}</h3>
        <span class="tg" style="font-size:11px;margin-top:4px;display:inline-block">${esc(a.category || 'General')}</span>
      </div>
    </div>
    <p style="margin:0;font-size:14px;color:var(--mu);flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(a.shortDescription || '')}</p>
    <div class="app-card-meta">
      <span>${mi('layers')}${esc(a.latestVersion || 'Latest')}</span>
      ${a.totalDownloads ? `<span>${mi('download')}${a.totalDownloads.toLocaleString('en-IN')}</span>` : ''}
      ${a.latestSize ? `<span>${size(a.latestSize)}</span>` : ''}
    </div>
  </a>`).join('')}</div>` : (catSearchQ ? `<div class="rel"><p class="sub">No applications match your search for &quot;${esc(catSearchQ)}&quot;.</p></div>` : '<p class="sub">No additional applications published yet.</p>');

  return pg(`${back('/', 'Home')}
    <div class="sh rv">
      <h2>Android Applications</h2>
      <p>Native Android applications with genuine releases and direct APK downloads hosted on GitHub.</p>
    </div>
    <div class="app-search">
      <span class="mi">search</span>
      <input id="catQ" placeholder="Search applications by name or keyword" value="${esc(catSearchQ)}" aria-label="Search applications">
    </div>
    ${cats.length > 2 ? `<div class="tabs" id="catTabs">${cats.map((c) => `<button class="${c === catFilter ? 'on' : ''}">${esc(c)}</button>`).join('')}</div>` : ''}
    ${superHtml}
    <div style="margin-top:28px">
      <h3 style="margin-bottom:18px">${catSearchQ ? 'Search Results' : 'All Applications'}</h3>
      ${gridHtml}
    </div>`);
}

/* ---------- APK Detail Page (/apk/<slug>) ---------- */
function apkDetailPage(slug) {
  if (!APP_DETAIL || (APP_DETAIL.app && APP_DETAIL.app.slug !== slug && APP_DETAIL.app.id !== slug)) {
    // Initiate background fetch and render placeholder
    api(`/api/apk?slug=${encodeURIComponent(slug)}`).then((d) => {
      APP_DETAIL = d;
      render(true);
    }).catch(() => {
      APP_DETAIL = { error: 'not_found' };
      render(true);
    });
    return pg(`${back('/apk', 'All applications')}<p class="sub">Loading application details...</p>`);
  }

  if (APP_DETAIL.error === 'not_found') {
    return pg(`${back('/apk', 'All applications')}<h2>Application not found</h2><p class="sub" style="margin:8px 0 20px">The requested application does not exist or is unpublished.</p><a class="btn p" href="/apk">View all applications</a>`);
  }

  const { app: item, releases, total, latest, repoUrl, relatedApps } = APP_DETAIL;
  const asset = latest && latest.asset ? latest.asset : null;

  return pg(`${back('/apk', 'All applications')}
    <div class="app-detail-head rv">
      ${appIco(item.icon, 'lg')}
      <div class="app-detail-body">
        <div class="row" style="align-items:center;gap:10px;margin-bottom:6px">
          <h1 style="font-size:32px;letter-spacing:-1px;margin:0">${esc(item.name)}</h1>
          <span class="tg">${esc(item.category || 'General')}</span>
          ${item.featured ? '<span class="tg" style="background:#FEF3C7;color:#92400E;font-weight:700">Super APK</span>' : ''}
        </div>
        <p class="lead" style="margin:8px 0 16px;font-size:16px">${esc(item.shortDescription || '')}</p>
        <div class="app-stats-row">
          <div>Version: <b>${esc(latest?.tag || 'Latest')}</b></div>
          ${asset ? `<div>File size: <b>${size(asset.size)}</b></div>` : ''}
          <div>GitHub downloads: <b>${total !== null && total !== undefined ? total.toLocaleString('en-IN') : 'Direct'}</b></div>
          <div>Requirements: <b>${esc(item.req || 'Android 7.0+')}</b></div>
        </div>
        <div class="row" style="align-items:center;margin-top:20px">
          ${asset ? `<a class="btn p" href="${esc(asset.url)}" target="_blank" rel="noopener noreferrer">${mi('download')}Download APK (${size(asset.size)})</a>` : (repoUrl ? `<a class="btn p" href="${esc(repoUrl)}" target="_blank" rel="noopener noreferrer">${mi('open_in_new')}View Releases on GitHub</a>` : '')}
          ${repoUrl ? `<a class="btn s" href="${esc(repoUrl)}" target="_blank" rel="noopener noreferrer">${mi('open_in_new')}GitHub Repository</a>` : ''}
        </div>
        <p class="sub" style="font-size:12.5px;margin-top:14px">Direct download of official release asset compiled from source and distributed via GitHub Releases.</p>
      </div>
    </div>

    ${item.uses && item.uses.length ? `<div class="pn rv" style="margin-bottom:32px">
      <h3>Key Features</h3>
      ${list(item.uses)}
    </div>` : ''}

    ${releases && releases.length ? `<div style="margin-bottom:48px">
      <h2 style="margin-bottom:18px">Releases &amp; Changelog</h2>
      ${releases.map((r, i) => `<div class="rel rv">
        <div class="row" style="justify-content:space-between;align-items:center">
          <div>
            <h3 style="margin:0">${esc(r.name || r.tag)} ${i === 0 ? '<span class="tg dn">Latest</span>' : ''} ${r.prerelease ? '<span class="tg n">Pre-release</span>' : ''}</h3>
            <small class="sub">${esc(r.tag)} &middot; ${date(r.date)}</small>
          </div>
        </div>
        ${r.body ? `<pre>${esc(r.body)}</pre>` : ''}
        ${(r.assets || []).map((a) => `<div class="asset">
          <div><b>${esc(a.name)}</b><br><small>${size(a.size)} &middot; ${a.downloads.toLocaleString('en-IN')} genuine downloads</small></div>
          <a class="btn p s" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">${mi('download')}Download APK</a>
        </div>`).join('')}
      </div>`).join('')}
    </div>` : ''}

    <div style="margin-top:36px">
      <h2 style="margin-bottom:20px">How to install</h2>
      <div class="steps rv">
        <div><b>1. Download</b><p>Tap Download to obtain the official APK directly from GitHub.</p></div>
        <div><b>2. Allow install</b><p>Enable &quot;Install unknown apps&quot; for your browser in Android settings.</p></div>
        <div><b>3. Install</b><p>Open the downloaded APK file and confirm installation.</p></div>
        <div><b>4. Open</b><p>Launch the application directly from your home screen.</p></div>
      </div>
    </div>

    ${relatedApps && relatedApps.length ? `<div style="margin-top:56px">
      <h2 style="margin-bottom:8px">You may also like</h2>
      <p class="sub" style="margin-bottom:24px">Related verified applications from our catalog.</p>
      <div class="app-grid">
        ${relatedApps.map((ra) => `<a class="app-card rv" href="/apk/${esc(ra.slug)}">
          <div class="app-card-top">
            ${appIco(ra.icon)}
            <div style="flex:1;min-width:0">
              <h3 style="margin:0;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(ra.name)}</h3>
              <span class="tg" style="font-size:11px;margin-top:4px;display:inline-block">${esc(ra.category || 'General')}</span>
            </div>
          </div>
          <p style="margin:0;font-size:13.5px;color:var(--mu);flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(ra.shortDescription || '')}</p>
          ${more('View application')}
        </a>`).join('')}
      </div>
    </div>` : ''}`);
}

/* ---------- request page ---------- */
function reqPage() {
  const q = new URLSearchParams(location.search), si = q.has('s') ? +q.get('s') : -1;
  const chips = S.services.map((s, i) => `<button type="button" data-i="${i}"${i === si ? ' class="on"' : ''}>${esc(s.name)}</button>`).join('') + `<button type="button" data-i="-1"${si < 0 ? ' class="on"' : ''}>Something else</button>`;
  const bud = S.budget.presets.map((n, i) => `<button type="button" data-b="${n}"${i === 0 ? ' class="on"' : ''}>${inr(n)}+</button>`).join('') + '<button type="button" data-b="custom">Custom budget</button>';
  return pg(`${back(si >= 0 ? '/services/' + si : '/', 'Back')}${head('Start your project', 'Tell me what you need. I will reply with a quote and a plan.')}
<form class="fm" id="qf" novalidate style="max-width:820px">
<div class="fs"><h3>1. What do you need?</h3><div class="opt" id="qs">${chips}</div></div>
<div class="fs" id="qfs"></div>
<div class="fs"><h3>3. Budget</h3><div class="opt" id="qb">${bud}</div><div class="amt" id="qa" style="display:none"><span>\u20B9</span><input id="qn" type="number" inputmode="numeric" min="${S.budget.presets[0] || 5000}" step="500" placeholder="Enter amount"></div><p class="sub" style="font-size:13px;margin-top:8px">Projects start at ${inr(S.budget.presets[0] || 5000)}. Final price is confirmed in the quote.</p></div>
<div class="fs"><h3>4. Timeline</h3><div class="opt" id="qt"><button type="button" class="on">Within 2 weeks</button><button type="button">2 to 4 weeks</button><button type="button">1 to 2 months</button><button type="button">Flexible</button></div></div>
<div class="fs"><h3>5. Your details</h3><div class="two"><div><label for="qname">Name</label><input id="qname" autocomplete="name" maxlength="80"></div><div><label for="qph">Phone number</label><input id="qph" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91 98765 43210"></div></div><div class="two"><div><label for="qem">Email (optional if phone given)</label><input id="qem" type="email" autocomplete="email"></div><div><label>Preferred contact</label><div class="opt" id="qv"><button type="button" class="on">Call</button><button type="button">WhatsApp</button><button type="button">Email</button></div></div></div><label for="qm">Project details</label><textarea id="qm" rows="4" maxlength="2000" placeholder="Describe what you want to build"></textarea></div>
<input class="hp" id="qw" tabindex="-1" autocomplete="off"><p id="qe" style="color:#B91C1C;font-size:14px;margin-bottom:10px"></p><button class="btn p" type="submit" id="qsub">Send request${mi('send')}</button></form>`);
}

function feats(i) {
  const s = S.services[i], el = $('#qfs'); if (!el) return;
  el.innerHTML = s && s.features.length ? `<h3>2. Select the features you want</h3><div class="cg">${s.features.map((f) => `<label class="chk"><input type="checkbox" value="${esc(f)}">${esc(f)}</label>`).join('')}</div>` : '<h3>2. Describe what you need in the details below</h3>';
}

function bindReq() {
  const f = $('#qf'); if (!f) return;
  const one = (id, cb) => $$(`#${id} button`).forEach((b) => (b.onclick = () => { $$(`#${id} button`).forEach((x) => x.classList.remove('on')); b.classList.add('on'); cb && cb(b); }));
  let svc = $('#qs .on') ? +$('#qs .on').dataset.i : -1;
  feats(svc);
  one('qs', (b) => { svc = +b.dataset.i; feats(svc); });
  one('qb', (b) => { $('#qa').style.display = b.dataset.b === 'custom' ? 'flex' : 'none'; });
  one('qt'); one('qv');
  f.onsubmit = async (e) => {
    e.preventDefault();
    const err = (m) => { $('#qe').textContent = m; };
    const bb = $('#qb .on'), custom = bb.dataset.b === 'custom', min = S.budget.presets[0] || 5000;
    const num = custom ? Math.round(+$('#qn').value) : +bb.dataset.b;
    const name = $('#qname').value.trim(), phone = $('#qph').value.trim(), email = $('#qem').value.trim();
    if (name.length < 2) return err('Please enter your name.');
    if (!/^\+?\d[\d\s-]{8,14}$/.test(phone) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return err('Enter a valid phone number or email.');
    if (custom && !(num >= min)) return err(`Custom budget must be at least ${inr(min)}.`);
    err('');
    const btn = $('#qsub'); btn.disabled = true; btn.textContent = 'Sending...';
    try {
      await api('/api/request', { method: 'POST', body: JSON.stringify({ name, phone, email, service: svc >= 0 ? S.services[svc].name : 'Something else', features: $$('#qfs input:checked').map((x) => x.value), budgetNum: num, budgetType: custom ? 'custom' : 'preset', timeline: $('#qt .on').textContent, via: $('#qv .on').textContent, msg: $('#qm').value, website: $('#qw').value }) });
      f.innerHTML = `<div class="ok">${mi('check_circle')}<h3 style="margin-top:10px">Request received</h3><p class="sub" style="margin:6px 0 20px">Thank you, ${esc(name)}. I will contact you shortly.</p><a class="btn" href="/">Back to home</a></div>`;
      scrollTo(0, 0);
    } catch (x) { err(x.message); btn.disabled = false; btn.innerHTML = `Send request${mi('send')}`; }
  };
}

/* ---------- rating + faq + catalog binding ---------- */
function bindRate() {
  const f = $('#rtf'); if (!f) return;
  let v = 0; const sb = $$('#stin button');
  sb.forEach((b) => (b.onclick = () => { v = +b.dataset.v; sb.forEach((x) => x.classList.toggle('on', +x.dataset.v <= v)); }));
  f.onsubmit = async (e) => {
    e.preventDefault();
    const err = (m) => { $('#re').textContent = m; };
    if (!v) return err('Please choose a star rating.');
    if ($('#rn').value.trim().length < 2) return err('Please enter your name.');
    try {
      await api('/api/rating', { method: 'POST', body: JSON.stringify({ stars: v, name: $('#rn').value, text: $('#rt').value, website: $('#rw').value }) });
      f.innerHTML = `<div class="ok">${mi('check_circle')}<h3 style="margin-top:10px">Thank you</h3><p class="sub">Your review will appear after approval.</p></div>`;
    } catch (x) { err(x.message); }
  };
}

function bindFaq() {
  const q = $('#fq'); if (!q) return;
  q.oninput = () => { faqQ = q.value.toLowerCase(); $('#fl').innerHTML = faqList(); };
  $$('#fc button').forEach((b) => (b.onclick = () => { faqCat = b.textContent; $$('#fc button').forEach((x) => x.classList.toggle('on', x === b)); $('#fl').innerHTML = faqList(); }));
}

function bindCatalog() {
  const q = $('#catQ');
  if (q) {
    q.oninput = () => {
      catSearchQ = q.value;
      render(true);
    };
  }
  $$('#catTabs button').forEach((b) => (b.onclick = () => {
    catFilter = b.textContent;
    render(true);
  }));
}

/* ---------- effects + render ---------- */
function fx() {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); e.target.querySelectorAll('.cn').forEach(cnt); } }), { threshold: .12 });
  $$('.rv,.steps').forEach((x) => io.observe(x));
}

function cnt(el) {
  const v = parseFloat(el.dataset.v), d = el.dataset.v.includes('.'); let t0 = null;
  const st = (t) => { t0 = t0 || t; const p = Math.min((t - t0) / 1000, 1); el.textContent = (v * (1 - Math.pow(1 - p, 3))).toFixed(d ? 1 : 0); if (p < 1) requestAnimationFrame(st); };
  requestAnimationFrame(st);
}

const TITLES = { apk: 'Android Applications', request: 'Start a project', reviews: 'Reviews', faq: 'FAQ', about: 'About us', privacy: 'Privacy policy', work: 'Work', services: 'Service', why: 'Why work with me' };

function render(keep) {
  const { k, a } = parse();
  const pages = {
    home,
    services: () => svcPage(+a),
    why: () => whyPage(+a),
    work: () => workPage(a),
    reviews: reviewsPage,
    faq: faqPage,
    apk: () => (a ? apkDetailPage(a) : apkCatalogPage()),
    request: reqPage,
    about: aboutPage,
    privacy: privacyPage
  };

  const y = scrollY;
  app.innerHTML = layout((pages[k] || nf)());

  let pageTitle = 'AnshuCore | Websites and Software';
  if (k === 'apk') {
    pageTitle = a && APP_DETAIL?.app?.name ? `${APP_DETAIL.app.name} - Download APK | AnshuCore` : 'Android Applications | AnshuCore';
  } else if (TITLES[k]) {
    pageTitle = `${TITLES[k]} | AnshuCore`;
  }
  document.title = pageTitle;

  $('#mb').onclick = () => $('#nv').classList.toggle('open');
  bindReq();
  bindRate();
  bindFaq();
  bindCatalog();
  fx();
  keep ? scrollTo(0, y) : scrollTo(0, 0);
}

boot();
