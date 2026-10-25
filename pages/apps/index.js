import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AppCard, { formatDownloadCount } from "../../components/AppCard";
import AppIcon from "../../components/AppIcon";
import Seo from "../../components/Seo";
import { getPublicWebsiteData } from "../../lib/adminStore";

// --- Category SVG Icons ---
function CategoryIcon({ category, size = 18, className = "" }) {
  const c = (category || "").toLowerCase();
  if (c.includes("all")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (c.includes("education") || c.includes("learn") || c.includes("study")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }
  if (c.includes("productiv") || c.includes("office") || c.includes("note")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    );
  }
  if (c.includes("developer") || c.includes("code") || c.includes("programming")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  if (c.includes("utilit") || c.includes("system")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    );
  }
  if (c.includes("entertain") || c.includes("media") || c.includes("movie") || c.includes("music")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    );
  }
  if (c.includes("tool")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }
  if (c.includes("secur") || c.includes("protect")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (c.includes("personal") || c.includes("theme")) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a7 7 0 0 0 0 14v6a10 10 0 0 0 0-20z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// --- Phone Frame Preview Component for Featured Banner ---
function PhonePreviewMockup({ app }) {
  const screenshot = app?.screenshots && app.screenshots.length > 0 ? app.screenshots[0] : null;

  return (
    <div className="relative w-44 sm:w-52 md:w-56 h-80 sm:h-96 rounded-[2.5rem] bg-slate-900 p-2 shadow-2xl border-4 border-slate-800 flex-shrink-0 select-none">
      {/* Speaker / Notch */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-slate-800 rounded-full z-20 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/50" />
      </div>

      {/* Screen Inner */}
      <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/40 relative flex flex-col justify-between p-3.5 pt-8">
        {screenshot ? (
          <img
            src={screenshot}
            alt={`${app.name} preview`}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = "flex";
              }
            }}
          />
        ) : null}

        {/* Fallback stylized app interface inside phone */}
        <div className={`w-full h-full flex-col justify-between ${screenshot ? "hidden" : "flex"}`}>
          <div className="flex items-center gap-2.5 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-xs border border-slate-100">
            <AppIcon icon={app?.icon} name={app?.name} size={36} className="rounded-xl shadow-xs" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{app?.name}</p>
              <p className="text-[10px] text-blue-600 font-medium truncate">{app?.category}</p>
            </div>
          </div>

          <div className="space-y-2 my-auto py-2">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
              <p className="text-[10px] font-semibold opacity-90">Mock Test Simulator</p>
              <p className="text-xs font-bold mt-0.5">Chapter-wise Test #4</p>
              <div className="w-full bg-blue-700/60 rounded-full h-1.5 mt-2">
                <div className="bg-white rounded-full h-1.5 w-3/4" />
              </div>
            </div>

            <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-600">Scorecard Analysis</span>
              <span className="text-[10px] font-bold text-emerald-600">94.2%</span>
            </div>

            <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-xs flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-600">Offline SQLite Bank</span>
              <span className="text-[10px] font-bold text-blue-600">Active</span>
            </div>
          </div>

          <div className="w-full py-1.5 text-center bg-blue-600 text-white rounded-lg text-[10px] font-bold shadow-xs">
            Start Practice
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppsIndexPage({ data }) {
  const router = useRouter();
  const allApks = useMemo(() => data?.apks || [], [data?.apks]);
  const categoriesList = useMemo(() => {
    const list = data?.categories || ["Education", "Productivity", "Developer Tools", "Utilities", "Entertainment", "Tools", "Other"];
    return list;
  }, [data?.categories]);

  const seo = data?.seo || {};
  const pageSeo = seo?.pages?.apps || {};
  const breadcrumbs = [{ name: "Apps", path: "/apps" }];

  // State
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const searchContainerRef = useRef(null);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter categories with real app count
  const categoryCounts = useMemo(() => {
    const counts = { All: allApks.length };
    categoriesList.forEach((c) => {
      counts[c] = allApks.filter((a) => a.category?.toLowerCase() === c.toLowerCase()).length;
    });
    return counts;
  }, [allApks, categoriesList]);

  // Featured apps (superApk first, or any marked isSuperApk)
  const featuredApps = useMemo(() => {
    const superList = allApks.filter((a) => a.isSuperApk);
    if (superList.length > 0) return superList;
    return allApks.length > 0 ? [allApks[0]] : [];
  }, [allApks]);

  const currentFeaturedApp = featuredApps[featuredIndex % Math.max(1, featuredApps.length)] || null;

  // Search suggestions: search name, description, category, features/keywords
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allApks
      .filter((a) => {
        const inName = a.name.toLowerCase().includes(q);
        const inCat = a.category && a.category.toLowerCase().includes(q);
        const inDesc = a.description && a.description.toLowerCase().includes(q);
        const inTagline = a.tagline && a.tagline.toLowerCase().includes(q);
        const inFeatures = Array.isArray(a.features) && a.features.some((f) => f.toLowerCase().includes(q));
        return inName || inCat || inDesc || inTagline || inFeatures;
      })
      .slice(0, 6);
  }, [allApks, query]);

  // Handle keyboard navigation in search suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      const target = suggestions[focusedSuggestionIndex];
      if (target) {
        setShowSuggestions(false);
        router.push(`/apps/${target.slug}`);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setFocusedSuggestionIndex(-1);
    }
  };

  // 1. Popular Apps: ordered by genuine downloadCount descending
  const popularApps = useMemo(() => {
    return [...allApks].sort((a, b) => (Number(b.downloadCount) || 0) - (Number(a.downloadCount) || 0));
  }, [allApks]);

  // 2. Latest Updated: ordered by actual updatedAt timestamp descending
  const latestUpdatedApps = useMemo(() => {
    return [...allApks].sort((a, b) => {
      const timeA = new Date(a.updatedAt || 0).getTime();
      const timeB = new Date(b.updatedAt || 0).getTime();
      return timeB - timeA;
    });
  }, [allApks]);

  // 3. Recommended Apps: deterministic fallback based on configured features or top downloads
  const recommendedApps = useMemo(() => {
    // Apps that are not the current featured app, or secondary highlights
    if (allApks.length <= 1) return allApks;
    return allApks.filter((a) => !a.isSuperApk).concat(allApks.filter((a) => a.isSuperApk));
  }, [allApks]);

  // Filtered applications based on category & search query
  const filteredApps = useMemo(() => {
    let list = [...allApks];
    if (selectedCategory !== "All") {
      list = list.filter((a) => a.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter((a) => {
        const inName = a.name.toLowerCase().includes(q);
        const inCat = a.category && a.category.toLowerCase().includes(q);
        const inDesc = a.description && a.description.toLowerCase().includes(q);
        const inTagline = a.tagline && a.tagline.toLowerCase().includes(q);
        const inFeatures = Array.isArray(a.features) && a.features.some((f) => f.toLowerCase().includes(q));
        return inName || inCat || inDesc || inTagline || inFeatures;
      });
    }
    return list;
  }, [allApks, selectedCategory, query]);

  const isBrowsingAll = selectedCategory === "All" && !query.trim();

  return (
    <>
      <Seo
        title={pageSeo.title || `AnshuCore Apps Store — Official Android Applications & Direct APK Downloads`}
        description={
          pageSeo.description ||
          "Browse and download official, cryptographically verified Android applications built by AnshuCore, including Anshu Mock, AnshuCore ERP, Core Notes, and developer utilities."
        }
        path="/apps"
        canonicalBase={seo.canonicalBase}
        noindex={pageSeo.noindex || false}
        breadcrumbs={breadcrumbs}
        keywords="AnshuCore apps, Android app store, direct APK download, official Android apps, Anshu Mock APK, education apps"
      />

      <Navbar />

      <div className="bg-[#f8fafc] min-h-screen pb-16 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Search Bar matching Reference UI */}
          <div className="pt-2 sm:pt-4 pb-4 sm:pb-6">
            <div className="w-full max-w-2xl lg:max-w-3xl mx-auto relative" ref={searchContainerRef}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowSuggestions(false);
                }}
                className="relative flex items-center"
                role="search"
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                <input
                  type="search"
                  id="store-search-input"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                    setFocusedSuggestionIndex(-1);
                  }}
                  onFocus={() => {
                    if (query.trim()) setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search apps, tools, games..."
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-2.5 sm:py-3 bg-white rounded-2xl border border-slate-200/90 text-xs sm:text-sm text-[#0f172a] placeholder-slate-400 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  aria-label="Search apps, tools, games"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions && suggestions.length > 0}
                />

                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 sm:right-1.5 sm:top-1.5 sm:bottom-1.5 px-3.5 sm:px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Search
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && query.trim() && (
                <div
                  className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  role="listbox"
                >
                  {suggestions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No published applications found matching &quot;{query}&quot;.
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Suggested Applications
                      </div>
                      {suggestions.map((app, index) => {
                        const isFocused = index === focusedSuggestionIndex;
                        return (
                          <Link
                            key={app.id || app.slug}
                            href={`/apps/${app.slug}`}
                            onClick={() => setShowSuggestions(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                              isFocused ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-[#0f172a]"
                            }`}
                            role="option"
                            aria-selected={isFocused}
                          >
                            <AppIcon icon={app.icon} name={app.name} size={36} className="rounded-xl shadow-xs" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{app.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">{app.category}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {app.releaseTag || "v1.0.0"}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile & Tablet Category Chips (Horizontal Scroll) matching Reference Image 2 */}
          <div
            className="lg:hidden mb-4 sm:mb-6 -mx-4 px-4 overflow-x-auto scrollbar-none flex items-center gap-2 pb-1.5"
            style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
          >
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === "All"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              All
            </button>
            {categoriesList.map((cat) => {
              const count = categoryCounts[cat] || 0;
              // Do not show empty categories on mobile chips unless selected
              if (count === 0 && selectedCategory !== cat) return null;
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main Layout: Desktop Sidebar (Left) + Content Area (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Left Sidebar: Categories matching Reference Image 1 */}
            <aside className="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider">
                  Categories
                </h2>
                <span className="text-xs text-slate-400 font-semibold font-mono">
                  {allApks.length} Apps
                </span>
              </div>

              <nav className="space-y-1" aria-label="Category navigation">
                {/* "All Apps" Pill */}
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    selectedCategory === "All"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0f172a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon category="all" size={17} className={selectedCategory === "All" ? "text-white" : "text-slate-400"} />
                    <span>All Apps</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    selectedCategory === "All" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {allApks.length}
                  </span>
                </button>

                {/* Persistent Admin-Managed Categories */}
                {categoriesList.map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#0f172a]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={cat} size={17} className={isActive ? "text-white" : "text-slate-400"} />
                        <span className="truncate">{cat}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Developer / Studio Info */}
              <div className="mt-8 pt-5 border-t border-slate-100 px-2 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-600">Official AnshuCore Apps</p>
                <p className="mt-1 leading-relaxed">Cryptographically signed APK packages with genuine GitHub release integrity.</p>
              </div>
            </aside>

            {/* Main Content Area (Right) */}
            <main className="lg:col-span-9 space-y-10">
              {/* Active Category Filter Header when filtered */}
              {selectedCategory !== "All" && (
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CategoryIcon category={selectedCategory} size={20} />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-[#0f172a]">{selectedCategory}</h1>
                      <p className="text-xs text-slate-500">Showing {filteredApps.length} published application{filteredApps.length === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* 1. Featured App Banner matching Reference Image 1 & 2 */}
              {isBrowsingAll && currentFeaturedApp && (
                <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-100/40 border border-blue-200/80 shadow-sm p-5 sm:p-7 lg:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
                    {/* Left: App Details and Actions */}
                    <div className="max-w-xl space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3">
                        <AppIcon
                          icon={currentFeaturedApp.icon}
                          name={currentFeaturedApp.name}
                          size={64}
                          className="rounded-2xl shadow-md border-2 border-white flex-shrink-0"
                        />
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] sm:text-[11px] font-bold tracking-wide uppercase shadow-xs">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            Featured App
                          </span>
                          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0f172a] tracking-tight mt-0.5">
                            {currentFeaturedApp.name}
                          </h2>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed font-normal">
                        {currentFeaturedApp.tagline || currentFeaturedApp.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                        {currentFeaturedApp.directUrl && currentFeaturedApp.directUrl !== "#" ? (
                          <a
                            href={currentFeaturedApp.directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="ac-btn-primary py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Download APK</span>
                          </a>
                        ) : (
                          <Link
                            href={`/apps/${currentFeaturedApp.slug}`}
                            className="ac-btn-primary py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-600/20"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>Download APK</span>
                          </Link>
                        )}

                        <Link
                          href={`/apps/${currentFeaturedApp.slug}`}
                          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-xs"
                        >
                          View Details
                        </Link>
                      </div>

                      {/* Genuine Stats Row */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 text-[11px] sm:text-xs text-slate-600 font-medium">
                        {typeof currentFeaturedApp.rating === "number" && currentFeaturedApp.rating > 0 && (
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span>{currentFeaturedApp.rating.toFixed(1)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-slate-500">
                          <CategoryIcon category={currentFeaturedApp.category} size={14} />
                          <span>{currentFeaturedApp.category}</span>
                        </div>

                        {currentFeaturedApp.downloadCount > 0 && (
                          <div className="flex items-center gap-1 text-slate-500">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>{formatDownloadCount(currentFeaturedApp.downloadCount)} Downloads</span>
                          </div>
                        )}

                        {currentFeaturedApp.releaseTag && (
                          <span className="font-mono text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                            {currentFeaturedApp.releaseTag.startsWith("v") ? currentFeaturedApp.releaseTag : `v${currentFeaturedApp.releaseTag}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Phone Mockup Frame */}
                    <div className="hidden md:flex items-center justify-center flex-shrink-0">
                      <PhonePreviewMockup app={currentFeaturedApp} />
                    </div>
                  </div>

                  {/* Carousel Controls if multiple featured apps */}
                  {featuredApps.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-5">
                      {featuredApps.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setFeaturedIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === featuredIndex ? "bg-blue-600 w-5" : "bg-slate-300 hover:bg-slate-400"
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* 2. Collection Sections when browsing All Apps */}
              {isBrowsingAll ? (
                <>
                  {/* Collection A: Popular Apps */}
                  {popularApps.length > 0 && (
                    <section aria-labelledby="heading-popular-apps">
                      <div className="flex items-center justify-between mb-3.5">
                        <div>
                          <h2 id="heading-popular-apps" className="text-base sm:text-lg md:text-xl font-bold text-[#0f172a]">
                            Popular Apps
                          </h2>
                          <p className="text-xs text-slate-500">Most downloaded applications verified by genuine distribution data.</p>
                        </div>
                        <button
                          onClick={() => {
                            const el = document.getElementById("browse-all-apps");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                        >
                          View All &rarr;
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
                        {popularApps.slice(0, 6).map((app) => (
                          <AppCard key={`popular-${app.id || app.slug}`} app={app} compact />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Collection B: Latest Updated */}
                  {latestUpdatedApps.length > 0 && (
                    <section aria-labelledby="heading-latest-updated">
                      <div className="flex items-center justify-between mb-3.5">
                        <div>
                          <h2 id="heading-latest-updated" className="text-base sm:text-lg md:text-xl font-bold text-[#0f172a]">
                            Latest Updated
                          </h2>
                          <p className="text-xs text-slate-500">Recently updated builds with latest bug fixes and features.</p>
                        </div>
                        <button
                          onClick={() => {
                            const el = document.getElementById("browse-all-apps");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                        >
                          View All &rarr;
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
                        {latestUpdatedApps.slice(0, 6).map((app) => (
                          <AppCard key={`latest-${app.id || app.slug}`} app={app} compact />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Collection C: Recommended for You */}
                  {recommendedApps.length > 0 && (
                    <section aria-labelledby="heading-recommended-apps">
                      <div className="flex items-center justify-between mb-3.5">
                        <div>
                          <h2 id="heading-recommended-apps" className="text-base sm:text-lg md:text-xl font-bold text-[#0f172a]">
                            Recommended for You
                          </h2>
                          <p className="text-xs text-slate-500">Handpicked tools and software crafted by AnshuCore.</p>
                        </div>
                        <button
                          onClick={() => {
                            const el = document.getElementById("browse-all-apps");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                        >
                          View All &rarr;
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
                        {recommendedApps.slice(0, 6).map((app) => (
                          <AppCard key={`rec-${app.id || app.slug}`} app={app} compact />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Collection D: Browse All Apps Grid */}
                  <section id="browse-all-apps" aria-labelledby="heading-all-apps" className="pt-4 border-t border-slate-200">
                    <div className="mb-3.5">
                      <h2 id="heading-all-apps" className="text-base sm:text-lg md:text-xl font-bold text-[#0f172a]">
                        Browse All Apps
                      </h2>
                      <p className="text-xs text-slate-500">Complete catalog of all {allApks.length} official Android applications.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                      {allApks.map((app) => (
                        <AppCard key={`all-${app.id || app.slug}`} app={app} />
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                /* Filtered or Search Results Grid */
                <section aria-labelledby="heading-filtered-apps">
                  <div className="mb-4">
                    <h2 id="heading-filtered-apps" className="text-lg font-bold text-[#0f172a]">
                      {query.trim() ? `Search Results for "${query}"` : `${selectedCategory} Applications`}
                    </h2>
                  </div>

                  {filteredApps.length === 0 ? (
                    <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      </div>
                      <h3 className="text-base font-bold text-[#0f172a] mb-1">No matching applications found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                        We couldn&apos;t find any published apps matching your criteria. Try searching for different keywords or select &quot;All Apps&quot;.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory("All");
                          setQuery("");
                        }}
                        className="ac-btn-primary text-xs py-2 px-5 rounded-xl font-semibold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
                      {filteredApps.map((app) => (
                        <AppCard key={`filtered-${app.id || app.slug}`} app={app} />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </main>
          </div>
        </div>
      </div>

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
