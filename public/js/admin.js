import { esc, mi, inr, LOGO, api, stars, resize, socIcon, socName, detect } from './lib.js';

const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const app = $('#app');
let S, REQ = [], RAT = [], STATE = {}, tab = (location.hash || '#dash').slice(1), reqF = { q: '', s: 'All' }, apkF = { q: '', s: 'All', c: 'All' };

const TABS = [
  ['dash', 'Dashboard', 'space_dashboard'],
  ['req', 'Requests', 'inbox'],
  ['apk', 'Android Apps', 'android'],
  ['services', 'Services', 'widgets'],
  ['why', 'Why work with me', 'thumb_up'],
  ['projects', 'Projects', 'work_outline'],
  ['rat', 'Ratings', 'star_outline'],
  ['faq', 'FAQ', 'help_outline'],
  ['soc', 'Social links', 'share'],
  ['pages', 'About and Privacy', 'article'],
  ['set', 'Settings', 'settings']
];

const ENT = {
  services: { t: 'Services', a: 'service', cols: ['name', 'short'], f: [['name', 'Name'], ['icon', 'Icon name (Material Icons, for example: language)'], ['short', 'Short description'], ['details', 'Full details (shown on the service page)', 'ta'], ['features', 'Features customers can select (one per line)', 'ln']] },
  why: { t: 'Why work with me', a: 'item', cols: ['title', 'short'], f: [['title', 'Title'], ['icon', 'Icon name (Material Icons)'], ['short', 'Short description'], ['details', 'Full details (shown on its page)', 'ta'], ['points', 'Key points (one per line)', 'ln']] },
  projects: { t: 'Projects', a: 'project', cols: ['name', 'cat'], f: [['name', 'Project name'], ['cat', 'Category'], ['url', 'Website URL'], ['desc', 'Description', 'ta']] },
  faq: { t: 'FAQ', a: 'question', cols: ['c', 'q'], f: [['c', 'Category (for example: Pricing)'], ['q', 'Question'], ['a', 'Answer', 'ta']] }
};

const LAB = { name: 'Name', short: 'Description', title: 'Title', cat: 'Category', c: 'Category', q: 'Question' };
const toast = (m) => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2400); };
const when = (t) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const inp = (id, l, v, t = 'text', ph = '') => `<label for="${id}">${l}</label><input id="${id}" type="${t}" value="${esc(v ?? '')}" placeholder="${esc(ph)}">`;
const tex = (id, l, v, r = 4) => `<label for="${id}">${l}</label><textarea id="${id}" rows="${r}">${esc(v ?? '')}</textarea>`;
const list = (a) => `<ul class="ft">${a.map((x) => `<li>${mi('check_circle')}${x}</li>`).join('')}</ul>`;

