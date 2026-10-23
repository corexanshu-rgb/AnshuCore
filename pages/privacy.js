import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { getPublicWebsiteData } from "../lib/adminStore";

export default function PrivacyPage({ data }) {
  const seo = data?.seo || {};
  const pageSeo = seo?.pages?.privacy || {};
  const breadcrumbs = [{ name: "Privacy Policy", path: "/privacy" }];

  return (
    <>
      <Seo
        title={pageSeo.title || `Privacy Policy — ${seo.siteTitle || "AnshuCore"}`}
        description={
          pageSeo.description ||
          "Privacy policy of AnshuCore. Transparent information regarding data collection, storage, zero third-party monetization, and user privacy."
        }
        path="/privacy"
        canonicalBase={seo.canonicalBase}
        noindex={pageSeo.noindex || false}
        breadcrumbs={breadcrumbs}
      />

      <Navbar />

      <main className="site-container py-12 lg:py-16 max-w-4xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-3">
            <span>Legal & Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: October 2026 • Effective immediately
          </p>
        </div>

        <div className="ac-card p-6 sm:p-10 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              1. Our Privacy Commitment
            </h2>
            <p>
              AnshuCore operates on a privacy-first foundation. We do not sell, rent, monetize, or broker personal information to third parties or advertising networks. We collect only the minimal data strictly necessary to respond to client inquiries, deliver software updates, and operate institutional services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Project Enquiries:</strong> When you submit a project request or contact inquiry, we collect your name, email address, optional phone number, desired service, and message details to prepare quotations and reply to your request.
              </li>
              <li>
                <strong>User Reviews:</strong> When you voluntarily submit a review for an application or service, your submitted name, star rating, and review comment are stored. Reviews are private until administratively approved.
              </li>
              <li>
                <strong>First-Party Anonymous Website Analytics:</strong> To understand which pages, educational ERP features, and Android APKs are helpful to visitors, we collect lightweight, non-identifying aggregate page metrics (page path, visit timestamp, and an anonymous randomized visitor identifier). We do NOT record your raw IP address or personal identity in our analytics records, and we do not use third-party tracking scripts.
              </li>
              <li>
                <strong>Technical Server Logs:</strong> Standard web server connection details (IP address, browser type, timestamp) are processed temporarily by our hosting infrastructure to defend against spam, enforce rate limits, and maintain service security.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              3. Information We Do NOT Collect
            </h2>
            <p className="mb-2">We deliberately avoid invasive tracking mechanisms:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>No third-party cross-site advertising trackers or tracking cookies.</li>
              <li>No data harvesting from installed Android applications.</li>
              <li>No unsolicited commercial email marketing.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              4. Third-Party Service Providers
            </h2>
            <p className="mb-2">We rely on reputable infrastructure providers:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Vercel Inc.:</strong> Hosting platform and serverless runtime.
              </li>
              <li>
                <strong>Upstash:</strong> Managed Redis cloud datastore for persistence with TLS encryption.
              </li>
              <li>
                <strong>GitHub Releases:</strong> Distribution host for verified APK binaries. When downloading APKs, your download request is fulfilled directly by GitHub's content delivery network.
              </li>
              <li>
                <strong>Razorpay:</strong> Secure payment processing for institutional library and school ERP maintenance invoices.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#0f172a] mb-3">
              5. Data Retention & Your Rights
            </h2>
            <p className="mb-3">
              You retain the right to inspect, correct, or request the deletion of your enquiry information at any time. To request removal of your submission from our records, contact us directly at <a href="mailto:corexanshu@gmail.com" className="text-blue-600 font-semibold underline">corexanshu@gmail.com</a>.
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
