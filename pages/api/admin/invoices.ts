import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminAuth } from '../../../lib/auth';
import { getStore, saveStore, logAdminAction, Invoice, PaymentRecord } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      invoices: store.invoices,
      payments: store.payments
    });
  }

  if (req.method === 'POST') {
    const { action } = req.body || {};

    // 1. Create Invoice
    if (action === 'create_invoice') {
      const { tenantId, amount, dueDate, notes } = req.body || {};
      if (!tenantId || !amount) {
        return res.status(400).json({ success: false, error: 'tenantId and amount are required.' });
      }

      const library = store.libraries.find(l => l.tenantId === tenantId);
      if (!library) {
        return res.status(404).json({ success: false, error: 'Selected library tenant not found.' });
      }

      const count = store.invoices.length + 1;
      const invNum = `INV-2026-${1000 + count}`;
      const now = new Date();
      const issueDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      const newInv: Invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invNum,
        tenantId,
        libraryName: library.name,
        amount: Number(amount),
        issueDate,
        dueDate: dueDate || library.nextDue,
        status: 'Pending'
      };

      store.invoices.unshift(newInv);
      await saveStore(store);
      await logAdminAction(
        auth.user.username,
        'CREATE_INVOICE',
        invNum,
        `Generated maintenance invoice ${invNum} for ${library.name} (Amount: ₹${amount})`
      );

      return res.status(201).json({
        success: true,
        invoice: newInv
      });
    }

    // 2. Record Verified Payment
    if (action === 'record_payment') {
      const { invoiceId, amount, method, transactionId } = req.body || {};
      if (!invoiceId) {
        return res.status(400).json({ success: false, error: 'invoiceId is required.' });
      }

      const inv = store.invoices.find(i => i.id === invoiceId);
      if (!inv) {
        return res.status(404).json({ success: false, error: 'Invoice not found.' });
      }

      const payAmount = Number(amount) || inv.amount;
      inv.status = 'Paid';
      inv.paidAt = new Date().toISOString().substring(0, 10);
      inv.paymentMethod = method || 'Razorpay UPI';

      // If library was locked due to payment overdue, unlock if appropriate
      const library = store.libraries.find(l => l.tenantId === inv.tenantId);
      if (library && library.isLocked && library.lockReason?.includes('overdue')) {
        library.isLocked = false;
        library.status = 'Active';
        library.lockReason = undefined;
      }

      const paymentRecord: PaymentRecord = {
        id: `pay-${Date.now()}`,
        invoiceId,
        tenantId: inv.tenantId,
        libraryName: inv.libraryName,
        amount: payAmount,
        transactionId: transactionId || `TXN_${Date.now().toString().slice(-6)}`,
        method: method || 'Razorpay Verified',
        status: 'Verified',
        verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      store.payments.unshift(paymentRecord);
      await saveStore(store);

      await logAdminAction(
        auth.user.username,
        'PAYMENT_RECORDED',
        inv.invoiceNumber,
        `Recorded verified payment of ₹${payAmount} for ${inv.libraryName} (Method: ${paymentRecord.method})`
      );

      return res.status(200).json({
        success: true,
        invoice: inv,
        payment: paymentRecord
      });
    }

    return res.status(400).json({ success: false, error: 'Valid action required ("create_invoice" | "record_payment").' });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Invoice ID is required.' });
    }

    const index = store.invoices.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Invoice not found.' });
    }

    const removed = store.invoices.splice(index, 1)[0];
    await saveStore(store);
    await logAdminAction(
      auth.user.username,
      'DELETE_INVOICE',
      removed.invoiceNumber,
      `Deleted invoice ${removed.invoiceNumber} for ${removed.libraryName} (Amount: ₹${removed.amount})`
    );

    return res.status(200).json({
      success: true,
      message: `Invoice ${removed.invoiceNumber} deleted successfully.`,
      invoices: store.invoices
    });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
