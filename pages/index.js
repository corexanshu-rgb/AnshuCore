import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { getPublicWebsiteData } from "../lib/adminStore";

export default function Home({ data }) {
  const hero = data?.hero || {};
  const services = data?.services || [];
  const projects = data?.projects || [];
  const apks = data?.apks || [];
  const reviews = data?.reviews || [];
  const seo = data?.seo || {};
  const pageSeo = seo?.pages?.home || {};

  // Icons helper for service cards
  const renderIcon = (name) => {
    switch (name) {
      case "globe":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        );
      case "cpu":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
        );
      case "smartphone":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
        );
      case "graduation-cap":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
        );
      case "building":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
        );
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        );
    }
  };

  return (
    <>
      <Seo
        title={pageSeo.title || seo.siteTitle}
        description={pageSeo.description || seo.description}
        path="/"
        canonicalBase={seo.canonicalBase}
        noindex={pageSeo.noindex || false}
        keywords={seo.keywords}
        gscVerification={seo.googleSiteVerification}
      />

      <Navbar />

      <main className="overflow-hidden">
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <section className="site-container pt-8 pb-16 lg:pt-14 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs sm:text-sm font-semibold mb-6">
                <svg className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{hero.eyebrow || "Software Development & Digital Solutions"}</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-[#0f172a] leading-[1.15] mb-6">
                Turning Ideas Into <br className="hidden sm:inline" />
                <span className="text-blue-600">Powerful Digital</span> Solutions
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                {hero.leadText || "We create modern websites, custom software, Android apps and complete ERP solutions for schools, libraries and businesses."}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4">
                <Link href={hero.ctaPrimaryUrl || "/contact"} className="ac-btn-primary text-base py-3 px-7">
                  {hero.ctaPrimary || "Get a Quote"}
                </Link>
                <Link href={hero.ctaSecondaryUrl || "/services"} className="ac-btn-secondary text-base py-3 px-7">
                  {hero.ctaSecondary || "Explore Services"}
                </Link>
              </div>
            </div>

            {/* Right Hero Visual (Real Software Laptop + Mobile Mockup & Floating Badges) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[480px]">
                {/* Laptop Window Simulation */}
                <div className="ac-card overflow-hidden shadow-2xl border-slate-200 bg-white">
                  {/* Window Bar */}
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 mx-auto">anshucore.app/dashboard</span>
                  </div>
                  {/* Laptop Screen Content: Authentic Signature Artwork */}
                  <div className="relative overflow-hidden bg-slate-950 aspect-[16/11]">
                    <img
                      src="/frames/frame_0001.jpg"
                      alt="AnshuCore Digital Engineering"
                      className="w-full h-full object-cover object-center filter saturate-[1.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-white">
                          <div className="text-xs font-bold tracking-tight">AnshuCore Systems</div>
                          <div className="text-[11px] text-slate-300">Modern Software Studio</div>
                        </div>
                        <span className="text-[10px] font-mono bg-blue-600/90 text-white px-2.5 py-1 rounded-full font-semibold border border-blue-400/30">
                          Production Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 1: Web Apps */}
                <div className="ac-floating-badge absolute -top-4 -right-4 sm:-right-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0f172a]">Web Apps</div>
                    <div className="text-[11px] text-slate-500">Custom Software</div>
                  </div>
                </div>

                {/* Floating Badge 2: Android Apps */}
                <div className="ac-floating-badge absolute top-1/2 -left-6 sm:-left-8 -translate-y-1/2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0f172a]">Android Apps</div>
                    <div className="text-[11px] text-slate-500">Play Store & APK</div>
                  </div>
                </div>

                {/* Floating Badge 3: ERP Solutions */}
                <div className="ac-floating-badge absolute -bottom-5 right-2 sm:right-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0f172a]">School & Library ERP</div>
                    <div className="text-[11px] text-slate-500">Multi-Tenant Solution</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Hero 5 Feature Cards Row */}
          <div className="mt-14 pt-8 border-t border-[#eaeff8]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {[
                { title: "Website Development", subtitle: "Modern & Responsive", icon: "globe" },
                { title: "Custom Software", subtitle: "For Your Business", icon: "cpu" },
                { title: "Android Applications", subtitle: "Play Store & APK", icon: "smartphone" },
                { title: "School ERP", subtitle: "Complete Solution", icon: "graduation-cap" },
                { title: "Library Management", subtitle: "Smart & Easy", icon: "building" }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="ac-card p-4 flex flex-col items-start gap-2 hover:border-blue-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    {renderIcon(card.icon)}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0f172a] leading-tight">{card.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{card.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* ========================================================= */}
        {/* OUR SERVICES SECTION                                      */}
        {/* ========================================================= */}
        <section className="site-container py-14">
          <div className="ac-section-header ac-section-header-split">
            <div>
              <h2 className="ac-section-title">Our Services</h2>
              <p className="ac-section-subtitle">
                Complete digital solutions for your personal, educational and business needs.
              </p>
            </div>
            <Link href="/services" className="ac-view-all">
              <span>View All Services</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id || service.name}
                className="ac-card ac-card-hover p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                    {renderIcon(service.icon)}
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">{service.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{service.description}</p>
                </div>
                <Link
                  href={`/contact?service=${encodeURIComponent(service.name)}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  <span>Learn More</span>
                  <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* OUR PROJECTS SECTION                                      */}
        {/* ========================================================= */}
        <section className="site-container py-14">
          <div className="ac-section-header ac-section-header-split">
            <div>
              <h2 className="ac-section-title">Our Projects</h2>
              <p className="ac-section-subtitle">
                Some of our recent work. Real projects. Real results.
              </p>
            </div>
            <Link href="/projects" className="ac-view-all">
              <span>View All Projects</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.slice(0, 4).map((project) => (
              <div
                key={project.id || project.title}
                className="ac-card ac-card-hover overflow-hidden flex flex-col justify-between"
              >
                <div className="h-44 bg-slate-100 relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4">
                    <span className="text-xs font-semibold text-white bg-blue-600 px-2 py-0.5 rounded-full">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#0f172a] mb-1">{project.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{project.summary}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={project.link && project.link !== "#" ? project.link : "/projects"}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span>View Live</span>
                      <span>→</span>
                    </Link>
                    <span className="text-[11px] text-slate-400">{project.year || "2026"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* CUSTOMER REVIEWS (Approved genuine reviews only)          */}
        {/* ========================================================= */}
        {reviews.length > 0 && (
          <section className="site-container py-14">
            <div className="ac-section-header">
              <h2 className="ac-section-title">Verified Customer Feedback</h2>
              <p className="ac-section-subtitle">
                Direct testimonials and reviews from users and institutional clients.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="ac-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-0.5 text-amber-400 mb-3 text-sm" aria-label={`${rev.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                      "{rev.comment}"
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0f172a]">{rev.userName}</span>
                    <span className="text-slate-400">{rev.appName}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* CTA BANNER                                                */}
        {/* ========================================================= */}
        <section className="site-container py-12">
          <div className="ac-card bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 sm:p-12 text-center rounded-3xl shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Have a Project in Mind? Let's Build It Together.
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
              Whether you need a custom school ERP, responsive website, or an Android app, AnshuCore delivers reliable, clean software tailored to your requirements.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="ac-btn-secondary bg-white text-[#0f172a] hover:bg-slate-50 font-bold py-3 px-8 text-base">
                Get a Quote
              </Link>
              <Link href="/about" className="text-white hover:text-blue-200 font-semibold text-sm underline underline-offset-4">
                Learn About AnshuCore
              </Link>
            </div>
          </div>
        </section>
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
    revalidate: 30, // ISR: re-fetch from persistent store periodically
  };
}
