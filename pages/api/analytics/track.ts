import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getClientIp } from '../../../lib/auth';
import { recordPageView } from '../../../lib/adminStore';

// In-memory rate limiting & deduplication cache (sliding window)
const recentTracks = new Map<string, number>();

// Clean up stale rate limits every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentTracks.entries()) {
    if (now - timestamp > 60 * 1000) {
      recentTracks.delete(key);
    }
  }
}, 5 * 60 * 1000);

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baidu/i,
  /duckduckbot/i,
  /slurp/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /headless/i,
  /chrome-lighthouse/i,
  /pingdom/i,
  /uptimerobot/i
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const userAgent = req.headers['user-agent'] || '';
    
    // Ignore known crawlers & search bots from inflating human traffic stats
    for (const pattern of BOT_PATTERNS) {
      if (pattern.test(userAgent)) {
        return res.status(200).json({ success: true, ignored: 'crawler' });
      }
    }

    const { path, referrer, visitorId } = req.body || {};
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid path is required' });
    }

    const cleanPath = path.split('?')[0].trim();

    // Exclude admin pages, private APIs, and static bundles
    if (
      cleanPath.startsWith('/hackertrac') ||
      cleanPath.startsWith('/admin') ||
      cleanPath.startsWith('/api') ||
      cleanPath.startsWith('/_next') ||
      cleanPath.includes('.')
    ) {
      return res.status(200).json({ success: true, ignored: 'private_or_asset' });
    }

    const ip = getClientIp(req);
    const now = Date.now();

    // Deduplicate same visitor hitting same path within 5 seconds
    const dedupKey = `${ip}:${cleanPath}`;
    const lastHit = recentTracks.get(dedupKey);
    if (lastHit && now - lastHit < 5000) {
      return res.status(200).json({ success: true, ignored: 'duplicate_cooldown' });
    }
    recentTracks.set(dedupKey, now);

    // Generate or sanitize privacy-friendly anonymous visitor ID
    let finalVisitorId = '';
    if (typeof visitorId === 'string' && /^[a-zA-Z0-9_-]{8,64}$/.test(visitorId)) {
      finalVisitorId = visitorId;
    } else {
      const today = new Date().toISOString().split('T')[0];
      finalVisitorId = crypto
        .createHash('sha256')
        .update(`${ip}:${userAgent}:${today}:anshucore_privacy_salt`)
        .digest('hex')
        .slice(0, 16);
    }

    await recordPageView(cleanPath, finalVisitorId, typeof referrer === 'string' ? referrer.slice(0, 200) : undefined);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Analytics track error:', err);
    return res.status(500).json({ success: false, error: 'Internal analytics error' });
  }
}
