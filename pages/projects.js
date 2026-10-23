import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { getPublicWebsiteData } from "../lib/adminStore";

export default function ProjectsPage({ data }) {
  const projects = data?.projects || [];
  const seo = data?.seo || {};
  const pageSeo = seo?.pages?.projects || {};

  const categories = ["All", "Websites", "School ERP", "Library", "Android Apps"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  const breadcrumbs = [{ name: "Projects", path: "/projects" }];

  return (
    <>
      <Seo
        title={pageSeo.title || `Software Engineering Portfolio & Projects — ${seo.siteTitle || "AnshuCore"}`}
        description={pageSeo.description || "Some of our recent work. Real projects. Real results. Explore custom school ERPs, library management SaaS, web platforms, and Android apps."}
        path="/projects"
        canonicalBase={seo.canonicalBase}
        noindex={pageSeo.noindex || false}
        breadcrumbs={breadcrumbs}
        keywords="AnshuCore projects, school ERP portfolio, library management SaaS, web development case studies, Android apps"
      />

      <Navbar />

      <main className="site-container py-12 lg:py-16">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-3">
            <span>Portfolio & Case Studies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight mb-3">
            Our Projects
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Some of our recent work. Real projects. Real results. Every system is built to solve operational problems, automate repetitive work, and provide clean user experiences.
          </p>
        </div>

        {/* Category Filter Pills (Matching Mockup) */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 border-b border-slate-100">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id || project.title}
              className="ac-card ac-card-hover overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Screenshot Container */}
                <div className="h-52 bg-slate-100 relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#0f172a] text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {project.year || "2026"}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {project.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#0f172a] mb-2">
                    {project.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {project.summary}
                  </p>

                  {/* Tech stack tags */}
                  {project.tech && project.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {project.tech.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-0 border-t border-slate-50 flex items-center justify-between mt-auto">
                {project.link && project.link.startsWith("http") ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ac-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    <span>View Project</span>
                    <span>↗</span>
                  </a>
                ) : project.link && project.link !== "#" ? (
                  <Link
                    href={project.link}
                    className="ac-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    <span>{project.link.startsWith("/apps") ? "View App" : "View Details"}</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <Link
                    href={`/contact?service=${encodeURIComponent(project.title)}`}
                    className="ac-btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                  >
                    <span>Enquire Solution</span>
                    <span>→</span>
                  </Link>
                )}

                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>Source</span>
                  </a>
                )}
              </div>
            </div>
          ))}
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
