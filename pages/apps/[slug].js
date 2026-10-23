import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AppIcon from "../../components/AppIcon";
import Seo from "../../components/Seo";
import { getStore, getPublicWebsiteData } from "../../lib/adminStore";

export default function AppDetailPage({ app, relatedApps, reviews, seo }) {
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

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

      setReviewSuccess(json.message);
      setReviewName("");
      setReviewComment("");
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const isDirectApk =
    (app.directUrl && (app.directUrl.endsWith('.apk') || app.directUrl.includes('/releases/download/'))) ||
    app.slug === 'anshu-mock';

  const downloadUrl =
    app.slug === 'anshu-mock'
      ? (app.directUrl || "https://github.com/indbite-web/Anshu-Mock-/releases/download/1.5.0/Anshu.Mock.apk")
      : (app.directUrl && app.directUrl !== "#")
      ? app.directUrl
      : app.repo
      ? `https://github.com/${app.repo}/releases`
      : `/contact?service=${encodeURIComponent(app.name)}`;

  const breadcrumbs = [
    { name: "Apps", path: "/apps" },
    { name: app.name, path: `/apps/${app.slug}` },
  ];

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": app.name,
    "operatingSystem": "Android",
    "applicationCategory": app.category || "UtilitiesApplication",
    "softwareVersion": app.releaseTag || "1.0.0",
    "fileSize": app.sizeFormatted || "20 MB",
    "downloadUrl": downloadUrl.startsWith("http") ? downloadUrl : `https://anshucore.in${downloadUrl}`,
    "author": {
      "@type": "Organization",
      "name": "AnshuCore",
      "url": "https://anshucore.in",
    },
    "description":
      app.description || `Download ${app.name} APK for Android developed by AnshuCore.`,
  };

  return (
    <>
      <Seo
        title={`${app.name} — Download Android APK | ${seo?.siteTitle || "AnshuCore"}`}
        description={`Download ${app.name} APK (${app.releaseTag || "latest"}) for Android. ${
          app.description || "Fast, reliable and verified release."
        }`}
        path={`/apps/${app.slug}`}
        canonicalBase={seo?.canonicalBase}
        breadcrumbs={breadcrumbs}
        jsonLd={appSchema}
        keywords={`${app.name}, ${app.name} APK, download ${app.name} Android, AnshuCore apps, ${app.category} APK`}
      />

      <Navbar />

      <main className="site-container py-10 lg:py-14">
        {/* Breadcrumb (Matching Visual Mockup) */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8">
          <Link href="/apps" className="hover:text-blue-600 transition-colors">
            Apps
          </Link>
          <span>/</span>
          <span className="text-[#0f172a]">{app.name}</span>
        </nav>

        {/* Top App Showcase Card */}
        <div className="ac-card p-6 sm:p-10 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Left: Icon & Info */}
            <div className="flex items-start sm:items-center gap-6">
              <AppIcon
                icon={app.icon}
                name={app.name}
                size={92}
                className="rounded-3xl shadow-lg shadow-blue-500/25 shrink-0"
              />

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0f172a]">
                    {app.name}
                  </h1>
                  {app.isSuperApk && (
                    <span className="text-xs bg-blue-100 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full">
                      Super APK
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base text-slate-600 font-medium mb-3">
                  {app.category} • Android Application
                </p>

                {/* Metrics Pill Row */}
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 font-mono">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">
                    {app.releaseTag || "1.5.0"}
                  </span>
                  <span>•</span>
                  <span>{app.sizeFormatted || "24.8 MB"}</span>
                  <span>•</span>
                  <span className="font-semibold text-blue-600">
                    {app.downloadCount.toLocaleString()} downloads
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Big Download Action */}
            <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-2 shrink-0">
              {isDirectApk ? (
                <a
                  href={downloadUrl}
                  download
                  className="ac-btn-primary text-base py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/30 font-bold"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download APK</span>
                </a>
              ) : downloadUrl.startsWith('http') ? (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ac-btn-primary text-base py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/30 font-bold"
                >
                  <span>View Repository & Releases</span>
                  <span>→</span>
                </a>
              ) : (
                <Link
                  href={downloadUrl}
                  className="ac-btn-primary text-base py-3.5 px-8 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/30 font-bold"
                >
                  <span>Request Access / Enquire</span>
                  <span>→</span>
                </Link>
              )}
              <span className="text-[11px] text-slate-400 text-center md:text-right font-medium">
                {isDirectApk
                  ? "Direct download from GitHub Releases"
                  : downloadUrl.startsWith('http')
                  ? "Official release repository on GitHub"
                  : "Custom deployment by AnshuCore"}
              </span>
            </div>
          </div>
        </div>

        {/* Specifications & About Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-14">
          {/* Left Column: About & Architecture */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="ac-card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0f172a] mb-3">
                About {app.name}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                {app.description ||
                  `${app.name} is engineered for Android devices with lightweight native architecture, offline-first reliability, and clean interaction design.`}
              </p>

              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">
                  Security & Release Integrity
                </h3>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  All APK binaries are cryptographically signed release builds hosted directly on official GitHub Releases. No third-party ad networks, trackers, or hidden analytics are embedded.
                </p>
              </div>
            </div>

            {/* User Reviews Section */}
            <div className="ac-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0f172a]">User Reviews</h2>
                  <p className="text-xs text-slate-500">Genuine reviews from verified users</p>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400 italic mb-6">
                  No approved reviews yet. Be the first to share your experience below!
                </p>
              ) : (
                <div className="space-y-4 mb-8">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-[#0f172a]">{rev.userName}</span>
                        <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${rev.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-2">
                        "{rev.comment}"
                      </p>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Review Form */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-[#0f172a] mb-3">Leave a Review</h3>
                {reviewSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{reviewSuccess}</span>
                  </div>
                )}
                {reviewError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>{reviewError}</span>
                  </div>
                )}
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500"
                      >
                        <option value={5}>5 Stars — Excellent</option>
                        <option value={4}>4 Stars — Very Good</option>
                        <option value={3}>3 Stars — Good</option>
                        <option value={2}>2 Stars — Fair</option>
                        <option value={1}>1 Star — Poor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Your Review</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts on performance, offline experience or usability..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="ac-btn-primary text-xs py-2 px-5 rounded-xl font-semibold"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review for Moderation"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column: Metadata Specifications Table (Matching Mockup) */}
          <div className="lg:col-span-5">
            <div className="ac-card p-6 sm:p-7 sticky top-28">
              <h2 className="text-base font-bold text-[#0f172a] mb-4">
                Application Specifications
              </h2>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Version</span>
                  <span className="font-mono font-bold text-[#0f172a]">{app.releaseTag || "v1.2.1"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">File Size</span>
                  <span className="font-mono font-bold text-[#0f172a]">{app.sizeFormatted || "24.8 MB"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Downloads</span>
                  <span className="font-mono font-bold text-blue-600">{app.downloadCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-semibold text-[#0f172a]">{app.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Last Updated</span>
                  <span className="text-slate-700">{app.updatedAt || "Aug 10, 2026"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500 font-medium">Source</span>
                  <span className="text-slate-700 font-semibold truncate max-w-[180px]">
                    {app.repo ? `GitHub (${app.repo})` : "Verified Asset"}
                  </span>
                </div>
              </div>

              {app.repo && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <a
                    href={`https://github.com/${app.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>View GitHub Repository</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* You May Also Like Section (Matching Visual Mockup) */}
        {relatedApps.length > 0 && (
          <section className="pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-[#0f172a] mb-6">
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedApps.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/apps/${rel.slug}`}
                  className="ac-card ac-card-hover p-4 flex flex-col items-center text-center group"
                >
                  <div className="mb-3 group-hover:scale-105 transition-transform">
                    <AppIcon
                      icon={rel.icon}
                      name={rel.name}
                      size={56}
                      className="rounded-2xl shadow-xs"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-[#0f172a] truncate w-full">
                    {rel.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate w-full mt-0.5">
                    {rel.category}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

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

  const relatedApps = websiteData.apks
    .filter((a) => a.slug !== app.slug)
    .slice(0, 4);

  const appReviews = websiteData.reviews.filter((r) => r.appSlug === app.slug);

  return {
    props: {
      app: JSON.parse(JSON.stringify(app)),
      relatedApps: JSON.parse(JSON.stringify(relatedApps)),
      reviews: JSON.parse(JSON.stringify(appReviews)),
      seo: JSON.parse(JSON.stringify(websiteData.seo)),
    },
    revalidate: 30,
  };
}
