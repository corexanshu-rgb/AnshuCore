import fs from 'fs';
import path from 'path';
import { fetchGitHubReleases, FALLBACK_RELEASES } from '../services/githubReleases';
import { hashPassword, verifyPassword, verifyPlainOrSha256 } from './auth';

export interface ThemeSettings {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  button: string;
  buttonText: string;
  link: string;
  headerBg: string;
  footerBg: string;
}

export const DEFAULT_THEME: ThemeSettings = {
  primary: '#2563eb',
  secondary: '#4f46e5',
  background: '#f5f7fc',
  surface: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#eaeff8',
  button: '#2563eb',
  buttonText: '#ffffff',
  link: '#2563eb',
  headerBg: '#ffffff',
  footerBg: '#ffffff',
};

export function validateHexColor(hex: string): boolean {
  return typeof hex === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
}

export interface PageSeoConfig {
  title?: string;
  description?: string;
  noindex?: boolean;
}

export interface SiteSeoSettings {
  siteTitle: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonicalBase: string;
  googleSiteVerification?: string;
  pages?: Record<string, PageSeoConfig>;
}

export const DEFAULT_PAGE_SEO: Record<string, PageSeoConfig> = {
  home: {
    title: 'AnshuCore — Software Development, Web & Android Apps | Uttar Pradesh',
    description: 'Modern websites, custom software, Android applications, school ERP, and library management software developed by AnshuCore in Mainpuri, Uttar Pradesh, and across India.',
    noindex: false
  },
  services: {
    title: 'Software & Web Development Services | AnshuCore',
    description: 'Professional website development, custom software engineering, Android applications, school ERP, and library management systems for businesses and institutions.',
    noindex: false
  },
  projects: {
    title: 'Software Engineering Portfolio & Projects | AnshuCore',
    description: 'Explore software engineering projects built by AnshuCore, including cloud library SaaS, institutional school ERP, web applications, and Android systems.',
    noindex: false
  },
  apps: {
    title: 'Android Applications & Direct APK Downloads | AnshuCore',
    description: 'Browse and download official, cryptographically verified Android applications built by AnshuCore, including Anshu Mock, AnshuCore ERP, and Core Notes.',
    noindex: false
  },
  about: {
    title: 'About AnshuCore — Independent Software Studio & Developer',
    description: 'Learn about AnshuCore, founded by Anshu in Mainpuri, Uttar Pradesh. Building dependable software, educational ERPs, and modern web applications.',
    noindex: false
  },
  contact: {
    title: 'Contact AnshuCore — Project Inquiries & Development Services',
    description: 'Get in touch with AnshuCore for website development, custom software, school ERP, or Android app projects. Available for remote and local consultations.',
    noindex: false
  },
  privacy: {
    title: 'Privacy Policy — AnshuCore',
    description: 'Transparent privacy policy detailing data handling, zero third-party monetization, and privacy-first commitments of AnshuCore.',
    noindex: false
  },
  terms: {
    title: 'Terms of Service — AnshuCore',
    description: 'Terms of service and software licensing conditions for AnshuCore applications and custom development services.',
    noindex: false
  },
  mainpuri: {
    title: 'Website Developer & Custom Software in Mainpuri | AnshuCore',
    description: 'Looking for a website developer in Mainpuri? AnshuCore provides custom web development, school ERP software, and Android apps across Mainpuri and Uttar Pradesh.',
    noindex: false
  }
};

export const DEFAULT_SEO: SiteSeoSettings = {
  siteTitle: 'AnshuCore — Website Development, Android Apps & Custom Software',
  description: 'AnshuCore builds modern responsive websites, custom software, Android applications, school ERPs, and library management software in Mainpuri, Uttar Pradesh, and across India.',
  keywords: 'AnshuCore, website developer in Mainpuri, website development services in Mainpuri, custom software development in Uttar Pradesh, Android app development Uttar Pradesh, school ERP software, library management software, business dashboard development',
  canonicalBase: 'https://anshucore.in',
  ogImage: '/assets/anshucore-og.png',
  googleSiteVerification: '',
  pages: { ...DEFAULT_PAGE_SEO }
};

export function sanitizeText(input: any, maxLen: number = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLen);
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  lastLogin: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  status: 'New' | 'In Progress' | 'Replied' | 'Archived';
  date: string;
  notes?: string;
}

export interface ApkItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
  repo: string;
  releaseTag?: string;
  directUrl?: string;
  downloadCount: number;
  sizeFormatted: string;
  isSuperApk: boolean;
  published: boolean;
  description: string;
  updatedAt: string;
}

export interface LibraryTenant {
  id: string;
  tenantId: string;
  name: string;
  hostUrl: string;
  plan: string;
  monthlyAmount: number;
  billingDate: string;
  nextDue: string;
  status: 'Active' | 'Overdue' | 'Suspended' | 'Grace Period';
  isLocked: boolean;
  lockReason?: string;
  gracePeriodDays: number;
  lastPing?: string;
  contactEmail?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  libraryName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  tenantId: string;
  libraryName: string;
  amount: number;
  transactionId: string;
  method: string;
  status: 'Verified' | 'Pending' | 'Failed';
  verifiedAt: string;
}

export interface AppReview {
  id: string;
  appSlug: string;
  appName: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: string;
  target: string;
  details: string;
}

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: string;
  updatedAt: string;
}

