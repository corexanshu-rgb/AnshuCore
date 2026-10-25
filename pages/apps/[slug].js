import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AppIcon from "../../components/AppIcon";
import AppCard, { formatDownloadCount } from "../../components/AppCard";
import Seo from "../../components/Seo";
import { getStore, getPublicWebsiteData } from "../../lib/adminStore";

export default function AppDetailPage({ app, relatedApps = [], reviews = [], seo = {} }) {
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  // Download URL configuration
  const downloadUrl = app.directUrl && app.directUrl !== "#" ? app.directUrl : null;
  const githubRepoUrl = app.repo ? (app.repo.startsWith("http") ? app.repo : `https://github.com/${app.repo}`) : null;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleDownloadClick = (e) => {
    if (!downloadUrl) {
      e.preventDefault();
      setDownloadError("The direct APK download asset is currently being compiled or requires GitHub access. You can visit the GitHub Releases page below.");
    } else {
      setDownloadError("");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewSuccess("");
    setReviewError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appSlug: app.slug,
          appName: app.name,
          userName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setReviewError(json.error || "Failed to submit review.");
        setSubmittingReview(false);
        return;
      }

      setReviewSuccess(json.message || "Thank you! Your verified review has been submitted for moderation.");
      setReviewName("");
      setReviewComment("");
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const breadcrumbs = [
    { name: "Apps", path: "/apps" },
    { name: app.category || "General", path: `/apps` },
    { name: app.name, path: `/apps/${app.slug}` },
  ];

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    operatingSystem: "Android",
    applicationCategory: app.category || "UtilitiesApplication",
    softwareVersion: app.releaseTag || "1.0.0",
    fileSize: app.sizeFormatted || "20 MB",
    downloadUrl: downloadUrl ? (downloadUrl.startsWith("http") ? downloadUrl : `https://anshucore.in${downloadUrl}`) : undefined,
    author: {
      "@type": "Organization",
      name: app.developer || "AnshuCore",
      url: "https://anshucore.in",
    },
    description: app.description || `Download ${app.name} APK for Android developed by AnshuCore.`,
  };

  const hasScreenshots = Array.isArray(app.screenshots) && app.screenshots.length > 0;
  const hasFeatures = Array.isArray(app.features) && app.features.length > 0;
  const hasChangelog = Array.isArray(app.changelog) && app.changelog.length > 0;
  const hasGenuineRating = typeof app.rating === "number" && app.rating > 0;
  const downloadsFormatted = formatDownloadCount(app.downloadCount);

  return (
    <>
      <Seo
        title={`${app.name} — Download Android APK | ${seo?.siteTitle || "AnshuCore Apps Store"}`}
        description={`Download ${app.name} APK (${app.releaseTag || "latest"}) for Android. ${
          app.tagline || app.description || "Official cryptographically verified APK build."
        }`}
        path={`/apps/${app.slug}`}
        canonicalBase={seo?.canonicalBase}
        breadcrumbs={breadcrumbs}
        jsonLd={appSchema}
        keywords={`${app.name}, ${app.name} APK, download ${app.name} Android, AnshuCore apps, ${app.category} APK`}
      />

      <Navbar />

      <div className="bg-[#f8fafc] min-h-screen pt-2 sm:pt-4 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation matching Reference UI */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/apps" className="hover:text-blue-600 transition-colors">Apps</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">{app.category}</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#0f172a] font-bold truncate max-w-xs">{app.name}</span>
          </nav>

          {/* Main App Hero Card matching Reference Image 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm mb-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
              <div className="flex items-start sm:items-center gap-5 sm:gap-6">
                <AppIcon
                  icon={app.icon}
                  name={app.name}
                  size={96}
                  className="rounded-3xl shadow-md border-2 border-slate-100 flex-shrink-0"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                    {app.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                    <span className="text-blue-600">{app.category}</span>
                    <span>&bull;</span>
                    <span>{app.developer || "AnshuCore"}</span>
                  </p>

                  {/* Badges / Metrics Row matching Reference Image 3 */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3 text-xs">
                    {hasGenuineRating ? (
                      <div className="flex items-center gap-1 font-bold text-slate-700">
                        <span className="text-amber-500">★</span>
                        <span>{app.rating.toFixed(1)}</span>
                        {app.reviewCount ? (
                          <span className="text-slate-400 font-normal">({app.reviewCount} reviews)</span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-500 font-medium">Verified Release</span>
                    )}

                    {downloadsFormatted && (
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>{downloadsFormatted} Downloads</span>
                      </div>
                    )}

                    {app.sizeFormatted && (
                      <span className="text-slate-500 font-mono">
                        {app.sizeFormatted}
                      </span>
                    )}

                    <span className="text-slate-600 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                      {app.ageRating || "Rated for 3+"}
                    </span>

                    {app.releaseTag && (
                      <span className="font-mono text-slate-500 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-100">
                        {app.releaseTag.startsWith("v") ? app.releaseTag : `v${app.releaseTag}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons Row matching Reference Image 3 */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto pt-2 md:pt-0">
                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={handleDownloadClick}
                    className="ac-btn-primary flex-1 sm:flex-none py-3 px-7 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download APK</span>
                  </a>
                ) : (
                  <button
                    onClick={handleDownloadClick}
                    className="ac-btn-primary flex-1 sm:flex-none py-3 px-7 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download APK</span>
                  </button>
                )}

                {githubRepoUrl && (
                  <a
                    href={githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>GitHub Release</span>
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 p-3 rounded-xl transition-colors shadow-xs"
                  title="Share Application Link"
                  aria-label="Share Application"
                >
                  {copiedShare ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Download error or share confirmation alert */}
            {copiedShare && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Direct link to {app.name} copied to clipboard!</span>
              </div>
            )}

            {downloadError && (
              <div className="mt-4 p-3.5 bg-amber-50 text-amber-800 rounded-xl text-xs leading-relaxed border border-amber-200 flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div className="flex-1">
                  <p className="font-semibold">{downloadError}</p>
                  {githubRepoUrl && (
                    <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold mt-1 inline-block">
                      View releases on GitHub &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Screenshots Gallery / Mockup Slider matching Reference UI */}
            {hasScreenshots && (
              <div className="pt-8">
                <h3 className="text-sm font-bold text-[#0f172a] uppercase tracking-wider mb-4">
                  Screenshots & Preview
                </h3>
                <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-thin">
                  {app.screenshots.map((screen, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedScreenshot(screen)}
                      className="cursor-pointer relative w-44 sm:w-52 h-72 sm:h-84 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 shadow-sm transition-all flex-shrink-0 group"
                    >
                      <img
                        src={screen}
                        alt={`${app.name} screenshot ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2 bg-white/90 rounded-full shadow-md text-blue-600">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Two-Column Layout: Details (Left) + App Info Card (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
            {/* Left Column: About This App, Features & Changelog */}
            <div className="lg:col-span-8 space-y-8">
              {/* About This App Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-[#0f172a] mb-4">
                  About This App
                </h2>
                <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-3 font-normal whitespace-pre-line">
                  {app.description || "Official Android application developed and maintained by AnshuCore."}
                </div>

                {/* Features & Keywords Tags matching Reference Image 3 */}
                {hasFeatures && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Features & Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {app.features.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-semibold transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* What's New / Version Changelog if present */}
              {hasChangelog && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0f172a] mb-4">
                    What&apos;s New & Release Notes
                  </h2>
                  <div className="space-y-4">
                    {app.changelog.map((log, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-bold text-blue-600">Version {log.version}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{log.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1 font-normal">{log.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews & Moderated Feedback */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#0f172a]">
                      Verified User Reviews
                    </h2>
                    <p className="text-xs text-slate-500">Genuine reviews submitted by real users of {app.name}.</p>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center mb-6">
                    <p className="text-xs text-slate-500 font-medium">No reviews published yet for this application.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Be the first to test this APK and submit your feedback!</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#0f172a]">{rev.userName}</span>
                          <div className="flex items-center text-amber-500 text-xs">
                            {"★".repeat(Math.min(5, rev.rating || 5))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">{rev.comment}</p>
                        <span className="text-[10px] text-slate-400 mt-2 block">{rev.date}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-[#0f172a]">Leave a Review</h3>
                  {reviewSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                      {reviewSuccess}
                    </div>
                  )}
                  {reviewError && (
                    <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold border border-rose-200">
                      {reviewError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="5">★★★★★ (5 - Excellent)</option>
                        <option value="4">★★★★☆ (4 - Good)</option>
                        <option value="3">★★★☆☆ (3 - Average)</option>
                        <option value="2">★★☆☆☆ (2 - Poor)</option>
                        <option value="1">★☆☆☆☆ (1 - Terrible)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Feedback</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience using this app..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="ac-btn-primary py-2 px-5 text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: App Info Card matching Reference Image 3 */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm sticky top-24">
                <h3 className="text-base font-bold text-[#0f172a] mb-5">
                  App Info
                </h3>

                <dl className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <dt className="text-slate-500 font-medium">Version</dt>
                    <dd className="font-mono font-bold text-slate-800">{app.releaseTag || "1.0.0"}</dd>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <dt className="text-slate-500 font-medium">Updated on</dt>
                    <dd className="font-medium text-slate-800">{app.updatedAt || "Recently"}</dd>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <dt className="text-slate-500 font-medium">Download Size</dt>
                    <dd className="font-mono font-medium text-slate-800">{app.sizeFormatted || "Verified build"}</dd>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <dt className="text-slate-500 font-medium">Requires Android</dt>
                    <dd className="font-medium text-slate-800">{app.minAndroid || "7.0 and up"}</dd>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <dt className="text-slate-500 font-medium">Content Rating</dt>
                    <dd className="font-medium text-slate-800">{app.ageRating || "Rated for 3+"}</dd>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <dt className="text-slate-500 font-medium">Developer</dt>
                    <dd className="font-bold text-blue-600">{app.developer || "AnshuCore"}</dd>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <dt className="text-slate-500 font-medium">Package Identifier</dt>
                    <dd className="font-mono text-slate-600 truncate max-w-[160px]">{app.slug}</dd>
                  </div>

                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500 font-medium">Security</dt>
                    <dd className="font-semibold text-emerald-600 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>Verified SHA-256</span>
                    </dd>
                  </div>
                </dl>

                {/* Additional Developer Contacts & Safety Notice */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    All APK binaries hosted on AnshuCore are cryptographically signed and tested for integrity.
                  </p>
                  <Link
                    href={`/contact?service=${encodeURIComponent(app.name)}`}
                    className="text-xs text-blue-600 hover:underline font-semibold block pt-1"
                  >
                    Report an issue or request a feature &rarr;
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Apps Section matching Reference Image 3 */}
          {relatedApps.length > 0 && (
            <section className="pt-6 border-t border-slate-200" aria-labelledby="heading-related-apps">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 id="heading-related-apps" className="text-xl font-bold text-[#0f172a]">
                    Related Applications
                  </h2>
                  <p className="text-xs text-slate-500">More official software and tools in {app.category} and beyond.</p>
                </div>
                <Link href="/apps" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  View All Apps &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {relatedApps.map((rel) => (
                  <AppCard key={`rel-${rel.id || rel.slug}`} app={rel} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {selectedScreenshot && (
        <div
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <img src={selectedScreenshot} alt="App preview" className="w-full h-auto rounded-2xl" />
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full shadow-md"
              aria-label="Close image preview"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  const store = await getStore();
  const paths = store.apks.map((app) => ({ params: { slug: app.slug } }));
  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const websiteData = await getPublicWebsiteData();
  const app = websiteData.apks.find((a) => a.slug === params.slug);
  if (!app) return { notFound: true };

  // Manually selected related apps first, then same category, then others; exclude current and duplicates
  let relatedApps = [];
  if (Array.isArray(app.relatedAppIds) && app.relatedAppIds.length > 0) {
    relatedApps = websiteData.apks.filter(
      (a) => (app.relatedAppIds.includes(a.id) || app.relatedAppIds.includes(a.slug)) && a.slug !== app.slug
    );
  }
  if (relatedApps.length < 4) {
    const sameCat = websiteData.apks.filter(
      (a) => a.category === app.category && a.slug !== app.slug && !relatedApps.some((r) => r.slug === a.slug)
    );
    relatedApps = [...relatedApps, ...sameCat];
  }
  if (relatedApps.length < 4) {
    const others = websiteData.apks.filter(
      (a) => a.slug !== app.slug && !relatedApps.some((r) => r.slug === a.slug)
    );
    relatedApps = [...relatedApps, ...others];
  }
  relatedApps = relatedApps.slice(0, 4);

  const appReviews = (websiteData.reviews || []).filter((r) => r.appSlug === app.slug);

  return {
    props: {
      app: JSON.parse(JSON.stringify(app)),
      relatedApps: JSON.parse(JSON.stringify(relatedApps)),
      reviews: JSON.parse(JSON.stringify(appReviews)),
      seo: JSON.parse(JSON.stringify(websiteData.seo || {})),
    },
    revalidate: 30,
  };
}
