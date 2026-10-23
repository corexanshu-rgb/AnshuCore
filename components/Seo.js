import Head from "next/head";

export const DEFAULT_CANONICAL_BASE = "https://anshucore.in";
export const DEFAULT_OG_IMAGE = `${DEFAULT_CANONICAL_BASE}/assets/anshucore-og.png`;
export const SITE_NAME = "AnshuCore";

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  keywords,
  canonicalBase = DEFAULT_CANONICAL_BASE,
  gscVerification,
  breadcrumbs,
  jsonLd,
}) {
  const base = (canonicalBase || DEFAULT_CANONICAL_BASE).trim().replace(/\/+$/, "");
  const cleanPath = !path || path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  const canonicalUrl = `${base}${cleanPath}`;

  const fullTitle = title || "AnshuCore — Website Development, Android Apps & Custom Software";
  const metaDescription =
    description ||
    "AnshuCore builds modern responsive websites, custom software, Android applications, school ERPs, and library management software in Mainpuri, Uttar Pradesh, and across India.";

  const fullImageUrl = image.startsWith("http")
    ? image
    : `${base}${image.startsWith("/") ? "" : "/"}${image}`;

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": base,
    "logo": `${base}/assets/anshucore-logo.svg`,
    "image": fullImageUrl,
    "description": metaDescription,
    "founder": {
      "@type": "Person",
      "name": "Anshu",
    },
    "sameAs": [
      "https://github.com/indbite-web",
      "https://twitter.com/corexanshu",
      "https://linkedin.com/in/corexanshu",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support & Project Inquiries",
      "email": "corexanshu@gmail.com",
      "availableLanguage": ["English", "Hindi"],
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Mainpuri, Uttar Pradesh",
      },
      {
        "@type": "State",
        "name": "Uttar Pradesh",
      },
      {
        "@type": "Country",
        "name": "India",
      },
    ],
  };

  // WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": base,
  };

  // Breadcrumb Schema
  let breadcrumbSchema = null;
  if (breadcrumbs && breadcrumbs.length > 0) {
    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": base,
        },
        ...breadcrumbs.map((b, idx) => ({
          "@type": "ListItem",
          "position": idx + 2,
          "name": b.name,
          "item": b.path.startsWith("http") ? b.path : `${base}${b.path.startsWith("/") ? "" : "/"}${b.path}`,
        })),
      ],
    };
  }

  // Combined schemas
  const schemas = [organizationSchema, websiteSchema];
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);
  if (jsonLd) {
    if (Array.isArray(jsonLd)) {
      schemas.push(...jsonLd);
    } else {
      schemas.push(jsonLd);
    }
  }

  const robotsDirective = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title key="title">{fullTitle}</title>
      <meta name="title" content={fullTitle} key="meta-title" />
      <meta name="description" content={metaDescription} key="description" />
      {keywords && <meta name="keywords" content={keywords} key="keywords" />}
      <link rel="canonical" href={canonicalUrl} key="canonical" />
      <meta name="robots" content={robotsDirective} key="robots" />

      {/* Google Site Verification if configured */}
      {gscVerification && (
        <meta
          name="google-site-verification"
          content={gscVerification}
          key="google-site-verification"
        />
      )}

      {/* Open Graph / Facebook / LinkedIn / WhatsApp */}
      <meta property="og:type" content={type} key="og:type" />
      <meta property="og:site_name" content={SITE_NAME} key="og:site_name" />
      <meta property="og:url" content={canonicalUrl} key="og:url" />
      <meta property="og:title" content={fullTitle} key="og:title" />
      <meta property="og:description" content={metaDescription} key="og:description" />
      <meta property="og:image" content={fullImageUrl} key="og:image" />
      <meta property="og:image:width" content="1200" key="og:image:width" />
      <meta property="og:image:height" content="630" key="og:image:height" />
      <meta property="og:image:alt" content={`${SITE_NAME} — Software Development & Digital Solutions`} key="og:image:alt" />
      <meta property="og:locale" content="en_IN" key="og:locale" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
      <meta name="twitter:site" content="@corexanshu" key="twitter:site" />
      <meta name="twitter:creator" content="@corexanshu" key="twitter:creator" />
      <meta name="twitter:url" content={canonicalUrl} key="twitter:url" />
      <meta name="twitter:title" content={fullTitle} key="twitter:title" />
      <meta name="twitter:description" content={metaDescription} key="twitter:description" />
      <meta name="twitter:image" content={fullImageUrl} key="twitter:image" />

      {/* Structured Data */}
      {schemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}
