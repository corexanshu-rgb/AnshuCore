import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getStore, saveStore, logAdminAction } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      reviews: store.reviews
    });
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ success: false, error: 'Review ID and status are required.' });
    }

    const item = store.reviews.find(r => r.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    item.status = status;
    await saveStore(store);

    await logAdminAction(
      auth.user.username,
      'MODERATE_REVIEW',
      item.appName,
      `Changed review status to "${status}" for ${item.userName}'s review of ${item.appName}`
    );

    return res.status(200).json({
      success: true,
      review: item
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Review ID is required.' });
    }

    const index = store.reviews.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    const removed = store.reviews.splice(index, 1)[0];
    await saveStore(store);

    await logAdminAction(
      auth.user.username,
      'DELETE_REVIEW',
      removed.appName,
      `Removed review from ${removed.userName}`
    );

    return res.status(200).json({
      success: true,
      message: 'Review removed successfully.',
      reviews: store.reviews
    });
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
