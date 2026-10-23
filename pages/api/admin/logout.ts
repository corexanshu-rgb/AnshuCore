import type { NextApiRequest, NextApiResponse } from 'next';
import { clearSessionCookie, extractSessionToken, verifySession } from '../../../lib/auth';
import { logAdminAction } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const token = extractSessionToken(req);
  const session = verifySession(token);
  if (session?.username) {
    await logAdminAction(
      session.username,
      'LOGOUT',
      'Admin Console',
      'Administrator logged out voluntarily.'
    );
  }

  clearSessionCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}