export interface AdminStoreData {
  adminAccount?: AdminAccount;
  enquiries: Enquiry[];
  apks: ApkItem[];
  libraries: LibraryTenant[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  reviews: AppReview[];
  websiteContent: {
    hero: {
      eyebrow: string;
      title: string;
      leadText: string;
      ctaPrimary: string;
      ctaPrimaryUrl?: string;
      ctaSecondary: string;
      ctaSecondaryUrl?: string;
      featureCards?: Array<{
        title: string;
        subtitle: string;
        icon: string;
      }>;
    };
    about: {
      headline: string;
      subheadline?: string;
      vision?: string;
      whatWeDo?: string[];
      whyChoose?: string;
      founderStory: string;
      mission: string;
    };
    services: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      tag?: string;
      details?: string;
      startingPrice?: string;
      published?: boolean;
    }>;
    projects: Array<{
      id: string;
      title: string;
      category: string;
      year: string;
      summary: string;
      link: string;
      repoUrl?: string;
      thumbnail?: string;
      featured?: boolean;
      published?: boolean;
      tech?: string[];
    }>;
    pages?: Array<{
      id: string;
      title: string;
      slug: string;
      summary: string;
      published?: boolean;
    }>;
    navItems?: Array<{
      id: string;
      label: string;
      href: string;
      order: number;
    }>;
    seo: SiteSeoSettings;
    social: {
      github: string;
      twitter: string;
      linkedin: string;
      email: string;
    };
  };
  categories?: string[];
  settings: {
    siteName: string;
    adminEmail: string;
    supportEmail: string;
    maintenanceMode: boolean;
    lockWebhookSecret: string;
    razorpayKeyId: string;
    notificationsEnabled: boolean;
    theme?: ThemeSettings;
  };
  auditLogs: AuditLog[];
  visitorLogs?: {
    totalVisitors: number;
    monthlyStats: Array<{ month: string; visitors: number }>;
  };
  analytics?: WebsiteAnalyticsStore;
}

export interface AnalyticsDayStats {
  pageViews: number;
  uniqueVisitorIds: string[];
  paths: Record<string, number>;
}

export interface WebsiteAnalyticsStore {
  configured: boolean;
  lastUpdated?: string;
  days: Record<string, AnalyticsDayStats>;
}

