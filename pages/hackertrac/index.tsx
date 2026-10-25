import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import BrandLogo from '../../components/BrandLogo';
import AppIcon from '../../components/AppIcon';
import { extractSessionToken, verifySession } from '../../lib/auth';

// Accessible SVG Helpers replacing decorative emojis
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const StarIcon = ({ size = 14, color = '#eab308' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ color }} aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const CheckIcon = ({ size = 16, color = '#16a34a' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);


// Types
interface OverviewData {
  metrics: {
    visitors?: { value: string; change: string; available: boolean };
    apks: { total: number; published: number; githubReleases?: number };
    enquiries: { total: number; newCount: number; change?: string };
    libraries: { total: number; active: number; due: number };
    revenue: { value: string; period: string; numeric: number };
    locked: { lockedCount: number; gracePeriodCount: number };
    system?: { githubApi: string; storageEngine: string; status: string };
  };
  recentEnquiries: Array<{
    id: string;
    name: string;
    service: string;
    status: 'New' | 'In Progress' | 'Replied' | 'Archived';
    date: string;
    email?: string;
    message?: string;
  }>;
  topApks: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string;
    downloadCount: number;
    category: string;
    sizeFormatted: string;
    published: boolean;
    isSuperApk: boolean;
  }>;
  libraryStatuses: Array<{
    id: string;
    tenantId: string;
    name: string;
    nextDue: string;
    status: 'Active' | 'Overdue' | 'Suspended' | 'Grace Period';
    isLocked: boolean;
    monthlyAmount: number;
    hostUrl: string;
    lockReason?: string;
  }>;
  visitorTrends?: Array<{ month: string; visitors: number }>;
  downloadsTrend?: Array<{ month: string; count: number }>;
  revenueTrend?: Array<{ month: string; amount: number }>;
  recentAuditLogs?: Array<{
    id: string;
    timestamp: string;
    adminUser: string;
    action: string;
    target: string;
    details: string;
  }>;
}

