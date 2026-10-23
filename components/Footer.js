import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-[#eaeff8] bg-white text-slate-600 mt-20">
      <div className="site-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <BrandLogo size={36} className="shadow-xs rounded-xl transition-transform group-hover:scale-105" style={{ borderRadius: "10px", border: "1px solid #eaeff8" }} />
              <span className="brand-name font-display text-xl">
                <span className="brand-anshu">Anshu</span><span className="brand-core">Core</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
              Professional software development company building modern websites, custom software, Android applications, and enterprise management solutions.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/indbite-web"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/corexanshu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/corexanshu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="mailto:corexanshu@gmail.com"
                aria-label="Email"
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Services */}
          <div>
            <h3 className="font-display text-xs uppercase tracking-wider text-[#0f172a] font-bold mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/services" className="hover:text-blue-600 transition-colors">Website Development</Link></li>
              <li><Link href="/services" className="hover:text-blue-600 transition-colors">Custom Software</Link></li>
              <li><Link href="/services" className="hover:text-blue-600 transition-colors">Android App Development</Link></li>
              <li><Link href="/services" className="hover:text-blue-600 transition-colors">School ERP Solution</Link></li>
              <li><Link href="/services" className="hover:text-blue-600 transition-colors">Library Management</Link></li>
            </ul>
          </div>

          {/* Column 2: Projects & Apps */}
          <div>
            <h3 className="font-display text-xs uppercase tracking-wider text-[#0f172a] font-bold mb-4">
              Products & Apps
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/apps/anshu-mock" className="hover:text-blue-600 transition-colors">Anshu Mock Exam</Link></li>
              <li><Link href="/apps" className="hover:text-blue-600 transition-colors">Android Apps Store</Link></li>
              <li><Link href="/projects" className="hover:text-blue-600 transition-colors">Gurukul Library SaaS</Link></li>
              <li><Link href="/projects" className="hover:text-blue-600 transition-colors">Anshu Public School ERP</Link></li>
              <li><Link href="/projects" className="hover:text-blue-600 transition-colors">IndBite Marketing</Link></li>
            </ul>
          </div>

          {/* Column 3: Company & Legal */}
          <div>
            <h3 className="font-display text-xs uppercase tracking-wider text-[#0f172a] font-bold mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact & Enquiries</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-14 pt-8 border-t border-[#eaeff8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AnshuCore. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Independent Software Studio</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400">Ship reliable, privacy-first software</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