// Default reference seed data matching the UI mockup
const DEFAULT_STORE_DATA: AdminStoreData = {
  enquiries: [],
  apks: [
    {
      id: 'apk-1',
      name: 'Anshu Mock',
      slug: 'anshu-mock',
      icon: 'AM',
      category: 'Education',
      repo: 'indbite-web/Anshu-Mock-',
      releaseTag: 'v1.2.1',
      directUrl: 'https://github.com/indbite-web/Anshu-Mock-/releases/download/v1.2.1/AnshuMock-v1.2.1.apk',
      downloadCount: 17880,
      sizeFormatted: '24.8 MB',
      isSuperApk: true,
      published: true,
      description: 'Official AI-powered test simulation and question bank application for Android.',
      updatedAt: '2026-08-10'
    },
    {
      id: 'apk-2',
      name: 'AnshuCore ERP',
      slug: 'anshucore-erp',
      icon: 'AC',
      category: 'Education',
      repo: 'indbite-web/AnshuCoreErp',
      releaseTag: 'v2.4.0',
      directUrl: '/school-portal',
      downloadCount: 8420,
      sizeFormatted: '32.1 MB',
      isSuperApk: false,
      published: true,
      description: 'Full school and campus management system from admissions to report cards.',
      updatedAt: '2026-08-10'
    },
    {
      id: 'apk-3',
      name: 'Core Notes',
      slug: 'core-notes',
      icon: 'CN',
      category: 'Utility',
      repo: '',
      releaseTag: 'v1.6.0',
      directUrl: '#',
      downloadCount: 3840,
      sizeFormatted: '14.2 MB',
      isSuperApk: false,
      published: true,
      description: 'Distraction-free fast note-taking with instant search and local markdown sync.',
      updatedAt: '2026-07-01'
    },
    {
      id: 'apk-4',
      name: 'GridPath',
      slug: 'gridpath',
      icon: 'GP',
      category: 'Games',
      repo: '',
      releaseTag: 'v1.2.0',
      directUrl: '#',
      downloadCount: 5120,
      sizeFormatted: '48.5 MB',
      isSuperApk: false,
      published: true,
      description: 'Calm hexagonal puzzle game about routing energy. 120 hand-crafted levels.',
      updatedAt: '2026-05-20'
    },
    {
      id: 'apk-5',
      name: 'AnshuBio Security',
      slug: 'anshubio',
      icon: 'AB',
      category: 'Security',
      repo: 'indbite-web/anshubio',
      releaseTag: 'v3.3.4',
      directUrl: '#',
      downloadCount: 1950,
      sizeFormatted: '18.6 MB',
      isSuperApk: false,
      published: true,
      description: 'Biometric PC unlocking and secure authentication protocol client for Windows.',
      updatedAt: '2026-08-15'
    }
  ],
  libraries: [],
  invoices: [],
  payments: [],
  reviews: [],
  websiteContent: {
    hero: {
      eyebrow: 'Software Development & Digital Solutions',
      title: 'Turning Ideas Into Powerful Digital Solutions',
      leadText: 'We create modern websites, custom software, Android apps and complete ERP solutions for schools, libraries and businesses.',
      ctaPrimary: 'Get a Quote',
      ctaPrimaryUrl: '/contact',
      ctaSecondary: 'Explore Services',
      ctaSecondaryUrl: '/services',
      featureCards: [
        { title: 'Website Development', subtitle: 'Modern & Responsive', icon: 'globe' },
        { title: 'Custom Software', subtitle: 'For Your Business', icon: 'cpu' },
        { title: 'Android Applications', subtitle: 'Play Store & APK', icon: 'smartphone' },
        { title: 'School ERP', subtitle: 'Complete Solution', icon: 'graduation-cap' },
        { title: 'Library Management', subtitle: 'Smart & Easy', icon: 'building' }
      ]
    },
    about: {
      headline: 'About Us',
      subheadline: 'Learn more about AnshuCore, our vision and what we do.',
      vision: 'To provide simple, powerful and affordable digital solutions for individuals, schools, libraries and businesses.',
      whatWeDo: [
        'Modern websites',
        'Custom software',
        'Android applications',
        'School and library ERP solutions',
        'Long-term support'
      ],
      whyChoose: 'Clean design, reliable solutions and continuous support.',
      founderStory: 'Anshu Core is an independent software studio founded by Anshu. We design and engineer specialized products across education management, examination simulation, developer utilities, and security.',
      mission: 'Ship reliable, privacy-first, lightning-fast software with zero unnecessary complexity.'
    },
    services: [
      {
        id: 'srv-1',
        name: 'Website Development',
        description: 'Modern, fast and responsive websites for businesses, schools and organizations.',
        icon: 'globe',
        tag: 'Modern & Responsive',
        details: 'Custom responsive design, high performance, SEO optimization, and secure API integration built with modern web technologies.',
        startingPrice: 'Custom Quote',
        published: true
      },
      {
        id: 'srv-2',
        name: 'Custom Software',
        description: 'Tailored software solutions to automate and grow your business.',
        icon: 'cpu',
        tag: 'For Your Business',
        details: 'Specialized business workflows, multi-tenant databases, reporting tools, and custom management dashboards.',
        startingPrice: 'Custom Quote',
        published: true
      },
      {
        id: 'srv-3',
        name: 'Android App Development',
        description: 'Professional Android applications for personal and business use.',
        icon: 'smartphone',
        tag: 'Play Store & APK',
        details: 'High-performance offline-first architecture, SQLite local caching, biometric authentication, and direct APK delivery.',
        startingPrice: 'Custom Quote',
        published: true
      },
      {
        id: 'srv-4',
        name: 'School ERP Solution',
        description: 'Complete school management system with website and admin panel.',
        icon: 'graduation-cap',
        tag: 'Complete Solution',
        details: 'Student records, fee management, examination scorecards, teacher attendance, and multi-branch management.',
        startingPrice: 'Custom Quote',
        published: true
      },
      {
        id: 'srv-5',
        name: 'Library Management',
        description: 'Smart library system with member management, book tracking and more.',
        icon: 'building',
        tag: 'Smart & Easy',
        details: 'Centralized book cataloging, RFID/barcode tracking, automated fee reminders, and remote turnstile/gate lock enforcement.',
        startingPrice: 'Custom Quote',
        published: true
      },
      {
        id: 'srv-6',
        name: 'Website Maintenance',
        description: 'Regular updates, speed optimization and continuous security support.',
        icon: 'wrench',
        tag: '24/7 Reliability',
        details: 'Proactive security patching, database backups, uptime monitoring, and priority technical assistance.',
        startingPrice: 'Custom Quote',
        published: true
      }
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Gurukul Library',
        category: 'Library',
        year: '2026',
        summary: 'Multi-tenant cloud library management platform with biometric turnstile gate controls and automated dues tracking.',
        thumbnail: '/screens/erp-1.png',
        link: '/contact?service=Library%20Management',
        repoUrl: '',
        featured: true,
        published: true,
        tech: ['Node.js', 'PostgreSQL', 'Prisma', 'TailwindCSS']
      },
      {
        id: 'proj-2',
        title: 'Anshu Public School ERP',
        category: 'School ERP',
        year: '2026',
        summary: 'Full-featured institutional SaaS managing admissions, fees collection, results, and teacher schedules.',
        thumbnail: '/screens/erp-2.png',
        link: '/contact?service=School%20ERP%20Solution',
        repoUrl: '',
        featured: true,
        published: true,
        tech: ['Next.js', 'React', 'Redis', 'Node.js']
      },
      {
        id: 'proj-3',
        title: 'IndBite',
        category: 'Websites',
        year: '2026',
        summary: 'Fast marketing and ordering web platform with responsive menu browsing and local order management.',
        thumbnail: '/screens/erp-3.png',
        link: 'https://github.com/indbite-web',
        repoUrl: 'https://github.com/indbite-web',
        featured: true,
        published: true,
        tech: ['HTML5', 'CSS3', 'JavaScript', 'Vercel']
      },
      {
        id: 'proj-4',
        title: 'MovieGetnix',
        category: 'Websites',
        year: '2026',
        summary: 'Interactive media exploration and entertainment discovery website with responsive catalog search.',
        thumbnail: '/screens/notes-1.png',
        link: 'https://github.com/indbite-web',
        repoUrl: 'https://github.com/indbite-web',
        featured: true,
        published: true,
        tech: ['JavaScript', 'API Integration', 'Responsive CSS']
      },
      {
        id: 'proj-5',
        title: 'Anshu Mock Exam Engine',
        category: 'Android Apps',
        year: '2026',
        summary: 'Official AI-powered examination simulator with offline SQLite question bank and real-time score analytics.',
        thumbnail: '/screens/notes-2.png',
        link: '/apps/anshu-mock',
        repoUrl: 'https://github.com/indbite-web/Anshu-Mock-',
        featured: true,
        published: true,
        tech: ['Android', 'Kotlin', 'SQLite', 'GitHub Releases']
      }
    ],
    pages: [
      { id: 'page-home', title: 'Home', slug: '/', summary: 'Landing page with hero, services overview and APKs showcase.', published: true },
      { id: 'page-services', title: 'Services', slug: '/services', summary: 'Detailed service catalog and solution offerings.', published: true },
      { id: 'page-projects', title: 'Projects', slug: '/projects', summary: 'Software engineering portfolio and case studies.', published: true },
      { id: 'page-apps', title: 'Apps & APKs', slug: '/apps', summary: 'Official cryptographically verified APK store.', published: true },
      { id: 'page-about', title: 'About Us', slug: '/about', summary: 'Company background, founder journey, and mission.', published: true },
      { id: 'page-contact', title: 'Contact Us', slug: '/contact', summary: 'Inquiries, quotes, and support form.', published: true },
      { id: 'page-privacy', title: 'Privacy Policy', slug: '/privacy', summary: 'Data protection and transparency terms.', published: true },
      { id: 'page-terms', title: 'Terms of Service', slug: '/terms', summary: 'Software licensing conditions.', published: true }
    ],
    navItems: [
      { id: 'nav-1', label: 'Home', href: '/', order: 1 },
      { id: 'nav-2', label: 'Services', href: '/services', order: 2 },
      { id: 'nav-3', label: 'Projects', href: '/projects', order: 3 },
      { id: 'nav-4', label: 'Apps', href: '/apps', order: 4 },
      { id: 'nav-5', label: 'About', href: '/about', order: 5 },
      { id: 'nav-6', label: 'Contact', href: '/contact', order: 6 }
    ],
    seo: { ...DEFAULT_SEO },
    social: {
      github: 'https://github.com/indbite-web',
      twitter: 'https://twitter.com/corexanshu',
      linkedin: 'https://linkedin.com/in/corexanshu',
      email: 'corexanshu@gmail.com'
    }
  },
  categories: ['Education', 'Utility', 'Games', 'Security'],
  settings: {
    siteName: 'AnshuCore Admin Console',
    adminEmail: 'corexanshu@gmail.com',
    supportEmail: 'support@anshucore.com',
    maintenanceMode: false,
    lockWebhookSecret: 'anshucore_lock_wh_sec_2026',
    razorpayKeyId: 'rzp_live_placeholder_key',
    notificationsEnabled: true,
    theme: { ...DEFAULT_THEME }
  },
  auditLogs: [
    {
      id: 'log-1',
      timestamp: '2026-10-23 09:15:22',
      adminUser: 'Anshu',
      action: 'SYSTEM_STARTUP',
      target: 'AnshuCore Engine',
      details: 'AnshuCore production environment initialized.'
    }
  ]
};

