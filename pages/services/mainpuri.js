import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";
import { getPublicWebsiteData } from "../../lib/adminStore";

export default function MainpuriServicesPage({ data }) {
  const seoSettings = data?.seo || {};
  const pageSeo = seoSettings.pages?.mainpuri || {};

  const breadcrumbs = [
    { name: "Services", path: "/services" },
    { name: "Mainpuri & UP", path: "/services/mainpuri" },
  ];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Website Development & Custom Software Services in Mainpuri",
    "provider": {
      "@type": "Organization",
      "name": "AnshuCore",
      "url": "https://anshucore.in",
    },
    "serviceType": "Software Development, Web Design, Android Apps, School ERP",
    "areaServed": [
      {
        "@type": "City",
        "name": "Mainpuri",
      },
      {
        "@type": "State",
        "name": "Uttar Pradesh",
      },
    ],
    "description":
      "Professional website design, custom software engineering, Android applications, school ERP, and library management software developed by AnshuCore in Mainpuri, Uttar Pradesh.",
  };

  const localSolutions = [
    {
      title: "School & Coaching ERP Software",
      tagline: "Admissions, Fees & Student Management",
      description:
        "Comprehensive institutional management for schools, intermediate colleges, and coaching centers in Mainpuri. Automates student admissions, fee collection with printable receipts, report cards, attendance records, and SMS/WhatsApp notifications.",
      features: [
        "Fee collection with instant receipt generation",
        "Student & staff attendance tracking",
        "Exam marksheets and performance cards",
        "Parent portal and notifications in Hindi/English",
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
    },
    {
      title: "Library Management Software",
      tagline: "Digital Passes, Member Dues & Cataloging",
      description:
        "Modern cloud-managed library management system designed for public and private study libraries. Features biometric turnstile support, RFID/barcode book checkout, seat allocation, and automated fee reminders.",
      features: [
        "Seat booking & shift-wise occupancy control",
        "Member card generation with QR codes",
        "Automated monthly fee renewal reminders",
        "Real-time turnstile/biometric entry integration",
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "Business Websites & Landing Pages",
      tagline: "High-Speed, Mobile-First Web Presence",
      description:
        "Clean, ultra-fast websites for local businesses, manufacturing units, diagnostic clinics, and service providers in Mainpuri and Uttar Pradesh. Built to rank on Google search, load instantly on mobile 4G/5G, and convert visitors into calls and inquiries.",
      features: [
        "Mobile-optimized with sub-second page loads",
        "Google Business Profile & local SEO integration",
        "Direct WhatsApp & click-to-call buttons",
        "Content management without coding knowledge",
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
      ),
    },
    {
      title: "Custom Android Applications",
      tagline: "Play Store & Direct APK Distribution",
      description:
        "Native and cross-platform Android mobile applications engineered for specific institutional workflows. Works reliably offline with local SQLite storage, cryptographic security, and automated cloud sync.",
      features: [
        "Offline-capable with automatic cloud synchronization",
        "Direct APK downloads and Google Play release support",
        "Clean, lightweight UI tested across diverse Android devices",
        "No third-party trackers or unnecessary permissions",
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Seo
        title={pageSeo.title || "Website Developer & Custom Software in Mainpuri | AnshuCore"}
        description={
          pageSeo.description ||
          "Professional website development, custom software engineering, Android applications, school ERP, and library management software developed by AnshuCore in Mainpuri, Uttar Pradesh."
        }
        path="/services/mainpuri"
        canonicalBase={seoSettings.canonicalBase}
        noindex={pageSeo.noindex || false}
        breadcrumbs={breadcrumbs}
        jsonLd={serviceSchema}
        keywords="Website developer in Mainpuri, Website development services in Mainpuri, Custom software development in Uttar Pradesh, Android app development Uttar Pradesh, School ERP software, Library management software, AnshuCore"
      />

      <Navbar />

      <main className="overflow-hidden">
        {/* Breadcrumb Row */}
        <div className="site-container pt-6 pb-2">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-blue-600 transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-[#0f172a]">Mainpuri &amp; Uttar Pradesh</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="site-container pt-6 pb-14 lg:pt-10 lg:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs sm:text-sm font-semibold mb-6">
              <span>Local Engineering • Mainpuri &amp; Uttar Pradesh</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0f172a] leading-[1.15] mb-6">
              Website Developer &amp; Custom Software in <span className="text-blue-600">Mainpuri</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              Founded and engineered by independent developer <strong>Anshu</strong>, AnshuCore delivers reliable, modern digital solutions tailored for educational institutions, study libraries, clinics, and businesses throughout <strong>Mainpuri district</strong> and across <strong>Uttar Pradesh</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/contact?service=Website%20Development" className="ac-btn-primary py-3 px-8 text-base">
                Discuss Your Project
              </Link>
              <Link href="/projects" className="ac-btn-secondary py-3 px-8 text-base">
                View Past Work
              </Link>
            </div>
          </div>
        </section>

        {/* Coverage & How We Work Section */}
        <section className="site-container py-12 border-t border-[#eaeff8]">
          <div className="ac-card p-6 sm:p-10 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs uppercase font-mono font-bold text-blue-600 tracking-wider">
                  Local Reach &amp; Remote Delivery
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mt-2 mb-4">
                  Direct Developer Access Without Agency Overhead
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                  Working directly with AnshuCore means you deal with the actual software engineer building your system—not middlemen, outsourced junior developers, or marketing executives.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  We provide <strong>in-person requirements gathering and on-site consultations</strong> across Mainpuri (including Bhogaon, Bewar, Karhal, Kishni, Ghiror, and Kurawali), with full remote project delivery across Uttar Pradesh (Agra, Lucknow, Kanpur, and beyond).
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0f172a]">Direct On-Site &amp; Remote Discovery</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Clear discussion of your exact workflow, hardware requirements, and budget without jargon.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0f172a]">Production-Grade Software Architecture</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Built with modern web stacks (Next.js, Node.js, SQLite/PostgreSQL) for maximum speed and security.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0f172a]">Dedicated Maintenance &amp; Training</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Full staff training on software operation plus ongoing support for updates and data backups.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solutions Grid */}
          <div className="ac-section-header">
            <h2 className="ac-section-title">Software Solutions for Mainpuri &amp; Regional Institutions</h2>
            <p className="ac-section-subtitle">
              Engineered specifically for practical Indian institutional and commercial requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localSolutions.map((sol, index) => (
              <div key={index} className="ac-card p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      {sol.icon}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-[#0f172a]">{sol.title}</h3>
                      <span className="text-xs font-semibold text-blue-600">{sol.tagline}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">{sol.description}</p>

                  <div className="space-y-2 mb-6">
                    {sol.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Link
                    href={`/contact?service=${encodeURIComponent(sol.title)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span>Request Details or Demo</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="site-container py-12">
          <div className="ac-card bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 sm:p-12 text-center rounded-3xl shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              Need a Custom Website or ERP in Mainpuri?
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
              Send us your project scope or schedule a consultation. We provide transparent estimates, clear delivery timelines, and genuine local accountability.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="ac-btn-secondary bg-white text-[#0f172a] hover:bg-slate-50 font-bold py-3 px-8 text-base">
                Get a Quote
              </Link>
              <a
                href="mailto:corexanshu@gmail.com"
                className="ac-btn-secondary bg-transparent border-white/30 text-white hover:bg-white/10 font-bold py-3 px-8 text-base"
              >
                Email Developer
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export async function getServerSideProps() {
  const websiteData = await getPublicWebsiteData();
  return {
    props: {
      data: websiteData,
    },
  };
}
