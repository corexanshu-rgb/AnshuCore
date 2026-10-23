import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getStore, saveStore, logAdminAction } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();

  if (req.method === 'GET') {
    const { status, query } = req.query;
    let list = [...store.enquiries];

    if (status && typeof status === 'string' && status !== 'All') {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }

    if (query && typeof query === 'string') {
      const q = query.toLowerCase();
      list = list.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.service.toLowerCase().includes(q) ||
          e.message.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      enquiries: list
    });
  }

  if (req.method === 'PATCH') {
    const { id, status, notes } = req.body || {};
    if (!id) {
      return res.status(400).json({ success: false, error: 'Enquiry ID is required.' });
    }

    const item = store.enquiries.find(e => e.id === id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }

    if (status) {
      item.status = status;
    }
    if (notes !== undefined) {
      item.notes = String(notes).trim();
    }

    await saveStore(store);
    await logAdminAction(
      auth.user.username,
      'UPDATE_ENQUIRY',
      item.name,
      `Updated status to "${item.status}" for enquiry from ${item.name}`
    );

    return res.status(200).json({
      success: true,
      enquiry: item
    });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Enquiry ID is required.' });
    }

    const index = store.enquiries.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }

    const removed = store.enquiries.splice(index, 1)[0];
    await saveStore(store);
    await logAdminAction(
      auth.user.username,
      'DELETE_ENQUIRY',
      removed.name,
      `Deleted enquiry from ${removed.name} (${removed.service})`
    );

    return res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully.',
      enquiries: store.enquiries
    });
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
