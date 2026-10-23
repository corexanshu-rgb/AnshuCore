import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getWebsiteAnalyticsMetrics } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const metrics = await getWebsiteAnalyticsMetrics();
    return res.status(200).json({
      success: true,
      ...metrics
    });
  } catch (err: any) {
    console.error('Admin analytics fetch error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve website analytics data.'
    });
  }
}