function appIco(icon, cls = '') {
  if (typeof icon === 'string' && (icon.startsWith('data:image/') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/'))) {
    return `<div class="app-ico ${cls}"><img src="${esc(icon)}" alt=""></div>`;
  }
  return `<div class="app-ico ${cls}">${mi(icon || 'android')}</div>`;
}

function slugify(str) {
  return String(str || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'app';
}

async function save(msg = 'Saved') {
  try {
    const d = await api('/api/admin?action=save', { method: 'POST', body: JSON.stringify({ site: S }) });
    if (!d || !d.site) throw new Error('Save response did not return updated data.');
    S = d.site;
    toast(msg);
    return true;
  } catch (e) {
    toast(e.message || 'Failed to save changes.');
    return false;
  }
}

async function act(action, body) {
  try {
    const res = await api('/api/admin?action=' + action, { method: 'POST', body: JSON.stringify(body) });
    if (res.site) S = res.site;
    return true;
  } catch (e) {
    toast(e.message || 'Operation failed.');
    return false;
  }
}

async function boot() {
  let me;
  try { me = await api('/api/admin?action=me'); } catch (e) { me = { fail: e.message }; }
  STATE = me;
  if (me.fail || me.admin === undefined) return app.innerHTML = `<div class="lg"><div class="fm" style="max-width:480px"><h3>Cannot reach the server</h3><p class="sub" style="margin-top:8px">The /api functions did not respond. In Vercel check that the latest deployment finished, the project root contains the api folder, and Framework Preset is Other.</p><button class="btn p" style="margin-top:16px" onclick="location.reload()">Retry</button></div></div>`;
  if (!me.admin) return login();
  try {
    const d = await api('/api/admin?action=data');
    S = d.site;
    REQ = d.requests;
    RAT = d.ratings;
    if (d.dbError) STATE.dbErr = d.dbError;
  } catch (e) {
    if (e.status === 401) return login();
    return app.innerHTML = `<div class="lg"><div class="fm" style="max-width:480px"><h3>Could not load data</h3><p class="sub" style="margin-top:8px">${esc(e.message)}</p><button class="btn p" style="margin-top:16px" onclick="location.reload()">Retry</button></div></div>`;
  }
  draw();
}

function login() {
  app.innerHTML = `<div class="lg"><form class="fm a" id="lf" style="width:100%;max-width:400px"><div class="brand" style="margin-bottom:12px">${LOGO}AnshuCore</div><h3>Admin sign in</h3>
<ul class="ft" style="margin:12px 0 0;font-size:13.5px"><li>${mi(STATE.configured ? 'check_circle' : 'error_outline')}Admin variables: ${STATE.configured ? 'set' : 'missing (ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET)'}</li><li>${mi(STATE.db ? 'check_circle' : 'error_outline')}Database: ${STATE.db ? 'connected' : 'not connected'}</li></ul>${STATE.db === false && STATE.dbErr ? `<p class="sub" style="font-size:12.5px;margin-top:6px">${esc(STATE.dbErr)}</p>` : ''}
<label for="le">Email</label><input id="le" type="email" autocomplete="username" required><label for="lp">Password</label><input id="lp" type="password" autocomplete="current-password" required><p id="lx" style="color:#B91C1C;font-size:13px;margin-top:10px"></p><button class="btn p" style="width:100%;margin-top:14px" type="submit">Sign in</button></form></div>`;
  $('#lf').onsubmit = async (e) => {
    e.preventDefault();
    const btn = $('#lf button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    try {
      await api('/api/admin?action=login', { method: 'POST', body: JSON.stringify({ email: $('#le').value, password: $('#lp').value }) });
      boot();
    } catch (x) {
      $('#lx').textContent = x.message;
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  };
}

/* ---------- requests view ---------- */
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

/* ---------- APK Manager view ---------- */
function apkView() {
  const apps = Array.isArray(S.apps) ? S.apps : [];
  const cats = ['All', ...new Set(apps.map((a) => a.category).filter(Boolean))];
  const filtered = apps.filter((a) => {
    const qMatch = !apkF.q || (a.name + ' ' + a.slug + ' ' + (a.repositoryOwner || '') + ' ' + (a.repositoryName || '') + ' ' + (a.shortDescription || '')).toLowerCase().includes(apkF.q);
    const catMatch = apkF.c === 'All' || a.category === apkF.c;
    const stMatch = apkF.s === 'All' || (apkF.s === 'Published' && a.published) || (apkF.s === 'Draft' && !a.published) || (apkF.s === 'Super APK' && a.featured);
    return qMatch && catMatch && stMatch;
  });

  const cardsHtml = filtered.map((a) => {
    const repoStr = a.repositoryOwner && a.repositoryName ? `${a.repositoryOwner}/${a.repositoryName}` : '';
    return `<div class="admin-app-card" data-aid="${esc(a.id)}">
      ${appIco(a.icon)}
      <div>
        <div class="row" style="align-items:center;gap:8px;margin-bottom:4px">
          <h3 style="margin:0">${esc(a.name)}</h3>
          <span class="tg">${esc(a.category || 'General')}</span>
          ${a.featured ? '<span class="tg" style="background:#FEF3C7;color:#92400E;font-weight:800"><span class="mi" style="font-size:13px;vertical-align:-1px">star</span> Super APK</span>' : ''}
          ${a.published ? '<span class="tg dn">Published</span>' : '<span class="tg n">Draft</span>'}
        </div>
        <p class="sub" style="font-size:13px;margin:2px 0 6px">Slug: <code>/apk/${esc(a.slug)}</code> &middot; GitHub: <b>${esc(repoStr || 'Not configured')}</b> &middot; Req: ${esc(a.req || 'Android 7.0+')}</p>
        <p style="font-size:14px;color:var(--mu);margin:0">${esc(a.shortDescription || 'No description added.')}</p>
      </div>
      <div class="acts">
        <button class="btn s" data-app-ed="${esc(a.id)}">${mi('edit')}Edit</button>
        <button class="btn s" data-app-pub="${esc(a.id)}">${a.published ? 'Unpublish' : 'Publish'}</button>
        ${!a.featured ? `<button class="btn s" data-app-feat="${esc(a.id)}" title="Set as featured Super APK">${mi('star')}Set Super APK</button>` : ''}
        ${repoStr ? `<button class="btn s" data-app-test="${esc(a.id)}" title="Test GitHub releases">${mi('cloud_sync')}Releases</button>` : ''}
        <button class="btn s d" data-app-del="${esc(a.id)}" title="Delete application">${mi('delete')}</button>
      </div>
    </div>`;
  }).join('');

  return `<div class="pn">
    <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:16px">
      <div>
        <h3 style="margin:0">Application Catalog (${apps.length})</h3>
        <p class="sub" style="font-size:13px;margin-top:2px">Manage multiple Android applications distributed through GitHub releases.</p>
      </div>
      <button class="btn p s" id="appAddBtn">${mi('add')}Add Application</button>
    </div>
    <div class="fl" style="margin-bottom:20px">
      <input id="appQ" placeholder="Search by name, slug, repo, or description" value="${esc(apkF.q)}">
      <select id="appCat" style="width:auto">${cats.map((c) => `<option${c === apkF.c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>
      <select id="appSt" style="width:auto">${['All', 'Published', 'Draft', 'Super APK'].map((s) => `<option${s === apkF.s ? ' selected' : ''}>${s}</option>`).join('')}</select>
    </div>
    <div id="appContainer">${cardsHtml || '<p class="sub">No applications match your search criteria. Click &quot;Add Application&quot; to add one.</p>'}</div>
  </div>
  <div class="pn">
    <h3>How GitHub APK distribution works</h3>
    ${list([
      'Each application links to its own GitHub repository (Owner and Repo name).',
      'Publish a Release on GitHub and attach your compiled .apk binary.',
      'The website automatically reads genuine release versions, file sizes, and asset download counts directly from GitHub.',
      'Exactly one application is designated as the &quot;Super APK&quot; and is featured prominently at the top of searches and the homepage.',
      'Downloads link directly to the genuine GitHub asset without going through the serverless function.'
    ])}
  </div>`;
}

/* ---------- app editor modal ---------- */
function appEditorModal(appId) {
  const isNew = !appId;
  const appItem = isNew ? {
    id: 'app_' + Date.now().toString(36),
    slug: '',
    name: '',
    icon: 'android',
    category: 'Business & Management',
    shortDescription: '',
    repositoryOwner: '',
    repositoryName: '',
    published: true,
    featured: (S.apps || []).length === 0,
    relatedAppIds: [],
    uses: [],
    req: 'Android 7.0 or later'
  } : (S.apps || []).find((a) => a.id === appId);

  if (!appItem) return toast('Application not found.');

  const otherApps = (S.apps || []).filter((a) => a.id !== appItem.id);
  const m = document.createElement('div');
  m.className = 'mo';
  m.innerHTML = `<div class="pn" style="max-width:640px;width:100%">
    <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="margin:0">${isNew ? 'Add New Application' : 'Edit Application'}</h3>
      <button class="ib" id="appEdClose" style="display:grid;border:0">${mi('close')}</button>
    </div>
    <div id="appEdErr" style="color:#B91C1C;font-size:13.5px;margin-bottom:10px"></div>
    <div class="two">
      <div>${inp('edAppName', 'Application Name *', appItem.name, 'text', 'e.g. AnshuCore Library App')}</div>
      <div>${inp('edAppSlug', 'URL Slug *', appItem.slug, 'text', 'e.g. anshucore-library-app')}</div>
    </div>
    <div class="two">
      <div>${inp('edAppCat', 'Category', appItem.category || 'Business & Management', 'text', 'e.g. Education, Utilities')}</div>
      <div>
        <label for="edAppIcon">Icon (Material Icon name or image)</label>
        <div class="row" style="align-items:center;gap:8px">
          <input id="edAppIcon" value="${esc(appItem.icon || 'android')}" placeholder="e.g. android, school, or URL" style="flex:1">
          <label class="btn s" style="margin:0;cursor:pointer" title="Upload custom icon">${mi('upload')}Upload<input type="file" id="edAppIconFile" accept="image/*" style="display:none"></label>
        </div>
      </div>
    </div>
    ${tex('edAppDesc', 'Short Factual Description (shown in catalog & detail header)', appItem.shortDescription, 3)}
    <div class="two">
      <div>${inp('edAppOwner', 'GitHub Repository Owner', appItem.repositoryOwner, 'text', 'e.g. corexanshu-rgb')}</div>
      <div>${inp('edAppRepo', 'GitHub Repository Name', appItem.repositoryName, 'text', 'e.g. AnshuCore')}</div>
    </div>
    <div class="two">
      <div>${inp('edAppReq', 'Requirements', appItem.req || 'Android 7.0 or later', 'text', 'e.g. Android 7.0+')}</div>
      <div style="display:flex;align-items:center;gap:18px;padding-top:28px">
        <label style="display:flex;align-items:center;gap:8px;margin:0;cursor:pointer">
          <input type="checkbox" id="edAppPub"${appItem.published ? ' checked' : ''} style="width:18px;height:18px;accent-color:var(--b1)"> Published
        </label>
        <label style="display:flex;align-items:center;gap:8px;margin:0;cursor:pointer" title="Single featured Super APK">
          <input type="checkbox" id="edAppFeat"${appItem.featured ? ' checked' : ''} style="width:18px;height:18px;accent-color:var(--b1)"> Super APK (Featured)
        </label>
      </div>
    </div>
    ${tex('edAppUses', 'Key Highlights / Features (one per line)', (appItem.uses || []).join('\n'), 3)}
    ${otherApps.length ? `<label>Related Applications (&quot;You may also like&quot; recommendations)</label>
      <div class="cg" style="max-height:120px;overflow:auto;border:1px solid var(--ln);border-radius:10px;padding:10px">
        ${otherApps.map((o) => `<label class="chk" style="padding:6px 10px;font-size:13px"><input type="checkbox" value="${esc(o.id)}"${(appItem.relatedAppIds || []).includes(o.id) ? ' checked' : ''}>${esc(o.name)}</label>`).join('')}
      </div>` : ''}
    <div class="row" style="margin-top:22px;justify-content:space-between;align-items:center">
      <div class="row">
        <button class="btn p" id="appEdSave">${mi('save')}Save Application</button>
        <button class="btn" id="appEdCancel">Cancel</button>
      </div>
      <button class="btn s" id="appEdTestGh">${mi('sync')}Test GitHub Link</button>
    </div>
  </div>`;

  document.body.appendChild(m);
  const close = () => m.remove();
  m.onclick = (e) => { if (e.target === m) close(); };
  $('#appEdClose').onclick = close;
  $('#appEdCancel').onclick = close;

  // Auto-slugify on title input if new or slug is empty
  $('#edAppName').oninput = () => {
    if (isNew || !$('#edAppSlug').value) {
      $('#edAppSlug').value = slugify($('#edAppName').value);
    }
  };

  // Custom icon file upload
  $('#edAppIconFile').onchange = (e) => {
    if (e.target.files && e.target.files[0]) {
      resize(e.target.files[0], (dataUrl) => {
        $('#edAppIcon').value = dataUrl;
        toast('Custom icon loaded');
      });
    }
  };

  // Test GitHub connection
  $('#appEdTestGh').onclick = async () => {
    const owner = $('#edAppOwner').value.trim();
    const repo = $('#edAppRepo').value.trim();
    if (!owner || !repo) return toast('Please enter GitHub Owner and Repository Name first.');
    const btn = $('#appEdTestGh');
    btn.disabled = true;
    btn.textContent = 'Testing...';
    try {
      const res = await api(`/api/apk?slug=${encodeURIComponent(appItem.slug || slugify($('#edAppName').value))}`);
      if (res.releases && res.releases.length) {
        toast(`Connected! Found ${res.releases.length} releases with ${res.total || 0} APK downloads.`);
      } else if (res.error) {
        toast(`GitHub check: ${res.error}`);
      } else {
        toast('Connected, but no APK releases found yet.');
      }
    } catch {
      toast('Could not verify releases directly. Save to test.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `${mi('sync')}Test GitHub Link`;
    }
  };

  // Save handler
  $('#appEdSave').onclick = async () => {
    const name = $('#edAppName').value.trim();
    if (!name) return $('#appEdErr').textContent = 'Please provide an application name.';
    const slug = slugify($('#edAppSlug').value || name);
    const saveBtn = $('#appEdSave');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const related = $$('.cg input:checked').map((x) => x.value);
    const uses = $('#edAppUses').value.split('\n').map((s) => s.trim()).filter(Boolean);
    const isFeat = $('#edAppFeat').checked;

    const payload = {
      id: appItem.id,
      name,
      slug,
      category: $('#edAppCat').value.trim() || 'General',
      icon: $('#edAppIcon').value.trim() || 'android',
      shortDescription: $('#edAppDesc').value.trim(),
      repositoryOwner: $('#edAppOwner').value.trim(),
      repositoryName: $('#edAppRepo').value.trim(),
      published: $('#edAppPub').checked,
      featured: isFeat,
      relatedAppIds: related,
      uses,
      req: $('#edAppReq').value.trim() || 'Android 7.0 or later'
    };

    try {
      const res = await api('/api/admin?action=appSave', { method: 'POST', body: JSON.stringify({ app: payload }) });
      if (res && res.site) S = res.site;
      close();
      draw();
      toast('Application saved');
    } catch (err) {
      $('#appEdErr').textContent = err.message || 'Failed to save application.';
      saveBtn.disabled = false;
      saveBtn.innerHTML = `${mi('save')}Save Application`;
    }
  };
}

/* ---------- test releases modal ---------- */
async function testReleasesModal(appId) {
  const item = (S.apps || []).find((a) => a.id === appId);
  if (!item) return;
  const m = document.createElement('div');
  m.className = 'mo';
  m.innerHTML = `<div class="pn" style="max-width:540px;width:100%">
    <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3 style="margin:0">${esc(item.name)} — Releases</h3>
      <button class="ib" id="relClose" style="display:grid;border:0">${mi('close')}</button>
    </div>
    <div id="relBody"><p class="sub">Querying GitHub API...</p></div>
    <div class="row" style="margin-top:20px;justify-content:flex-end">
      <button class="btn" id="relDone">Close</button>
    </div>
  </div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  m.onclick = (e) => { if (e.target === m) close(); };
  $('#relClose').onclick = close;
  $('#relDone').onclick = close;

  try {
    const data = await api(`/api/apk?slug=${encodeURIComponent(item.slug)}`);
    const container = $('#relBody');
    if (!data.configured) {
      container.innerHTML = `<p class="sub">No GitHub repository configured for this application.</p>`;
      return;
    }
    if (data.error) {
      container.innerHTML = `<div class="wn">GitHub reported: ${esc(data.error)}. If rate limited, the site serves cached release counts until the limit resets.</div>`;
      return;
    }
    if (!data.releases || !data.releases.length) {
      container.innerHTML = `<p class="sub">Repository <b>${esc(data.repo)}</b> is reachable, but has no published releases with <code>.apk</code> assets attached.</p>`;
      return;
    }
    container.innerHTML = `
      <p style="margin-bottom:14px"><b>${esc(data.repo)}</b> &middot; <span class="big" style="font-size:24px">${(data.total || 0).toLocaleString('en-IN')}</span> genuine downloads</p>
      <div style="max-height:280px;overflow:auto">
        ${data.releases.map((r, i) => `<div class="rel" style="padding:14px;margin-bottom:10px">
          <div class="row" style="justify-content:space-between">
            <b>${esc(r.name || r.tag)} ${i === 0 ? '<span class="tg dn">Latest</span>' : ''}</b>
            <small class="sub">${new Date(r.date).toLocaleDateString()}</small>
          </div>
          ${(r.assets || []).map((a) => `<div style="font-size:13px;color:var(--mu);margin-top:6px">${esc(a.name)} &middot; ${(a.size / 1048576).toFixed(1)} MB &middot; ${a.downloads.toLocaleString('en-IN')} downloads</div>`).join('')}
        </div>`).join('')}
      </div>`;
  } catch (e) {
    $('#relBody').innerHTML = `<p style="color:#B91C1C">${esc(e.message || 'Error fetching releases')}</p>`;
  }
}

/* ---------- main view renderer ---------- */
function view() {
  const E = ENT[tab], nw = REQ.filter((r) => r.status === 'New').length;
  if (tab === 'dash') {
    const appCount = (S.apps || []).length;
    return `<div class="kp">
      <div class="card"><span>${mi('inbox')}Requests</span><b>${REQ.length}</b></div>
      <div class="card"><span>${mi('fiber_new')}New</span><b>${nw}</b></div>
      <div class="card"><span>${mi('android')}Applications</span><b>${appCount}</b></div>
      <div class="card"><span>${mi('star_outline')}Pending reviews</span><b>${RAT.filter((r) => !r.approved).length}</b></div>
      <div class="card"><span>${mi('widgets')}Services</span><b>${S.services.length}</b></div>
    </div>
    <div class="pn"><h3>Latest requests</h3>${REQ.slice(0, 3).map(reqCard).join('') || '<p class="sub">No requests yet. New requests from the website appear here.</p>'}</div>`;
  }
  if (tab === 'req') {
    return `<div class="fl"><input id="rq" placeholder="Search by name, service, phone or email" value="${esc(reqF.q)}"><select id="rs">${['All', 'New', 'Contacted', 'In progress', 'Done'].map((s) => `<option${s === reqF.s ? ' selected' : ''}>${s}</option>`).join('')}</select></div><div id="rl">${reqView()}</div>`;
  }
  if (tab === 'apk') return apkView();
  if (tab === 'rat') {
    return `<div class="pn"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="margin:0">Ratings (${RAT.length})</h3><button class="btn p s" id="ra">${mi('add')}Add review</button></div>${RAT.length ? `<div class="tw"><table><tr><th>Name</th><th>Rating</th><th>Review</th><th>Status</th><th></th></tr>${RAT.map((r) => `<tr><td>${esc(r.name)}</td><td>${stars(r.stars)}</td><td style="white-space:normal;min-width:220px">${esc(r.text)}</td><td>${r.approved ? '<span class="tg dn">Visible</span>' : '<span class="tg n">Pending</span>'}</td><td style="text-align:right;white-space:nowrap"><button class="btn s" data-rv="${r.id}:${r.approved ? 0 : 1}">${r.approved ? 'Hide' : 'Approve'}</button> <button class="btn s d" data-rd="${r.id}">Delete</button></td></tr>`).join('')}</table></div>` : '<p class="sub">No ratings yet.</p>'}</div>`;
  }
  if (E) {
    const a = S[tab];
    return `<div class="pn"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="margin:0">${E.t} (${a.length})</h3><button class="btn p s" data-add="${tab}">${mi('add')}Add ${E.a}</button></div>${a.length ? `<div class="tw"><table><tr>${E.cols.map((c) => `<th>${LAB[c]}</th>`).join('')}<th></th></tr>${a.map((x, i) => `<tr>${E.cols.map((c) => `<td style="white-space:normal;max-width:340px">${esc(String(x[c]).slice(0, 90))}</td>`).join('')}<td style="text-align:right;white-space:nowrap"><button class="btn s" data-mv="${tab}:${i}:-1" aria-label="Move up">${mi('arrow_upward')}</button> <button class="btn s" data-mv="${tab}:${i}:1" aria-label="Move down">${mi('arrow_downward')}</button> <button class="btn s" data-ed="${tab}:${i}">Edit</button> <button class="btn s d" data-rm="${tab}:${i}">Delete</button></td></tr>`).join('')}</table></div>` : '<p class="sub">Nothing here yet. Use the Add button to create your first entry.</p>'}</div>`;
  }
  if (tab === 'soc') {
    return `<div class="pn"><h3>Social links</h3><p class="sub" style="margin-bottom:16px">Paste a link. The icon is created automatically and appears in the footer and on the floating side bar.</p><div class="fl"><input id="su" placeholder="https://instagram.com/yourname"><button class="btn p" id="sad">${mi('add')}Add</button></div>${S.social.length ? `<div class="tw"><table><tr><th>Icon</th><th>Platform</th><th>Link</th><th></th></tr>${S.social.map((s, i) => `<tr><td style="color:var(--b1)">${socIcon(s.url)}</td><td>${socName(s.url)}</td><td>${esc(s.url)}</td><td style="text-align:right"><button class="btn s d" data-rm="social:${i}">Remove</button></td></tr>`).join('')}</table></div>` : '<p class="sub">No social links yet.</p>'}</div>`;
  }
  if (tab === 'pages') {
    return `<div class="pn"><h3>About us page</h3><p class="sub" style="font-size:13px">Separate paragraphs with a blank line. Start a line with ## to make a heading.</p>${tex('pa', '', S.pages.about, 12)}</div><div class="pn"><h3>Privacy policy page</h3>${tex('pp', '', S.pages.privacy, 14)}</div><button class="btn p" id="sp">Save pages</button>`;
  }
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
<main class="mn"><div class="tp"><h1>${T[1]}</h1><div class="row"><button class="btn s" id="rf">${mi('refresh')}Refresh</button><a class="btn s" href="/" target="_blank">${mi('open_in_new')}View site</a><button class="btn s" id="lo">Sign out</button></div></div>${STATE.db === false || STATE.dbErr ? `<div class="wn">Database is not connected, so requests and changes cannot be saved. Connect Upstash Redis in Vercel Storage and redeploy.${STATE.dbErr ? ' (' + esc(STATE.dbErr) + ')' : ''}</div>` : ''}${view()}</main></div>`;
  bind();
}

/* ---------- modal editor for generic entities ---------- */
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
    m.remove();
    await save();
    draw();
  };
}

function addReview() {
  const m = document.createElement('div'); m.className = 'mo';
  m.innerHTML = `<div class="pn"><h3>Add review</h3>${inp('vn', 'Client name', '')}<label for="vs">Rating</label><select id="vs"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select>${tex('vt', 'Review', '', 3)}<div class="row" style="margin-top:20px"><button class="btn p" id="vv">Add</button><button class="btn" id="vc">Cancel</button></div></div>`;
  document.body.appendChild(m); m.onclick = (e) => { if (e.target === m) m.remove(); }; $('#vc').onclick = () => m.remove();
  $('#vv').onclick = async () => {
    const btn = $('#vv');
    btn.disabled = true;
    try {
      const d = await api('/api/admin?action=ratingAdd', { method: 'POST', body: JSON.stringify({ name: $('#vn').value, stars: $('#vs').value, text: $('#vt').value }) });
      RAT.unshift(d.rating);
      m.remove();
      draw();
    } catch (e) {
      toast(e.message);
      btn.disabled = false;
    }
  };
}

/* ---------- event bindings ---------- */
function bind() {
  $$('[data-t]').forEach((a) => (a.onclick = (e) => { e.preventDefault(); tab = a.dataset.t; history.replaceState(null, '', '#' + tab); draw(); scrollTo(0, 0); }));
  $('#lo').onclick = async () => { await api('/api/admin?action=logout', { method: 'POST', body: '{}' }); boot(); };
  $('#rf').onclick = async () => {
    const d = await api('/api/admin?action=data');
    S = d.site;
    REQ = d.requests;
    RAT = d.ratings;
    draw();
    toast('Refreshed');
  };

  // Request filters
  const rl = () => { $('#rl').innerHTML = reqView(); bindReq(); };
  if ($('#rq')) {
    $('#rq').oninput = (e) => { reqF.q = e.target.value.toLowerCase(); rl(); };
    $('#rs').onchange = (e) => { reqF.s = e.target.value; rl(); };
  }
  bindReq();

  // APK catalog bindings
  if (tab === 'apk') {
    if ($('#appAddBtn')) $('#appAddBtn').onclick = () => appEditorModal(null);
    if ($('#appQ')) $('#appQ').oninput = (e) => { apkF.q = e.target.value.toLowerCase(); draw(); };
    if ($('#appCat')) $('#appCat').onchange = (e) => { apkF.c = e.target.value; draw(); };
    if ($('#appSt')) $('#appSt').onchange = (e) => { apkF.s = e.target.value; draw(); };

    $$('[data-app-ed]').forEach((b) => (b.onclick = () => appEditorModal(b.dataset.appEd)));
    $$('[data-app-pub]').forEach((b) => (b.onclick = async () => {
      const id = b.dataset.appPub;
      if (await act('appTogglePublish', { id })) {
        draw();
        toast('Publication status updated');
      }
    }));
    $$('[data-app-feat]').forEach((b) => (b.onclick = async () => {
      const id = b.dataset.appFeat;
      if (await act('appSetFeatured', { id })) {
        draw();
        toast('Featured Super APK updated');
      }
    }));
    $$('[data-app-test]').forEach((b) => (b.onclick = () => testReleasesModal(b.dataset.appTest)));
    $$('[data-app-del]').forEach((b) => (b.onclick = async () => {
      const id = b.dataset.appDel;
      const target = (S.apps || []).find((a) => a.id === id);
      if (confirm(`Are you sure you want to delete "${target ? target.name : 'this app'}"? This action cannot be undone.`)) {
        if (await act('appDelete', { id })) {
          draw();
          toast('Application deleted');
        }
      }
    }));
  }

  // Generic ENT bindings
  $$('[data-add]').forEach((b) => (b.onclick = () => ed(b.dataset.add, -1)));
  $$('[data-ed]').forEach((b) => (b.onclick = () => { const p = b.dataset.ed.split(':'); ed(p[0], +p[1]); }));
  $$('[data-rm]').forEach((b) => (b.onclick = async () => { const p = b.dataset.rm.split(':'); if (confirm('Delete this item?')) { S[p[0]].splice(+p[1], 1); await save(); draw(); } }));
  $$('[data-mv]').forEach((b) => (b.onclick = async () => { const p = b.dataset.mv.split(':'), a = S[p[0]], i = +p[1], j = i + +p[2]; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; await save('Order saved'); draw(); }));
  $$('[data-rv]').forEach((b) => (b.onclick = async () => { const [id, v] = b.dataset.rv.split(':'); if (await act('ratingSet', { id, approved: v === '1' })) { RAT.find((r) => r.id === id).approved = v === '1'; draw(); } }));
  $$('[data-rd]').forEach((b) => (b.onclick = async () => { if (confirm('Delete this review?') && await act('ratingDelete', { id: b.dataset.rd })) { RAT = RAT.filter((r) => r.id !== b.dataset.rd); draw(); } }));
  if ($('#ra')) $('#ra').onclick = addReview;

  // Social links
  if ($('#sad')) $('#sad').onclick = async () => { const u = $('#su').value.trim(); if (!u) return; S.social.push({ url: u, label: '' }); await save('Link added'); draw(); };

  // Pages
  if ($('#sp') && tab === 'pages') $('#sp').onclick = async () => { S.pages.about = $('#pa').value; S.pages.privacy = $('#pp').value; await save('Pages saved'); };

  // Profile photo
  if ($('#sph')) $('#sph').onchange = (e) => resize(e.target.files[0], async (d) => { S.me.photo = d; await save('Photo saved'); draw(); });
  if ($('#spx')) $('#spx').onclick = async () => { S.me.photo = ''; await save('Photo removed'); draw(); };

  // Site settings
  if ($('#ss')) $('#ss').onclick = async () => {
    Object.assign(S.me, { name: $('#sn').value, title: $('#st').value, bio: $('#sb').value, email: $('#se').value, phone: $('#sp').value, address: $('#sa').value });
    Object.assign(S.hero, { badge: $('#hb').value, h: $('#hh').value, p: $('#hp').value });
    S.budget.presets = $('#bp').value.split(',').map((x) => +x.trim()).filter((n) => n >= 1000);
    $$('[data-k]').forEach((x) => { S.show[x.dataset.k] = x.checked ? 1 : 0; });
    await save('Settings saved');
  };
}

function bindReq() {
  $$('[data-st]').forEach((s) => (s.onchange = async () => {
    if (await act('reqStatus', { id: s.dataset.st, status: s.value })) {
      REQ.find((r) => r.id === s.dataset.st).status = s.value;
      toast('Status updated');
      draw();
    }
  }));
  $$('[data-ni]').forEach((b) => (b.onclick = async () => {
    if (confirm('Mark as not interested and delete this request?') && await act('reqDelete', { id: b.dataset.ni })) {
      REQ = REQ.filter((r) => r.id !== b.dataset.ni);
      toast('Request deleted');
      draw();
    }
  }));
}

boot();
