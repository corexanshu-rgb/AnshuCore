import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { getPublicWebsiteData } from "../lib/adminStore";

export default function ServicesPage({ data }) {
  const services = data?.services || [];
  const seo = data?.seo || {};
  const pageSeo = seo?.pages?.services || {};

  const breadcrumbs = [{ name: "Services", path: "/services" }];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Software & Web Development Services",
    "provider": {
      "@type": "Organization",
      "name": "AnshuCore",
      "url": "https://anshucore.in",
    },
    "serviceType": "Website Development, Android Applications, School ERP, Library SaaS",
    "areaServed": "India",
    "description":
      pageSeo.description ||
      "Professional website development, custom software engineering, Android applications, school ERP, and library management systems.",
  };

  const renderIcon = (name) => {
    switch (name) {
      case "globe":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        );
      case "cpu":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
        );
      case "smartphone":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
        );
      case "graduation-cap":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
        );
      case "building":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
        );
    }
  };

  return (
    <>
      <Seo
        title={pageSeo.title || `Software & Web Development Services — ${seo.siteTitle || "AnshuCore"}`}
        description={pageSeo.description || "Complete digital solutions: websites, custom software, Android apps, school ERP and library management."}
        path="/services"
        canonicalBase={seo.canonicalBase}
        noindex={pageSeo.noindex || false}
        breadcrumbs={breadcrumbs}
        jsonLd={serviceSchema}
        keywords="Software services, website development, Android apps, school ERP software, library management, Mainpuri, Uttar Pradesh"
      />

      <Navbar />

      <main className="site-container py-12 lg:py-16">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-3">
            <span>Specialized Capabilities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
            Our Services
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Complete digital solutions for your personal, educational and business needs. Every solution is engineered for performance, security, and long-term maintainability.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id || service.name}
              className="ac-card ac-card-hover p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    {renderIcon(service.icon)}
                  </div>
                  {service.tag && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {service.tag}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-[#0f172a] mb-2.5">
                  {service.name}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {service.description}
                </p>

                {service.details && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-5 leading-normal">
                    {service.details}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {service.startingPrice && (
                  <span className="text-xs font-semibold text-slate-500">
                    From: <strong className="text-[#0f172a]">{service.startingPrice}</strong>
                  </span>
                )}
                <Link
                  href={`/contact?service=${encodeURIComponent(service.name)}`}
                  className="ac-btn-primary text-xs py-2 px-4 ml-auto"
                >
                  <span>Enquire Now</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Consulting & Regional Banner */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="ac-card p-8 bg-blue-50/50 border border-blue-100 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-mono font-bold text-blue-600 tracking-wider">Custom Engineering</span>
              <h2 className="text-lg font-bold text-[#0f172a] mt-1 mb-2">
                Need a tailored software solution?
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                We consult directly with institutional leaders, founders, and business owners to design exact custom software architectures.
              </p>
            </div>
            <Link href="/contact" className="ac-btn-primary self-start py-2.5 px-6">
              Get a Quote
            </Link>
          </div>

          <div className="ac-card p-8 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-mono font-bold text-indigo-600 tracking-wider">Regional Coverage</span>
              <h2 className="text-lg font-bold text-[#0f172a] mt-1 mb-2">
                Serving Mainpuri &amp; Uttar Pradesh
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Looking for on-site software consultations or local school/library ERP deployment in Mainpuri district and across UP?
              </p>
            </div>
            <Link href="/services/mainpuri" className="ac-btn-secondary self-start py-2.5 px-6">
              View Mainpuri Services →
            </Link>
          </div>
        </div>
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
