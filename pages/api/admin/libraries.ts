import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getStore, saveStore, logAdminAction, LibraryTenant } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      libraries: store.libraries
    });
  }

  // PATCH: Lock or Unlock specific tenant
  if (req.method === 'PATCH') {
    const { tenantId, action, reason } = req.body || {};

    if (!tenantId || !action) {
      return res.status(400).json({
        success: false,
        error: 'tenantId and action ("lock" | "unlock") are required.'
      });
    }

    const library = store.libraries.find(l => l.tenantId === tenantId);
    if (!library) {
      return res.status(404).json({
        success: false,
        error: `Library with tenant identifier "${tenantId}" not found.`
      });
    }

    const isLocking = action === 'lock';
    library.isLocked = isLocking;
    library.status = isLocking ? 'Suspended' : 'Active';
    library.lockReason = isLocking
      ? (reason ? String(reason).trim() : 'Manual administrator suspension')
      : undefined;

    // Remote sync attempt if host is accessible
    let remoteSyncResult: { attempted: boolean; success: boolean; message: string } = {
      attempted: false,
      success: false,
      message: 'Remote host not contacted'
    };

    if (library.hostUrl && library.hostUrl.startsWith('http')) {
      try {
        remoteSyncResult.attempted = true;
        const controllerSecret = store.settings.lockWebhookSecret || 'anshucore_lock_wh_sec_2026';
        
        // Timeout after 3 seconds so admin dashboard never hangs on offline client host
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const remoteRes = await fetch(`${library.hostUrl.replace(/\/+$/, '')}/api/admin-ops/lock-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-AnshuCore-Secret': controllerSecret,
            'X-Tenant-Id': tenantId
          },
          body: JSON.stringify({
            tenantId,
            isLocked: isLocking,
            reason: library.lockReason,
            timestamp: new Date().toISOString()
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (remoteRes.ok) {
          remoteSyncResult.success = true;
          remoteSyncResult.message = `Remote host acknowledged ${action}.`;
        } else {
          remoteSyncResult.message = `Remote host returned status ${remoteRes.status}. State saved in controller.`;
        }
      } catch (e: any) {
        remoteSyncResult.message = `Remote host unreachable (${e.message || 'offline'}). Central controller state updated.`;
      }
    }

    await saveStore(store);
    await logAdminAction(
      auth.user.username,
      isLocking ? 'LIBRARY_LOCKED' : 'LIBRARY_UNLOCKED',
      tenantId,
      `${isLocking ? 'Locked' : 'Unlocked'} access for ${library.name} (${tenantId}). Reason: ${library.lockReason || 'None'}. ${remoteSyncResult.message}`
    );

    return res.status(200).json({
      success: true,
      library,
      remoteSync: remoteSyncResult
    });
  }

  // POST: Create or Update Library Registration
  if (req.method === 'POST') {
    const {
      id,
      tenantId,
      name,
      hostUrl,
      plan,
      monthlyAmount,
      billingDate,
      nextDue,
      gracePeriodDays,
      contactEmail
    } = req.body || {};

    if (!name || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Library name and unique tenant ID are required.'
      });
    }

    const cleanTenantId = String(tenantId).toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');

    if (id) {
      const index = store.libraries.findIndex(l => l.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Library record not found.' });
      }

      store.libraries[index] = {
        ...store.libraries[index],
        name: String(name).trim(),
        tenantId: cleanTenantId,
        hostUrl: hostUrl ? String(hostUrl).trim() : store.libraries[index].hostUrl,
        plan: plan ? String(plan).trim() : store.libraries[index].plan,
        monthlyAmount: monthlyAmount !== undefined ? Number(monthlyAmount) : store.libraries[index].monthlyAmount,
        billingDate: billingDate ? String(billingDate).trim() : store.libraries[index].billingDate,
        nextDue: nextDue ? String(nextDue).trim() : store.libraries[index].nextDue,
        gracePeriodDays: gracePeriodDays !== undefined ? Number(gracePeriodDays) : store.libraries[index].gracePeriodDays,
        contactEmail: contactEmail ? String(contactEmail).trim() : store.libraries[index].contactEmail
      };

      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'UPDATE_LIBRARY',
        cleanTenantId,
        `Updated registration details for ${name}`
      );

      return res.status(200).json({
        success: true,
        library: store.libraries[index]
      });
    } else {
      if (store.libraries.some(l => l.tenantId === cleanTenantId)) {
        return res.status(400).json({
          success: false,
          error: `A library with tenant ID "${cleanTenantId}" is already registered.`
        });
      }

      const newLib: LibraryTenant = {
        id: `lib-${Date.now()}`,
        tenantId: cleanTenantId,
        name: String(name).trim(),
        hostUrl: hostUrl ? String(hostUrl).trim() : 'http://localhost:5000',
        plan: plan ? String(plan).trim() : 'Standard Monthly',
        monthlyAmount: Number(monthlyAmount) || 1000,
        billingDate: billingDate ? String(billingDate).trim() : '1st',
        nextDue: nextDue ? String(nextDue).trim() : 'Next Month',
        status: 'Active',
        isLocked: false,
        gracePeriodDays: Number(gracePeriodDays) || 5,
        lastPing: new Date().toISOString(),
        contactEmail: contactEmail ? String(contactEmail).trim() : ''
      };

      store.libraries.push(newLib);
      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'REGISTER_LIBRARY',
        cleanTenantId,
        `Registered new library ${name} on plan ${newLib.plan}`
      );

      return res.status(201).json({
        success: true,
        library: newLib
      });
    }
  }

  // DELETE: Delete library
  if (req.method === 'DELETE') {
    const { id, force } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Library ID is required.' });
    }

    const index = store.libraries.findIndex(l => l.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Library not found.' });
    }

    const targetLib = store.libraries[index];

    // Check foreign key dependencies: unpaid invoices
    const pendingInvoices = store.invoices.filter(i => i.tenantId === targetLib.tenantId && i.status !== 'Paid');
    if (pendingInvoices.length > 0 && force !== 'true') {
      return res.status(400).json({
        success: false,
        error: `Cannot delete library "${targetLib.name}" because it has ${pendingInvoices.length} pending invoice(s). Resolve them first or confirm force deletion.`,
        hasPendingInvoices: true
      });
    }

    const removed = store.libraries.splice(index, 1)[0];
    if (force === 'true') {
      store.invoices = store.invoices.filter(i => i.tenantId !== removed.tenantId);
      store.payments = store.payments.filter(p => p.tenantId !== removed.tenantId);
    }

    await saveStore(store);
    await logAdminAction(
      auth.user.username,
      'DELETE_LIBRARY',
      removed.tenantId,
      `Removed library registration for "${removed.name}"`
    );

    return res.status(200).json({
      success: true,
      message: `Library "${removed.name}" deleted successfully.`,
      libraries: store.libraries
    });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