const REDIS_KEY = 'anshucore:admin:store:v1';
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'admin-store.json');

// In-memory cache for fast sub-millisecond reads
let memoryCache: AdminStoreData | null = null;
let lastCacheSync = 0;

/**
 * Check if Upstash Redis credentials are configured
 */
function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    return { url, token };
  }
  return null;
}

/**
 * Native REST client for Upstash Redis (zero external dependencies)
 */
async function redisRestCall(command: string[]): Promise<any> {
  const config = getRedisConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });

    if (!res.ok) {
      console.warn(`Upstash Redis error (${res.status}):`, await res.text());
      return null;
    }

    const data = await res.json();
    return data.result;
  } catch (err) {
    console.warn('Upstash Redis network exception, using local store:', err);
    return null;
  }
}

/**
 * Read store with multi-tier storage (Memory -> Redis -> Local File -> Default)
 */
export async function getStore(): Promise<AdminStoreData> {
  const now = Date.now();
  if (memoryCache && now - lastCacheSync < 10000) {
    return memoryCache;
  }

  // 1. Try Upstash Redis if configured
  const redisConfig = getRedisConfig();
  if (redisConfig) {
    const redisRaw = await redisRestCall(['GET', REDIS_KEY]);
    if (redisRaw) {
      try {
        const rawObj = typeof redisRaw === 'string' ? JSON.parse(redisRaw) : redisRaw;
        const parsed = hydrateStoreDefaults(rawObj);
        memoryCache = parsed;
        lastCacheSync = now;
        return parsed;
      } catch (e) {
        console.error('Failed to parse Redis data JSON:', e);
      }
    }
  }

  // 2. Try Local File Store or /tmp fallback on serverless
  const tmpStoreFile = path.join('/tmp', 'admin-store.json');
  const targetFile = fs.existsSync(tmpStoreFile) ? tmpStoreFile : LOCAL_STORE_FILE;

  try {
    if (fs.existsSync(targetFile)) {
      const fileRaw = fs.readFileSync(targetFile, 'utf-8');
      const rawObj = JSON.parse(fileRaw);
      const parsed = hydrateStoreDefaults(rawObj);
      memoryCache = parsed;
      lastCacheSync = now;
      return parsed;
    }
  } catch (e) {
    console.warn('Local store read warning:', e);
  }

  // 3. Fallback to Initial Seed Data and persist it safely
  memoryCache = hydrateStoreDefaults(JSON.parse(JSON.stringify(DEFAULT_STORE_DATA)));
  lastCacheSync = now;
  await saveStore(memoryCache!);
  return memoryCache!;
}