export default function AdminPage({ initialAuthenticated = false, initialUser = null }: any) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(initialAuthenticated));
  const [adminUser, setAdminUser] = useState<any>(initialUser || null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Navigation & View state
  const [activeNav, setActiveNav] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Website Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Dashboard & Domain data
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState<OverviewData | null>(null);
  const [apksList, setApksList] = useState<any[]>([]);
  const [librariesList, setLibrariesList] = useState<any[]>([]);
  const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [websiteContent, setWebsiteContent] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>(['Education', 'Utility', 'Games', 'Security']);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Account Security state
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
    loading: false,
    error: '',
    success: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: '',
    success: ''
  });

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    title: string;
    message: string;
    recordName?: string;
    details?: string;
    actionType: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Form states for modals
  const [apkForm, setApkForm] = useState({
    id: '',
    name: '',
    slug: '',
    icon: '',
    category: 'Education',
    repo: 'indbite-web/Anshu-Mock-',
    releaseTag: 'v1.2.1',
    directUrl: '',
    downloadCount: 0,
    sizeFormatted: '24.8 MB',
    isSuperApk: false,
    published: true,
    description: '',
    tagline: '',
    minAndroid: '7.0 and up',
    ageRating: 'Rated for 3+',
    features: '',
    screenshots: '',
    relatedAppIds: [] as string[],
    developer: 'AnshuCore'
  });

  // App manager filter and sort states matching Reference UI
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [appCategoryFilter, setAppCategoryFilter] = useState('all');
  const [appSortBy, setAppSortBy] = useState<'name' | 'downloads' | 'newest'>('newest');
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);
  const [reassignCategoryModal, setReassignCategoryModal] = useState<{ targetCat: string; reassignTo: string; affectedApps: any[] } | null>(null);

  const [libraryForm, setLibraryForm] = useState({
    id: '',
    tenantId: '',
    name: '',
    hostUrl: 'http://localhost:5000',
    plan: 'Standard Monthly',
    monthlyAmount: 1000,
    billingDate: '25th',
    nextDue: '25 Nov 2026',
    gracePeriodDays: 5,
    contactEmail: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    tenantId: 'gurukul-lib',
    amount: 1000,
    dueDate: '25 Nov 2026'
  });

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: 1000,
    method: 'Razorpay UPI',
    transactionId: ''
  });

  const [lockModalForm, setLockModalForm] = useState({
    tenantId: '',
    libraryName: '',
    isCurrentlyLocked: false,
    reason: ''
  });

  const [enquiryDetails, setEnquiryDetails] = useState<any>(null);
  const [enquiryStatusUpdate, setEnquiryStatusUpdate] = useState<'New' | 'In Progress' | 'Replied' | 'Archived'>('New');
  const [enquiryNotes, setEnquiryNotes] = useState('');

  const [serviceForm, setServiceForm] = useState({
    id: '',
    name: '',
    description: '',
    icon: 'globe',
    tag: 'Modern & Responsive',
    details: '',
    startingPrice: 'Custom Quote',
    published: true
  });

  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    category: 'Websites',
    year: '2026',
    summary: '',
    link: '#',
    repoUrl: '',
    thumbnail: '/screens/erp-1.png',
    featured: true,
    published: true,
    tech: 'Next.js, React, Node.js'
  });

  // APK Icon upload validation & error state
  const [apkIconError, setApkIconError] = useState('');

  // Website Appearance / Theme Customization State
  const DEFAULT_THEME_STATE = {
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
  const [themeForm, setThemeForm] = useState(DEFAULT_THEME_STATE);
  const [savedTheme, setSavedTheme] = useState(DEFAULT_THEME_STATE);
  const [themeLoading, setThemeLoading] = useState(false);
  const [themeError, setThemeError] = useState('');

  // SEO & Social Management State
  const [selectedSeoTab, setSelectedSeoTab] = useState<'pages' | 'global'>('pages');
  const [selectedSeoPage, setSelectedSeoPage] = useState<string>('home');
  const [seoSaving, setSeoSaving] = useState(false);

  const SEO_PAGES_LIST = [
    { key: 'home', label: 'Home Page', path: '/' },
    { key: 'services', label: 'Services', path: '/services' },
    { key: 'mainpuri', label: 'Mainpuri & UP Regional', path: '/services/mainpuri' },
    { key: 'projects', label: 'Projects & Case Studies', path: '/projects' },
    { key: 'apps', label: 'Android APK Store', path: '/apps' },
    { key: 'about', label: 'About Us', path: '/about' },
    { key: 'contact', label: 'Contact & Quotes', path: '/contact' },
    { key: 'privacy', label: 'Privacy Policy', path: '/privacy' },
    { key: 'terms', label: 'Terms of Service', path: '/terms' },
  ];

  // Contrast ratio calculator for WCAG accessibility
  const getContrast = (hex1: string, hex2: string) => {
    try {
      const toRgb = (h: string) => {
        let c = (h || '#000000').replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const n = parseInt(c, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      };
      const lum = (rgb: number[]) => {
        const a = rgb.map(v => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
      };
      const l1 = lum(toRgb(hex1));
      const l2 = lum(toRgb(hex2));
      const max = Math.max(l1, l2);
      const min = Math.min(l1, l2);
      return (max + 0.05) / (min + 0.05);
    } catch {
      return 21;
    }
  };

  const loadTheme = async () => {
    try {
      const res = await fetch('/api/admin/theme');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.theme) {
          setThemeForm(json.theme);
          setSavedTheme(json.theme);
        }
      }
    } catch {}
  };

  const updateThemeField = (key: string, val: string) => {
    setThemeForm(prev => {
      const next = { ...prev, [key]: val };
      if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.trim())) {
        const cssMap: Record<string, string> = {
          primary: '--color-primary',
          secondary: '--color-secondary',
          background: '--color-background',
          surface: '--color-surface',
          text: '--color-text',
          muted: '--color-muted',
          border: '--color-border',
          button: '--color-button',
          buttonText: '--color-button-text',
          link: '--color-link',
          headerBg: '--color-header',
          footerBg: '--color-footer',
        };
        if (cssMap[key]) {
          document.documentElement.style.setProperty(cssMap[key], val.trim());
        }
      }
      return next;
    });
  };

  const handleSaveTheme = async () => {
    setThemeLoading(true);
    setThemeError('');
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeForm)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setThemeError(json.error || 'Failed to save theme.');
        setThemeLoading(false);
        return;
      }
      setSavedTheme(json.theme);
      setThemeForm(json.theme);
      setThemeLoading(false);
      showToast('Website appearance and theme saved successfully.');
    } catch (err: any) {
      setThemeError(err.message || 'Error communicating with server.');
      setThemeLoading(false);
    }
  };

  const handleResetTheme = async () => {
    if (!confirm('Reset website theme to the original AnshuCore white/light theme with blue accents?')) return;
    setThemeLoading(true);
    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setSavedTheme(json.theme);
        setThemeForm(json.theme);
        Object.keys(json.theme).forEach(k => {
          document.documentElement.style.removeProperty(`--color-${k}`);
        });
        showToast('Restored original AnshuCore theme defaults.');
      }
      setThemeLoading(false);
    } catch (err: any) {
      setThemeLoading(false);
    }
  };

  const handleCancelTheme = () => {
    setThemeForm(savedTheme);
    Object.entries(savedTheme).forEach(([k, v]) => {
      document.documentElement.style.setProperty(`--color-${k}`, v as string);
    });
    showToast('Color modifications cancelled.');
  };

  const handleApkIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApkIconError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setApkIconError('Invalid file format. Please upload PNG, JPEG, or WebP.');
      e.target.value = '';
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setApkIconError(`File size is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max limit is 1.5 MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (img.width < 32 || img.height < 32) {
          setApkIconError('Image dimensions are too small (minimum 32x32 px).');
          return;
        }
        if (img.width > 2048 || img.height > 2048) {
          setApkIconError('Image dimensions exceed max limit (2048x2048 px).');
          return;
        }
        setApkForm(prev => ({ ...prev, icon: dataUrl }));
        showToast(`Icon validated (${img.width}x${img.height} px). Ready to save.`);
      };
      img.onerror = () => {
        setApkIconError('Unable to decode image file. File may be corrupted.');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setApkIconError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Check auth on mount
  useEffect(() => {
    checkSession();
    loadTheme();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Safe Deletion Handlers with Error Handling, In-Progress State, and Cache Invalidation
  const promptDeleteApk = (apk: any) => {
    setDeleteDialog({
      title: 'Delete Application',
      message: 'Are you sure you want to permanently delete this application from the APK catalog?',
      recordName: `${apk.name} (${apk.releaseTag || apk.slug})`,
      actionType: 'apk',
      onConfirm: async () => {
        try {
          setDeletingId(apk.id);
          const res = await fetch(`/api/admin/apks?id=${encodeURIComponent(apk.id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete application.', 'error');
            return;
          }
          if (json.apks) setApksList(json.apks);
          else loadApks();
          loadDashboardData();
          showToast(`Application "${apk.name}" deleted successfully.`);
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting application.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const promptDeleteService = (srv: any) => {
    setDeleteDialog({
      title: 'Delete Service',
      message: 'Are you sure you want to remove this service offering from the public website?',
      recordName: srv.name,
      actionType: 'service',
      onConfirm: async () => {
        try {
          setDeletingId(srv.id);
          const res = await fetch(`/api/admin/content?section=services&id=${encodeURIComponent(srv.id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete service.', 'error');
            return;
          }
          if (json.content) setWebsiteContent(json.content);
          else loadWebsiteContent();
          showToast(`Service "${srv.name}" deleted successfully.`);
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting service.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const promptDeleteProject = (proj: any) => {
    setDeleteDialog({
      title: 'Delete Project',
      message: 'Are you sure you want to permanently delete this portfolio project from the website?',
      recordName: `${proj.title} (${proj.category})`,
      actionType: 'project',
      onConfirm: async () => {
        try {
          setDeletingId(proj.id);
          const res = await fetch(`/api/admin/content?section=projects&id=${encodeURIComponent(proj.id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete project.', 'error');
            return;
          }
          if (json.content) setWebsiteContent(json.content);
          else loadWebsiteContent();
          showToast(`Project "${proj.title}" deleted successfully.`);
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting project.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const promptDeleteEnquiry = (enq: any) => {
    setDeleteDialog({
      title: 'Delete Enquiry',
      message: 'Permanently remove this client enquiry message from the database?',
      recordName: `From: ${enq.name} (${enq.email})`,
      actionType: 'enquiry',
      onConfirm: async () => {
        try {
          setDeletingId(enq.id);
          const res = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(enq.id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete enquiry.', 'error');
            return;
          }
          if (json.enquiries) setEnquiriesList(json.enquiries);
          else loadEnquiries();
          loadDashboardData();
          showToast('Enquiry deleted successfully.');
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting enquiry.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const promptDeleteLibrary = (lib: any, force = false) => {
    const pendingInvoices = invoicesList.filter((i: any) => i.tenantId === lib.tenantId && i.status !== 'Paid');
    const hasUnpaid = pendingInvoices.length > 0;

    setDeleteDialog({
      title: hasUnpaid ? 'Delete Library & Unpaid Invoices' : 'Delete Library Tenant',
      message: hasUnpaid
        ? `Warning: This library has ${pendingInvoices.length} unpaid maintenance invoice(s). Deleting will permanently remove this library and associated pending invoices.`
        : 'Are you sure you want to remove this library instance from the central controller? Subscription enforcement and lock tracking will be terminated.',
      recordName: `${lib.name} (Tenant: ${lib.tenantId})`,
      details: hasUnpaid ? `Pending Invoices: ${pendingInvoices.map((i: any) => `${i.invoiceNumber} (₹${i.amount})`).join(', ')}` : undefined,
      actionType: 'library',
      onConfirm: async () => {
        try {
          setDeletingId(lib.id);
          const forceParam = (force || hasUnpaid) ? '&force=true' : '';
          const res = await fetch(`/api/admin/libraries?id=${encodeURIComponent(lib.id)}${forceParam}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete library.', 'error');
            return;
          }
          if (json.libraries) setLibrariesList(json.libraries);
          else loadLibraries();
          loadInvoices();
          loadDashboardData();
          showToast(`Library "${lib.name}" removed successfully.`);
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting library.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const promptDeleteInvoice = (inv: any) => {
    setDeleteDialog({
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this billing invoice record?',
      recordName: `${inv.invoiceNumber} — ${inv.libraryName} (₹${inv.amount})`,
      actionType: 'invoice',
      onConfirm: async () => {
        try {
          setDeletingId(inv.id);
          const res = await fetch(`/api/admin/invoices?id=${encodeURIComponent(inv.id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete invoice.', 'error');
            return;
          }
          if (json.invoices) setInvoicesList(json.invoices);
          else loadInvoices();
          showToast(`Invoice ${inv.invoiceNumber} deleted successfully.`);
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting invoice.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const promptDeleteReview = (rev: any) => {
    setDeleteDialog({
      title: 'Delete App Review',
      message: 'Are you sure you want to permanently delete this user feedback review?',
      recordName: `By: ${rev.userName} on ${rev.appName} (${rev.rating}★)`,
      actionType: 'review',
      onConfirm: async () => {
        try {
          setDeletingId(rev.id);
          const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(rev.id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete review.', 'error');
            return;
          }
          if (json.reviews) setReviewsList(json.reviews);
          else loadReviews();
          showToast('App review deleted successfully.');
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting review.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const promptDeleteCategory = (catName: string) => {
    const appsInCat = apksList.filter((a: any) => a.category?.toLowerCase() === catName.toLowerCase());
    if (appsInCat.length > 0) {
      setReassignCategoryModal({
        targetCat: catName,
        reassignTo: categoriesList.find(c => c.toLowerCase() !== catName.toLowerCase()) || 'Other',
        affectedApps: appsInCat
      });
      return;
    }
    setDeleteDialog({
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${catName}"? This category currently has 0 assigned applications.`,
      recordName: `Category: ${catName}`,
      actionType: 'category',
      onConfirm: async () => {
        try {
          setDeletingId(catName);
          const res = await fetch(`/api/admin/content?section=categories&name=${encodeURIComponent(catName)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete category.', 'error');
            return;
          }
          if (json.categories) setCategoriesList(json.categories);
          else setCategoriesList(prev => prev.filter(c => c.toLowerCase() !== catName.toLowerCase()));
          loadWebsiteContent();
          loadApks();
          showToast(`Category "${catName}" deleted successfully.`);
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting category.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategoryInput.trim();
    if (!clean) return;
    if (categoriesList.some(c => c.toLowerCase() === clean.toLowerCase())) {
      showToast(`Category "${clean}" already exists.`, 'error');
      return;
    }
    const updated = [...categoriesList, clean];
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'categories', data: updated })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || 'Failed to add category.', 'error');
        return;
      }
      setCategoriesList(updated);
      setNewCategoryInput('');
      showToast(`Category "${clean}" created successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Error communicating with server.', 'error');
    }
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    const cleanNew = newName.trim();
    if (!cleanNew || cleanNew.toLowerCase() === oldName.toLowerCase()) {
      setEditingCategory(null);
      return;
    }
    if (categoriesList.some(c => c.toLowerCase() === cleanNew.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase())) {
      showToast(`Category "${cleanNew}" already exists.`, 'error');
      return;
    }
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'categories', action: 'rename', oldName, newName: cleanNew })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || 'Failed to rename category.', 'error');
        return;
      }
      setCategoriesList(json.categories);
      setEditingCategory(null);
      loadApks();
      showToast(json.message || `Category renamed to "${cleanNew}".`);
    } catch (err: any) {
      showToast(err.message || 'Error communicating with server.', 'error');
    }
  };

  const handleReorderCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoriesList.length) return;
    const reordered = [...categoriesList];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setCategoriesList(reordered);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'categories', data: reordered })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || 'Failed to save reordered categories.', 'error');
        loadApks();
      } else {
        showToast('Categories reordered.');
      }
    } catch {
      loadApks();
    }
  };

  const handleReassignAndDeleteCategory = async (targetCat: string, reassignTo: string) => {
    try {
      setDeletingId(targetCat);
      const res = await fetch(`/api/admin/content?section=categories&name=${encodeURIComponent(targetCat)}&reassignTo=${encodeURIComponent(reassignTo)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || 'Failed to reassign and delete category.', 'error');
        return;
      }
      if (json.categories) setCategoriesList(json.categories);
      setReassignCategoryModal(null);
      loadApks();
      loadWebsiteContent();
      showToast(`Category "${targetCat}" deleted and apps reassigned to "${reassignTo}".`);
    } catch (e: any) {
      showToast(e.message || 'Network error.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const promptDeletePage = (page: any) => {
    setDeleteDialog({
      title: 'Delete Page',
      message: 'Are you sure you want to remove this page entry and its custom configuration?',
      recordName: `${page.title} (${page.slug})`,
      actionType: 'page',
      onConfirm: async () => {
        try {
          setDeletingId(page.id);
          const res = await fetch(`/api/admin/content?section=pages&id=${encodeURIComponent(page.id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete page.', 'error');
            return;
          }
          if (json.content) setWebsiteContent(json.content);
          else loadWebsiteContent();
          showToast(`Page "${page.title}" deleted.`);
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting page.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const promptDeleteNavItem = (item: any) => {
    setDeleteDialog({
      title: 'Delete Navigation Link',
      message: 'Remove this navigation link from the website menu?',
      recordName: `${item.label} (${item.href})`,
      actionType: 'nav',
      onConfirm: async () => {
        try {
          setDeletingId(item.id);
          const res = await fetch(`/api/admin/content?section=nav&id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
          const json = await res.json();
          if (!res.ok || !json.success) {
            showToast(json.error || 'Failed to delete navigation link.', 'error');
            return;
          }
          if (json.content) setWebsiteContent(json.content);
          else loadWebsiteContent();
          showToast(`Navigation link "${item.label}" deleted.`);
          setDeleteDialog(null);
        } catch (e: any) {
          showToast(e.message || 'Network error while deleting navigation link.', 'error');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/session');
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          setIsAuthenticated(true);
          setAdminUser(json.user);
          loadDashboardData();
          return;
        }
      }
      setIsAuthenticated(false);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Invalid credentials.');
        setLoginLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setAdminUser(data.user);
      setLoginPassword('');
      setLoginLoading(false);
      showToast(`Welcome back, ${data.user.name || 'Admin'}!`);
      loadDashboardData();
    } catch (err: any) {
      setLoginError('Network error connecting to login endpoint.');
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    setIsAuthenticated(false);
    setAdminUser(null);
    setAccountMenuOpen(false);
  };

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDashboardData(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setAnalyticsData(json);
        } else {
          setAnalyticsError(json.error || 'Failed to retrieve analytics.');
        }
      } else {
        setAnalyticsError('Server error retrieving analytics.');
      }
    } catch {
      setAnalyticsError('Network error connecting to analytics API.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load section-specific data when activeNav changes
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeNav === 'dashboard') {
      loadDashboardData();
      loadAnalytics();
    } else if (activeNav === 'web-analytics') {
      loadAnalytics();
    } else if (activeNav.startsWith('apk-') || activeNav === 'apks') {
      loadApks();
    } else if (activeNav.startsWith('lib-') || activeNav === 'libraries') {
      loadLibraries();
      loadInvoices();
    } else if (activeNav.startsWith('enq-') || activeNav === 'messages') {
      loadEnquiries();
    } else if (activeNav === 'reviews') {
      loadReviews();
    } else if (activeNav.startsWith('web-')) {
      loadWebsiteContent();
    } else if (activeNav === 'account-security' || activeNav === 'sys-admins') {
      loadAccountInfo();
    } else if (activeNav.startsWith('sys-')) {
      loadSettings();
    }
  }, [activeNav, isAuthenticated]);

  const loadApks = async () => {
    try {
      const res = await fetch('/api/admin/apks');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setApksList(json.apks);
          if (json.categories) setCategoriesList(json.categories);
        }
      }
    } catch {}
  };

  const loadLibraries = async () => {
    try {
      const res = await fetch('/api/admin/libraries');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setLibrariesList(json.libraries);
      }
    } catch {}
  };

  const loadInvoices = async () => {
    try {
      const res = await fetch('/api/admin/invoices');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setInvoicesList(json.invoices);
          setPaymentsList(json.payments);
        }
      }
    } catch {}
  };

  const loadEnquiries = async () => {
    try {
      const res = await fetch('/api/admin/enquiries');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setEnquiriesList(json.enquiries);
      }
    } catch {}
  };

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setReviewsList(json.reviews);
      }
    } catch {}
  };

  const loadWebsiteContent = async () => {
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setWebsiteContent(json.content);
          if (json.categories) setCategoriesList(json.categories);
        }
      }
    } catch {}
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSystemSettings(json.settings);
          setAuditLogs(json.auditLogs);
        }
      }
    } catch {}
  };

  const loadAccountInfo = async () => {
    try {
      const res = await fetch('/api/admin/account');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.account) {
          setAdminUser((prev: any) => ({ ...(prev || {}), ...json.account }));
        }
      }
    } catch {}
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailForm(prev => ({ ...prev, loading: true, error: '', success: '' }));
    try {
      const res = await fetch('/api/admin/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_email',
          currentEmail: adminUser?.email,
          newEmail: emailForm.newEmail,
          currentPassword: emailForm.currentPassword
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setEmailForm(prev => ({ ...prev, loading: false, error: json.error || 'Failed to update email.' }));
        return;
      }
      setEmailForm({
        newEmail: '',
        currentPassword: '',
        loading: false,
        error: '',
        success: 'Administrator email updated successfully.'
      });
      setAdminUser((prev: any) => ({ ...(prev || {}), email: json.email }));
      showToast('Admin email updated successfully.');
    } catch (err: any) {
      setEmailForm(prev => ({ ...prev, loading: false, error: err.message || 'Network error updating email.' }));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordForm(prev => ({ ...prev, loading: true, error: '', success: '' }));

    if (passwordForm.newPassword.length < 8) {
      setPasswordForm(prev => ({ ...prev, loading: false, error: 'New password must be at least 8 characters long.' }));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordForm(prev => ({ ...prev, loading: false, error: 'New password and confirmation do not match.' }));
      return;
    }

    try {
      const res = await fetch('/api/admin/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setPasswordForm(prev => ({ ...prev, loading: false, error: json.error || 'Failed to update password.' }));
        return;
      }
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        loading: false,
        error: '',
        success: 'Password updated successfully! For security, your active session has been invalidated. Please sign in with your new password.'
      });
      showToast('Password changed. Re-authenticating...');
      setTimeout(() => {
        setIsAuthenticated(false);
        setAdminUser(null);
      }, 2500);
    } catch (err: any) {
      setPasswordForm(prev => ({ ...prev, loading: false, error: err.message || 'Network error updating password.' }));
    }
  };

  // Lock/Unlock handler
  const handleToggleLock = async (tenantId: string, currentLock: boolean, libName: string) => {
    setLockModalForm({
      tenantId,
      libraryName: libName,
      isCurrentlyLocked: currentLock,
      reason: currentLock ? '' : 'Payment overdue (grace period expired)'
    });
    setActiveModal('lock-modal');
  };

  const executeLockToggle = async () => {
    setModalLoading(true);
    setModalError('');
    try {
      const res = await fetch('/api/admin/libraries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: lockModalForm.tenantId,
          action: lockModalForm.isCurrentlyLocked ? 'unlock' : 'lock',
          reason: lockModalForm.reason
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setModalError(json.error || 'Failed to update lock status.');
        setModalLoading(false);
        return;
      }

      showToast(`Library "${lockModalForm.libraryName}" ${lockModalForm.isCurrentlyLocked ? 'unlocked' : 'locked'} successfully.`);
      setActiveModal(null);
      setModalLoading(false);
      loadLibraries();
      loadDashboardData();
    } catch (err: any) {
      setModalError(err.message || 'Error communicating with server.');
      setModalLoading(false);
    }
  };

  // Close modals with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setMobileMenuOpen(false);
        setAccountMenuOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered enquiries for Enquiries View
  const filteredEnquiries = useMemo(() => {
    const list = enquiriesList.length > 0 ? enquiriesList : (dashboardData?.recentEnquiries || []);
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        e.service.toLowerCase().includes(q)
    );
  }, [enquiriesList, dashboardData, searchQuery]);

  // Current date formatted e.g. "21 Oct 2026 Wednesday"
  const currentDateString = useMemo(() => {
    const now = new Date();
    const day = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    return `${day} ${weekday}`;
  }, []);

  // -------------------------------------------------------------
  // 1. UNAUTHENTICATED STATE: Clean, Light-Theme Login Interface
  // -------------------------------------------------------------
  if (isAuthenticated === false) {
    return (
      <div className="admin-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fc', padding: '1.5rem' }}>
        <Head>
          <title>AnshuCore — Administrator Sign In</title>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="googlebot" content="noindex, nofollow" />
        </Head>

        <div className="admin-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2rem', background: '#ffffff', borderRadius: '24px', boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {/* Official AnshuCore SVG Logo */}
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <BrandLogo size={56} className="shadow-xs" style={{ borderRadius: '14px', border: '1px solid #eaeff8' }} />
            </div>
            <h1 className="brand-name" style={{ fontSize: '1.625rem', fontWeight: 800, margin: '0 0 0.35rem 0', letterSpacing: '-0.5px' }}>
              <span className="brand-anshu" style={{ color: '#111827' }}>Anshu</span><span className="brand-core" style={{ color: '#2563EB' }}>Core</span>
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Administration Console & Management Platform
            </p>
          </div>

          {loginError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Administrator Username or Email
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="Anshu or corexanshu@gmail.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.9375rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  Secure Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter admin password"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.9375rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '12px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                transition: 'background 0.2s'
              }}
            >
              {loginLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              Protected under server-side session authorization & rate limiting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while verifying token
  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7fc' }}>
        <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Initializing AnshuCore Console...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. AUTHENTICATED STATE: Complete Dashboard Layout
  // -------------------------------------------------------------
  return (
    <div className="admin-root">
      <Head>
        <title>AnshuCore — Management Console</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toastType === 'error' ? '#dc2626' : '#0f172a',
          color: '#ffffff',
          padding: '0.875rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          animation: 'fadeIn 0.2s ease'
        }}>
          {toastType === 'error' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <CheckIcon size={16} color="#4ade80" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Universal Destructive Delete Confirmation Modal */}
      {deleteDialog && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingId) {
              setDeleteDialog(null);
            }
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #fee2e2',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  {deleteDialog.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  {deleteDialog.message}
                </p>
              </div>
            </div>

            {deleteDialog.recordName && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  marginBottom: '1rem',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace'
                }}
              >
                {deleteDialog.recordName}
              </div>
            )}

            {deleteDialog.details && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#92400e',
                  marginBottom: '1.25rem',
                  lineHeight: 1.4
                }}
              >
                {deleteDialog.details}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => setDeleteDialog(null)}
                className="admin-btn admin-btn-secondary"
                style={{ minWidth: '90px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => deleteDialog.onConfirm()}
                className="admin-btn admin-btn-danger"
                style={{
                  minWidth: '120px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  opacity: deletingId ? 0.75 : 1,
                  cursor: deletingId ? 'not-allowed' : 'pointer'
                }}
              >
                {deletingId ? (
                  <span>Deleting...</span>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Reassignment & Safe Deletion Modal */}
      {reassignCategoryModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingId) {
              setReassignCategoryModal(null);
            }
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #fed7aa',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#ffedd5',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  Reassign &amp; Delete Category
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Category <strong>&quot;{reassignCategoryModal.targetCat}&quot;</strong> has <strong>{reassignCategoryModal.affectedApps.length}</strong> active application{reassignCategoryModal.affectedApps.length > 1 ? 's' : ''}. Select a destination category before deleting:
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Affected Applications:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {reassignCategoryModal.affectedApps.map((a: any) => (
                  <span key={a.id} style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}>
                    {a.name}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                Reassign Applications To:
              </label>
              <select
                value={reassignCategoryModal.reassignTo}
                onChange={(e) => setReassignCategoryModal({ ...reassignCategoryModal, reassignTo: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
              >
                {categoriesList
                  .filter(c => c.toLowerCase() !== reassignCategoryModal.targetCat.toLowerCase())
                  .map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                }
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setReassignCategoryModal(null)}
                disabled={Boolean(deletingId)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReassignAndDeleteCategory(reassignCategoryModal.targetCat, reassignCategoryModal.reassignTo)}
                disabled={Boolean(deletingId)}
                className="admin-btn admin-btn-danger"
              >
                {deletingId ? 'Reassigning & Deleting...' : 'Reassign & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HEADER BAR                                                */}
      {/* ========================================================= */}
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Mobile Hamburger / Desktop Collapse Toggle */}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* AnshuCore Branding in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BrandLogo size={32} className="shadow-xs" style={{ borderRadius: '8px', border: '1px solid #eaeff8' }} />
            <span className="brand-name" style={{ fontSize: '1.1875rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
              <span className="brand-anshu" style={{ color: '#111827' }}>Anshu</span><span className="brand-core" style={{ color: '#2563EB' }}>Core</span>
            </span>
          </div>

          {/* Search Field */}
          <div style={{ position: 'relative', display: 'none' }} className="md:block" id="search-container">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search anything..."
              className="admin-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right Header Section: Notifications, Admin Profile, Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="View notifications"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                padding: '6px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {/* Genuine Red Dot indicator if overdue library exists */}
              {(dashboardData?.metrics.locked.lockedCount || 0) > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '5px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444'
                }} />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                width: '320px',
                background: '#ffffff',
                border: '1px solid #eaeff8',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.1)',
                padding: '1rem',
                zIndex: 60
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Notifications</span>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Real-time</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '10px', fontSize: '0.75rem', color: '#991b1b' }}>
                    <p style={{ margin: '0 0 2px 0', fontWeight: 700 }}>Sunrise Library: Payment Overdue</p>
                    <p style={{ margin: 0, color: '#b91c1c' }}>Access locked automatically on 12 Oct 2026.</p>
                  </div>
                  <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '10px', fontSize: '0.75rem', color: '#1e40af' }}>
                    <p style={{ margin: '0 0 2px 0', fontWeight: 700 }}>New Client Enquiry</p>
                    <p style={{ margin: 0, color: '#2563eb' }}>Rahul Verma requested Website Development.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin User Profile Pill */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
            >
              {/* Avatar circle "A" */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#1d4ed8',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)'
              }}>
                A
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="hidden sm:flex">
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  Welcome, {adminUser?.name || adminUser?.username || 'Administrator'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {adminUser?.email || ''}
                </span>
              </div>
            </div>

            {/* Account Menu Dropdown */}
            {accountMenuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 12px)',
                width: '210px',
                background: '#ffffff',
                border: '1px solid #eaeff8',
                borderRadius: '14px',
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)',
                padding: '0.5rem',
                zIndex: 60
              }}>
                <button
                  onClick={() => { setActiveNav('account-security'); setAccountMenuOpen(false); }}
                  className="admin-nav-item"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Account Security
                </button>
                <button
                  onClick={() => { setActiveNav('sys-settings'); setAccountMenuOpen(false); }}
                  className="admin-nav-item"
                  style={{ fontSize: '0.8125rem' }}
                >
                  General Settings
                </button>
                <button
                  onClick={() => { setActiveNav('sys-logs'); setAccountMenuOpen(false); }}
                  className="admin-nav-item"
                  style={{ fontSize: '0.8125rem' }}
                >
                  Audit Logs
                </button>
                <div style={{ height: '1px', background: '#f1f5f9', margin: '0.35rem 0' }} />
                <button
                  onClick={handleLogout}
                  className="admin-nav-item"
                  style={{ fontSize: '0.8125rem', color: '#ef4444' }}
                >
                  Secure Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* BODY WITH SIDEBAR AND MAIN CONTENT                       */}
      {/* ========================================================= */}
      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 72px)' }}>
        {/* DESKTOP SIDEBAR */}
        <aside
          className="admin-sidebar"
          style={{
            display: sidebarCollapsed ? 'none' : 'flex'
          }}
        >
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.25rem 0.5rem 0.85rem 0.5rem', borderBottom: '1px solid #eaeff8', marginBottom: '0.5rem' }}>
              <BrandLogo size={28} className="shadow-xs" style={{ borderRadius: '7px', border: '1px solid #eaeff8' }} />
              <span className="brand-name" style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                <span className="brand-anshu" style={{ color: '#111827' }}>Anshu</span><span className="brand-core" style={{ color: '#2563EB' }}>Core</span>
              </span>
            </div>

            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`admin-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              <span>Dashboard</span>
            </button>

            {/* 2. Website Management */}
            <div className="admin-nav-section-title">WEBSITE MANAGEMENT</div>
            <button onClick={() => setActiveNav('web-analytics')} className={`admin-nav-item ${activeNav === 'web-analytics' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              <span>Website Analytics</span>
            </button>
            <button onClick={() => setActiveNav('web-home')} className={`admin-nav-item ${activeNav === 'web-home' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
              <span>Home Content</span>
            </button>
            <button onClick={() => setActiveNav('web-about')} className={`admin-nav-item ${activeNav === 'web-about' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              <span>About & Info</span>
            </button>
            <button onClick={() => setActiveNav('web-services')} className={`admin-nav-item ${activeNav === 'web-services' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              <span>Services</span>
            </button>
            <button onClick={() => setActiveNav('web-projects')} className={`admin-nav-item ${activeNav === 'web-projects' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
              <span>Projects</span>
            </button>
            <button onClick={() => setActiveNav('web-pages')} className={`admin-nav-item ${activeNav === 'web-pages' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              <span>Pages</span>
            </button>
            <button onClick={() => setActiveNav('web-nav')} className={`admin-nav-item ${activeNav === 'web-nav' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              <span>Navigation</span>
            </button>
            <button onClick={() => setActiveNav('web-seo')} className={`admin-nav-item ${activeNav === 'web-seo' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
              <span>SEO & Social</span>
            </button>
            <button onClick={() => setActiveNav('web-theme')} className={`admin-nav-item ${activeNav === 'web-theme' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
              <span>Theme & Appearance</span>
            </button>

            {/* 3. APK Store */}
            <div className="admin-nav-section-title">APK STORE</div>
            <button onClick={() => setActiveNav('apk-manager')} className={`admin-nav-item ${activeNav === 'apk-manager' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
              <span>APK Manager</span>
            </button>
            <button onClick={() => setActiveNav('apk-categories')} className={`admin-nav-item ${activeNav === 'apk-categories' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
              <span>Categories</span>
            </button>
            <button onClick={() => setActiveNav('apk-super')} className={`admin-nav-item ${activeNav === 'apk-super' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span>Super APK</span>
            </button>
            <button onClick={() => setActiveNav('reviews')} className={`admin-nav-item ${activeNav === 'reviews' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
              <span>App Reviews</span>
            </button>
            <button onClick={() => setActiveNav('apk-settings')} className={`admin-nav-item ${activeNav === 'apk-settings' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              <span>App Settings</span>
            </button>

            {/* 4. Clients & Enquiries */}
            <div className="admin-nav-section-title">CLIENTS & ENQUIRIES</div>
            <button onClick={() => setActiveNav('enq-messages')} className={`admin-nav-item ${activeNav === 'enq-messages' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              <span>Contact Messages</span>
            </button>
            <button onClick={() => setActiveNav('enq-projects')} className={`admin-nav-item ${activeNav === 'enq-projects' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              <span>Project Enquiries</span>
            </button>
            <button onClick={() => setActiveNav('enq-clients')} className={`admin-nav-item ${activeNav === 'enq-clients' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              <span>Client Management</span>
            </button>

            {/* 5. Library Controller */}
            <div className="admin-nav-section-title">LIBRARY CONTROLLER</div>
            <button onClick={() => setActiveNav('lib-list')} className={`admin-nav-item ${activeNav === 'lib-list' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              <span>Libraries</span>
            </button>
            <button onClick={() => setActiveNav('lib-invoices')} className={`admin-nav-item ${activeNav === 'lib-invoices' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              <span>Invoices</span>
            </button>
            <button onClick={() => setActiveNav('lib-payments')} className={`admin-nav-item ${activeNav === 'lib-payments' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <span>Payments</span>
            </button>
            <button onClick={() => setActiveNav('lib-plans')} className={`admin-nav-item ${activeNav === 'lib-plans' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span>Subscription Plans</span>
            </button>
            <button onClick={() => setActiveNav('lib-lock')} className={`admin-nav-item ${activeNav === 'lib-lock' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <span>Lock/Unlock Access</span>
            </button>

            {/* 6. System */}
            <div className="admin-nav-section-title">SYSTEM</div>
            <button onClick={() => setActiveNav('account-security')} className={`admin-nav-item ${activeNav === 'account-security' || activeNav === 'sys-admins' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <span>Account Security</span>
            </button>
            <button onClick={() => setActiveNav('sys-settings')} className={`admin-nav-item ${activeNav === 'sys-settings' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              <span>General Settings</span>
            </button>
            <button onClick={() => setActiveNav('sys-logs')} className={`admin-nav-item ${activeNav === 'sys-logs' ? 'active' : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              <span>Backup & Logs</span>
            </button>
          </div>
        </aside>

        {/* MOBILE SLIDE-IN NAVIGATION DRAWER */}
        {mobileMenuOpen && (
          <div className="admin-mobile-drawer" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="admin-mobile-drawer-content"
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <BrandLogo size={28} className="shadow-xs" style={{ borderRadius: '7px', border: '1px solid #eaeff8' }} />
                  <span className="brand-name" style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                    <span className="brand-anshu" style={{ color: '#111827' }}>Anshu</span><span className="brand-core" style={{ color: '#2563EB' }}>Core</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div style={{ padding: '0.75rem', overflowY: 'auto', flex: 1 }}>
                <button onClick={() => { setActiveNav('dashboard'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}>
                  Dashboard Overview
                </button>
                <div className="admin-nav-section-title">WEBSITE</div>
                <button onClick={() => { setActiveNav('web-analytics'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'web-analytics' ? 'active' : ''}`}>Website Analytics</button>
                <button onClick={() => { setActiveNav('web-home'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'web-home' ? 'active' : ''}`}>Home Content</button>
                <button onClick={() => { setActiveNav('web-services'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'web-services' ? 'active' : ''}`}>Services</button>
                <button onClick={() => { setActiveNav('web-projects'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'web-projects' ? 'active' : ''}`}>Projects</button>
                <button onClick={() => { setActiveNav('web-theme'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'web-theme' ? 'active' : ''}`}>Theme & Appearance</button>
                <div className="admin-nav-section-title">APK STORE</div>
                <button onClick={() => { setActiveNav('apk-manager'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'apk-manager' ? 'active' : ''}`}>APK Manager</button>
                <button onClick={() => { setActiveNav('reviews'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'reviews' ? 'active' : ''}`}>App Reviews</button>
                <div className="admin-nav-section-title">CLIENTS & ENQUIRIES</div>
                <button onClick={() => { setActiveNav('enq-messages'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'enq-messages' ? 'active' : ''}`}>Contact Messages</button>
                <div className="admin-nav-section-title">LIBRARY CONTROLLER</div>
                <button onClick={() => { setActiveNav('lib-list'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'lib-list' ? 'active' : ''}`}>Libraries</button>
                <button onClick={() => { setActiveNav('lib-invoices'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'lib-invoices' ? 'active' : ''}`}>Invoices & Payments</button>
                <button onClick={() => { setActiveNav('lib-lock'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'lib-lock' ? 'active' : ''}`}>Lock/Unlock Access</button>
                <div className="admin-nav-section-title">SYSTEM</div>
                <button onClick={() => { setActiveNav('account-security'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'account-security' || activeNav === 'sys-admins' ? 'active' : ''}`}>Account Security</button>
                <button onClick={() => { setActiveNav('sys-settings'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'sys-settings' ? 'active' : ''}`}>General Settings</button>
                <button onClick={() => { setActiveNav('sys-logs'); setMobileMenuOpen(false); }} className={`admin-nav-item ${activeNav === 'sys-logs' ? 'active' : ''}`}>Audit Logs</button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN VIEWPORT CONTAINER */}
        <main style={{ flex: 1, padding: '1.75rem', overflowX: 'hidden' }}>
          {/* Top Title Bar with Date and Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem' }} className="sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', letterSpacing: '-0.025em' }}>
                {activeNav === 'dashboard' && 'Dashboard'}
                {activeNav === 'web-analytics' && 'Website — Real Visitor Analytics'}
                {activeNav === 'web-home' && 'Website — Home Content'}
                {activeNav === 'web-about' && 'Website — About & Info'}
                {activeNav === 'web-services' && 'Website — Services Management'}
                {activeNav === 'web-projects' && 'Website — Portfolio Projects'}
                {activeNav === 'web-seo' && 'Website — SEO & Social Links'}
                {activeNav === 'web-theme' && 'Website — Appearance & Theme Customization'}
                {activeNav === 'apk-manager' && 'APK Store — Multi-Application Manager'}
                {activeNav === 'apk-categories' && 'APK Store — App Categories'}
                {activeNav === 'apk-super' && 'APK Store — Super APK Configuration'}
                {activeNav === 'reviews' && 'APK Store — App Reviews & Moderation'}
                {activeNav === 'enq-messages' && 'Clients — Contact Enquiries & Messages'}
                {activeNav === 'lib-list' && 'Library Controller — Multi-Tenant Registry'}
                {activeNav === 'lib-invoices' && 'Library Controller — Invoices & Billing'}
                {activeNav === 'lib-payments' && 'Library Controller — Verified Payments'}
                {activeNav === 'lib-lock' && 'Library Controller — Lock / Unlock Controller'}
                {activeNav === 'sys-settings' && 'System — General Configuration'}
                {(activeNav === 'account-security' || activeNav === 'sys-admins') && 'System — Administrator Account Security'}
                {activeNav === 'sys-logs' && 'System — Audit Trail & Data Backup'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                Manage your website, apps, clients and library subscriptions.
              </p>
            </div>

            {/* Date Display and Range Dropdown matching Reference */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #eaeff8',
                borderRadius: '12px',
                padding: '0.5rem 0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: '#334155',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span style={{ fontWeight: 600 }}>{currentDateString}</span>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #eaeff8',
                borderRadius: '12px',
                padding: '0.5rem 0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <span>Last 30 Days</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* VIEW 1: DASHBOARD OVERVIEW (Primary Visual Target)        */}
          {/* ========================================================= */}
          {activeNav === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* TOP ROW: 6 OVERVIEW METRIC CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                {/* 1. GitHub Releases */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" color="#2563eb">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>GitHub Releases</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {dashboardData?.metrics.apks.githubReleases ?? 1}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckIcon size={13} color="#16a34a" />
                      <span>Live API Synced</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Anshu-Mock-</span>
                  </div>
                </div>

                {/* 2. Total APKs */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Total APKs</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {dashboardData?.metrics.apks.total ?? 0}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Published: <span style={{ color: '#0f172a', fontWeight: 700 }}>{dashboardData?.metrics.apks.published ?? 0}</span>
                  </div>
                </div>

                {/* 3. Client Enquiries */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Client Enquiries</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {dashboardData?.metrics.enquiries.total ?? 0}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    New Pending: <span style={{ color: (dashboardData?.metrics.enquiries.newCount ?? 0) > 0 ? '#2563eb' : '#64748b', fontWeight: 700 }}>{dashboardData?.metrics.enquiries.newCount ?? 0}</span>
                  </div>
                </div>

                {/* 4. Libraries */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                        <path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
                        <path d="M12 10h.01" /><path d="M12 14h.01" />
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Libraries</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {dashboardData?.metrics.libraries.total ?? 0}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Active: <span style={{ color: '#16a34a', fontWeight: 700 }}>{dashboardData?.metrics.libraries.active ?? 0}</span> | Due: <span style={{ color: '#ef4444', fontWeight: 700 }}>{dashboardData?.metrics.libraries.due ?? 0}</span>
                  </div>
                </div>

                {/* 5. Monthly Revenue */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Monthly Revenue</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {dashboardData?.metrics.revenue.value || '₹0'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Verified Payments ({dashboardData?.metrics.revenue.period || 'This Month'})
                  </div>
                </div>

                {/* 6. Locked Libraries */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Locked Libraries</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                        {dashboardData?.metrics.locked.lockedCount ?? 0}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    Grace Period: <span style={{ color: '#0f172a', fontWeight: 700 }}>{dashboardData?.metrics.locked.gracePeriodCount ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: 3 MAIN PANELS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem'
              }}>
                {/* PANEL 1: Recent Enquiries */}
                <div className="admin-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Enquiries</h2>
                    <button
                      onClick={() => setActiveNav('enq-messages')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View All
                    </button>
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: '28px' }}>#</th>
                          <th>Name</th>
                          <th>Service</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!dashboardData?.recentEnquiries || dashboardData.recentEnquiries.length === 0) ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                              No client enquiries yet. Submissions from the public contact page will appear here.
                            </td>
                          </tr>
                        ) : (
                          dashboardData.recentEnquiries.map((enq, idx) => (
                            <tr
                              key={enq.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setEnquiryDetails(enq);
                                setEnquiryStatusUpdate(enq.status);
                                setEnquiryNotes((enq as any).notes || '');
                                setActiveModal('enquiry-detail');
                              }}
                            >
                              <td style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{idx + 1}</td>
                              <td style={{ fontWeight: 600, color: '#0f172a' }}>{enq.name}</td>
                              <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{enq.service}</td>
                              <td>
                                <span className={`admin-badge admin-badge-${enq.status.toLowerCase().replace(' ', '')}`}>
                                  {enq.status}
                                </span>
                              </td>
                              <td style={{ color: '#64748b', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{enq.date}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PANEL 2: Downloads (Top APKs) */}
                <div className="admin-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Downloads (Top APKs)</h2>
                    <button
                      onClick={() => setActiveNav('apk-manager')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View All
                    </button>
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ width: '28px' }}>#</th>
                          <th>App Name</th>
                          <th style={{ textAlign: 'right' }}>Downloads</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!dashboardData?.topApks || dashboardData.topApks.length === 0) ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                              No APKs registered yet. Add apps to track releases and downloads.
                            </td>
                          </tr>
                        ) : (
                          dashboardData.topApks.map((apk, idx) => (
                            <tr key={apk.id}>
                              <td style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{idx + 1}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <AppIcon icon={apk.icon} name={apk.name} size={30} className="rounded-lg shadow-xs" />
                                  <div>
                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{apk.name}</span>
                                    {apk.isSuperApk && (
                                      <span style={{ marginLeft: '6px', fontSize: '0.6875rem', color: '#eab308', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                        <StarIcon size={11} color="#eab308" />
                                        <span>Super</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                {apk.downloadCount ? apk.downloadCount.toLocaleString() : '0'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PANEL 3: Library Subscription Status */}
                <div className="admin-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Library Subscription Status</h2>
                    <button
                      onClick={() => setActiveNav('lib-list')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View All
                    </button>
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Library</th>
                          <th>Next Due</th>
                          <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!dashboardData?.libraryStatuses || dashboardData.libraryStatuses.length === 0) ? (
                          <tr>
                            <td colSpan={3} style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                              No library tenants registered. Click &ldquo;Add New Library&rdquo; below to configure subscriptions.
                            </td>
                          </tr>
                        ) : (
                          dashboardData.libraryStatuses.map(lib => (
                            <tr key={lib.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                  </svg>
                                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{lib.name}</span>
                                </div>
                              </td>
                              <td style={{ color: '#64748b', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{lib.nextDue}</td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  onClick={() => handleToggleLock(lib.tenantId, lib.isLocked, lib.name)}
                                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                                  title="Click to modify lock state"
                                >
                                  <span className={`admin-badge admin-badge-${lib.status.toLowerCase().replace(' ', '')}`}>
                                    {lib.status}
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS ROW (6 ACTION CARDS) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                {/* 1. Add New APK */}
                <div
                  className="admin-card"
                  onClick={() => {
                    setApkForm({
                      id: '',
                      name: '',
                      slug: '',
                      icon: '',
                      category: categoriesList[0] || 'Education',
                      repo: 'indbite-web/',
                      releaseTag: 'v1.0.0',
                      directUrl: '',
                      downloadCount: 0,
                      sizeFormatted: '20.0 MB',
                      isSuperApk: false,
                      published: true,
                      description: '',
                      tagline: '',
                      minAndroid: '7.0 and up',
                      ageRating: 'Rated for 3+',
                      features: '',
                      screenshots: '',
                      relatedAppIds: [],
                      developer: 'AnshuCore'
                    });
                    setActiveModal('apk-modal');
                  }}
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>Add New APK</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Add Android App</p>
                  </div>
                </div>

                {/* 2. Add New Project */}
                <div
                  className="admin-card"
                  onClick={() => setActiveNav('web-projects')}
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>Add New Project</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Show in Portfolio</p>
                  </div>
                </div>

                {/* 3. Add New Service */}
                <div
                  className="admin-card"
                  onClick={() => setActiveNav('web-services')}
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>Add New Service</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Manage Services</p>
                  </div>
                </div>

                {/* 4. Add New Library */}
                <div
                  className="admin-card"
                  onClick={() => {
                    setLibraryForm({
                      id: '',
                      tenantId: '',
                      name: '',
                      hostUrl: 'http://localhost:5000',
                      plan: 'Standard Monthly',
                      monthlyAmount: 1000,
                      billingDate: '1st',
                      nextDue: '01 Nov 2026',
                      gracePeriodDays: 5,
                      contactEmail: ''
                    });
                    setActiveModal('library-modal');
                  }}
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                      <path d="M9 22v-4h6v4" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>Add New Library</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Create Library</p>
                  </div>
                </div>

                {/* 5. Create Invoice */}
                <div
                  className="admin-card"
                  onClick={() => {
                    setInvoiceForm({
                      tenantId: (dashboardData?.libraryStatuses[0]?.tenantId) || 'gurukul-lib',
                      amount: 1000,
                      dueDate: '25 Nov 2026'
                    });
                    setActiveModal('invoice-modal');
                  }}
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>Create Invoice</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Generate Bill</p>
                  </div>
                </div>

                {/* 6. View Messages */}
                <div
                  className="admin-card"
                  onClick={() => setActiveNav('enq-messages')}
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>View Messages</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Contact Enquiries</p>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: REAL SYSTEM STATUS & VERIFIED AUDIT LOGS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem'
              }}>
                {/* CARD 1: System Integration & Cloud Status */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>System Integrations</h3>
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                      Operational
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>GitHub Releases API</span>
                      <span style={{ fontWeight: 600, color: dashboardData?.metrics?.system?.githubApi === 'Connected' ? '#16a34a' : '#2563eb' }}>
                        {dashboardData?.metrics?.system?.githubApi || 'Connected'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Persistence Engine</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Multi-tier JSON &amp; KV</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Admin Authentication</span>
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>HMAC-SHA256 Signed</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                      <span style={{ color: '#64748b' }}>Serverless Hosting</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Vercel Free Ready</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Live Distribution Specs */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Binary Distribution</h3>
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>GitHub Releases</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Active Repository</span>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>indbite-web/Anshu-Mock-</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Latest Binary Tag</span>
                      <span style={{ fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                        {dashboardData?.topApks?.find(a => a.slug === 'anshu-mock')?.sizeFormatted ? '1.5.0' : '1.5.0'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Release Binary Asset</span>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>Anshu.Mock.apk</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                      <span style={{ color: '#64748b' }}>Delivery Architecture</span>
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>Direct GitHub CDN</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Recent Security & Audit Events */}
                <div className="admin-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Security Audit</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Active Log</span>
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {(!dashboardData?.recentAuditLogs || dashboardData.recentAuditLogs.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                        No audit events logged yet in current store.
                      </div>
                    ) : (
                      dashboardData.recentAuditLogs.slice(0, 4).map((log) => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', padding: '0.35rem 0', borderBottom: '1px solid #f8fafc' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.action}</span>
                            <span style={{ color: '#64748b', marginLeft: '6px' }}>({log.target})</span>
                          </div>
                          <span style={{ color: '#94a3b8', fontSize: '0.6875rem', whiteSpace: 'nowrap' }}>{log.timestamp.substring(11, 16)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: APK MANAGER (Multi-APK Management)                */}
          {/* ========================================================= */}
          {/* VIEW 2: APK MANAGER & CATEGORIES */}
          {/* VIEW 2: APK MANAGER, CATEGORIES & SUPER APK */}
          {activeNav === 'apk-categories' ? (
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Apps &gt; Categories</div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Manage Categories</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Create, rename, reorder, and safely delete categories. Deletion requires reassigning active applications.</p>
                </div>
                <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={newCategoryInput}
                    onChange={e => setNewCategoryInput(e.target.value)}
                    style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', minWidth: '220px' }}
                  />
                  <button type="submit" className="admin-btn admin-btn-primary">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    <span>Add Category</span>
                  </button>
                </form>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Order</th>
                      <th>Category Name</th>
                      <th>Assigned Applications</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriesList.map((cat, idx) => {
                      const appsInCat = apksList.filter((a: any) => a.category?.toLowerCase() === cat.toLowerCase());
                      const isEditing = editingCategory?.oldName === cat;
                      return (
                        <tr key={cat}>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleReorderCategory(idx, 'up')}
                                className="admin-btn admin-btn-secondary"
                                style={{ padding: '2px 6px', fontSize: '10px', opacity: idx === 0 ? 0.3 : 1 }}
                                title="Move up"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={idx === categoriesList.length - 1}
                                onClick={() => handleReorderCategory(idx, 'down')}
                                className="admin-btn admin-btn-secondary"
                                style={{ padding: '2px 6px', fontSize: '10px', opacity: idx === categoriesList.length - 1 ? 0.3 : 1 }}
                                title="Move down"
                              >
                                ▼
                              </button>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={editingCategory.newName}
                                  onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                                  style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #2563eb', fontSize: '0.875rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameCategory(cat, editingCategory.newName)}
                                  className="admin-btn admin-btn-primary admin-btn-sm"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategory(null)}
                                  className="admin-btn admin-btn-secondary admin-btn-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.875rem' }}>
                                {cat}
                              </span>
                            )}
                          </td>
                          <td>
                            {appsInCat.length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.8125rem', marginRight: '6px' }}>
                                  {appsInCat.length} app{appsInCat.length > 1 ? 's' : ''}:
                                </span>
                                {appsInCat.map((a: any) => (
                                  <span key={a.id} style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>
                                    {a.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8125rem', fontStyle: 'italic' }}>0 applications assigned</span>
                            )}
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-active">Active</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              {!isEditing && (
                                <button
                                  onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                                  className="admin-btn admin-btn-secondary admin-btn-sm"
                                >
                                  Rename
                                </button>
                              )}
                              <button
                                onClick={() => promptDeleteCategory(cat)}
                                disabled={deletingId === cat}
                                className="admin-btn admin-btn-danger admin-btn-sm"
                              >
                                {deletingId === cat ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeNav === 'apk-super' ? (
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Apps &gt; Featured App</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Featured Application Banner</h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Select the primary application showcased in the prominent hero banner on the Apps Store homepage.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {apksList.filter(a => a.published !== false).map(apk => {
                  const isCurrentSuper = Boolean(apk.isSuperApk);
                  return (
                    <div
                      key={apk.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '16px',
                        border: isCurrentSuper ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        background: isCurrentSuper ? '#eff6ff' : '#ffffff',
                        boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <AppIcon icon={apk.icon} name={apk.name} size={48} className="rounded-xl shadow-xs" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', margin: 0 }} className="truncate">{apk.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{apk.category} &bull; {apk.releaseTag || 'v1.0.0'}</span>
                        </div>
                        {isCurrentSuper && (
                          <span style={{ background: '#2563eb', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: 700 }}>
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {apk.tagline || apk.description || 'Official application.'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                        <a href={`/apps/${apk.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                          Preview Store Page &rarr;
                        </a>
                        <button
                          type="button"
                          disabled={isCurrentSuper}
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/apks', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...apk, isSuperApk: true })
                              });
                              if (res.ok) {
                                showToast(`"${apk.name}" set as featured application.`);
                                loadApks();
                              }
                            } catch {
                              showToast('Failed to set featured app.', 'error');
                            }
                          }}
                          className={`admin-btn admin-btn-sm ${isCurrentSuper ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                        >
                          {isCurrentSuper ? 'Currently Featured' : 'Set as Featured'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeNav.startsWith('apk-') || activeNav === 'apks' ? (
            /* VIEW: MANAGE APPS (Matching Reference Image 4) */
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              {/* Header with Breadcrumb, Title & Add New App Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>Apps &gt; Manage Apps</div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Manage Apps</h2>
                </div>
                <button
                  onClick={() => {
                    setApkForm({
                      id: '',
                      name: '',
                      slug: '',
                      icon: '',
                      category: categoriesList[0] || 'Education',
                      repo: 'indbite-web/',
                      releaseTag: '1.0.0',
                      directUrl: '',
                      downloadCount: 0,
                      sizeFormatted: '20.0 MB',
                      isSuperApk: false,
                      published: true,
                      description: '',
                      tagline: '',
                      minAndroid: '7.0 and up',
                      ageRating: 'Rated for 3+',
                      features: '',
                      screenshots: '',
                      relatedAppIds: [],
                      developer: 'AnshuCore'
                    });
                    setActiveModal('apk-modal');
                  }}
                  className="admin-btn admin-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.15rem' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  <span>+ Add New App</span>
                </button>
              </div>

              {/* Status Filter Tabs matching Reference Image 4 */}
              <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eaeff8', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setAppStatusFilter('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.6rem 0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: appStatusFilter === 'all' ? 700 : 500,
                    color: appStatusFilter === 'all' ? '#2563eb' : '#64748b',
                    borderBottom: appStatusFilter === 'all' ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  All ({apksList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAppStatusFilter('published')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.6rem 0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: appStatusFilter === 'published' ? 700 : 500,
                    color: appStatusFilter === 'published' ? '#2563eb' : '#64748b',
                    borderBottom: appStatusFilter === 'published' ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  Published ({apksList.filter(a => a.published !== false).length})
                </button>
                <button
                  type="button"
                  onClick={() => setAppStatusFilter('draft')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.6rem 0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: appStatusFilter === 'draft' ? 700 : 500,
                    color: appStatusFilter === 'draft' ? '#2563eb' : '#64748b',
                    borderBottom: appStatusFilter === 'draft' ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  Draft ({apksList.filter(a => a.published === false).length})
                </button>
              </div>

              {/* Search, Category Filter, and Sort Controls Row matching Reference Image 4 */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '380px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="search"
                    placeholder="Search apps..."
                    value={appSearchQuery}
                    onChange={e => setAppSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    value={appCategoryFilter}
                    onChange={e => setAppCategoryFilter(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', background: '#fff', color: '#334155' }}
                  >
                    <option value="all">All Categories</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={appSortBy}
                    onChange={e => setAppSortBy(e.target.value as any)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', background: '#fff', color: '#334155' }}
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="downloads">Sort: Downloads</option>
                  </select>
                </div>
              </div>

              {/* Table of Apps matching Reference Image 4 */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Icon</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Version</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let list = [...apksList];
                      // Filter by status tab
                      if (appStatusFilter === 'published') {
                        list = list.filter(a => a.published !== false);
                      } else if (appStatusFilter === 'draft') {
                        list = list.filter(a => a.published === false);
                      }
                      // Filter by category
                      if (appCategoryFilter !== 'all') {
                        list = list.filter(a => a.category?.toLowerCase() === appCategoryFilter.toLowerCase());
                      }
                      // Filter by search query
                      if (appSearchQuery.trim()) {
                        const q = appSearchQuery.toLowerCase().trim();
                        list = list.filter(a => a.name.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q) || (a.category && a.category.toLowerCase().includes(q)));
                      }
                      // Sort
                      if (appSortBy === 'name') {
                        list.sort((a, b) => a.name.localeCompare(b.name));
                      } else if (appSortBy === 'downloads') {
                        list.sort((a, b) => (Number(b.downloadCount) || 0) - (Number(a.downloadCount) || 0));
                      } else {
                        list.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
                      }

                      if (list.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                              No applications found matching the selected filters.
                            </td>
                          </tr>
                        );
                      }

                      return list.map(apk => (
                        <tr key={apk.id}>
                          <td>
                            <AppIcon icon={apk.icon} name={apk.name} size={36} className="rounded-xl shadow-xs border border-slate-100" />
                          </td>
                          <td>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{apk.name}</span>
                                {apk.isSuperApk && (
                                  <span style={{ color: '#eab308' }} title="Featured App">
                                    <StarIcon size={13} color="#eab308" />
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>/{apk.slug}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem', color: '#475569', background: '#f1f5f9', padding: '3px 10px', borderRadius: '6px', fontWeight: 500 }}>
                              {apk.category}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                              {apk.releaseTag || '1.0.0'}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-badge ${apk.published !== false ? 'admin-badge-active' : 'admin-badge-archived'}`}>
                              {apk.published !== false ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              {/* Preview Eye Action */}
                              <a
                                href={`/apps/${apk.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-btn admin-btn-secondary admin-btn-sm"
                                style={{ padding: '6px 8px' }}
                                title="Preview Details Page"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </a>

                              {/* Edit Pencil Action */}
                              <button
                                type="button"
                                onClick={() => {
                                  setApkForm({
                                    id: apk.id,
                                    name: apk.name,
                                    slug: apk.slug,
                                    icon: apk.icon,
                                    category: apk.category || 'Education',
                                    repo: apk.repo || '',
                                    releaseTag: apk.releaseTag || 'v1.0.0',
                                    directUrl: apk.directUrl || '',
                                    downloadCount: apk.downloadCount || 0,
                                    sizeFormatted: apk.sizeFormatted || '20.0 MB',
                                    isSuperApk: Boolean(apk.isSuperApk),
                                    published: apk.published !== false,
                                    description: apk.description || '',
                                    tagline: apk.tagline || '',
                                    minAndroid: apk.minAndroid || '7.0 and up',
                                    ageRating: apk.ageRating || 'Rated for 3+',
                                    features: Array.isArray(apk.features) ? apk.features.join(', ') : (apk.features || ''),
                                    screenshots: Array.isArray(apk.screenshots) ? apk.screenshots.join(', ') : (apk.screenshots || ''),
                                    relatedAppIds: Array.isArray(apk.relatedAppIds) ? apk.relatedAppIds : [],
                                    developer: apk.developer || 'AnshuCore'
                                  });
                                  setActiveModal('apk-modal');
                                }}
                                className="admin-btn admin-btn-secondary admin-btn-sm"
                                style={{ padding: '6px 8px' }}
                                title="Edit App Details"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>

                              {/* Delete Trash Action */}
                              <button
                                type="button"
                                onClick={() => promptDeleteApk(apk)}
                                disabled={deletingId === apk.id}
                                className="admin-btn admin-btn-danger admin-btn-sm"
                                style={{ padding: '6px 8px' }}
                                title="Delete App"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* ========================================================= */}
          {/* VIEW 3: LIBRARY CONTROLLER (Multi-Tenant Isolation)       */}
          {/* ========================================================= */}
          {activeNav.startsWith('lib-') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Multi-Tenant Library Registry</h2>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Independent library instances, subscription enforcement, and remote locks.</p>
                  </div>
                  <button
                    onClick={() => {
                      setLibraryForm({
                        id: '',
                        tenantId: '',
                        name: '',
                        hostUrl: 'http://localhost:5000',
                        plan: 'Standard Monthly',
                        monthlyAmount: 1000,
                        billingDate: '1st',
                        nextDue: '01 Nov 2026',
                        gracePeriodDays: 5,
                        contactEmail: ''
                      });
                      setActiveModal('library-modal');
                    }}
                    className="admin-btn admin-btn-primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    <span>Register New Library</span>
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Library Tenant</th>
                        <th>Host URL</th>
                        <th>Plan & Fee</th>
                        <th>Billing Date</th>
                        <th>Next Due</th>
                        <th>Status</th>
                        <th>Lock Control</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {librariesList.map(lib => (
                        <tr key={lib.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{lib.name}</span>
                              <span style={{ fontSize: '0.6875rem', background: '#eff6ff', color: '#2563eb', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                {lib.tenantId}
                              </span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: '#64748b', fontFamily: 'monospace' }}>{lib.hostUrl}</td>
                          <td>
                            <div style={{ fontSize: '0.8125rem' }}>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{lib.monthlyAmount}</span>/mo
                              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.6875rem' }}>{lib.plan}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8125rem', color: '#475569' }}>{lib.billingDate} of month</td>
                          <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{lib.nextDue}</td>
                          <td>
                            <span className={`admin-badge admin-badge-${lib.status.toLowerCase().replace(' ', '')}`}>
                              {lib.status}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleLock(lib.tenantId, lib.isLocked, lib.name)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid',
                                borderColor: lib.isLocked ? '#fecaca' : '#bbf7d0',
                                background: lib.isLocked ? '#fee2e2' : '#f0fdf4',
                                color: lib.isLocked ? '#b91c1c' : '#15803d',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {lib.isLocked ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                  <span>Suspended</span>
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                                  <span>Active</span>
                                </span>
                              )}
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  setInvoiceForm({ tenantId: lib.tenantId, amount: lib.monthlyAmount, dueDate: lib.nextDue });
                                  setActiveModal('invoice-modal');
                                }}
                                className="admin-btn admin-btn-secondary admin-btn-sm"
                              >
                                Invoice
                              </button>
                              <button
                                onClick={() => {
                                  setLibraryForm({
                                    id: lib.id,
                                    tenantId: lib.tenantId,
                                    name: lib.name,
                                    hostUrl: lib.hostUrl,
                                    plan: lib.plan,
                                    monthlyAmount: lib.monthlyAmount,
                                    billingDate: lib.billingDate,
                                    nextDue: lib.nextDue,
                                    gracePeriodDays: lib.gracePeriodDays,
                                    contactEmail: lib.contactEmail || ''
                                  });
                                  setActiveModal('library-modal');
                                }}
                                className="admin-btn admin-btn-secondary admin-btn-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => promptDeleteLibrary(lib)}
                                disabled={deletingId === lib.id}
                                className="admin-btn admin-btn-danger admin-btn-sm"
                              >
                                {deletingId === lib.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoices and Verified Payments Table */}
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Invoices & Verified Payments</h3>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Razorpay Webhook Verified</div>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Library</th>
                        <th>Amount</th>
                        <th>Issue Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Payment Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesList.map(inv => (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>{inv.invoiceNumber}</td>
                          <td style={{ fontWeight: 600 }}>{inv.libraryName}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>₹{inv.amount}</td>
                          <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{inv.issueDate}</td>
                          <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{inv.dueDate}</td>
                          <td>
                            <span className={`admin-badge admin-badge-${inv.status.toLowerCase()}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              {inv.status !== 'Paid' ? (
                                <button
                                  onClick={() => {
                                    setPaymentForm({
                                      invoiceId: inv.id,
                                      amount: inv.amount,
                                      method: 'Razorpay UPI',
                                      transactionId: `TXN_${Date.now().toString().slice(-6)}`
                                    });
                                    setActiveModal('payment-modal');
                                  }}
                                  className="admin-btn admin-btn-primary admin-btn-sm"
                                >
                                  Mark Paid
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <CheckIcon size={13} color="#16a34a" />
                                  <span>Verified ({inv.paymentMethod || 'Razorpay'})</span>
                                </span>
                              )}
                              <button
                                onClick={() => promptDeleteInvoice(inv)}
                                disabled={deletingId === inv.id}
                                className="admin-btn admin-btn-danger admin-btn-sm"
                                title="Delete Invoice"
                              >
                                {deletingId === inv.id ? '...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: CONTACT MESSAGES & CLIENT ENQUIRIES               */}
          {/* ========================================================= */}
          {activeNav.startsWith('enq-') && (
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Client Enquiries & Messages</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Incoming requests submitted through the public website contact form.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Search by name, email, service..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="admin-search-input"
                    style={{ width: '240px' }}
                  />
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Contact Info</th>
                      <th>Requested Service</th>
                      <th>Message Snippet</th>
                      <th>Status</th>
                      <th>Received Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map(enq => (
                      <tr key={enq.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{enq.name}</td>
                        <td style={{ fontSize: '0.8125rem' }}>
                          <span style={{ color: '#2563eb', display: 'block' }}>{enq.email}</span>
                          {enq.phone && <span style={{ color: '#64748b' }}>{enq.phone}</span>}
                        </td>
                        <td><span style={{ fontSize: '0.8125rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>{enq.service}</span></td>
                        <td style={{ fontSize: '0.8125rem', color: '#475569', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {enq.message}
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge-${enq.status.toLowerCase().replace(' ', '')}`}>
                            {enq.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>{enq.date}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              onClick={() => {
                                setEnquiryDetails(enq);
                                setEnquiryStatusUpdate(enq.status);
                                setEnquiryNotes(enq.notes || '');
                                setActiveModal('enquiry-detail');
                              }}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => promptDeleteEnquiry(enq)}
                              disabled={deletingId === enq.id}
                              className="admin-btn admin-btn-danger admin-btn-sm"
                            >
                              {deletingId === enq.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: WEBSITE CONTENT MANAGEMENT (CMS)                  */}
          {/* ========================================================= */}
          {activeNav.startsWith('web-') && (
            <div className="admin-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Website Content Management</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Configure and publish content that updates live on the public website.</p>
                </div>

                {/* Sub-navigation tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                  {[
                    { id: 'web-analytics', label: 'Website Analytics' },
                    { id: 'web-home', label: 'Home Hero' },
                    { id: 'web-services', label: 'Services' },
                    { id: 'web-projects', label: 'Projects' },
                    { id: 'web-about', label: 'About Us' },
                    { id: 'web-pages', label: 'Pages' },
                    { id: 'web-nav', label: 'Navigation' },
                    { id: 'web-seo', label: 'SEO & Social' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveNav(tab.id)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: activeNav === tab.id ? '#ffffff' : 'transparent',
                        color: activeNav === tab.id ? '#2563eb' : '#64748b',
                        boxShadow: activeNav === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {websiteContent ? (
                <div>
                  {/* TAB 0: REAL WEBSITE VISITOR ANALYTICS */}
                  {activeNav === 'web-analytics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Section Top Header */}
                      <div style={{
                        background: '#f8fafc',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #eaeff8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              First-Party Website Traffic & Visitor Analytics
                            </h3>
                            <span style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
                              Live Tracking Active
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                            Real website metrics recorded server-side without tracking cookies, third-party beacons, or personally identifiable data.
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {analyticsData?.lastUpdated && (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Last updated: {new Date(analyticsData.lastUpdated).toLocaleTimeString()}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={loadAnalytics}
                            disabled={analyticsLoading}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={analyticsLoading ? 'animate-spin' : ''}>
                              <path d="M23 4v6h-6" />
                              <path d="M1 20v-6h6" />
                              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                            </svg>
                            <span>{analyticsLoading ? 'Refreshing...' : 'Refresh'}</span>
                          </button>
                        </div>
                      </div>

                      {analyticsError && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.8125rem' }}>
                          {analyticsError}
                        </div>
                      )}

                      {/* 1. Quick Stat Cards Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        {/* Stat Card 1: Unique Visitors (All-Time) */}
                        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #eaeff8', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Unique Visitors</span>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            </div>
                          </div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                            {(analyticsData?.totals?.uniqueVisitors || 0).toLocaleString()}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                            Distinct anonymous devices across all time
                          </p>
                        </div>

                        {/* Stat Card 2: Total Page Views */}
                        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #eaeff8', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Page Views</span>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </div>
                          </div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                            {(analyticsData?.totals?.pageViews || 0).toLocaleString()}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                            Total public content requests recorded
                          </p>
                        </div>

                        {/* Stat Card 3: Today's Traffic */}
                        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #eaeff8', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Visitors</span>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </div>
                          </div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                            {(analyticsData?.today?.uniqueVisitors || 0).toLocaleString()}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                            {(analyticsData?.today?.pageViews || 0).toLocaleString()} page views today
                          </p>
                        </div>

                        {/* Stat Card 4: Last 30 Days Traffic */}
                        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #eaeff8', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last 30 Days</span>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                            </div>
                          </div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                            {(analyticsData?.last30Days?.uniqueVisitors || 0).toLocaleString()}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                            {(analyticsData?.last30Days?.pageViews || 0).toLocaleString()} views in 30 days
                          </p>
                        </div>
                      </div>

                      {/* Empty State Warning if No Data Yet */}
                      {!analyticsData?.hasData && (
                        <div style={{
                          background: '#ffffff',
                          border: '2px dashed #cbd5e1',
                          borderRadius: '16px',
                          padding: '2.5rem 1.5rem',
                          textAlign: 'center',
                          margin: '0.5rem 0'
                        }}>
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                          }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </div>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                            No Website Traffic Recorded Yet
                          </h4>
                          <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '520px', margin: '0 auto 1.25rem auto', lineHeight: 1.5 }}>
                            The tracking engine is active and waiting for public visitors. To verify tracking, visit any public page (e.g. Home, Services, Apps, or Contact) or click below to simulate a real visit.
                          </p>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await fetch('/api/analytics/track', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ path: '/', visitorId: 'probe_test_visitor' })
                                });
                                showToast('Test pageview logged for "/"!');
                                loadAnalytics();
                              } catch {
                                showToast('Failed to log test visit.');
                              }
                            }}
                            className="admin-btn admin-btn-primary admin-btn-sm"
                          >
                            Simulate Sample Visit to Homepage
                          </button>
                        </div>
                      )}

                      {/* 2. Timeframe Comparison Table */}
                      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #eaeff8', padding: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                          Visitor Activity Across Timeframes
                        </h4>
                        <div className="admin-table-container">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Time Period</th>
                                <th>Page Views</th>
                                <th>Unique Visitors</th>
                                <th>Avg. Views per Visitor</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>Today</td>
                                <td style={{ fontWeight: 600 }}>{analyticsData?.today?.pageViews || 0}</td>
                                <td>{analyticsData?.today?.uniqueVisitors || 0}</td>
                                <td>
                                  {analyticsData?.today?.uniqueVisitors > 0
                                    ? ((analyticsData.today.pageViews / analyticsData.today.uniqueVisitors).toFixed(1))
                                    : '0'}
                                </td>
                                <td><span className="admin-badge admin-badge-active">Real-Time</span></td>
                              </tr>
                              <tr>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>Last 7 Days</td>
                                <td style={{ fontWeight: 600 }}>{analyticsData?.last7Days?.pageViews || 0}</td>
                                <td>{analyticsData?.last7Days?.uniqueVisitors || 0}</td>
                                <td>
                                  {analyticsData?.last7Days?.uniqueVisitors > 0
                                    ? ((analyticsData.last7Days.pageViews / analyticsData.last7Days.uniqueVisitors).toFixed(1))
                                    : '0'}
                                </td>
                                <td><span className="admin-badge admin-badge-active">Weekly Trend</span></td>
                              </tr>
                              <tr>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>Last 30 Days</td>
                                <td style={{ fontWeight: 600 }}>{analyticsData?.last30Days?.pageViews || 0}</td>
                                <td>{analyticsData?.last30Days?.uniqueVisitors || 0}</td>
                                <td>
                                  {analyticsData?.last30Days?.uniqueVisitors > 0
                                    ? ((analyticsData.last30Days.pageViews / analyticsData.last30Days.uniqueVisitors).toFixed(1))
                                    : '0'}
                                </td>
                                <td><span className="admin-badge admin-badge-active">Monthly Trend</span></td>
                              </tr>
                              <tr>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>All-Time Total</td>
                                <td style={{ fontWeight: 700, color: '#2563eb' }}>{analyticsData?.totals?.pageViews || 0}</td>
                                <td style={{ fontWeight: 700 }}>{analyticsData?.totals?.uniqueVisitors || 0}</td>
                                <td>
                                  {analyticsData?.totals?.uniqueVisitors > 0
                                    ? ((analyticsData.totals.pageViews / analyticsData.totals.uniqueVisitors).toFixed(1))
                                    : '0'}
                                </td>
                                <td><span className="admin-badge admin-badge-active">Historical</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 3. Daily Visitor & Page-View Chart (Last 30 Days) */}
                      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #eaeff8', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                              Daily Traffic Overview (Last 30 Days)
                            </h4>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                              Visual breakdown of daily page views and unique visitor devices
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ width: '10px', height: '10px', background: '#2563eb', borderRadius: '2px' }} />
                              <span style={{ color: '#475569', fontWeight: 600 }}>Page Views</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ width: '10px', height: '10px', background: '#93c5fd', borderRadius: '2px' }} />
                              <span style={{ color: '#475569', fontWeight: 600 }}>Unique Visitors</span>
                            </div>
                          </div>
                        </div>

                        {/* Visual SVG Bar Chart */}
                        {(() => {
                          const chartDays = analyticsData?.dailyChart || [];
                          const maxViews = Math.max(...chartDays.map((d: any) => d.pageViews || 0), 5);

                          return (
                            <div style={{ width: '100%', overflowX: 'auto' }}>
                              <div style={{ minWidth: '600px', height: '180px', display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '10px 0 25px 0', position: 'relative', borderBottom: '1px solid #e2e8f0' }}>
                                {chartDays.map((d: any, idx: number) => {
                                  const pHeight = Math.max((d.pageViews / maxViews) * 140, d.pageViews > 0 ? 8 : 2);
                                  const vHeight = Math.max((d.visitors / maxViews) * 140, d.visitors > 0 ? 6 : 2);

                                  return (
                                    <div
                                      key={d.date || idx}
                                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}
                                      title={`${d.label}: ${d.pageViews} views, ${d.visitors} visitors`}
                                    >
                                      {/* Bar group */}
                                      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
                                        <div
                                          style={{
                                            width: '8px',
                                            height: `${pHeight}px`,
                                            background: '#2563eb',
                                            borderRadius: '2px 2px 0 0',
                                            transition: 'height 0.3s'
                                          }}
                                        />
                                        <div
                                          style={{
                                            width: '8px',
                                            height: `${vHeight}px`,
                                            background: '#93c5fd',
                                            borderRadius: '2px 2px 0 0',
                                            transition: 'height 0.3s'
                                          }}
                                        />
                                      </div>

                                      {/* Date label every 5 days */}
                                      {idx % 5 === 0 && (
                                        <span style={{ position: 'absolute', bottom: '-22px', fontSize: '0.625rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                          {d.label}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* 4. Most Visited Pages Table */}
                      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #eaeff8', padding: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                          Most Visited Pages (Top Content)
                        </h4>
                        <div className="admin-table-container">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th style={{ width: '60px' }}>Rank</th>
                                <th>Page Path / Name</th>
                                <th>Total Views</th>
                                <th>Traffic Share</th>
                                <th style={{ textAlign: 'right' }}>Preview</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(!analyticsData?.mostVisitedPages || analyticsData.mostVisitedPages.length === 0) ? (
                                <tr>
                                  <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', padding: '1.5rem' }}>
                                    No pageview data recorded yet.
                                  </td>
                                </tr>
                              ) : (
                                analyticsData.mostVisitedPages.map((page: any, idx: number) => (
                                  <tr key={page.path}>
                                    <td style={{ fontWeight: 700, color: '#64748b' }}>#{idx + 1}</td>
                                    <td>
                                      <div>
                                        <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{page.name}</span>
                                        <span style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'monospace' }}>{page.path}</span>
                                      </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{page.views.toLocaleString()}</td>
                                    <td>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                          <div style={{ width: `${page.percentage}%`, height: '100%', background: '#2563eb', borderRadius: '3px' }} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{page.percentage}%</span>
                                      </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      <a
                                        href={page.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="admin-btn admin-btn-secondary admin-btn-sm"
                                        style={{ textDecoration: 'none' }}
                                      >
                                        Visit Page ↗
                                      </a>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 1: SERVICES MANAGEMENT CRUD */}
                  {activeNav === 'web-services' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Service Offerings ({websiteContent.services?.length || 0})</h3>
                          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Manage services displayed on the public Homepage and Services page.</p>
                        </div>
                        <button
                          onClick={() => {
                            setServiceForm({
                              id: '',
                              name: '',
                              description: '',
                              icon: 'globe',
                              tag: 'Modern & Responsive',
                              details: '',
                              startingPrice: 'Custom Quote',
                              published: true
                            });
                            setActiveModal('service-modal');
                          }}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                        >
                          + Add New Service
                        </button>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Icon</th>
                              <th>Service Name</th>
                              <th>Badge / Tag</th>
                              <th>Description</th>
                              <th>Starting Price</th>
                              <th>Status</th>
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(websiteContent.services || []).map((srv: any, idx: number) => (
                              <tr key={srv.id || idx}>
                                <td>
                                  <span style={{ display: 'inline-flex', padding: '6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                    {srv.icon}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>{srv.name}</td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
                                    {srv.tag || 'Standard'}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '280px' }}>{srv.description}</td>
                                <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{srv.startingPrice || 'Custom Quote'}</td>
                                <td>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <input
                                      type="checkbox"
                                      checked={srv.published !== false}
                                      onChange={async () => {
                                        const updated = websiteContent.services.map((s: any, i: number) =>
                                          i === idx ? { ...s, published: s.published === false ? true : false } : s
                                        );
                                        const newContent = { ...websiteContent, services: updated };
                                        setWebsiteContent(newContent);
                                        await fetch('/api/admin/content', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ section: 'services', data: updated })
                                        });
                                        showToast(`Service "${srv.name}" ${srv.published !== false ? 'unpublished' : 'published'}.`);
                                      }}
                                    />
                                    <span>{srv.published !== false ? 'Published' : 'Hidden'}</span>
                                  </label>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => {
                                        setServiceForm({
                                          id: srv.id || `srv-${idx + 1}`,
                                          name: srv.name || '',
                                          description: srv.description || '',
                                          icon: srv.icon || 'globe',
                                          tag: srv.tag || '',
                                          details: srv.details || '',
                                          startingPrice: srv.startingPrice || 'Custom Quote',
                                          published: srv.published !== false
                                        });
                                        setActiveModal('service-modal');
                                      }}
                                      className="admin-btn admin-btn-secondary admin-btn-sm"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => promptDeleteService(srv)}
                                      disabled={deletingId === srv.id}
                                      className="admin-btn admin-btn-danger admin-btn-sm"
                                    >
                                      {deletingId === srv.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PROJECTS MANAGEMENT CRUD */}
                  {activeNav === 'web-projects' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Project Portfolio ({websiteContent.projects?.length || 0})</h3>
                          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Manage genuine projects displayed on the public Homepage and Projects page.</p>
                        </div>
                        <button
                          onClick={() => {
                            setProjectForm({
                              id: '',
                              title: '',
                              category: 'Websites',
                              year: '2026',
                              summary: '',
                              link: '#',
                              repoUrl: '',
                              thumbnail: '/screens/erp-1.png',
                              featured: true,
                              published: true,
                              tech: 'Next.js, React, Node.js'
                            });
                            setActiveModal('project-modal');
                          }}
                          className="admin-btn admin-btn-primary admin-btn-sm"
                        >
                          + Add New Project
                        </button>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Project Title</th>
                              <th>Category</th>
                              <th>Year</th>
                              <th>Summary</th>
                              <th>Featured</th>
                              <th>Published</th>
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(websiteContent.projects || []).map((proj: any, idx: number) => (
                              <tr key={proj.id || idx}>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>{proj.title}</td>
                                <td>
                                  <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                    {proj.category}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>{proj.year || '2026'}</td>
                                <td style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '280px' }}>{proj.summary}</td>
                                <td>
                                  <span style={{ color: proj.featured ? '#16a34a' : '#94a3b8', fontWeight: 700 }}>
                                    {proj.featured ? (
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                        <StarIcon size={12} color="#16a34a" />
                                        <span>Yes</span>
                                      </span>
                                    ) : 'No'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`admin-badge ${proj.published !== false ? 'admin-badge-active' : 'admin-badge-suspended'}`}>
                                    {proj.published !== false ? 'Published' : 'Hidden'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => {
                                        setProjectForm({
                                          id: proj.id || `proj-${idx + 1}`,
                                          title: proj.title || '',
                                          category: proj.category || 'Websites',
                                          year: proj.year || '2026',
                                          summary: proj.summary || '',
                                          link: proj.link || '#',
                                          repoUrl: proj.repoUrl || '',
                                          thumbnail: proj.thumbnail || '/screens/erp-1.png',
                                          featured: proj.featured !== false,
                                          published: proj.published !== false,
                                          tech: Array.isArray(proj.tech) ? proj.tech.join(', ') : (proj.tech || '')
                                        });
                                        setActiveModal('project-modal');
                                      }}
                                      className="admin-btn admin-btn-secondary admin-btn-sm"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => promptDeleteProject(proj)}
                                      disabled={deletingId === proj.id}
                                      className="admin-btn admin-btn-danger admin-btn-sm"
                                    >
                                      {deletingId === proj.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ABOUT US EDITING */}
                  {activeNav === 'web-about' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #eaeff8' }}>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>About Us Page & Capabilities</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Page Headline</label>
                            <input
                              type="text"
                              value={websiteContent.about?.headline || ''}
                              onChange={e => setWebsiteContent({ ...websiteContent, about: { ...websiteContent.about, headline: e.target.value } })}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Subheadline</label>
                            <input
                              type="text"
                              value={websiteContent.about?.subheadline || ''}
                              onChange={e => setWebsiteContent({ ...websiteContent, about: { ...websiteContent.about, subheadline: e.target.value } })}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Our Vision</label>
                          <textarea
                            rows={2}
                            value={websiteContent.about?.vision || ''}
                            onChange={e => setWebsiteContent({ ...websiteContent, about: { ...websiteContent.about, vision: e.target.value } })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Why Choose AnshuCore Text</label>
                          <textarea
                            rows={2}
                            value={websiteContent.about?.whyChoose || ''}
                            onChange={e => setWebsiteContent({ ...websiteContent, about: { ...websiteContent.about, whyChoose: e.target.value } })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Founder Story</label>
                          <textarea
                            rows={3}
                            value={websiteContent.about?.founderStory || ''}
                            onChange={e => setWebsiteContent({ ...websiteContent, about: { ...websiteContent.about, founderStory: e.target.value } })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await fetch('/api/admin/content', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ section: 'about', data: websiteContent.about })
                          });
                          showToast('About section saved and published.');
                        }}
                        className="admin-btn admin-btn-primary"
                        style={{ alignSelf: 'flex-start' }}
                      >
                        Save & Publish About Section
                      </button>
                    </div>
                  )}

                  {/* TAB 4: COMPREHENSIVE TECHNICAL SEO & SOCIAL MANAGER */}
                  {activeNav === 'web-seo' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Top Intro & Tab Navigation */}
                      <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eaeff8', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                              Search Engine Optimization (SEO) &amp; Social Metadata
                            </h3>
                            <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                              Configure page titles, meta descriptions, canonical URLs, search engine indexing directives, and Google Search Console verification.
                            </p>
                          </div>
                          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedSeoTab('pages')}
                              style={{
                                padding: '0.45rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: selectedSeoTab === 'pages' ? '#2563eb' : 'transparent',
                                color: selectedSeoTab === 'pages' ? '#ffffff' : '#64748b',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Page-Specific SEO
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedSeoTab('global')}
                              style={{
                                padding: '0.45rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: selectedSeoTab === 'global' ? '#2563eb' : 'transparent',
                                color: selectedSeoTab === 'global' ? '#ffffff' : '#64748b',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Global &amp; Canonical Settings
                            </button>
                          </div>
                        </div>

                        {/* SUB-TAB 1: PAGE-SPECIFIC SEO */}
                        {selectedSeoTab === 'pages' && (() => {
                          const activePageItem = SEO_PAGES_LIST.find(p => p.key === selectedSeoPage) || SEO_PAGES_LIST[0];
                          const pageConfig = websiteContent?.seo?.pages?.[selectedSeoPage] || {};
                          const currentTitle = pageConfig.title !== undefined ? pageConfig.title : '';
                          const currentDesc = pageConfig.description !== undefined ? pageConfig.description : '';
                          const isNoIndex = Boolean(pageConfig.noindex);
                          const canonicalUrl = `${(websiteContent?.seo?.canonicalBase || 'https://anshucore.in').replace(/\/+$/, '')}${activePageItem.path === '/' ? '' : activePageItem.path}`;

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                              {/* Page Selection Pills */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eaeff8' }}>
                                {SEO_PAGES_LIST.map((page) => {
                                  const isSelected = selectedSeoPage === page.key;
                                  const hasNoIndex = Boolean(websiteContent?.seo?.pages?.[page.key]?.noindex);
                                  return (
                                    <button
                                      key={page.key}
                                      type="button"
                                      onClick={() => setSelectedSeoPage(page.key)}
                                      style={{
                                        padding: '0.4rem 0.85rem',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: isSelected ? 700 : 500,
                                        border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                        background: isSelected ? '#eff6ff' : '#ffffff',
                                        color: isSelected ? '#1d4ed8' : '#475569',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem'
                                      }}
                                    >
                                      <span>{page.label}</span>
                                      {hasNoIndex && (
                                        <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>
                                          noindex
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Selected Page Editor & Google Snippet Grid */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                                {/* Left Form Controls */}
                                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #eaeff8' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                                      {activePageItem.label} Metadata
                                    </span>
                                    <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#64748b', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                      {activePageItem.path}
                                    </span>
                                  </div>

                                  {/* Page Title */}
                                  <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Page Title Tag</label>
                                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: currentTitle.length > 60 ? '#f59e0b' : '#64748b' }}>
                                        {currentTitle.length}/60 chars
                                      </span>
                                    </div>
                                    <input
                                      type="text"
                                      value={currentTitle}
                                      placeholder="Optimal: 50-60 characters"
                                      onChange={(e) => {
                                        const nextPages = { ...(websiteContent.seo?.pages || {}) };
                                        nextPages[selectedSeoPage] = { ...(nextPages[selectedSeoPage] || {}), title: e.target.value };
                                        setWebsiteContent({
                                          ...websiteContent,
                                          seo: { ...(websiteContent.seo || {}), pages: nextPages }
                                        });
                                      }}
                                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                    />
                                  </div>

                                  {/* Meta Description */}
                                  <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Meta Description</label>
                                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: currentDesc.length > 160 ? '#f59e0b' : '#64748b' }}>
                                        {currentDesc.length}/160 chars
                                      </span>
                                    </div>
                                    <textarea
                                      rows={3}
                                      value={currentDesc}
                                      placeholder="Optimal: 140-160 characters describing the page"
                                      onChange={(e) => {
                                        const nextPages = { ...(websiteContent.seo?.pages || {}) };
                                        nextPages[selectedSeoPage] = { ...(nextPages[selectedSeoPage] || {}), description: e.target.value };
                                        setWebsiteContent({
                                          ...websiteContent,
                                          seo: { ...(websiteContent.seo || {}), pages: nextPages }
                                        });
                                      }}
                                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                    />
                                  </div>

                                  {/* Indexing Directive */}
                                  <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.45rem' }}>
                                      Search Engine Indexing Directive
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#0f172a', cursor: 'pointer' }}>
                                        <input
                                          type="radio"
                                          name={`index-${selectedSeoPage}`}
                                          checked={!isNoIndex}
                                          onChange={() => {
                                            const nextPages = { ...(websiteContent.seo?.pages || {}) };
                                            nextPages[selectedSeoPage] = { ...(nextPages[selectedSeoPage] || {}), noindex: false };
                                            setWebsiteContent({
                                              ...websiteContent,
                                              seo: { ...(websiteContent.seo || {}), pages: nextPages }
                                            });
                                          }}
                                        />
                                        <span style={{ fontWeight: 600, color: '#16a34a' }}>Index (index, follow)</span>
                                      </label>
                                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#0f172a', cursor: 'pointer' }}>
                                        <input
                                          type="radio"
                                          name={`index-${selectedSeoPage}`}
                                          checked={isNoIndex}
                                          onChange={() => {
                                            const nextPages = { ...(websiteContent.seo?.pages || {}) };
                                            nextPages[selectedSeoPage] = { ...(nextPages[selectedSeoPage] || {}), noindex: true };
                                            setWebsiteContent({
                                              ...websiteContent,
                                              seo: { ...(websiteContent.seo || {}), pages: nextPages }
                                            });
                                          }}
                                        />
                                        <span style={{ fontWeight: 600, color: '#dc2626' }}>Noindex (noindex, nofollow)</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Google Search Result Simulation */}
                                <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #eaeff8' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Live Google Search Result Preview
                                    </span>
                                    <span style={{
                                      fontSize: '0.6875rem',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      background: isNoIndex ? '#fef2f2' : '#f0fdf4',
                                      color: isNoIndex ? '#b91c1c' : '#15803d',
                                      border: isNoIndex ? '1px solid #fecaca' : '1px solid #bbf7d0'
                                    }}>
                                      {isNoIndex ? 'Blocked from Google (noindex)' : 'Eligible for Google Index'}
                                    </span>
                                  </div>

                                  {/* Simulated Google SERP Snippet */}
                                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#ffffff', border: '1px solid #eaeff8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BrandLogo size={16} />
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="brand-name" style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                                          <span className="brand-anshu" style={{ color: '#111827' }}>Anshu</span><span className="brand-core" style={{ color: '#2563EB' }}>Core</span>
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#5f6368', lineHeight: 1 }}>{canonicalUrl}</span>
                                      </div>
                                    </div>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 500, color: '#1a0dab', marginTop: '6px', marginBottom: '4px', lineHeight: 1.3, cursor: 'pointer' }}>
                                      {currentTitle || `${activePageItem.label} | AnshuCore`}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: '#4d5156', lineHeight: 1.5 }}>
                                      {currentDesc || 'No custom description provided. Search engines may generate a snippet from on-page content.'}
                                    </div>
                                  </div>

                                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <span>Canonical URL:</span>
                                    <code style={{ fontSize: '0.6875rem', color: '#2563eb', background: '#eff6ff', padding: '1px 5px', borderRadius: '4px' }}>
                                      {canonicalUrl}
                                    </code>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* SUB-TAB 2: GLOBAL & CANONICAL SETTINGS */}
                        {selectedSeoTab === 'global' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #eaeff8' }}>
                              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                                Global Canonical &amp; Verification Settings
                              </h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                                    Canonical Domain Base
                                  </label>
                                  <input
                                    type="text"
                                    value={websiteContent.seo?.canonicalBase || 'https://anshucore.in'}
                                    onChange={e => setWebsiteContent({
                                      ...websiteContent,
                                      seo: { ...websiteContent.seo, canonicalBase: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                                    Google Search Console Verification Token / Tag
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. google-site-verification=abc..."
                                    value={websiteContent.seo?.googleSiteVerification || ''}
                                    onChange={e => setWebsiteContent({
                                      ...websiteContent,
                                      seo: { ...websiteContent.seo, googleSiteVerification: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                                    Default Social Share (OG) Image URL
                                  </label>
                                  <input
                                    type="text"
                                    value={websiteContent.seo?.ogImage || '/assets/anshucore-og.png'}
                                    onChange={e => setWebsiteContent({
                                      ...websiteContent,
                                      seo: { ...websiteContent.seo, ogImage: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                                    Target Regional &amp; Tech Keywords
                                  </label>
                                  <input
                                    type="text"
                                    value={websiteContent.seo?.keywords || ''}
                                    onChange={e => setWebsiteContent({
                                      ...websiteContent,
                                      seo: { ...websiteContent.seo, keywords: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                              </div>

                              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                                    Global Fallback Site Title
                                  </label>
                                  <input
                                    type="text"
                                    value={websiteContent.seo?.siteTitle || ''}
                                    onChange={e => setWebsiteContent({
                                      ...websiteContent,
                                      seo: { ...websiteContent.seo, siteTitle: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                                    Global Fallback Description
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={websiteContent.seo?.description || ''}
                                    onChange={e => setWebsiteContent({
                                      ...websiteContent,
                                      seo: { ...websiteContent.seo, description: e.target.value }
                                    })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Social Profiles */}
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #eaeff8' }}>
                              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                                Social Links &amp; Schema SameAs Profiles
                              </h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>GitHub URL</label>
                                  <input
                                    type="text"
                                    value={websiteContent.social?.github || ''}
                                    onChange={e => setWebsiteContent({ ...websiteContent, social: { ...websiteContent.social, github: e.target.value } })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Twitter / X URL</label>
                                  <input
                                    type="text"
                                    value={websiteContent.social?.twitter || ''}
                                    onChange={e => setWebsiteContent({ ...websiteContent, social: { ...websiteContent.social, twitter: e.target.value } })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>LinkedIn URL</label>
                                  <input
                                    type="text"
                                    value={websiteContent.social?.linkedin || ''}
                                    onChange={e => setWebsiteContent({ ...websiteContent, social: { ...websiteContent.social, linkedin: e.target.value } })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Public Inquiry Email</label>
                                  <input
                                    type="text"
                                    value={websiteContent.social?.email || ''}
                                    onChange={e => setWebsiteContent({ ...websiteContent, social: { ...websiteContent.social, email: e.target.value } })}
                                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            disabled={seoSaving}
                            onClick={async () => {
                              setSeoSaving(true);
                              try {
                                await fetch('/api/admin/content', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ section: 'seo', data: websiteContent.seo })
                                });
                                await fetch('/api/admin/content', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ section: 'social', data: websiteContent.social })
                                });
                                showToast('SEO settings and metadata successfully saved and published.');
                              } catch {
                                showToast('Error saving SEO settings.');
                              } finally {
                                setSeoSaving(false);
                              }
                            }}
                            className="admin-btn admin-btn-primary"
                          >
                            {seoSaving ? 'Saving Settings...' : 'Save & Publish SEO Settings'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4B: WEBSITE APPEARANCE & THEME SETTINGS */}
                  {activeNav === 'web-theme' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eaeff8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                          <div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                              Website Appearance & Theme Customization
                            </h3>
                            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                              Customize website theme colors across headers, surfaces, buttons, and links without editing code. Changes persist safely in Redis & local store.
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={handleResetTheme}
                              disabled={themeLoading}
                              className="admin-btn admin-btn-secondary"
                              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.85rem' }}
                            >
                              Reset to Default
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelTheme}
                              disabled={themeLoading}
                              className="admin-btn admin-btn-secondary"
                              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.85rem' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveTheme}
                              disabled={themeLoading}
                              className="admin-btn admin-btn-primary"
                              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
                            >
                              {themeLoading ? 'Saving...' : 'Save Theme Settings'}
                            </button>
                          </div>
                        </div>

                        {themeError && (
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                            {themeError}
                          </div>
                        )}

                        {/* ACCESSIBILITY & CONTRAST WARNINGS */}
                        {(() => {
                          const btnContrast = getContrast(themeForm.buttonText, themeForm.button);
                          const textOnSurfaceContrast = getContrast(themeForm.text, themeForm.surface);
                          const textOnBgContrast = getContrast(themeForm.text, themeForm.background);
                          const warnings = [];

                          if (btnContrast < 4.5) {
                            warnings.push(`Button text contrast is ${btnContrast.toFixed(2)}:1 (minimum 4.5:1 recommended).`);
                          }
                          if (textOnSurfaceContrast < 4.5) {
                            warnings.push(`Main text contrast on card surface is ${textOnSurfaceContrast.toFixed(2)}:1 (minimum 4.5:1 recommended).`);
                          }
                          if (textOnBgContrast < 4.5) {
                            warnings.push(`Main text contrast on page background is ${textOnBgContrast.toFixed(2)}:1.`);
                          }

                          if (warnings.length === 0) {
                            return (
                              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckIcon size={16} color="#15803d" />
                                <span>High readability confirmed. All active color pairs meet WCAG AA contrast standards.</span>
                              </div>
                            );
                          }

                          return (
                            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
                              <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                Contrast Warning (Accessibility):
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                {warnings.map((w, idx) => (
                                  <li key={idx}>{w}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}

                        {/* LIVE PREVIEW COMPONENT */}
                        <div style={{ background: themeForm.background, border: `1px solid ${themeForm.border}`, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', transition: 'all 0.2s' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: themeForm.muted, marginBottom: '0.75rem' }}>
                            Interactive Live Theme Preview
                          </div>
                          
                          {/* Simulated Nav & Card */}
                          <div style={{ background: themeForm.surface, border: `1px solid ${themeForm.border}`, borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${themeForm.border}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BrandLogo size={28} className="shadow-xs" style={{ borderRadius: '7px', border: '1px solid #eaeff8' }} />
                                <span className="brand-name" style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                                  <span className="brand-anshu" style={{ color: '#111827' }}>Anshu</span><span className="brand-core" style={{ color: '#2563EB' }}>Core</span>
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
                                <span style={{ color: themeForm.link, fontWeight: 600 }}>Home</span>
                                <span style={{ color: themeForm.muted }}>Services</span>
                                <span style={{ color: themeForm.muted }}>Apps</span>
                              </div>
                            </div>

                            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: themeForm.text, margin: '0 0 0.5rem 0' }}>
                              Turning Ideas Into Digital Solutions
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: themeForm.muted, margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                              This live card demonstrates how your customized text, surface, border, and button colors harmonize together.
                            </p>

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <button
                                type="button"
                                style={{
                                  background: themeForm.button,
                                  color: themeForm.buttonText,
                                  border: 'none',
                                  borderRadius: '9999px',
                                  padding: '0.55rem 1.25rem',
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Primary Action
                              </button>
                              <button
                                type="button"
                                style={{
                                  background: themeForm.surface,
                                  color: themeForm.text,
                                  border: `1px solid ${themeForm.border}`,
                                  borderRadius: '9999px',
                                  padding: '0.55rem 1.25rem',
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Secondary Action
                              </button>
                              <span style={{ fontSize: '0.8125rem', color: themeForm.link, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                                Sample Hyperlink &rarr;
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* COLOR CONTROLS GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                          {[
                            { key: 'primary', label: 'Primary Brand Color', desc: 'Main brand accents, highlights & badges', varName: '--color-primary' },
                            { key: 'secondary', label: 'Secondary / Accent Color', desc: 'Button hovers and secondary gradients', varName: '--color-secondary' },
                            { key: 'background', label: 'Page Background', desc: 'Base body background color', varName: '--color-background' },
                            { key: 'surface', label: 'Card & Surface Background', desc: 'Containers, cards, modals & sidebars', varName: '--color-surface' },
                            { key: 'text', label: 'Main Text Color', desc: 'Headlines, titles and primary body copy', varName: '--color-text' },
                            { key: 'muted', label: 'Muted Text Color', desc: 'Subtitles, captions and meta details', varName: '--color-muted' },
                            { key: 'border', label: 'Border Color', desc: 'Card dividers, inputs & section outlines', varName: '--color-border' },
                            { key: 'button', label: 'Primary Button Background', desc: 'Main call-to-action button fill', varName: '--color-button' },
                            { key: 'buttonText', label: 'Primary Button Text', desc: 'Text inside primary action buttons', varName: '--color-button-text' },
                            { key: 'link', label: 'Link Color', desc: 'Interactive text links and breadcrumbs', varName: '--color-link' },
                            { key: 'headerBg', label: 'Header Background', desc: 'Top navigation bar background', varName: '--color-header' },
                            { key: 'footerBg', label: 'Footer Background', desc: 'Bottom site footer background', varName: '--color-footer' },
                          ].map(item => {
                            const val = (themeForm as any)[item.key] || '#000000';
                            return (
                              <div
                                key={item.key}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #eaeff8',
                                  borderRadius: '12px',
                                  padding: '1rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                                    {item.label}
                                  </label>
                                  <code style={{ fontSize: '0.6875rem', color: '#64748b', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                                    {item.varName}
                                  </code>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                                  {item.desc}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                  <input
                                    type="color"
                                    value={val}
                                    onChange={e => updateThemeField(item.key, e.target.value)}
                                    style={{
                                      width: '42px',
                                      height: '38px',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      background: '#fff'
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={val}
                                    maxLength={7}
                                    onChange={e => updateThemeField(item.key, e.target.value)}
                                    placeholder="#2563eb"
                                    style={{
                                      flex: 1,
                                      padding: '0.5rem 0.75rem',
                                      borderRadius: '8px',
                                      border: '1px solid #cbd5e1',
                                      fontSize: '0.875rem',
                                      fontFamily: 'monospace',
                                      color: '#0f172a'
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5 (DEFAULT): HOMEPAGE HERO & CTAS */}
                  {activeNav === 'web-home' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #eaeff8' }}>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Homepage Hero Copywriting & Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Eyebrow Tag</label>
                            <input
                              type="text"
                              value={websiteContent.hero?.eyebrow || ''}
                              onChange={e => setWebsiteContent({ ...websiteContent, hero: { ...websiteContent.hero, eyebrow: e.target.value } })}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Hero Headline</label>
                            <input
                              type="text"
                              value={websiteContent.hero?.title || ''}
                              onChange={e => setWebsiteContent({ ...websiteContent, hero: { ...websiteContent.hero, title: e.target.value } })}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Lead Paragraph</label>
                          <textarea
                            rows={3}
                            value={websiteContent.hero?.leadText || ''}
                            onChange={e => setWebsiteContent({ ...websiteContent, hero: { ...websiteContent.hero, leadText: e.target.value } })}
                            style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', resize: 'vertical' }}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Primary Action Label</label>
                            <input
                              type="text"
                              value={websiteContent.hero?.ctaPrimary || 'Get a Quote'}
                              onChange={e => setWebsiteContent({ ...websiteContent, hero: { ...websiteContent.hero, ctaPrimary: e.target.value } })}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Secondary Action Label</label>
                            <input
                              type="text"
                              value={websiteContent.hero?.ctaSecondary || 'Explore Services'}
                              onChange={e => setWebsiteContent({ ...websiteContent, hero: { ...websiteContent.hero, ctaSecondary: e.target.value } })}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          await fetch('/api/admin/content', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ section: 'hero', data: websiteContent.hero })
                          });
                          showToast('Homepage hero content saved and published.');
                        }}
                        className="admin-btn admin-btn-primary"
                        style={{ alignSelf: 'flex-start' }}
                      >
                        Save & Publish Hero Changes
                      </button>
                    </div>
                  )}

                  {/* TAB: PAGES & CONTENT */}
                  {activeNav === 'web-pages' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Website Pages & Routes ({websiteContent.pages?.length || 0})</h3>
                          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Public web pages configured in the CMS. You can delete obsolete custom pages.</p>
                        </div>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Page Title</th>
                              <th>Route URL / Slug</th>
                              <th>Description / Purpose</th>
                              <th>Status</th>
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(websiteContent.pages || []).map((page: any) => (
                              <tr key={page.id || page.slug}>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>{page.title}</td>
                                <td>
                                  <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                                    {page.slug}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: '320px' }}>
                                  {page.summary || 'Standard website page'}
                                </td>
                                <td>
                                  <span className={`admin-badge ${page.published !== false ? 'admin-badge-active' : 'admin-badge-archived'}`}>
                                    {page.published !== false ? 'Published' : 'Draft'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    onClick={() => promptDeletePage(page)}
                                    disabled={deletingId === page.id}
                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                  >
                                    {deletingId === page.id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB: NAVIGATION LINKS */}
                  {activeNav === 'web-nav' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Header Navigation Menu Links ({websiteContent.navItems?.length || 0})</h3>
                          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Navbar items displayed at the top of the public website.</p>
                        </div>
                      </div>

                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Order</th>
                              <th>Menu Label</th>
                              <th>Target Link (HREF)</th>
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(websiteContent.navItems || []).map((item: any, idx: number) => (
                              <tr key={item.id || idx}>
                                <td style={{ fontWeight: 700, color: '#64748b', width: '60px' }}>
                                  #{item.order || idx + 1}
                                </td>
                                <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.label}</td>
                                <td>
                                  <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                                    {item.href}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <button
                                    onClick={() => promptDeleteNavItem(item)}
                                    disabled={deletingId === item.id}
                                    className="admin-btn admin-btn-danger admin-btn-sm"
                                  >
                                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#64748b' }}>Loading content...</p>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 6: APP REVIEWS & MODERATION                          */}
          {/* ========================================================= */}
          {activeNav === 'reviews' && (
            <div className="admin-card" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>App Reviews & Moderation</h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Review genuine community feedback. Only approved reviews appear on public app showcases.</p>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>App</th>
                      <th>User</th>
                      <th>Rating</th>
                      <th>Review Comment</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Moderation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewsList.map(rev => (
                      <tr key={rev.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{rev.appName}</td>
                        <td style={{ fontWeight: 600 }}>{rev.userName}</td>
                        <td style={{ color: '#eab308' }}>
                          <div style={{ display: 'inline-flex', gap: '2px' }} aria-label={`${rev.rating} stars`}>
                            {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                              <StarIcon key={i} size={13} color="#eab308" />
                            ))}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: '#475569', maxWidth: '300px' }}>{rev.comment}</td>
                        <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>{rev.date}</td>
                        <td>
                          <span className={`admin-badge admin-badge-${rev.status.toLowerCase()}`}>
                            {rev.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {rev.status !== 'Approved' && (
                              <button
                                onClick={async () => {
                                  await fetch('/api/admin/reviews', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: rev.id, status: 'Approved' })
                                  });
                                  showToast('Review approved.');
                                  loadReviews();
                                }}
                                className="admin-btn admin-btn-primary admin-btn-sm"
                              >
                                Approve
                              </button>
                            )}
                            {rev.status !== 'Rejected' && (
                              <button
                                onClick={async () => {
                                  await fetch('/api/admin/reviews', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: rev.id, status: 'Rejected' })
                                  });
                                  showToast('Review rejected.');
                                  loadReviews();
                                }}
                                className="admin-btn admin-btn-secondary admin-btn-sm"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => promptDeleteReview(rev)}
                              disabled={deletingId === rev.id}
                              className="admin-btn admin-btn-danger admin-btn-sm"
                            >
                              {deletingId === rev.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 7: ACCOUNT SECURITY & CREDENTIAL MANAGEMENT          */}
          {/* ========================================================= */}
          {(activeNav === 'account-security' || activeNav === 'sys-admins') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Top Section Banner */}
              <div style={{
                background: '#f8fafc',
                padding: '1.25rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #eaeff8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Administrator Account Security & Credentials
                    </h3>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }} />
                      Protected by Scrypt Hashing
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                    Manage login credentials securely. Passwords are never stored in plaintext and all updates are verified server-side.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={loadAccountInfo}
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                  >
                    Refresh Profile
                  </button>
                </div>
              </div>

              {/* Two Column Layout for Profile & Forms */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left Column: Account Details & Security Architecture */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Account Overview Card */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#ffffff',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                      }}>
                        A
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.15rem 0' }}>
                          {adminUser?.name || adminUser?.username || 'Super Administrator'}
                        </h4>
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          background: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {adminUser?.role || 'Super Admin'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Username</span>
                        <strong style={{ color: '#0f172a' }}>{adminUser?.username || 'Anshu'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Current Email</span>
                        <strong style={{ color: '#0f172a' }}>{adminUser?.email || 'admin@anshucore.in'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ color: '#64748b' }}>Password Encryption</span>
                        <strong style={{ color: '#059669' }}>Scrypt + 16B Salt</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                        <span style={{ color: '#64748b' }}>Session Mechanism</span>
                        <strong style={{ color: '#0f172a' }}>HttpOnly SameSite Cookie</strong>
                      </div>
                    </div>
                  </div>

                  {/* Security Architecture Notice */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #eaeff8',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    fontSize: '0.8125rem',
                    color: '#475569',
                    lineHeight: 1.6
                  }}>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      <span>Security & Environment Isolation</span>
                    </h5>
                    <p style={{ margin: '0 0 0.65rem 0' }}>
                      The initial administrator account is automatically initialized from <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> environment variables.
                    </p>
                    <p style={{ margin: '0 0 0.65rem 0' }}>
                      Once saved in persistent storage (Local file or Upstash Redis), your account is <strong>never overwritten on restart or redeployment</strong>. All subsequent updates are managed securely from this dashboard.
                    </p>
                    <p style={{ margin: 0 }}>
                      Password changes immediately invalidate all active sessions to protect against hijacked tokens.
                    </p>
                  </div>
                </div>

                {/* Right Column: Update Email & Update Password Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* FORM 1: CHANGE EMAIL */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                        Change Administrator Email
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                        Your email address is required for future administrator logins and system notifications.
                      </p>
                    </div>

                    {emailForm.error && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {emailForm.error}
                      </div>
                    )}

                    {emailForm.success && (
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {emailForm.success}
                      </div>
                    )}

                    <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                          Current Registered Email
                        </label>
                        <input
                          type="email"
                          disabled
                          value={adminUser?.email || ''}
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.875rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                          New Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={emailForm.newEmail}
                          onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value, error: '', success: '' })}
                          placeholder="e.g. admin@anshucore.in"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                          Current Password (for authorization) *
                        </label>
                        <input
                          type="password"
                          required
                          value={emailForm.currentPassword}
                          onChange={e => setEmailForm({ ...emailForm, currentPassword: e.target.value, error: '', success: '' })}
                          placeholder="Enter current password"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={emailForm.loading}
                        className="admin-btn admin-btn-primary"
                        style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                      >
                        {emailForm.loading ? 'Updating Email...' : 'Update Administrator Email'}
                      </button>
                    </form>
                  </div>

                  {/* FORM 2: CHANGE PASSWORD */}
                  <div className="admin-card" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                        Change Administrator Password
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                        Choose a strong password of at least 8 characters. You will need to log in again after updating.
                      </p>
                    </div>

                    {passwordForm.error && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {passwordForm.error}
                      </div>
                    )}

                    {passwordForm.success && (
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        {passwordForm.success}
                      </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                          Current Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value, error: '', success: '' })}
                          placeholder="Enter current password"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                            New Password *
                          </label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value, error: '', success: '' })}
                            placeholder="At least 8 characters"
                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                            Confirm New Password *
                          </label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value, error: '', success: '' })}
                            placeholder="Re-type new password"
                            style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={passwordForm.loading}
                        className="admin-btn admin-btn-primary"
                        style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}
                      >
                        {passwordForm.loading ? 'Updating Password...' : 'Update Password & Re-Authenticate'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 8: GENERAL SYSTEM SETTINGS                           */}
          {/* ========================================================= */}
          {activeNav === 'sys-settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                    General Platform Configuration
                  </h2>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                    Configure site name, contact emails, maintenance mode, and notifications.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Site Name</label>
                    <input
                      type="text"
                      value={systemSettings?.siteName || ''}
                      onChange={e => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Support Email</label>
                    <input
                      type="email"
                      value={systemSettings?.supportEmail || ''}
                      onChange={e => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(systemSettings?.maintenanceMode)}
                      onChange={e => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
                    />
                    <span>Maintenance Mode (Public site shows maintenance notice)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(systemSettings?.notificationsEnabled !== false)}
                      onChange={e => setSystemSettings({ ...systemSettings, notificationsEnabled: e.target.checked })}
                    />
                    <span>Enable Client Enquiry Email Notifications</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'update_settings', settings: systemSettings })
                      });
                      if (res.ok) {
                        showToast('General settings saved.');
                      } else {
                        showToast('Failed to save settings.');
                      }
                    } catch {
                      showToast('Network error saving settings.');
                    }
                  }}
                  className="admin-btn admin-btn-primary"
                  style={{ alignSelf: 'flex-start', marginTop: '1.5rem' }}
                >
                  Save General Settings
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 9: AUDIT LOGS & DATA BACKUP                          */}
          {/* ========================================================= */}
          {activeNav === 'sys-logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="admin-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>System Security & Audit Trail</h2>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Immutable log of administrative operations and database backup utilities.</p>
                  </div>
                  <a
                    href="/api/admin/settings?action=backup"
                    download
                    className="admin-btn admin-btn-secondary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    <span>Download JSON Backup</span>
                  </a>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Administrator</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{log.adminUser}</td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace', background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px' }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{log.target}</td>
                          <td style={{ fontSize: '0.8125rem', color: '#475569' }}>{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODALS SECTION                                            */}
      {/* ========================================================= */}

      {/* 1. LOCK / UNLOCK LIBRARY MODAL */}
      {activeModal === 'lock-modal' && (
        <div className="admin-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {lockModalForm.isCurrentlyLocked ? 'Unlock Library Access' : 'Suspend / Lock Library Access'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {modalError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                  {modalError}
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.25rem' }}>
                Target: <strong style={{ color: '#0f172a' }}>{lockModalForm.libraryName}</strong> (Tenant ID: <code>{lockModalForm.tenantId}</code>).
                {lockModalForm.isCurrentlyLocked
                  ? ' Re-enabling access will clear suspension flags and notify the remote library backend.'
                  : ' Locking access will suspend student and administrative access on the library host. No data will be deleted.'}
              </p>
              {!lockModalForm.isCurrentlyLocked && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Lock Reason</label>
                  <input
                    type="text"
                    value={lockModalForm.reason}
                    onChange={e => setLockModalForm({ ...lockModalForm, reason: e.target.value })}
                    placeholder="e.g. Monthly maintenance overdue (Grace period exceeded)"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              )}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button onClick={() => setActiveModal(null)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button
                  onClick={executeLockToggle}
                  disabled={modalLoading}
                  className={`admin-btn ${lockModalForm.isCurrentlyLocked ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                >
                  {modalLoading ? 'Processing...' : (lockModalForm.isCurrentlyLocked ? 'Confirm Reactivation' : 'Confirm Lock')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD / EDIT APK MODAL */}
      {activeModal === 'apk-modal' && (
        <div className="admin-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-box" style={{ maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #eaeff8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#ffffff', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {apkForm.id ? 'Edit Application' : 'Add New Application'}
                </h3>
                {apkForm.slug && (
                  <a
                    href={`/apps/${apkForm.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none'
                    }}
                    title="Preview Public Store Details Page"
                  >
                    <span>Preview Page</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                )}
              </div>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setModalLoading(true);
                setModalError('');
                try {
                  const res = await fetch('/api/admin/apks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apkForm)
                  });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    setModalError(json.error || 'Failed to save application.');
                    setModalLoading(false);
                    return;
                  }
                  showToast(`Application "${apkForm.name}" saved.`);
                  setActiveModal(null);
                  setModalLoading(false);
                  loadApks();
                  loadDashboardData();
                } catch (err: any) {
                  setModalError(err.message || 'Network error.');
                  setModalLoading(false);
                }
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {modalError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {modalError}
                </div>
              )}

              {/* Basic Info: Name & Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Application Name *</label>
                  <input
                    type="text"
                    required
                    value={apkForm.name}
                    onChange={e => setApkForm({ ...apkForm, name: e.target.value, slug: apkForm.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') })}
                    placeholder="e.g. Anshu Mock"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={apkForm.slug}
                    onChange={e => setApkForm({ ...apkForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') })}
                    placeholder="anshu-mock"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Short Tagline (Hero Banner &amp; Cards)</label>
                <input
                  type="text"
                  value={apkForm.tagline}
                  onChange={e => setApkForm({ ...apkForm, tagline: e.target.value })}
                  placeholder="e.g. Best mock test app for all competitive exams."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              {/* Category & Version */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Category</label>
                  <select
                    value={apkForm.category}
                    onChange={e => setApkForm({ ...apkForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                  >
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Version / Release Tag</label>
                  <input
                    type="text"
                    value={apkForm.releaseTag}
                    onChange={e => setApkForm({ ...apkForm, releaseTag: e.target.value })}
                    placeholder="v1.5.0"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* GitHub Repo & Direct APK Download URL */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>GitHub Repository</label>
                  <input
                    type="text"
                    value={apkForm.repo}
                    onChange={e => setApkForm({ ...apkForm, repo: e.target.value })}
                    placeholder="indbite-web/Anshu-Mock-"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Direct APK Asset Download URL</label>
                  <input
                    type="text"
                    value={apkForm.directUrl}
                    onChange={e => setApkForm({ ...apkForm, directUrl: e.target.value })}
                    placeholder="https://github.com/.../releases/download/.../App.apk"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* UPLOAD APP ICON CONTROL */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', background: '#f8fafc' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.65rem' }}>
                  Application Icon
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    border: '2px solid #cbd5e1',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
                    flexShrink: 0
                  }}>
                    <AppIcon
                      icon={apkForm.icon}
                      name={apkForm.name || 'App'}
                      size={64}
                      className="rounded-2xl"
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <label
                        htmlFor="apk-icon-file-input"
                        className="admin-btn admin-btn-secondary"
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        <span>{apkForm.icon && (apkForm.icon.startsWith('data:image/') || apkForm.icon.startsWith('http')) ? 'Replace Icon' : 'Upload Icon Image'}</span>
                      </label>
                      <input
                        id="apk-icon-file-input"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        style={{ display: 'none' }}
                        onChange={handleApkIconUpload}
                      />
                      {apkForm.icon && (
                        <button
                          type="button"
                          onClick={() => {
                            setApkIconError('');
                            setApkForm({ ...apkForm, icon: '' });
                            showToast('Icon cleared. Safe monogram fallback will be used.');
                          }}
                          className="admin-btn"
                          style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem', color: '#b91c1c', border: '1px solid #fecaca', background: '#fef2f2' }}
                        >
                          Remove Icon
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Supports PNG, JPEG, or WebP. Auto-validated on upload.
                    </p>
                    {apkIconError && (
                      <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600, marginBottom: '0.5rem' }}>
                        {apkIconError}
                      </div>
                    )}
                    <details style={{ fontSize: '0.75rem', color: '#475569' }}>
                      <summary style={{ cursor: 'pointer', userSelect: 'none', color: '#2563eb', fontWeight: 600 }}>
                        Or enter direct HTTPS Image URL
                      </summary>
                      <div style={{ marginTop: '0.35rem' }}>
                        <input
                          type="url"
                          value={apkForm.icon && !apkForm.icon.startsWith('data:image/') ? apkForm.icon : ''}
                          onChange={e => {
                            const url = e.target.value.trim();
                            setApkIconError('');
                            setApkForm({ ...apkForm, icon: url });
                          }}
                          placeholder="https://example.com/assets/my-icon.png"
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>About This App (Detailed Description)</label>
                <textarea
                  rows={3}
                  value={apkForm.description}
                  onChange={e => setApkForm({ ...apkForm, description: e.target.value })}
                  placeholder="Comprehensive description of the application's capabilities, target audience, and usage..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              {/* Features & Keywords */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Features / Keywords (Comma-separated)</label>
                <input
                  type="text"
                  value={apkForm.features}
                  onChange={e => setApkForm({ ...apkForm, features: e.target.value })}
                  placeholder="Mock Test, Competitive Exams, Analytics, Offline Support"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              {/* Min Android, Age Rating, Developer, Size */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Min Android OS</label>
                  <input
                    type="text"
                    value={apkForm.minAndroid}
                    onChange={e => setApkForm({ ...apkForm, minAndroid: e.target.value })}
                    placeholder="7.0 and up"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Age Rating</label>
                  <input
                    type="text"
                    value={apkForm.ageRating}
                    onChange={e => setApkForm({ ...apkForm, ageRating: e.target.value })}
                    placeholder="Rated for 3+"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Developer</label>
                  <input
                    type="text"
                    value={apkForm.developer}
                    onChange={e => setApkForm({ ...apkForm, developer: e.target.value })}
                    placeholder="AnshuCore"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>App Size</label>
                  <input
                    type="text"
                    value={apkForm.sizeFormatted}
                    onChange={e => setApkForm({ ...apkForm, sizeFormatted: e.target.value })}
                    placeholder="25 MB"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Screenshots (Image URLs, comma or newline separated)</label>
                <textarea
                  rows={2}
                  value={apkForm.screenshots}
                  onChange={e => setApkForm({ ...apkForm, screenshots: e.target.value })}
                  placeholder="https://example.com/screenshot1.png, https://example.com/screenshot2.png"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8125rem', resize: 'vertical' }}
                />
              </div>

              {/* Related Apps Multiselect */}
              {apksList.filter(a => a.id !== apkForm.id).length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Select Related Applications:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
                    {apksList.filter(a => a.id !== apkForm.id).map(app => {
                      const isSelected = Array.isArray(apkForm.relatedAppIds) && apkForm.relatedAppIds.includes(app.id);
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            const cur = Array.isArray(apkForm.relatedAppIds) ? apkForm.relatedAppIds : [];
                            const next = isSelected ? cur.filter(x => x !== app.id) : [...cur, app.id];
                            setApkForm({ ...apkForm, relatedAppIds: next });
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            color: isSelected ? '#1d4ed8' : '#475569',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{isSelected ? '✓ ' : '+ '}{app.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status checkboxes */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={apkForm.published}
                    onChange={e => setApkForm({ ...apkForm, published: e.target.checked })}
                  />
                  <span>Published on Store</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={apkForm.isSuperApk}
                    onChange={e => setApkForm({ ...apkForm, isSuperApk: e.target.checked })}
                  />
                  <span>Set as Featured App (Homepage Hero Banner)</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eaeff8' }}>
                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      setApkForm(prev => ({ ...prev, published: false }));
                      setModalLoading(true);
                      setModalError('');
                      try {
                        const res = await fetch('/api/admin/apks', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...apkForm, published: false })
                        });
                        const json = await res.json();
                        if (!res.ok || !json.success) {
                          setModalError(json.error || 'Failed to save draft.');
                          setModalLoading(false);
                          return;
                        }
                        showToast(`Application "${apkForm.name}" saved as draft.`);
                        setActiveModal(null);
                        setModalLoading(false);
                        loadApks();
                        loadDashboardData();
                      } catch (err: any) {
                        setModalError(err.message || 'Network error.');
                        setModalLoading(false);
                      }
                    }}
                    disabled={modalLoading}
                    className="admin-btn admin-btn-secondary"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Save as Draft
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setActiveModal(null)} className="admin-btn admin-btn-secondary">Cancel</button>
                  <button type="submit" disabled={modalLoading} className="admin-btn admin-btn-primary">
                    {modalLoading ? 'Saving...' : (apkForm.id ? 'Update Application' : 'Create Application')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. REGISTER / EDIT LIBRARY MODAL */}
      {activeModal === 'library-modal' && (
        <div className="admin-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {libraryForm.id ? 'Edit Library Record' : 'Register New Library'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setModalLoading(true);
                setModalError('');
                try {
                  const res = await fetch('/api/admin/libraries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(libraryForm)
                  });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    setModalError(json.error || 'Failed to save library.');
                    setModalLoading(false);
                    return;
                  }
                  showToast(`Library "${libraryForm.name}" registered.`);
                  setActiveModal(null);
                  setModalLoading(false);
                  loadLibraries();
                  loadDashboardData();
                } catch (err: any) {
                  setModalError(err.message || 'Network error.');
                  setModalLoading(false);
                }
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {modalError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {modalError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Library Name</label>
                  <input
                    type="text"
                    required
                    value={libraryForm.name}
                    onChange={e => setLibraryForm({ ...libraryForm, name: e.target.value, tenantId: libraryForm.tenantId || e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                    placeholder="Gurukul Library"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Tenant Identifier</label>
                  <input
                    type="text"
                    required
                    value={libraryForm.tenantId}
                    onChange={e => setLibraryForm({ ...libraryForm, tenantId: e.target.value })}
                    placeholder="gurukul-lib"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Host URL (Remote Endpoint)</label>
                <input
                  type="text"
                  required
                  value={libraryForm.hostUrl}
                  onChange={e => setLibraryForm({ ...libraryForm, hostUrl: e.target.value })}
                  placeholder="http://localhost:5000 or https://tenant.domain.com"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={libraryForm.monthlyAmount}
                    onChange={e => setLibraryForm({ ...libraryForm, monthlyAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Billing Day</label>
                  <input
                    type="text"
                    value={libraryForm.billingDate}
                    onChange={e => setLibraryForm({ ...libraryForm, billingDate: e.target.value })}
                    placeholder="25th"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={modalLoading} className="admin-btn admin-btn-primary">
                  {modalLoading ? 'Saving...' : 'Register Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. CREATE INVOICE MODAL */}
      {activeModal === 'invoice-modal' && (
        <div className="admin-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Create Monthly Maintenance Invoice</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setModalLoading(true);
                setModalError('');
                try {
                  const res = await fetch('/api/admin/invoices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'create_invoice',
                      tenantId: invoiceForm.tenantId,
                      amount: invoiceForm.amount,
                      dueDate: invoiceForm.dueDate
                    })
                  });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    setModalError(json.error || 'Failed to create invoice.');
                    setModalLoading(false);
                    return;
                  }
                  showToast(`Invoice ${json.invoice.invoiceNumber} created.`);
                  setActiveModal(null);
                  loadInvoices();
                  loadDashboardData();
                } catch (err: any) {
                  setModalError(err.message || 'Network error creating invoice.');
                } finally {
                  setModalLoading(false);
                }
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {modalError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {modalError}
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Select Library Tenant</label>
                <select
                  value={invoiceForm.tenantId}
                  onChange={e => setInvoiceForm({ ...invoiceForm, tenantId: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                >
                  {(dashboardData?.libraryStatuses || []).map(lib => (
                    <option key={lib.tenantId} value={lib.tenantId}>
                      {lib.name} ({lib.tenantId})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Invoice Amount (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.amount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Payment Due Date</label>
                  <input
                    type="text"
                    value={invoiceForm.dueDate}
                    onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={modalLoading} className="admin-btn admin-btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. RECORD PAYMENT MODAL */}
      {activeModal === 'payment-modal' && (
        <div className="admin-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Record Verified Payment</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setModalLoading(true);
                setModalError('');
                try {
                  const res = await fetch('/api/admin/invoices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'record_payment',
                      invoiceId: paymentForm.invoiceId,
                      amount: paymentForm.amount,
                      method: paymentForm.method,
                      transactionId: paymentForm.transactionId
                    })
                  });
                  const json = await res.json();
                  if (!res.ok || !json.success) {
                    setModalError(json.error || 'Failed to record payment.');
                    setModalLoading(false);
                    return;
                  }
                  showToast('Payment verified and recorded successfully.');
                  setActiveModal(null);
                  loadInvoices();
                  loadDashboardData();
                } catch (err: any) {
                  setModalError(err.message || 'Network error recording payment.');
                } finally {
                  setModalLoading(false);
                }
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {modalError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {modalError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Amount Received (₹)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Payment Gateway / Method</label>
                  <select
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                  >
                    <option value="Razorpay UPI">Razorpay UPI</option>
                    <option value="Razorpay NetBanking">Razorpay NetBanking</option>
                    <option value="Razorpay Card">Razorpay Card</option>
                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Transaction / Reference ID</label>
                <input
                  type="text"
                  value={paymentForm.transactionId}
                  onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={modalLoading} className="admin-btn admin-btn-primary">Verify & Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ENQUIRY DETAILS MODAL */}
      {activeModal === 'enquiry-detail' && enquiryDetails && (
        <div className="admin-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Enquiry Details</h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {modalError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {modalError}
                </div>
              )}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>{enquiryDetails.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{enquiryDetails.date}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#2563eb', marginBottom: '0.25rem' }}>{enquiryDetails.email}</div>
                {enquiryDetails.phone && <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{enquiryDetails.phone}</div>}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#334155' }}>
                  {enquiryDetails.message}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Update Status</label>
                <select
                  value={enquiryStatusUpdate}
                  onChange={e => setEnquiryStatusUpdate(e.target.value as any)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Replied">Replied</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Internal Follow-up Notes</label>
                <textarea
                  rows={3}
                  value={enquiryNotes}
                  onChange={e => setEnquiryNotes(e.target.value)}
                  placeholder="Record call summary, pricing quote sent, or next follow-up date..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setActiveModal(null)} className="admin-btn admin-btn-secondary">Close</button>
                <button
                  disabled={modalLoading}
                  onClick={async () => {
                    setModalLoading(true);
                    setModalError('');
                    try {
                      const res = await fetch('/api/admin/enquiries', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: enquiryDetails.id,
                          status: enquiryStatusUpdate,
                          notes: enquiryNotes
                        })
                      });
                      const json = await res.json();
                      if (!res.ok || !json.success) {
                        setModalError(json.error || 'Failed to update enquiry.');
                        setModalLoading(false);
                        return;
                      }
                      showToast('Enquiry updated.');
                      setActiveModal(null);
                      loadEnquiries();
                      loadDashboardData();
                    } catch (err: any) {
                      setModalError(err.message || 'Network error.');
                    } finally {
                      setModalLoading(false);
                    }
                  }}
                  className="admin-btn admin-btn-primary"
                >
                  {modalLoading ? 'Saving...' : 'Save Status & Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. SERVICE MODAL */}
      {activeModal === 'service-modal' && (
        <div className="admin-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {serviceForm.id ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setModalLoading(true);
                setModalError('');
                try {
                  const currentServices = websiteContent.services || [];
                  let updatedServices;
                  if (serviceForm.id) {
                    updatedServices = currentServices.map((s: any) =>
                      s.id === serviceForm.id ? { ...serviceForm } : s
                    );
                  } else {
                    const newSrv = {
                      ...serviceForm,
                      id: `srv-${Date.now()}`
                    };
                    updatedServices = [...currentServices, newSrv];
                  }

                  const res = await fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section: 'services', data: updatedServices })
                  });

                  const json = await res.json().catch(() => ({}));
                  if (!res.ok || json.success === false) {
                    setModalError(json.error || 'Failed to save service.');
                    setModalLoading(false);
                    return;
                  }

                  setWebsiteContent({ ...websiteContent, services: updatedServices });
                  showToast(`Service "${serviceForm.name}" saved.`);
                  setActiveModal(null);
                } catch (err: any) {
                  setModalError(err.message || 'Failed to save service.');
                } finally {
                  setModalLoading(false);
                }
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {modalError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {modalError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Service Name</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.name}
                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                    placeholder="e.g. Website Development"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Icon</label>
                  <select
                    value={serviceForm.icon}
                    onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                  >
                    <option value="globe">globe (Web)</option>
                    <option value="cpu">cpu (Software / API)</option>
                    <option value="smartphone">smartphone (Mobile / Android)</option>
                    <option value="graduation-cap">graduation-cap (School ERP)</option>
                    <option value="building">building (Library Management)</option>
                    <option value="wrench">wrench (Maintenance)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Tag / Badge</label>
                  <input
                    type="text"
                    value={serviceForm.tag}
                    onChange={e => setServiceForm({ ...serviceForm, tag: e.target.value })}
                    placeholder="e.g. Modern & Responsive"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Starting Price</label>
                  <input
                    type="text"
                    value={serviceForm.startingPrice}
                    onChange={e => setServiceForm({ ...serviceForm, startingPrice: e.target.value })}
                    placeholder="Custom Quote"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Summary displayed on cards"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Full Details & Specifications</label>
                <textarea
                  rows={3}
                  value={serviceForm.details}
                  onChange={e => setServiceForm({ ...serviceForm, details: e.target.value })}
                  placeholder="Detailed deliverables, architecture and scope..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="srv-pub-chk"
                  checked={serviceForm.published}
                  onChange={e => setServiceForm({ ...serviceForm, published: e.target.checked })}
                />
                <label htmlFor="srv-pub-chk" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Publish on Website
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={modalLoading} className="admin-btn admin-btn-primary">
                  {modalLoading ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. PROJECT MODAL */}
      {activeModal === 'project-modal' && (
        <div className="admin-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eaeff8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {projectForm.id ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }} aria-label="Close dialog"><CloseIcon /></button>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setModalLoading(true);
                setModalError('');
                try {
                  const currentProjects = websiteContent.projects || [];
                  const techArray = typeof projectForm.tech === 'string'
                    ? projectForm.tech.split(',').map(t => t.trim()).filter(Boolean)
                    : projectForm.tech;

                  const payload = {
                    ...projectForm,
                    tech: techArray
                  };

                  let updatedProjects;
                  if (projectForm.id) {
                    updatedProjects = currentProjects.map((p: any) =>
                      p.id === projectForm.id ? payload : p
                    );
                  } else {
                    const newProj = {
                      ...payload,
                      id: `proj-${Date.now()}`
                    };
                    updatedProjects = [...currentProjects, newProj];
                  }

                  const res = await fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section: 'projects', data: updatedProjects })
                  });

                  const json = await res.json().catch(() => ({}));
                  if (!res.ok || json.success === false) {
                    setModalError(json.error || 'Failed to save project.');
                    setModalLoading(false);
                    return;
                  }

                  setWebsiteContent({ ...websiteContent, projects: updatedProjects });
                  showToast(`Project "${projectForm.title}" saved.`);
                  setActiveModal(null);
                } catch (err: any) {
                  setModalError(err.message || 'Failed to save project.');
                } finally {
                  setModalLoading(false);
                }
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {modalError && (
                <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {modalError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Project Title</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="e.g. Gurukul Library"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Category</label>
                  <select
                    value={projectForm.category}
                    onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                  >
                    <option value="Websites">Websites</option>
                    <option value="School ERP">School ERP</option>
                    <option value="Library">Library</option>
                    <option value="Android Apps">Android Apps</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Live Website URL</label>
                  <input
                    type="text"
                    value={projectForm.link}
                    onChange={e => setProjectForm({ ...projectForm, link: e.target.value })}
                    placeholder="https://... or #"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Thumbnail Image Path</label>
                  <input
                    type="text"
                    value={projectForm.thumbnail}
                    onChange={e => setProjectForm({ ...projectForm, thumbnail: e.target.value })}
                    placeholder="/screens/erp-1.png"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Summary</label>
                <textarea
                  rows={2}
                  required
                  value={projectForm.summary}
                  onChange={e => setProjectForm({ ...projectForm, summary: e.target.value })}
                  placeholder="Short description of deliverables and architecture..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>GitHub Repo URL (Optional)</label>
                  <input
                    type="text"
                    value={projectForm.repoUrl}
                    onChange={e => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={projectForm.tech}
                    onChange={e => setProjectForm({ ...projectForm, tech: e.target.value })}
                    placeholder="Next.js, React, Node.js"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={e => setProjectForm({ ...projectForm, featured: e.target.checked })}
                  />
                  <span>Featured Project</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={projectForm.published}
                    onChange={e => setProjectForm({ ...projectForm, published: e.target.checked })}
                  />
                  <span>Published on Website</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveModal(null)} className="admin-btn admin-btn-secondary">Cancel</button>
                <button type="submit" disabled={modalLoading} className="admin-btn admin-btn-primary">
                  {modalLoading ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const token = extractSessionToken(context.req);
  const session = verifySession(token);

  return {
    props: {
      initialAuthenticated: Boolean(session && session.username),
      initialUser: session ? JSON.parse(JSON.stringify(session)) : null
    }
  };
}

