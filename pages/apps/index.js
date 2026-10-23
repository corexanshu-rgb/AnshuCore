import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AppIcon from "../../components/AppIcon";
import Seo from "../../components/Seo";
import { getPublicWebsiteData } from "../../lib/adminStore";

export default function AppsIndexPage({ data }) {
  const allApks = data?.apks || [];
  const superApk = data?.superApk || null;
  const seo = data?.seo || {};
  const pageSeo = seo?.pages?.apps || {};

  const breadcrumbs = [{ name: "Apps", path: "/apps" }];

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = ["All", "Tools", "Social", "Media", "Productivity", "Education", "Games", "Security"];

  // Search suggestions
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allApks
      .filter((a) => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
      .slice(0, 5);
  }, [allApks, query]);

  // Filtered applications: Super APK placed first without duplication
  const displayApks = useMemo(() => {
    let list = [...allApks];

    // Filter by category
    if (selectedCategory !== "All") {
      list = list.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }

    // If Super APK is active, place it at the very top without duplicate
    if (superApk) {
      const isSuperInList = list.some((a) => a.slug === superApk.slug);
      if (isSuperInList) {
        // Re-order so superApk is first
        const nonSuper = list.filter((a) => a.slug !== superApk.slug);
        list = [superApk, ...nonSuper];
      }
    }

    return list;
  }, [allApks, superApk, selectedCategory, query]);

  return (
    <>
      <Seo
        title={pageSeo.title || `Android Applications & Direct APK Downloads — ${seo.siteTitle || "AnshuCore"}`}
        description={
          pageSeo.description ||
          "Browse and download official, cryptographically verified Android applications built by AnshuCore, including Anshu Mock, AnshuCore ERP, and Core Notes."
        }
        path="/apps"
        canonicalBase={seo.canonicalBase}
        noindex={pageSeo.noindex || false}
        breadcrumbs={breadcrumbs}
        keywords="Android applications, direct APK download, AnshuCore apps, Anshu Mock APK, educational Android apps"
      />

      <Navbar />

      <main className="site-container py-12 lg:py-16">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-3">
            <span>Direct APK Downloads</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
            Android Apps
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Explore our useful Android applications. Simple, fast and always updated with genuine GitHub releases.
          </p>
        </div>

        {/* Search & Suggestions */}
        <div className="relative max-w-xl mb-6">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search apps by name, category or utility..."
              className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 bg-white text-sm text-[#0f172a] shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-20">
              <div className="p-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 pt-3">
                Suggested Applications
              </div>
              {suggestions.map((s) => (
                <Link
                  key={s.slug}
                  href={`/apps/${s.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <AppIcon icon={s.icon} name={s.name} size={28} className="rounded-lg shadow-xs" />
                    <span className="text-sm font-semibold text-[#0f172a]">{s.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{s.category}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Category Pills (Matching Visual Mockup) */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-slate-100">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Super APK Spotlight Banner (if active) */}
        {superApk && selectedCategory === "All" && !query.trim() && (
          <div className="mb-10 ac-card p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-indigo-50/40 border border-blue-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <AppIcon icon={superApk.icon} name={superApk.name} size={64} className="rounded-2xl shadow-lg shadow-blue-500/20 shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                    Featured Super APK
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{superApk.category}</span>
                </div>
                <h2 className="text-2xl font-bold text-[#0f172a]">{superApk.name}</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg">{superApk.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-mono">
                  <span>{superApk.releaseTag || "v1.2.1"}</span>
                  <span>•</span>
                  <span>{superApk.sizeFormatted || "24.8 MB"}</span>
                  <span>•</span>
                  <span className="font-semibold text-blue-700">
                    {superApk.downloadCount.toLocaleString()} downloads
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href={`/apps/${superApk.slug}`} className="ac-btn-primary py-2.5 px-6">
                View App Details
              </Link>
            </div>
          </div>
        )}

        {/* Applications Grid */}
        {displayApks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <p className="text-base text-slate-600 font-semibold mb-2">No applications match your criteria.</p>
            <p className="text-sm text-slate-400">Try searching for a different term or selecting &quot;All&quot; categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {displayApks.map((app) => (
              <div
                key={app.id || app.slug}
                className="ac-card ac-card-hover p-6 flex flex-col items-center text-center justify-between"
              >
                <AppIcon icon={app.icon} name={app.name} size={64} className="rounded-2xl shadow-md mb-4" />

                <div className="mb-4 w-full">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <h3 className="text-base font-bold text-[#0f172a] truncate" title={app.name}>
                      {app.name}
                    </h3>
                    {app.isSuperApk && (
                      <span className="inline-flex items-center text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded" title="Super APK">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 inline mr-0.5" aria-hidden="true">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        Super
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2 truncate">{app.category}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    {app.releaseTag || "v1.2.1"} • {app.sizeFormatted || "24 MB"}
                  </p>
                </div>

                <Link
                  href={`/apps/${app.slug}`}
                  className="ac-btn-primary w-full text-xs py-2 px-4 rounded-xl"
                >
                  View App
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export async function getStaticProps() {
  const websiteData = await getPublicWebsiteData();
  return {
    props: {
      data: JSON.parse(JSON.stringify(websiteData)),
    },
    revalidate: 30,
  };
}