function hydrateStoreDefaults(parsed: any): AdminStoreData {
  parsed.settings = parsed.settings || {};
  parsed.settings.theme = { ...DEFAULT_THEME, ...(parsed.settings.theme || {}) };
  parsed.websiteContent = parsed.websiteContent || {};
  parsed.websiteContent.services = parsed.websiteContent.services || DEFAULT_STORE_DATA.websiteContent.services;
  parsed.websiteContent.projects = parsed.websiteContent.projects || DEFAULT_STORE_DATA.websiteContent.projects;
  parsed.websiteContent.pages = parsed.websiteContent.pages || DEFAULT_STORE_DATA.websiteContent.pages;
  parsed.websiteContent.navItems = parsed.websiteContent.navItems || DEFAULT_STORE_DATA.websiteContent.navItems;
  parsed.categories = (parsed.categories && parsed.categories.length > 0)
    ? parsed.categories
    : ['Education', 'Utility', 'Games', 'Security'];
  parsed.enquiries = parsed.enquiries || [];
  parsed.apks = parsed.apks || DEFAULT_STORE_DATA.apks;
  parsed.libraries = parsed.libraries || [];
  parsed.invoices = parsed.invoices || [];
  parsed.payments = parsed.payments || [];
  parsed.reviews = parsed.reviews || [];
  parsed.auditLogs = parsed.auditLogs || [];
  parsed.websiteContent.seo = {
    ...DEFAULT_SEO,
    ...(parsed.websiteContent.seo || {}),
    canonicalBase: (parsed.websiteContent.seo?.canonicalBase || 'https://anshucore.in').trim().replace(/\/+$/, ''),
    pages: {
      ...DEFAULT_PAGE_SEO,
      ...(parsed.websiteContent.seo?.pages || {})
    }
  };
  ensureAdminAccount(parsed);
  return parsed as AdminStoreData;
}

/**
 * Bootstrap or retrieve persistent Admin Account
 * NEVER overwrites an already-existing admin account on startup/deploy
 */
export function ensureAdminAccount(store: AdminStoreData): AdminAccount {
  if (store.adminAccount && store.adminAccount.email && store.adminAccount.passwordHash) {
    return store.adminAccount;
  }

  // Safe bootstrap from environment variables
  const envEmail = (process.env.ADMIN_EMAIL || 'admin@anshucore.in').trim();
  const envUsername = (process.env.ADMIN_USERNAME || 'Anshu').trim();
  const envPassword = process.env.ADMIN_PASSWORD || 'AnshuCore@2026!';

  const { hash, salt } = hashPassword(envPassword);
  store.adminAccount = {
    id: 'usr_admin_1',
    username: envUsername,
    email: envEmail,
    passwordHash: hash,
    salt,
    name: envUsername,
    role: 'Super Admin',
    updatedAt: new Date().toISOString()
  };
  return store.adminAccount;
}

/**
 * Update Admin Email in persistent storage
 */
export async function updateAdminEmail(
  currentEmail: string,
  newEmail: string,
  currentPassword: string
): Promise<{ success: boolean; error?: string; email?: string }> {
  const store = await getStore();
  const account = ensureAdminAccount(store);

  // Verify current password
  const isValidPass = (account.passwordHash && account.salt)
    ? verifyPassword(currentPassword, account.passwordHash, account.salt)
    : verifyPlainOrSha256(currentPassword, process.env.ADMIN_PASSWORD || '');

  if (!isValidPass) {
    return { success: false, error: 'Current password verification failed. Please enter your valid password.' };
  }

  // Validate new email format
  const cleanEmail = (newEmail || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  if (cleanEmail === account.email.toLowerCase()) {
    return { success: false, error: 'New email address must be different from current email.' };
  }

  account.email = cleanEmail;
  account.updatedAt = new Date().toISOString();
  if (store.settings) {
    store.settings.adminEmail = cleanEmail;
  }
  await saveStore(store);

  await logAdminAction(
    account.username,
    'ADMIN_EMAIL_CHANGED',
    'Account Security',
    `Administrator email changed to ${cleanEmail}`
  );

  return { success: true, email: cleanEmail };
}

/**
 * Update Admin Password in persistent storage
 */
export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; error?: string }> {
  const store = await getStore();
  const account = ensureAdminAccount(store);

  // Verify current password
  const isValidPass = (account.passwordHash && account.salt)
    ? verifyPassword(currentPassword, account.passwordHash, account.salt)
    : verifyPlainOrSha256(currentPassword, process.env.ADMIN_PASSWORD || '');

  if (!isValidPass) {
    return { success: false, error: 'Current password verification failed. Please enter your valid password.' };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'New password and confirmation password do not match.' };
  }

  if (newPassword === currentPassword) {
    return { success: false, error: 'New password must be different from your current password.' };
  }

  const { hash, salt } = hashPassword(newPassword);
  account.passwordHash = hash;
  account.salt = salt;
  account.updatedAt = new Date().toISOString();
  await saveStore(store);

  await logAdminAction(
    account.username,
    'ADMIN_PASSWORD_CHANGED',
    'Account Security',
    'Administrator password changed successfully.'
  );

  return { success: true };
}

