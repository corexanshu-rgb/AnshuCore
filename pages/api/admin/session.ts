import type { NextApiRequest, NextApiResponse } from 'next';
import { extractSessionToken, verifySession, clearSessionCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const token = extractSessionToken(req);
  const session = verifySession(token);

  if (!session) {
    clearSessionCookie(res);
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Session expired or invalid.'
    });
  }

  return res.status(200).json({
    success: true,
    authenticated: true,
    user: {
      id: session.id,
      username: session.username,
      email: session.email,
      name: session.name,
      role: session.role
    }
  });
}
