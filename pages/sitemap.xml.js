import { getStore } from "../lib/adminStore";

export default function SiteMap() {
  return null;
}

export async function getServerSideProps({ res }) {
  try {
    const store = await getStore();
    const canonicalBase = (store?.websiteContent?.seo?.canonicalBase || "https://anshucore.in")
      .trim()
      .replace(/\/+$/, "");
    const pagesConfig = store?.websiteContent?.seo?.pages || {};

    const staticRoutes = [
      { path: "", priority: "1.0", changefreq: "weekly", key: "home" },
      { path: "/services", priority: "0.9", changefreq: "weekly", key: "services" },
      { path: "/services/mainpuri", priority: "0.9", changefreq: "weekly", key: "mainpuri" },
      { path: "/projects", priority: "0.8", changefreq: "monthly", key: "projects" },
      { path: "/apps", priority: "0.9", changefreq: "daily", key: "apps" },
      { path: "/about", priority: "0.7", changefreq: "monthly", key: "about" },
      { path: "/contact", priority: "0.8", changefreq: "monthly", key: "contact" },
      { path: "/privacy", priority: "0.3", changefreq: "yearly", key: "privacy" },
      { path: "/terms", priority: "0.3", changefreq: "yearly", key: "terms" },
    ];

    const now = new Date().toISOString().split("T")[0];
    const entries = [];

    for (const route of staticRoutes) {
      if (pagesConfig[route.key]?.noindex) continue;
      entries.push(`  <url>
    <loc>${canonicalBase}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
    }

    // Published APKs from admin store
    const publishedApks = (store?.apks || []).filter((a) => a.published !== false);
    for (const apk of publishedApks) {
      entries.push(`  <url>
    <loc>${canonicalBase}/apps/${apk.slug}</loc>
    <lastmod>${apk.updatedAt || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=43200");
    res.write(xml);
    res.end();
  } catch (error) {
    console.error("Error generating dynamic sitemap.xml:", error);
    res.statusCode = 500;
    res.end("Error generating sitemap");
  }

  return {
    props: {},
  };
}