/**
 * Persist store to Redis and Local File safely
 */
export async function saveStore(store: AdminStoreData): Promise<boolean> {
  memoryCache = store;
  lastCacheSync = Date.now();

  let redisSaved = false;
  const redisConfig = getRedisConfig();
  if (redisConfig) {
    const result = await redisRestCall(['SET', REDIS_KEY, JSON.stringify(store)]);
    if (result === 'OK' || result === true) {
      redisSaved = true;
    }
  }

  // Also persist to local filesystem if writable, with /tmp fallback for serverless
  const tmpStoreFile = path.join('/tmp', 'admin-store.json');
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
    return true;
  } catch (err) {
    try {
      fs.writeFileSync(tmpStoreFile, JSON.stringify(store, null, 2), 'utf-8');
      return true;
    } catch {}
    return redisSaved;
  }
}

/**
 * Audit Logger
 */
export async function logAdminAction(
  adminUser: string,
  action: string,
  target: string,
  details: string
): Promise<void> {
  const store = await getStore();
  const log: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    adminUser,
    action,
    target,
    details
  };
  store.auditLogs.unshift(log);
  if (store.auditLogs.length > 200) {
    store.auditLogs = store.auditLogs.slice(0, 200);
  }
  await saveStore(store);
}

/**
 * Compute Real Dashboard Overview Statistics
 */
export async function getDashboardOverviewMetrics() {
  const store = await getStore();

  // Try fetching live GitHub releases for Anshu Mock to verify real counts
  let liveGitHubDownloads = 0;
  let liveReleaseCount = 0;
  try {
    const ghData = await fetchGitHubReleases();
    if (ghData && ghData.releases?.length > 0) {
      liveReleaseCount = ghData.releases.length;
      liveGitHubDownloads = ghData.totalDownloads;
      // Sync with store's Anshu Mock APK
      const anshuMock = store.apks.find(a => a.slug === 'anshu-mock');
      if (anshuMock) {
        anshuMock.downloadCount = liveGitHubDownloads;
        if (ghData.latestRelease?.tag_name) {
          anshuMock.releaseTag = ghData.latestRelease.tag_name;
        }
        if (ghData.latestRelease?.downloadUrl) {
          anshuMock.directUrl = ghData.latestRelease.downloadUrl;
        }
      }
    }
  } catch {
    // Use stored counts
  }

  // 1. APK metrics
  const totalApks = store.apks.length;
  const publishedApks = store.apks.filter(a => a.published).length;

  // 2. Client Enquiries
  const totalEnquiries = store.enquiries.length;
  const newEnquiries = store.enquiries.filter(e => e.status === 'New').length;

  // 3. Libraries (Tenants)
  const totalLibraries = store.libraries.length;
  const activeLibraries = store.libraries.filter(l => l.status === 'Active' && !l.isLocked).length;
  const dueLibraries = store.libraries.filter(l => l.status === 'Overdue' || l.status === 'Grace Period').length;

  // 4. Monthly Maintenance Revenue (strictly from verified payments)
  const monthlyRevenue = store.payments
    .filter(p => p.status === 'Verified')
    .reduce((sum, p) => sum + p.amount, 0);

  // 5. Locked Libraries
  const lockedLibraries = store.libraries.filter(l => l.isLocked).length;
  const gracePeriodLibraries = store.libraries.filter(l => l.status === 'Grace Period').length;

  // Recent enquiries list (first 5)
  const recentEnquiries = store.enquiries.slice(0, 5);

  // Top APKs
  const topApks = [...store.apks]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 5);

  // Library subscription status list (first 5)
  const libraryStatuses = store.libraries.slice(0, 5);

  // 6. Real Website Visitors from analytics store
  let totalVisitorsCount = 0;
  let todayVisitorsCount = 0;
  let hasRealVisitors = false;

  if (store.analytics?.days) {
    const todayStr = new Date().toISOString().split('T')[0];
    const allVids = new Set<string>();
    const todayVids = new Set<string>();

    for (const [d, dayData] of Object.entries(store.analytics.days)) {
      for (const vid of dayData.uniqueVisitorIds || []) {
        allVids.add(vid);
        if (d === todayStr) todayVids.add(vid);
      }
    }
    totalVisitorsCount = allVids.size;
    todayVisitorsCount = todayVids.size;
    hasRealVisitors = totalVisitorsCount > 0;
  }

  return {
    metrics: {
      visitors: {
        value: hasRealVisitors ? `${totalVisitorsCount.toLocaleString()}` : '0',
        change: hasRealVisitors ? `+${todayVisitorsCount} today` : 'Awaiting traffic',
        available: hasRealVisitors
      },
      apks: {
        total: totalApks,
        published: publishedApks,
        githubReleases: liveReleaseCount
      },
      enquiries: {
        total: totalEnquiries,
        newCount: newEnquiries
      },
      libraries: {
        total: totalLibraries,
        active: activeLibraries,
        due: dueLibraries
      },
      revenue: {
        value: monthlyRevenue > 0 ? `₹${monthlyRevenue.toLocaleString()}` : '₹0',
        period: 'This Month',
        numeric: monthlyRevenue
      },
      locked: {
        lockedCount: lockedLibraries,
        gracePeriodCount: gracePeriodLibraries
      },
      system: {
        githubApi: liveReleaseCount > 0 ? 'Connected' : 'Standby',
        storageEngine: 'Multi-tier JSON & KV',
        status: 'Operational'
      }
    },
    recentEnquiries,
    topApks,
    libraryStatuses,
    recentAuditLogs: store.auditLogs.slice(0, 8)
  };
}

