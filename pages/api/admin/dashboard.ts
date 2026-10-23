import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getDashboardOverviewMetrics } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  try {
    const data = await getDashboardOverviewMetrics();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (err: any) {
    console.error('Error fetching admin dashboard metrics:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to compute dashboard metrics. Please try again.'
    });
  }
}
