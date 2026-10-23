# AnshuCore — Software Development, Web & Android Apps

Official platform codebase for [AnshuCore](https://anshucore.in). Built with Next.js 15, React 19, and Tailwind CSS.

## 🚀 Features

- **Responsive Modern UI**: Built with Tailwind CSS and Framer Motion for smooth animations and micro-interactions.
- **Android APK Catalog**: Dynamic multi-app showcase featuring live GitHub Release statistics, asset downloads, and version tracking.
- **Service & Location Hubs**: Dedicated landing pages tailored for tech services across Uttar Pradesh (Mainpuri, Lucknow, Noida, etc.).
- **Comprehensive Admin Suite**:
  - APK Manager & Super APK placement
  - Service & Project portfolio manager
  - Interactive Enquiry & Client intake
  - Review moderation & Testimonials
  - Web Analytics & real-time traffic tracking
- **Serverless & Scalable**: Designed for zero-config deployment on Vercel with optional Upstash Redis cloud persistence.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Storage / Database**: Upstash Redis (Cloud Serverless) & Local JSON fallback
- **Hosting & CI/CD**: Vercel

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and configure:
```bash
cp .env.example .env.local
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the site.

### 4. Build for Production
```bash
npm run build
npm start
```