/**
 * Fetch Public Website Data for SSR / SSG and API
 */
export async function getPublicWebsiteData() {
  const store = await getStore();

  // Try fetching live GitHub releases for Anshu Mock to verify real counts
  try {
    const ghData = await fetchGitHubReleases();
    if (ghData && ghData.totalDownloads > 0) {
      const anshuMock = store.apks.find(a => a.slug === 'anshu-mock');
      if (anshuMock) {
        anshuMock.downloadCount = ghData.totalDownloads;
        if (ghData.latestRelease?.tag_name) {
          anshuMock.releaseTag = ghData.latestRelease.tag_name;
        }
        if (ghData.latestRelease?.downloadUrl) {
          anshuMock.directUrl = ghData.latestRelease.downloadUrl;
        }
        if (ghData.latestRelease?.apkSizeFormatted) {
          anshuMock.sizeFormatted = ghData.latestRelease.apkSizeFormatted;
        }
      }
    }
  } catch {
    // Keep cached counts
  }

  const publishedApks = store.apks.filter(a => a.published !== false);
  const superApk = publishedApks.find(a => a.isSuperApk) || publishedApks[0] || null;
  const approvedReviews = store.reviews.filter(r => r.status === 'Approved');
  const publishedServices = (store.websiteContent.services || []).filter((s: any) => s.published !== false);
  const publishedProjects = (store.websiteContent.projects || []).filter((p: any) => p.published !== false);

  return {
    hero: store.websiteContent.hero,
    about: store.websiteContent.about,
    services: publishedServices,
    projects: publishedProjects,
    apks: publishedApks,
    superApk,
    reviews: approvedReviews,
    seo: store.websiteContent.seo,
    social: store.websiteContent.social,
    settings: {
      siteName: store.settings.siteName,
      supportEmail: store.settings.supportEmail,
      theme: store.settings.theme || DEFAULT_THEME
    }
  };
}

/**
 * Save / Update Theme Settings
 */
export async function saveTheme(themeUpdate: Partial<ThemeSettings>): Promise<ThemeSettings> {
  const store = await getStore();
  store.settings = store.settings || {};
  const currentTheme = store.settings.theme || { ...DEFAULT_THEME };

  const sanitized: ThemeSettings = {
    primary: validateHexColor(themeUpdate.primary || '') ? themeUpdate.primary!.trim() : currentTheme.primary,
    secondary: validateHexColor(themeUpdate.secondary || '') ? themeUpdate.secondary!.trim() : currentTheme.secondary,
    background: validateHexColor(themeUpdate.background || '') ? themeUpdate.background!.trim() : currentTheme.background,
    surface: validateHexColor(themeUpdate.surface || '') ? themeUpdate.surface!.trim() : currentTheme.surface,
    text: validateHexColor(themeUpdate.text || '') ? themeUpdate.text!.trim() : currentTheme.text,
    muted: validateHexColor(themeUpdate.muted || '') ? themeUpdate.muted!.trim() : currentTheme.muted,
    border: validateHexColor(themeUpdate.border || '') ? themeUpdate.border!.trim() : currentTheme.border,
    button: validateHexColor(themeUpdate.button || '') ? themeUpdate.button!.trim() : currentTheme.button,
    buttonText: validateHexColor(themeUpdate.buttonText || '') ? themeUpdate.buttonText!.trim() : currentTheme.buttonText,
    link: validateHexColor(themeUpdate.link || '') ? themeUpdate.link!.trim() : currentTheme.link,
    headerBg: validateHexColor(themeUpdate.headerBg || '') ? themeUpdate.headerBg!.trim() : currentTheme.headerBg,
    footerBg: validateHexColor(themeUpdate.footerBg || '') ? themeUpdate.footerBg!.trim() : currentTheme.footerBg,
  };

  store.settings.theme = sanitized;
  await saveStore(store);
  return sanitized;
}

/**
 * Record a public page view for privacy-conscious website analytics
 */
