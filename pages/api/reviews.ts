import type { NextApiRequest, NextApiResponse } from 'next';
import { getStore, saveStore } from '../../lib/adminStore';

// Simple in-memory rate limiting map: IP -> timestamp
const ipRateMap = new Map<string, number>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Rate limiting: 1 submission per 60 seconds per IP
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const lastTime = ipRateMap.get(clientIp);
  if (lastTime && now - lastTime < 60000) {
    return res.status(429).json({
      success: false,
      error: 'Please wait a moment before submitting another review.'
    });
  }
  ipRateMap.set(clientIp, now);

  const { appSlug, appName, userName, rating, comment } = req.body || {};

  if (!appSlug || !userName || !comment) {
    return res.status(400).json({
      success: false,
      error: 'Name, review text, and app are required.'
    });
  }

  const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

  try {
    const store = await getStore();
    const newReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      appSlug: String(appSlug).trim(),
      appName: String(appName || appSlug).trim(),
      userName: String(userName).trim().slice(0, 60),
      rating: numericRating,
      comment: String(comment).trim().slice(0, 500),
      status: 'Pending' as const, // Stays private until approved in admin panel
      date: new Date().toISOString().split('T')[0]
    };

    store.reviews.push(newReview);
    await saveStore(store);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted for moderation and will appear once approved by the administrator.'
    });
  } catch (err: any) {
    console.error('Error submitting review:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit review. Please try again.'
    });
  }
}
