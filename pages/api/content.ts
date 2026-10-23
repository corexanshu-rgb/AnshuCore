import type { NextApiRequest, NextApiResponse } from 'next';
import { getPublicWebsiteData } from '../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const data = await getPublicWebsiteData();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      success: true,
      data
    });
  } catch (err: any) {
    console.error('Error fetching public content:', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to retrieve content.'
    });
  }
}
