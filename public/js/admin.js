import { esc, mi, inr, LOGO, api, stars, resize, socIcon, socName, detect } from './lib.js';

const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const app = $('#app');
let S, REQ = [], RAT = [], STATE = {}, tab = (location.hash || '#dash').slice(1), reqF = { q: '', s: 'All' };

const TABS = [['dash', 'Dashboard', 'space_dashboard'], ['req', 'Requests', 'inbox'], ['rat', 'Ratings', 'star_outline'], ['services', 'Services', 'widgets'], ['why', 'Why work with me', 'thumb_up'], ['projects', 'Projects', 'work_outline'], ['faq', 'FAQ', 'help_outline'], ['apk', 'Android App', 'android'], ['soc', 'Social links', 'share'], ['pages', 'About and Privacy', 'article'], ['set', 'Settings', 'settings']];
const ENT = {
  services: { t: 'Services', a: 'service', cols: ['name', 'short'], f: [['name', 'Name'], ['icon', 'Icon name (Material Icons, for example: language)'], ['short', 'Short description'], ['details', 'Full details (shown on the service page)', 'ta'], ['features', 'Features customers can select (one per line)', 'ln']] },
  why: { t: 'Why work with me', a: 'item', cols: ['title', 'short'], f: [['title', 'Title'], ['icon', 'Icon name (Material Icons)'], ['short', 'Short description'], ['details', 'Full details (shown on its page)', 'ta'], ['points', 'Key points (one per line)', 'ln']] },
  projects: { t: 'Projects', a: 'project', cols: ['name', 'cat'], f: [['name', 'Project name'], ['cat', 'Category'], ['url', 'Website URL'], ['desc', 'Description', 'ta']] },
  faq: { t: 'FAQ', a: 'question', cols: ['c', 'q'], f: [['c', 'Category (for example: Pricing)'], ['q', 'Question'], ['a', 'Answer', 'ta']] }
};
const LAB = { name: 'Name', short: 'Description', title: 'Title', cat: 'Category', c: 'Category', q: 'Question' };
const toast = (m) => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); };
const when = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const inp = (id, l, v, t = 'text', ph = '') => `<label for="${id}">${l}</label><input id="${id}" type="${t}" value="${esc(v ?? '')}" placeholder="${esc(ph)}">`;
const tex = (id, l, v, r = 4) => `<label for="${id}">${l}</label><textarea id="${id}" rows="${r}">${esc(v ?? '')}</textarea>`;
const list = (a) => `<ul class="ft">${a.map((x) => `<li>${mi('check_circle')}${x}</li>`).join('')}</ul>`;

async function save(msg = 'Saved') {
  try { const d = await api('/api/admin?action=save', { method: 'POST', body: JSON.stringify({ site: S }) }); S = d.site; toast(msg); }
  catch (e) { toast(e.message); }
}
async function act(action, body) { try { await api('/api/admin?action=' + action, { method: 'POST', body: JSON.stringify(body) }); return true; } catch (e) { toast(e.message); return false; } }

async function boot() {
  let me;
  try { me = await api('/api/admin?action=me'); } catch { me = {}; }
  STATE = me;
  if (!me.admin) return login();
  try { const d = await api('/api/admin?action=data'); S = d.site; REQ = d.requests; RAT = d.ratings; } catch (e) { return login(); }
  draw();
}
function login() {
  app.innerHTML = `<div class="lg"><form class="fm a" id="lf" style="width:100%;max-width:400px"><div class="brand" style="margin-bottom:12px">${LOGO}AnshuCore</div><h3>Admin sign in</h3>
${STATE.configured === false ? '<div class="wn" style="margin-top:12px">Admin login is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD and SESSION_SECRET in Vercel environment variables and redeploy.</div>' : ''}
<label for="le">Email</label><input id="le" type="email" autocomplete="username" required><label for="lp">Password</label><input id="lp" type="password" autocomplete="current-password" required><p id="lx" style="color:#B91C1C;font-size:13px;margin-top:10px"></p><button class="btn p" style="width:100%;margin-top:14px" type="submit">Sign in</button></form></div>`;
  $('#lf').onsubmit = async (e) => {
    e.preventDefault();
    try { await api('/api/admin?action=login', { method: 'POST', body: JSON.stringify({ email: $('#le').value, password: $('#lp').value }) }); boot(); }
    catch (x) { $('#lx').textContent = x.message; }
  };
}

