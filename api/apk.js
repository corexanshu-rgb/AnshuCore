import { getSite, getCache, setCache, parseGithubRepo } from './_lib.js';

async function fetchGithubReleases(owner, repo) {
  if (!owner || !repo) return { configured: false, releases: [], total: null };
  const safe = parseGithubRepo(`${owner}/${repo}`);
  if (!safe) return { configured: false, error: 'invalid_repo', releases: [], total: null };

  const cacheKey = `gh:rel:${safe.owner}:${safe.repo}`;
  const cached = await getCache(cacheKey);
  const now = Date.now();

  // Fresh cache (within 15 minutes)
  if (cached && (now - cached.cachedAt < 900000)) {
    return cached.data;
  }

  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'anshucore-platform' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;

  let page = 1;
  const allReleases = [];
  let totalDownloads = 0;
  let fetchError = null;

  try {
    // Paginate through releases (up to 5 pages of 100 items = 500 releases) to compute genuine lifetime downloads
    while (page <= 5) {
      const url = `https://api.github.com/repos/${safe.owner}/${safe.repo}/releases?per_page=100&page=${page}`;
      const r = await fetch(url, { headers });
      if (!r.ok) {
        if (r.status === 403 || r.status === 429) fetchError = 'rate_limited';
        else if (r.status === 404) fetchError = 'not_found';
        else fetchError = 'github_unavailable';
        break;
      }
      const list = await r.json();
      if (!Array.isArray(list) || list.length === 0) break;
      allReleases.push(...list);
      if (list.length < 100) break;
      page++;
    }

    if (fetchError && allReleases.length === 0) {
      if (cached && cached.data) {
        return { ...cached.data, stale: true, error: fetchError };
      }
      return { configured: true, error: fetchError, releases: [], total: null };
    }

    const filtered = allReleases.filter((x) => !x.draft).map((x) => {
      const assets = (x.assets || [])
        .filter((a) => /\.apk$/i.test(a.name))
        .map((a) => ({
          name: a.name,
          size: a.size,
          downloads: Number(a.download_count) || 0,
          url: a.browser_download_url
        }));
      assets.forEach((a) => { totalDownloads += a.downloads; });
      return {
        tag: x.tag_name,
        name: x.name || x.tag_name,
        date: x.published_at,
        body: String(x.body || '').slice(0, 1500),
        prerelease: !!x.prerelease,
        page: x.html_url,
        assets
      };
    }).filter((x) => x.assets.length > 0);

    const latestRelease = filtered[0] || null;
    const result = {
      configured: true,
      releases: filtered,
      total: totalDownloads,
      latest: latestRelease ? {
        tag: latestRelease.tag,
        name: latestRelease.name,
        date: latestRelease.date,
        asset: latestRelease.assets[0] || null
      } : null
    };

    await setCache(cacheKey, { data: result, cachedAt: now }, 900);
    return result;
  } catch (err) {
    if (cached && cached.data) return { ...cached.data, stale: true, error: 'network_error' };
    return { configured: true, error: 'fetch_failed', releases: [], total: null };
  }
}

