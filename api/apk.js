import { getSite } from './_lib.js';

const repoOf = (v) => {
  const m = /(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:\/.*)?$/.exec(String(v || '').trim());
  return m ? m[1] + '/' + m[2] : '';
};

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const site = await getSite();
  const repo = repoOf(site.apk.repo);
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
  if (!repo) return res.status(200).json({ configured: false });
  try {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'anshucore-site' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
    const r = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=15`, { headers });
    if (!r.ok) return res.status(200).json({ configured: true, repo, error: true, releases: [], total: 0 });
    const list = await r.json();
    let total = 0;
    const releases = list.filter((x) => !x.draft).map((x) => {
      const assets = (x.assets || []).filter((a) => /\.apk$/i.test(a.name)).map((a) => ({ name: a.name, size: a.size, downloads: a.download_count, url: a.browser_download_url }));
      assets.forEach((a) => { total += a.downloads; });
      return { tag: x.tag_name, name: x.name || x.tag_name, date: x.published_at, body: String(x.body || '').slice(0, 1200), prerelease: !!x.prerelease, page: x.html_url, assets };
    }).filter((x) => x.assets.length);
    res.status(200).json({ configured: true, repo, repoUrl: 'https://github.com/' + repo, releases, total });
  } catch (e) {
    res.status(200).json({ configured: true, repo, error: true, releases: [], total: 0 });
  }
}
