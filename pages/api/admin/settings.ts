import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getStore, saveStore, logAdminAction } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();

  if (req.method === 'GET') {
    const { action } = req.query;

    if (action === 'backup') {
      // Export full clean JSON backup
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=anshucore-backup-${Date.now()}.json`);
      return res.status(200).send(JSON.stringify(store, null, 2));
    }

    return res.status(200).json({
      success: true,
      settings: store.settings,
      auditLogs: store.auditLogs
    });
  }

  if (req.method === 'POST') {
    const { action, settings, backupPayload } = req.body || {};

    // 1. Update settings
    if (action === 'update_settings' && settings) {
      store.settings = {
        ...store.settings,
        ...settings
      };
      await saveStore(store);

      await logAdminAction(
        auth.user.username,
        'UPDATE_SETTINGS',
        'System Configuration',
        'Admin settings updated'
      );

      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully.',
        settings: store.settings
      });
    }

    // 2. Restore from backup payload safely
    if (action === 'restore_backup' && backupPayload) {
      if (!backupPayload.enquiries || !backupPayload.apks || !backupPayload.libraries) {
        return res.status(400).json({
          success: false,
          error: 'Invalid backup structure. Required keys missing.'
        });
      }

      store.enquiries = backupPayload.enquiries;
      store.apks = backupPayload.apks;
      store.libraries = backupPayload.libraries;
      if (backupPayload.invoices) store.invoices = backupPayload.invoices;
      if (backupPayload.payments) store.payments = backupPayload.payments;
      if (backupPayload.websiteContent) store.websiteContent = backupPayload.websiteContent;
      if (backupPayload.settings) store.settings = backupPayload.settings;

      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'RESTORE_BACKUP',
        'System Database',
        'Restored database from uploaded JSON backup payload.'
      );

      return res.status(200).json({
        success: true,
        message: 'System restored from backup successfully.'
      });
    }

    return res.status(400).json({ success: false, error: 'Valid action required.' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
