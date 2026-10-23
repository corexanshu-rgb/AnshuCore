import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Sora, Manrope, IBM_Plex_Mono } from "next/font/google";
import "../styles/globals.css";
import "../styles/admin.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const DEFAULT_THEME = {
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

// Strict hex color validator to prevent untrusted CSS injection
function isSafeHex(val) {
  return typeof val === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.trim());
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const serverTheme = pageProps?.websiteData?.settings?.theme;
  const [activeTheme, setActiveTheme] = useState(serverTheme || DEFAULT_THEME);

  // Real, privacy-conscious visitor analytics tracking
  useEffect(() => {
    let visitorId = '';
    try {
      visitorId = localStorage.getItem('ac_vid') || '';
      if (!visitorId) {
        visitorId = 'vid_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('ac_vid', visitorId);
      }
    } catch {
      // Storage unavailable or disabled
    }

    const sendPageView = (url) => {
      const path = (url || window.location.pathname || '/').split('?')[0];

      // Never track admin console or API paths
      if (
        path.startsWith('/hackertrac') ||
        path.startsWith('/admin') ||
        path.startsWith('/api') ||
        path.includes('.')
      ) {
        return;
      }

      const payload = JSON.stringify({
        path,
        visitorId,
        referrer: typeof document !== 'undefined' ? document.referrer : ''
      });

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    };

    // Track initial page load
    sendPageView(router.asPath);

    // Track SPA route changes
    const handleRouteChange = (url) => {
      sendPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, router.asPath]);

  useEffect(() => {
    if (serverTheme) {
      setActiveTheme(serverTheme);
      return;
    }
    // Client-side fetch if theme was not provided via SSR props
    fetch('/api/theme')
      .then((res) => res.json())
      .then((data) => {
        if (data?.theme) setActiveTheme(data.theme);
      })
      .catch(() => {});
  }, [serverTheme]);

  // Sanitize every property before injecting
  const safeTheme = {
    primary: isSafeHex(activeTheme?.primary) ? activeTheme.primary : DEFAULT_THEME.primary,
    secondary: isSafeHex(activeTheme?.secondary) ? activeTheme.secondary : DEFAULT_THEME.secondary,
    background: isSafeHex(activeTheme?.background) ? activeTheme.background : DEFAULT_THEME.background,
    surface: isSafeHex(activeTheme?.surface) ? activeTheme.surface : DEFAULT_THEME.surface,
    text: isSafeHex(activeTheme?.text) ? activeTheme.text : DEFAULT_THEME.text,
    muted: isSafeHex(activeTheme?.muted) ? activeTheme.muted : DEFAULT_THEME.muted,
    border: isSafeHex(activeTheme?.border) ? activeTheme.border : DEFAULT_THEME.border,
    button: isSafeHex(activeTheme?.button) ? activeTheme.button : DEFAULT_THEME.button,
    buttonText: isSafeHex(activeTheme?.buttonText) ? activeTheme.buttonText : DEFAULT_THEME.buttonText,
    link: isSafeHex(activeTheme?.link) ? activeTheme.link : DEFAULT_THEME.link,
    headerBg: isSafeHex(activeTheme?.headerBg) ? activeTheme.headerBg : DEFAULT_THEME.headerBg,
    footerBg: isSafeHex(activeTheme?.footerBg) ? activeTheme.footerBg : DEFAULT_THEME.footerBg,
  };

  const cssVariables = `
    :root {
      --color-primary: ${safeTheme.primary};
      --color-secondary: ${safeTheme.secondary};
      --color-background: ${safeTheme.background};
      --color-surface: ${safeTheme.surface};
      --color-text: ${safeTheme.text};
      --color-muted: ${safeTheme.muted};
      --color-border: ${safeTheme.border};
      --color-button: ${safeTheme.button};
      --color-button-text: ${safeTheme.buttonText};
      --color-link: ${safeTheme.link};
      --color-header: ${safeTheme.headerBg};
      --color-footer: ${safeTheme.footerBg};
    }
  `;

  return (
    <>
      <Head>
        <style id="anshucore-active-theme" dangerouslySetInnerHTML={{ __html: cssVariables }} />
      </Head>
      <main className={`${sora.variable} ${manrope.variable} ${plexMono.variable} font-body`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
