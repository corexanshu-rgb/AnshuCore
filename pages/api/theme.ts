import type { NextApiRequest, NextApiResponse } from 'next';
import { getStore, DEFAULT_THEME } from '../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const store = await getStore();
    return res.status(200).json({
      success: true,
      theme: store.settings?.theme || DEFAULT_THEME
    });
  } catch (e: any) {
    return res.status(200).json({
      success: true,
      theme: DEFAULT_THEME
    });
  }
}
