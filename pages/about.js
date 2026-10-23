import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { getPublicWebsiteData } from "../lib/adminStore";

export default function AboutPage({ data }) {
  const about = data?.about || {};
  const seo = data?.seo || {};
  const pageSeo = seo?.pages?.about || {};

  const whatWeDoList = about.whatWeDo || [
    "Modern websites",
    "Custom software",
    "Android applications",
    "School and library ERP solutions",
    "Long-term support",
  ];

  const breadcrumbs = [{ name: "About", path: "/about" }];

  return (
    <>
      <Seo
        title={pageSeo.title || `About Us — ${seo.siteTitle || "AnshuCore"}`}
        description={
          pageSeo.description ||
          "Learn about AnshuCore, an independent software studio founded by Anshu in Mainpuri, Uttar Pradesh. Building dependable software, educational ERPs, and modern web applications."
        }
        path="/about"
        canonicalBase={seo.canonicalBase}
        noindex={pageSeo.noindex || false}
        breadcrumbs={breadcrumbs}
        keywords="About AnshuCore, Anshu developer, software studio Mainpuri, Uttar Pradesh software engineer, educational ERP studio"
      />

      <Navbar />

      <main className="site-container py-12 lg:py-16">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-3">
            <span>Engineering & Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
            {about.headline || "About Us"}
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            {about.subheadline || "Learn more about AnshuCore, our vision and what we do."}
          </p>
        </div>

        {/* Two-Column Layout (Matching Visual Mockup) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* Left Column: Vision & What We Do */}
          <div className="lg:col-span-6 space-y-10">
            {/* Our Vision */}
            <div className="ac-card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                Our Vision
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                {about.vision ||
                  "To provide simple, powerful and affordable digital solutions for individuals, schools, libraries and businesses."}
              </p>
            </div>

            {/* What We Do Checklist */}
            <div className="ac-card p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[#0f172a] mb-5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                What We Do
              </h2>
              <div className="space-y-3.5">
                {whatWeDoList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-[#0f172a]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual & Why Choose Card */}
          <div className="lg:col-span-6 space-y-6">
            {/* Workspace / Architecture Graphic */}
            <div className="ac-card overflow-hidden p-6 bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <span className="text-xs font-mono text-blue-400">anshu-core-stack.tsx</span>
                <span className="text-xs text-slate-400">Native Engineering</span>
              </div>
              <div className="space-y-2 font-mono text-xs text-slate-300">
                <p className="text-emerald-400">// Core Philosophy</p>
                <p>const standard = &#123;</p>
                <p className="pl-4">architecture: &quot;Offline-first & High Availability&quot;,</p>
                <p className="pl-4">zeroBloat: true,</p>
                <p className="pl-4">verifiedIntegrity: true,</p>
                <p className="pl-4">privacyFirst: true</p>
                <p>&#125;;</p>
              </div>
            </div>

            {/* Why Choose AnshuCore Card */}
            <div className="ac-card p-6 sm:p-8 bg-blue-50/50 border border-blue-200 rounded-3xl">
              <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                Why Choose AnshuCore?
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium mb-4">
                {about.whyChoose || "Clean design, reliable solutions and continuous support."}
              </p>
              <Link href="/contact" className="ac-btn-primary text-xs py-2 px-5">
                Work With Us
              </Link>
            </div>
          </div>
        </div>

        {/* Founder Story Section */}
        {about.founderStory && (
          <div className="ac-card p-8 sm:p-12 max-w-4xl mx-auto rounded-3xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3">
              Studio Background
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
              {about.founderStory}
            </p>
            {about.mission && (
              <div className="pt-6 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Our Mission
                </span>
                <p className="text-sm sm:text-base text-[#0f172a] font-semibold">
                  &quot;{about.mission}&quot;
                </p>
              </div>
            )}
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
