// Central data source for the Apps showcase.
// Replace with a CMS/API call once the admin panel (Phase 3) is wired up.

export const apps = [
  {
    slug: "anshu-mock",
    name: "Anshu Mock",
    tagline: "AI-powered test simulation and question bank for Android.",
    category: "Education",
    rating: 4.9,
    platforms: ["Android"],
    icon: "AM",
    accent: "#2563EB",
    description:
      "Anshu Mock is the official offline-first examination simulator and AI question bank for Android. Features adaptive test difficulty, instant scorecards, and local SQLite caching.",
    screenshots: ["/screens/erp-1.png", "/screens/erp-2.png"],
    changelog: [
      { version: "1.2.1", date: "2026-08-10", notes: "AI evaluation engine refinements and speed optimization." },
      { version: "1.2.0", date: "2026-07-15", notes: "Major SQLite local storage engine rewrite." },
      { version: "1.1.0", date: "2026-05-22", notes: "Custom test creator and instant PDF scorecards." },
      { version: "1.0.0", date: "2026-03-01", notes: "Initial public release." }
    ],
    downloads: {
      android: "https://github.com/indbite-web/Anshu-Mock-/releases/download/v1.2.1/AnshuMock-v1.2.1.apk",
    },
  },
  {
    slug: "anshucore-erp",
    name: "AnshuCore ERP",
    tagline: "School management, from admissions to results, in one system.",
    category: "Education",
    rating: 4.8,
    platforms: ["Web", "Android"],
    icon: "AC",
    accent: "#2F6BFF",
    description:
      "AnshuCore ERP is a full school management SaaS covering student and teacher records, fee collection, results, notices, and role-based dashboards for admins, teachers, and students. Built for schools that have outgrown spreadsheets.",
    screenshots: ["/screens/erp-1.png", "/screens/erp-2.png", "/screens/erp-3.png"],
    changelog: [
      { version: "2.4.0", date: "2026-08-10", notes: "Redesigned fee management and billing reports." },
      { version: "2.3.0", date: "2026-06-02", notes: "Added Redis-backed caching for faster dashboards." },
      { version: "2.2.0", date: "2026-03-18", notes: "Role-based Manager Panel launched." },
    ],
    downloads: {
      web: "/school-portal",
    },
  },
  {
    slug: "core-notes",
    name: "Core Notes",
    tagline: "Fast, distraction-free note-taking with offline sync.",
    category: "Utility",
    rating: 4.6,
    platforms: ["Android", "Windows"],
    icon: "CN",
    accent: "#4C8DFF",
    description:
      "A minimal notes app focused on speed: instant search, offline-first storage, and a distraction-free writing surface with markdown support.",
    screenshots: ["/screens/notes-1.png", "/screens/notes-2.png"],
    changelog: [
      { version: "1.6.0", date: "2026-07-01", notes: "Markdown export and dark mode." },
      { version: "1.5.0", date: "2026-04-14", notes: "Offline sync engine rewrite." },
    ],
    downloads: {
      android: "#",
      windows: "#",
    },
  },
  {
    slug: "gridpath",
    name: "GridPath",
    tagline: "A calm, turn-based puzzle game about routing energy.",
    category: "Games",
    rating: 4.7,
    platforms: ["Android", "Web"],
    icon: "GP",
    accent: "#FF6A3D",
    description:
      "GridPath is a low-stress puzzle game where you route power across a grid of hexagonal tiles. 120 hand-built levels, no ads, no timers.",
    screenshots: ["/screens/grid-1.png", "/screens/grid-2.png"],
    changelog: [
      { version: "1.2.0", date: "2026-05-20", notes: "20 new levels added: the Coastal set." },
    ],
    downloads: {
      android: "#",
      web: "#",
    },
  },
];

export function getAppBySlug(slug) {
  return apps.find((app) => app.slug === slug);
}
