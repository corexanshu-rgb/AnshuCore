import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { getPublicWebsiteData } from "../lib/adminStore";

export default function TermsPage({ data }) {
  const seo = data?.seo || {};
  const pageSeo = seo?.pages?.terms || {};
  const breadcrumbs = [{ name: "Terms of Service", path: "/terms" }];

  return (
    <>
      <Seo
        title={pageSeo.title || `Terms of Service — ${seo.siteTitle || "AnshuCore"}`}
        description={
          pageSeo.description ||
          "Terms of service and software licensing conditions for AnshuCore applications and custom development services."
        }
        path="/terms"
        canonicalBase={seo.canonicalBase}
        noindex={pageSeo.noindex || false}
        breadcrumbs={breadcrumbs}
      />

      <Navbar />

      <main className="site-container py-12 lg:py-16 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-3">
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: October 2026 • AnshuCore Software Studio
          </p>
        </div>

        <div className="ac-card p-6 sm:p-10 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing the AnshuCore website, utilizing our custom software, or downloading our Android application packages (APKs), you agree to be bound by these Terms of Service and applicable laws.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              2. Software Licensing & Distribution
            </h2>
            <p>
              Applications distributed via GitHub Releases are provided under their respective repository licenses. You agree not to reverse engineer, decompile, redistribute modified binaries under deceptive names, or attempt unauthorized circumvention of security controls.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              3. Custom Software & ERP Solutions
            </h2>
            <p>
              Institutional systems (including Anshu Public School ERP and Gurukul Library SaaS) are governed by individual client service agreements regarding hosting, automated backups, support SLAs, and monthly maintenance billing terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              4. Contact & Legal Inquiries
            </h2>
            <p>
              For legal notices or questions regarding these terms, reach us at <a href="mailto:corexanshu@gmail.com" className="text-blue-600 font-semibold underline">corexanshu@gmail.com</a>.
            </p>
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
    revalidate: 60,
  };
}
