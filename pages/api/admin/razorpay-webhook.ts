import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getStore, saveStore, logAdminAction, PaymentRecord } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  // In production, signature verification is strictly enforced
  if (webhookSecret) {
    if (!signature) {
      return res.status(400).json({ success: false, error: 'Missing Razorpay signature header.' });
    }

    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Razorpay webhook signature mismatch.');
      return res.status(400).json({ success: false, error: 'Invalid webhook signature.' });
    }
  } else {
    // If webhook secret is not yet configured, log warning and document setup
    console.warn('RAZORPAY_WEBHOOK_SECRET not set in environment. Webhook received in test/staging mode.');
  }

  try {
    const event = req.body;
    const eventType = event?.event;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event?.payload?.payment?.entity;
      const amountPaise = paymentEntity?.amount || 0;
      const amountRupees = amountPaise / 100;
      const transactionId = paymentEntity?.id || `rzp_${Date.now()}`;
      const notes = paymentEntity?.notes || {};
      const tenantId = notes.tenantId;
      const invoiceNumber = notes.invoiceNumber;

      const store = await getStore();

      // Find matching invoice
      let invoice = invoiceNumber ? store.invoices.find(i => i.invoiceNumber === invoiceNumber) : null;
      if (!invoice && tenantId) {
        invoice = store.invoices.find(i => i.tenantId === tenantId && i.status !== 'Paid');
      }

      if (invoice) {
        invoice.status = 'Paid';
        invoice.paidAt = new Date().toISOString().substring(0, 10);
        invoice.razorpayPaymentId = transactionId;
        invoice.paymentMethod = paymentEntity?.method || 'Razorpay Online';

        // Unlock library if suspended due to payment
        const library = store.libraries.find(l => l.tenantId === invoice?.tenantId);
        if (library && library.isLocked && library.lockReason?.includes('overdue')) {
          library.isLocked = false;
          library.status = 'Active';
          library.lockReason = undefined;
        }

        const paymentRecord: PaymentRecord = {
          id: `pay-${Date.now()}`,
          invoiceId: invoice.id,
          tenantId: invoice.tenantId,
          libraryName: invoice.libraryName,
          amount: amountRupees || invoice.amount,
          transactionId,
          method: `Razorpay (${paymentEntity?.method || 'Card/UPI'})`,
          status: 'Verified',
          verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        store.payments.unshift(paymentRecord);
        await saveStore(store);

        await logAdminAction(
          'RAZORPAY_WEBHOOK',
          'PAYMENT_CAPTURED',
          invoice.invoiceNumber,
          `Verified payment of ₹${paymentRecord.amount} from ${invoice.libraryName} via Razorpay Webhook (${transactionId}).`
        );
      }

      return res.status(200).json({ status: 'ok', processed: true });
    }

    return res.status(200).json({ status: 'ignored', event: eventType });
  } catch (err: any) {
    console.error('Razorpay webhook processing error:', err);
    return res.status(500).json({ success: false, error: 'Internal webhook error' });
  }
}
