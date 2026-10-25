import React from "react";
import Link from "next/link";
import AppIcon from "./AppIcon";

/**
 * Format genuine download count (e.g. 1M+, 8.4K+, 79, or New)
 */
export function formatDownloadCount(count) {
  if (count === undefined || count === null || count === "") return null;
  const num = Number(count);
  if (isNaN(num)) return null;
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  }
  if (num > 0) {
    return `${num.toLocaleString()}`;
  }
  return "New";
}

/**
 * Play Store-Inspired App Card Component
 * Strictly respects genuine data rules (only shows ratings if verified data exists).
 */
export default function AppCard({ app, compact = false, className = "" }) {
  if (!app) return null;

  const version = app.releaseTag
    ? app.releaseTag.startsWith("v")
      ? app.releaseTag
      : `v${app.releaseTag}`
    : null;

  const downloads = formatDownloadCount(app.downloadCount);
  const hasGenuineRating = typeof app.rating === "number" && app.rating > 0 && app.rating <= 5;

  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`group block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-2xl ${className}`}
      title={`View ${app.name} details`}
      aria-label={`${app.name} (${app.category})`}
    >
      <div
        className={`bg-white rounded-2xl border border-slate-100/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)] 
        transition-all duration-200 ease-out group-hover:border-blue-200 
        group-hover:shadow-[0_10px_25px_-5px_rgba(37,99,235,0.12)] group-hover:-translate-y-1
        flex flex-col justify-between h-full ${compact ? "p-3 sm:p-3.5" : "p-3.5 sm:p-5"}`}
      >
        {/* Top Section: Icon, Name, Category */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2.5 flex-shrink-0">
            <AppIcon
              icon={app.icon}
              name={app.name}
              size={compact ? 50 : 60}
              className="rounded-2xl shadow-sm border border-slate-100 transition-transform duration-200 group-hover:scale-105"
            />
            {app.isSuperApk && (
              <span
                className="absolute -top-1 -right-1 bg-blue-600 text-white p-0.5 rounded-full shadow-xs"
                title="Featured Application"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
            )}
          </div>

          <h3
            className="w-full font-bold text-xs sm:text-sm text-[#0f172a] group-hover:text-blue-600 transition-colors line-clamp-1"
            title={app.name}
          >
            {app.name}
          </h3>

          <p className="w-full text-[10px] sm:text-xs text-slate-500 font-medium truncate mt-0.5">
            {app.category || "Application"}
          </p>

          {app.tagline && (
            <p className="w-full text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal hidden sm:block">
              {app.tagline}
            </p>
          )}
        </div>

        {/* Bottom Metadata: Ratings, Downloads, Version */}
        <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 w-full font-medium">
          {hasGenuineRating ? (
            <div className="flex items-center gap-1 text-amber-500 font-semibold" title={`Verified rating: ${app.rating}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{app.rating.toFixed(1)}</span>
            </div>
          ) : downloads ? (
            <div className="flex items-center gap-1 text-slate-500" title="Genuine Downloads">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{downloads}</span>
            </div>
          ) : (
            <span className="text-slate-400 font-normal">Official APK</span>
          )}

          {version && (
            <span className="font-mono text-[9px] sm:text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
              {version}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