/* ---------- views ---------- */
function reqCard(r) {
  const tel = r.phone ? r.phone.replace(/[^\d+]/g, '') : '', wa = tel.replace(/^\+/, '').replace(/^0+/, ''), waN = wa.length === 10 ? '91' + wa : wa;
  const budget = (r.budgetType === 'custom' ? 'Custom ' : '') + inr(r.budgetNum);
  return `<div class="rc${r.status === 'New' ? ' nw' : ''}" data-id="${r.id}"><div class="row" style="justify-content:space-between;align-items:center"><h3 style="margin:0">${esc(r.name)}</h3><span class="tg${r.status === 'New' ? ' n' : r.status === 'Done' ? ' dn' : ''}">${r.status}</span></div>
<div class="meta"><span>${mi('widgets')} ${esc(r.service)}</span><span>${mi('payments')} ${budget}</span><span>${mi('schedule')} ${esc(r.timeline || '-')}</span><span>${mi('call_split')} Prefers ${esc(r.via)}</span><span>${mi('event')} ${when(r.ts)}</span></div>
${r.features.length ? `<div class="tags" style="margin:0 0 8px">${r.features.map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
${r.msg ? `<div class="mm">${esc(r.msg)}</div>` : ''}
<div class="meta" style="margin-top:12px">${r.phone ? `<span>${mi('call')} ${esc(r.phone)}</span>` : ''}${r.email ? `<span>${mi('mail')} ${esc(r.email)}</span>` : ''}</div>
<div class="acts">${tel ? `<a class="btn s g" href="tel:${esc(tel)}">${mi('call')}Call</a><a class="btn s g" href="https://wa.me/${esc(waN)}?text=${encodeURIComponent('Hello ' + r.name + ', thanks for your request for ' + r.service + '.')}" target="_blank" rel="noopener noreferrer">${mi('chat')}WhatsApp</a>` : ''}${r.email ? `<a class="btn s g" href="mailto:${esc(r.email)}?subject=${encodeURIComponent('Your request: ' + r.service)}">${mi('mail')}Email</a>` : ''}
<select data-st="${r.id}" style="width:auto;padding:7px 10px">${['New', 'Contacted', 'In progress', 'Done'].map((s) => `<option${s === r.status ? ' selected' : ''}>${s}</option>`).join('')}</select><button class="btn s d" data-ni="${r.id}">${mi('block')}Not interested</button></div></div>`;
}
function reqView() {
  const l = REQ.filter((r) => (reqF.s === 'All' || r.status === reqF.s) && (r.name + r.service + r.phone + r.email).toLowerCase().includes(reqF.q));
  return l.length ? l.map(reqCard).join('') : '<p class="sub">No requests found.</p>';
}
function view() {
  const E = ENT[tab], nw = REQ.filter((r) => r.status === 'New').length;
  if (tab === 'dash') return `<div class="kp"><div class="card"><span>${mi('inbox')}Requests</span><b>${REQ.length}</b></div><div class="card"><span>${mi('fiber_new')}New</span><b>${nw}</b></div><div class="card"><span>${mi('star_outline')}Pending reviews</span><b>${RAT.filter((r) => !r.approved).length}</b></div><div class="card"><span>${mi('widgets')}Services</span><b>${S.services.length}</b></div><div class="card"><span>${mi('work_outline')}Projects</span><b>${S.projects.length}</b></div></div>
<div class="pn"><h3>Latest requests</h3>${REQ.slice(0, 3).map(reqCard).join('') || '<p class="sub">No requests yet. New requests from the website appear here.</p>'}</div>`;
  if (tab === 'req') return `<div class="fl"><input id="rq" placeholder="Search by name, service, phone or email" value="${esc(reqF.q)}"><select id="rs">${['All', 'New', 'Contacted', 'In progress', 'Done'].map((s) => `<option${s === reqF.s ? ' selected' : ''}>${s}</option>`).join('')}</select></div><div id="rl">${reqView()}</div>`;
  if (tab === 'rat') return `<div class="pn"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="margin:0">Ratings (${RAT.length})</h3><button class="btn p s" id="ra">${mi('add')}Add review</button></div>${RAT.length ? `<div class="tw"><table><tr><th>Name</th><th>Rating</th><th>Review</th><th>Status</th><th></th></tr>${RAT.map((r) => `<tr><td>${esc(r.name)}</td><td>${stars(r.stars)}</td><td style="white-space:normal;min-width:220px">${esc(r.text)}</td><td>${r.approved ? '<span class="tg dn">Visible</span>' : '<span class="tg n">Pending</span>'}</td><td style="text-align:right;white-space:nowrap"><button class="btn s" data-rv="${r.id}:${r.approved ? 0 : 1}">${r.approved ? 'Hide' : 'Approve'}</button> <button class="btn s d" data-rd="${r.id}">Delete</button></td></tr>`).join('')}</table></div>` : '<p class="sub">No ratings yet.</p>'}</div>`;
  if (E) {
    const a = S[tab];
    return `<div class="pn"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="margin:0">${E.t} (${a.length})</h3><button class="btn p s" data-add="${tab}">${mi('add')}Add ${E.a}</button></div>${a.length ? `<div class="tw"><table><tr>${E.cols.map((c) => `<th>${LAB[c]}</th>`).join('')}<th></th></tr>${a.map((x, i) => `<tr>${E.cols.map((c) => `<td style="white-space:normal;max-width:340px">${esc(String(x[c]).slice(0, 90))}</td>`).join('')}<td style="text-align:right;white-space:nowrap"><button class="btn s" data-mv="${tab}:${i}:-1" aria-label="Move up">${mi('arrow_upward')}</button> <button class="btn s" data-mv="${tab}:${i}:1" aria-label="Move down">${mi('arrow_downward')}</button> <button class="btn s" data-ed="${tab}:${i}">Edit</button> <button class="btn s d" data-rm="${tab}:${i}">Delete</button></td></tr>`).join('')}</table></div>` : '<p class="sub">Nothing here yet. Use the Add button to create your first entry.</p>'}</div>`;
  }
  if (tab === 'apk') return `<div class="pn"><h3>GitHub release</h3>${inp('ar', 'GitHub repository (owner/repo or full link)', S.apk.repo, 'text', 'example: anshu/anshucore-app')}<p class="sub" style="font-size:13px;margin-top:8px">The website reads APK files and download counts from this repository's Releases. The repository must be public.</p></div>
<div class="pn"><h3>Page details</h3>${inp('at', 'Title', S.apk.title)}${tex('ad', 'Description (what the app is for)', S.apk.desc, 3)}${tex('au', 'What it is used for (one per line)', S.apk.uses.join('\n'), 4)}${inp('aq', 'Requirements', S.apk.req)}<button class="btn p" style="margin-top:20px" id="sa">Save</button></div>
<div class="pn"><h3>How to publish an APK</h3>${list(['Open your GitHub repository and go to Releases', 'Create a new release and attach the .apk file', 'Publish the release. It appears on the website within a few minutes', 'Download counts update automatically from GitHub'])}</div>`;
  if (tab === 'soc') return `<div class="pn"><h3>Social links</h3><p class="sub" style="margin-bottom:16px">Paste a link. The icon is created automatically and appears in the footer and on the floating side bar.</p><div class="fl"><input id="su" placeholder="https://instagram.com/yourname"><button class="btn p" id="sad">${mi('add')}Add</button></div>${S.social.length ? `<div class="tw"><table><tr><th>Icon</th><th>Platform</th><th>Link</th><th></th></tr>${S.social.map((s, i) => `<tr><td style="color:var(--b1)">${socIcon(s.url)}</td><td>${socName(s.url)}</td><td>${esc(s.url)}</td><td style="text-align:right"><button class="btn s d" data-rm="social:${i}">Remove</button></td></tr>`).join('')}</table></div>` : '<p class="sub">No social links yet.</p>'}</div>`;
  if (tab === 'pages') return `<div class="pn"><h3>About us page</h3><p class="sub" style="font-size:13px">Separate paragraphs with a blank line. Start a line with ## to make a heading.</p>${tex('pa', '', S.pages.about, 12)}</div><div class="pn"><h3>Privacy policy page</h3>${tex('pp', '', S.pages.privacy, 14)}</div><button class="btn p" id="sp">Save pages</button>`;
  return `<div class="pn"><h3>Profile</h3><div class="two"><div>${inp('sn', 'Name', S.me.name)}</div><div>${inp('st', 'Title', S.me.title)}</div></div>${tex('sb', 'Bio', S.me.bio, 4)}<label>Photo</label><input type="file" id="sph" accept="image/*">${S.me.photo ? `<p style="margin-top:10px"><img src="${S.me.photo}" alt="" style="height:90px;border-radius:12px"> <button class="btn s d" id="spx">Remove photo</button></p>` : ''}</div>
<div class="pn"><h3>Contact</h3><div class="two"><div>${inp('se', 'Email', S.me.email, 'email')}</div><div>${inp('sp', 'Phone', S.me.phone, 'tel', '+91 98765 43210')}</div></div>${inp('sa', 'Address (optional)', S.me.address)}</div>
<div class="pn"><h3>Home page</h3>${inp('hb', 'Badge text', S.hero.badge)}${inp('hh', 'Headline', S.hero.h)}${tex('hp', 'Subtext', S.hero.p, 3)}</div>
<div class="pn"><h3>Budget options (in rupees)</h3>${inp('bp', 'Preset amounts, comma separated. The first one is the minimum.', S.budget.presets.join(', '))}</div>
<div class="pn"><h3>Visible sections</h3>${Object.keys(S.show).map((k) => `<div class="tgl"><span style="text-transform:capitalize">${k}</span><input type="checkbox" data-k="${k}"${S.show[k] ? ' checked' : ''}></div>`).join('')}</div><button class="btn p" id="ss">Save settings</button>`;
}
function draw() {
  const nw = REQ.filter((r) => r.status === 'New').length, T = TABS.find((t) => t[0] === tab) || TABS[0];
  if (!TABS.find((t) => t[0] === tab)) tab = 'dash';
  app.innerHTML = `<div class="ad"><aside class="sb"><a class="brand" href="/">${LOGO}AnshuCore</a>${TABS.map((t) => `<a href="#${t[0]}" data-t="${t[0]}" class="${t[0] === tab ? 'on' : ''}">${mi(t[2])}${t[1]}${t[0] === 'req' && nw ? `<span class="bd">${nw}</span>` : ''}${t[0] === 'rat' && RAT.some((r) => !r.approved) ? `<span class="bd">${RAT.filter((r) => !r.approved).length}</span>` : ''}</a>`).join('')}</aside>
<main class="mn"><div class="tp"><h1>${T[1]}</h1><div class="row"><button class="btn s" id="rf">${mi('refresh')}Refresh</button><a class="btn s" href="/" target="_blank">${mi('open_in_new')}View site</a><button class="btn s" id="lo">Sign out</button></div></div>${STATE.db === false ? '<div class="wn">Database is not connected. Connect Upstash Redis in Vercel, otherwise changes and requests cannot be saved.</div>' : ''}${view()}</main></div>`;
  bind();
}
/* ---------- modal editor ---------- */
function ed(k, i) {
  const E = ENT[k], x = i < 0 ? {} : S[k][i], m = document.createElement('div'); m.className = 'mo';
  m.innerHTML = `<div class="pn"><h3>${i < 0 ? 'Add' : 'Edit'} ${E.a}</h3>${E.f.map((f, j) => { const v = x[f[0]]; return f[2] === 'ln' ? tex('f' + j, f[1], (v || []).join('\n'), 5) : f[2] === 'ta' ? tex('f' + j, f[1], v, 5) : inp('f' + j, f[1], v); }).join('')}<div class="row" style="margin-top:20px"><button class="btn p" id="mv">Save</button><button class="btn" id="mc">Cancel</button></div></div>`;
  document.body.appendChild(m);
  m.onclick = (e) => { if (e.target === m) m.remove(); };
  $('#mc').onclick = () => m.remove();
  $('#mv').onclick = async () => {
    const n = { ...x };
    E.f.forEach((f, j) => { const v = $('#f' + j).value; n[f[0]] = f[2] === 'ln' ? v.split('\n').map((s) => s.trim()).filter(Boolean) : v.trim(); });
    if (!String(n[E.f[0][0]] || '').trim()) return toast('Please fill the first field.');
    if (k === 'services' && !n.icon) n.icon = 'widgets';
    if (k === 'why' && !n.icon) n.icon = 'check_circle';
    i < 0 ? S[k].push(n) : (S[k][i] = n);
    m.remove(); await save(); draw();
  };
}
function addReview() {
  const m = document.createElement('div'); m.className = 'mo';
  m.innerHTML = `<div class="pn"><h3>Add review</h3>${inp('vn', 'Client name', '')}<label for="vs">Rating</label><select id="vs"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select>${tex('vt', 'Review', '', 3)}<div class="row" style="margin-top:20px"><button class="btn p" id="vv">Add</button><button class="btn" id="vc">Cancel</button></div></div>`;
  document.body.appendChild(m); m.onclick = (e) => { if (e.target === m) m.remove(); }; $('#vc').onclick = () => m.remove();
  $('#vv').onclick = async () => { try { const d = await api('/api/admin?action=ratingAdd', { method: 'POST', body: JSON.stringify({ name: $('#vn').value, stars: $('#vs').value, text: $('#vt').value }) }); RAT.unshift(d.rating); m.remove(); draw(); } catch (e) { toast(e.message); } };
}
/* ---------- events ---------- */
function bind() {
  $$('[data-t]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); tab = a.dataset.t; history.replaceState(null, '', '#' + tab); draw(); scrollTo(0, 0); }));
  $('#lo').onclick = async () => { await api('/api/admin?action=logout', { method: 'POST', body: '{}' }); boot(); };
  $('#rf').onclick = async () => { const d = await api('/api/admin?action=data'); S = d.site; REQ = d.requests; RAT = d.ratings; draw(); toast('Refreshed'); };
  const rl = () => { $('#rl').innerHTML = reqView(); bindReq(); };
  if ($('#rq')) { $('#rq').oninput = (e) => { reqF.q = e.target.value.toLowerCase(); rl(); }; $('#rs').onchange = (e) => { reqF.s = e.target.value; rl(); }; }
  bindReq();
  $$('[data-add]').forEach((b) => (b.onclick = () => ed(b.dataset.add, -1)));
  $$('[data-ed]').forEach((b) => (b.onclick = () => { const p = b.dataset.ed.split(':'); ed(p[0], +p[1]); }));
  $$('[data-rm]').forEach((b) => (b.onclick = async () => { const p = b.dataset.rm.split(':'); if (confirm('Delete this item?')) { S[p[0]].splice(+p[1], 1); await save(); draw(); } }));
  $$('[data-mv]').forEach((b) => (b.onclick = async () => { const p = b.dataset.mv.split(':'), a = S[p[0]], i = +p[1], j = i + +p[2]; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; await save('Order saved'); draw(); }));
  $$('[data-rv]').forEach((b) => (b.onclick = async () => { const [id, v] = b.dataset.rv.split(':'); if (await act('ratingSet', { id, approved: v === '1' })) { RAT.find((r) => r.id === id).approved = v === '1'; draw(); } }));
  $$('[data-rd]').forEach((b) => (b.onclick = async () => { if (confirm('Delete this review?') && await act('ratingDelete', { id: b.dataset.rd })) { RAT = RAT.filter((r) => r.id !== b.dataset.rd); draw(); } }));
  if ($('#ra')) $('#ra').onclick = addReview;
  if ($('#sa') && tab === 'apk') $('#sa').onclick = async () => { Object.assign(S.apk, { repo: $('#ar').value, title: $('#at').value, desc: $('#ad').value, uses: $('#au').value.split('\n').map((s) => s.trim()).filter(Boolean), req: $('#aq').value }); await save(); };
  if ($('#sad')) $('#sad').onclick = async () => { const u = $('#su').value.trim(); if (!u) return; S.social.push({ url: u, label: '' }); await save('Link added'); draw(); };
  if ($('#sp') && tab === 'pages') $('#sp').onclick = async () => { S.pages.about = $('#pa').value; S.pages.privacy = $('#pp').value; await save(); };
  if ($('#sph')) $('#sph').onchange = (e) => resize(e.target.files[0], async (d) => { S.me.photo = d; await save('Photo saved'); draw(); });
  if ($('#spx')) $('#spx').onclick = async () => { S.me.photo = ''; await save(); draw(); };
  if ($('#ss')) $('#ss').onclick = async () => {
    Object.assign(S.me, { name: $('#sn').value, title: $('#st').value, bio: $('#sb').value, email: $('#se').value, phone: $('#sp').value, address: $('#sa').value });
    Object.assign(S.hero, { badge: $('#hb').value, h: $('#hh').value, p: $('#hp').value });
    S.budget.presets = $('#bp').value.split(',').map((x) => +x.trim()).filter((n) => n >= 1000);
    $$('[data-k]').forEach((x) => { S.show[x.dataset.k] = x.checked ? 1 : 0; });
    await save('Settings saved');
  };
}
function bindReq() {
  $$('[data-st]').forEach((s) => (s.onchange = async () => { if (await act('reqStatus', { id: s.dataset.st, status: s.value })) { REQ.find((r) => r.id === s.dataset.st).status = s.value; toast('Status updated'); draw(); } }));
  $$('[data-ni]').forEach((b) => (b.onclick = async () => { if (confirm('Mark as not interested and delete this request?') && await act('reqDelete', { id: b.dataset.ni })) { REQ = REQ.filter((r) => r.id !== b.dataset.ni); toast('Request deleted'); draw(); } }));
}
boot();
