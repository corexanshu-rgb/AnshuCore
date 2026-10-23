import type { NextApiRequest, NextApiResponse } from 'next';
import { getStore, saveStore, Enquiry } from '../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { name, email, phone, service, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email address, and message are required fields.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    const store = await getStore();

    // Format current readable date e.g. "23 Oct 2026"
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newEnquiry: Enquiry = {
      id: `enq-${Date.now()}`,
      name: String(name).trim().substring(0, 100),
      email: String(email).trim().toLowerCase().substring(0, 120),
      phone: phone ? String(phone).trim().substring(0, 30) : undefined,
      service: service ? String(service).trim().substring(0, 80) : 'General Inquiry',
      message: String(message).trim().substring(0, 3000),
      status: 'New',
      date: dateFormatted,
      notes: 'Submitted via public contact form.'
    };

    store.enquiries.unshift(newEnquiry);
    await saveStore(store);

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received.',
      enquiryId: newEnquiry.id
    });
  } catch (err: any) {
    console.error('Error submitting public enquiry:', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to deliver message at this time. Please try again shortly.'
    });
  }
}
