import Seo from "../components/Seo";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <>
      <Seo
        title="404 — Page Not Found | AnshuCore"
        description="The page you are looking for does not exist, has been moved, or the link was mistyped."
        path="/404"
        noindex={true}
      />

      <Navbar />

      <main className="site-container min-h-[60vh] flex flex-col items-center justify-center text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-mono font-extrabold text-2xl mb-6 shadow-sm">
          404
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-4">
          Page Not Found
        </h1>
        <p className="text-base text-slate-600 max-w-md mx-auto mb-8">
          The page you are looking for doesn&apos;t exist, has been moved, or the link was mistyped.
        </p>
        <Link href="/" className="ac-btn-primary py-3 px-8 text-base">
          Back to Home
        </Link>
      </main>

      <Footer />
    </>
  );
}