export async function recordPageView(
  rawPath: string,
  visitorId: string,
  _referrer?: string
): Promise<boolean> {
  if (!rawPath || typeof rawPath !== 'string') return false;

  // Clean path
  const path = rawPath.split('?')[0].trim() || '/';

  // Do not record admin or internal routes
  if (
    path.startsWith('/hackertrac') ||
    path.startsWith('/admin') ||
    path.startsWith('/api') ||
    path.startsWith('/_next')
  ) {
    return false;
  }

  const store = await getStore();
  if (!store.analytics) {
    store.analytics = {
      configured: true,
      lastUpdated: new Date().toISOString(),
      days: {}
    };
  }

  const today = new Date().toISOString().split('T')[0];
  if (!store.analytics.days[today]) {
    store.analytics.days[today] = {
      pageViews: 0,
      uniqueVisitorIds: [],
      paths: {}
    };
  }

  const day = store.analytics.days[today];
  day.pageViews += 1;

  const cleanVid = (visitorId || '').trim().slice(0, 64);
  if (cleanVid && !day.uniqueVisitorIds.includes(cleanVid)) {
    day.uniqueVisitorIds.push(cleanVid);
  }

  day.paths[path] = (day.paths[path] || 0) + 1;
  store.analytics.lastUpdated = new Date().toISOString();

  // Prune days older than 90 days to keep store compact
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  for (const dateKey of Object.keys(store.analytics.days)) {
    if (dateKey < cutoffStr) {
      delete store.analytics.days[dateKey];
    }
  }

  await saveStore(store);
  return true;
}

/**
 * Compute Real Website Analytics Metrics for Admin Dashboard
 */
export async function getWebsiteAnalyticsMetrics() {
  const store = await getStore();
  const analytics = store.analytics;

  if (!analytics || !analytics.days || Object.keys(analytics.days).length === 0) {
    return {
      configured: true,
      hasData: false,
      lastUpdated: null,
      totals: {
        pageViews: 0,
        uniqueVisitors: 0
      },
      today: {
        pageViews: 0,
        uniqueVisitors: 0
      },
      last7Days: {
        pageViews: 0,
        uniqueVisitors: 0
      },
      last30Days: {
        pageViews: 0,
        uniqueVisitors: 0
      },
      mostVisitedPages: [],
      dailyChart: []
    };
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const getDateStr = (offsetDays: number) => {
    const d = new Date(now.getTime() - offsetDays * 86400000);
    return d.toISOString().split('T')[0];
  };

  const dayKeys7 = new Set<string>();
  for (let i = 0; i < 7; i++) dayKeys7.add(getDateStr(i));

  const dayKeys30 = new Set<string>();
  for (let i = 0; i < 30; i++) dayKeys30.add(getDateStr(i));

  let totalPageViews = 0;
  const allUniqueVisitorIds = new Set<string>();

  let todayPageViews = 0;
  const todayVisitors = new Set<string>();

  let last7PageViews = 0;
  const last7Visitors = new Set<string>();

  let last30PageViews = 0;
  const last30Visitors = new Set<string>();

  const pathAggregates: Record<string, number> = {};

  for (const [dateStr, dayData] of Object.entries(analytics.days)) {
    const views = dayData.pageViews || 0;
    const vids = dayData.uniqueVisitorIds || [];

    totalPageViews += views;
    for (const id of vids) allUniqueVisitorIds.add(id);

    if (dateStr === todayStr) {
      todayPageViews += views;
      for (const id of vids) todayVisitors.add(id);
    }

    if (dayKeys7.has(dateStr)) {
      last7PageViews += views;
      for (const id of vids) last7Visitors.add(id);
    }

    if (dayKeys30.has(dateStr)) {
      last30PageViews += views;
      for (const id of vids) last30Visitors.add(id);
    }

    for (const [path, count] of Object.entries(dayData.paths || {})) {
      pathAggregates[path] = (pathAggregates[path] || 0) + count;
    }
  }

  const pathNames: Record<string, string> = {
    '/': 'Home',
    '/services': 'Services',
    '/services/mainpuri': 'Mainpuri Regional Services',
    '/projects': 'Projects Portfolio',
    '/apps': 'Apps & APK Store',
    '/about': 'About AnshuCore',
    '/contact': 'Contact Us',
    '/privacy': 'Privacy Policy',
    '/terms': 'Terms of Service',
  };

  const mostVisitedPages = Object.entries(pathAggregates)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, views]) => {
      let friendlyName = pathNames[path];
      if (!friendlyName) {
        if (path.startsWith('/apps/')) {
          friendlyName = `App: ${path.replace('/apps/', '')}`;
        } else {
          friendlyName = path;
        }
      }
      const percentage = totalPageViews > 0 ? Math.round((views / totalPageViews) * 100) : 0;
      return {
        path,
        name: friendlyName,
        views,
        percentage
      };
    });

  const dailyChart = [];
  for (let i = 29; i >= 0; i--) {
    const dStr = getDateStr(i);
    const dayData = analytics.days[dStr];
    const dateObj = new Date(dStr + 'T00:00:00Z');
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    dailyChart.push({
      date: dStr,
      label,
      pageViews: dayData?.pageViews || 0,
      visitors: (dayData?.uniqueVisitorIds || []).length
    });
  }

  return {
    configured: true,
    hasData: totalPageViews > 0,
    lastUpdated: analytics.lastUpdated,
    totals: {
      pageViews: totalPageViews,
      uniqueVisitors: allUniqueVisitorIds.size
    },
    today: {
      pageViews: todayPageViews,
      uniqueVisitors: todayVisitors.size
    },
    last7Days: {
      pageViews: last7PageViews,
      uniqueVisitors: last7Visitors.size
    },
    last30Days: {
      pageViews: last30PageViews,
      uniqueVisitors: last30Visitors.size
    },
    mostVisitedPages,
    dailyChart
  };
}