function getRelatedApps(currentApp, allApps) {
  const published = allApps.filter((a) => a.published && a.id !== currentApp.id);
  const related = [];
  const addedIds = new Set();

  // Priority 1: Administrator manually selected related applications
  if (Array.isArray(currentApp.relatedAppIds)) {
    for (const id of currentApp.relatedAppIds) {
      const found = published.find((a) => a.id === id);
      if (found && !addedIds.has(found.id)) {
        related.push(found);
        addedIds.add(found.id);
      }
    }
  }

  // Priority 2: Applications from the same category
  if (related.length < 4 && currentApp.category) {
    for (const a of published) {
      if (!addedIds.has(a.id) && a.category.toLowerCase() === currentApp.category.toLowerCase()) {
        related.push(a);
        addedIds.add(a.id);
        if (related.length >= 4) break;
      }
    }
  }

  // Fallback to any published apps if needed to ensure recommendations
  if (related.length < 3) {
    for (const a of published) {
      if (!addedIds.has(a.id)) {
        related.push(a);
        addedIds.add(a.id);
        if (related.length >= 3) break;
      }
    }
  }

  return related.map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    icon: a.icon,
    category: a.category,
    shortDescription: a.shortDescription
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');

  try {
    const site = await getSite();
    const slug = String(req.query?.slug || req.query?.app || '').trim();

    // Specific application detail request
    if (slug) {
      const app = site.apps.find((a) => a.slug === slug || a.id === slug);
      if (!app || !app.published) {
        return res.status(404).json({ error: 'Application not found or unpublished' });
      }

      const hasRepo = app.repositoryOwner && app.repositoryName;
      const gh = hasRepo ? await fetchGithubReleases(app.repositoryOwner, app.repositoryName) : { configured: false, releases: [], total: null };
      const relatedApps = getRelatedApps(app, site.apps);

      return res.status(200).json({
        configured: hasRepo,
        app: {
          id: app.id,
          slug: app.slug,
          name: app.name,
          icon: app.icon,
          shortDescription: app.shortDescription,
          category: app.category,
          repositoryOwner: app.repositoryOwner,
          repositoryName: app.repositoryName,
          featured: !!app.featured,
          uses: app.uses || [],
          req: app.req || 'Android 7.0 or later'
        },
        repo: hasRepo ? `${app.repositoryOwner}/${app.repositoryName}` : '',
        repoUrl: hasRepo ? `https://github.com/${app.repositoryOwner}/${app.repositoryName}` : '',
        releases: gh.releases || [],
        total: gh.total,
        latest: gh.latest || null,
        error: gh.error || false,
        stale: !!gh.stale,
        relatedApps
      });
    }

    // Catalog / Summary request: return published apps
    const published = site.apps.filter((a) => a.published);
    const featuredApp = site.apps.find((a) => a.featured && a.published) || published[0] || null;

    // For catalog, fetch/read release summary for apps so cards have real download counts
    const appSummaries = await Promise.all(published.map(async (a) => {
      let latest = null, total = null;
      if (a.repositoryOwner && a.repositoryName) {
        const gh = await fetchGithubReleases(a.repositoryOwner, a.repositoryName);
        latest = gh.latest || null;
        total = gh.total;
      }
      return {
        id: a.id,
        slug: a.slug,
        name: a.name,
        icon: a.icon,
        category: a.category,
        shortDescription: a.shortDescription,
        featured: !!a.featured,
        req: a.req,
        latestVersion: latest ? latest.tag : '',
        latestSize: latest && latest.asset ? latest.asset.size : 0,
        downloadUrl: latest && latest.asset ? latest.asset.url : '',
        totalDownloads: total
      };
    }));

    // Legacy featured app releases support
    let featuredGh = { releases: [], total: 0, configured: false };
    if (featuredApp && featuredApp.repositoryOwner && featuredApp.repositoryName) {
      featuredGh = await fetchGithubReleases(featuredApp.repositoryOwner, featuredApp.repositoryName);
    }

    return res.status(200).json({
      apps: appSummaries,
      featuredApp: featuredApp ? {
        id: featuredApp.id,
        slug: featuredApp.slug,
        name: featuredApp.name,
        icon: featuredApp.icon,
        category: featuredApp.category,
        shortDescription: featuredApp.shortDescription,
        uses: featuredApp.uses || [],
        req: featuredApp.req,
        repo: featuredApp.repositoryOwner && featuredApp.repositoryName ? `${featuredApp.repositoryOwner}/${featuredApp.repositoryName}` : ''
      } : null,
      // Backward compatibility fields for legacy single-app consumers
      configured: featuredGh.configured ?? !!(featuredApp && featuredApp.repositoryOwner),
      repo: featuredApp && featuredApp.repositoryOwner ? `${featuredApp.repositoryOwner}/${featuredApp.repositoryName}` : '',
      repoUrl: featuredApp && featuredApp.repositoryOwner ? `https://github.com/${featuredApp.repositoryOwner}/${featuredApp.repositoryName}` : '',
      releases: featuredGh.releases || [],
      total: featuredGh.total || 0,
      error: featuredGh.error || false
    });
  } catch (e) {
    return res.status(500).json({ error: 'Server error loading APK data' });
  }
}
