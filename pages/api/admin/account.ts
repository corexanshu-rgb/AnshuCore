import type { NextApiRequest, NextApiResponse } from 'next';
import {
  requireAdminAuth,
  signSession,
  setSessionCookie,
  clearSessionCookie
} from '../../../lib/auth';
import {
  getStore,
  ensureAdminAccount,
  updateAdminEmail,
  updateAdminPassword
} from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Enforce Server-Side Administrator Authentication
  const auth = requireAdminAuth(req, res);
  if (!auth) return;

  const store = await getStore();
  const account = ensureAdminAccount(store);

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        name: account.name,
        role: account.role,
        updatedAt: account.updatedAt
      }
    });
  }

  if (req.method === 'POST') {
    const { action, currentEmail, newEmail, currentPassword, newPassword, confirmPassword } = req.body || {};

    if (action === 'change_email') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required to change administrator email.'
        });
      }
      if (!newEmail) {
        return res.status(400).json({
          success: false,
          error: 'New email address is required.'
        });
      }

      const result = await updateAdminEmail(currentEmail || account.email, newEmail, currentPassword);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      // Re-issue session cookie with updated email
      const updatedSession = {
        ...auth.user,
        email: result.email,
        updatedAt: new Date().toISOString()
      };
      const newToken = signSession(updatedSession);
      setSessionCookie(res, newToken);

      return res.status(200).json({
        success: true,
        message: 'Administrator email updated successfully.',
        email: result.email,
        user: updatedSession
      });
    }

    if (action === 'change_password') {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required.'
        });
      }
      if (!newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'New password and confirmation password are required.'
        });
      }

      const result = await updateAdminPassword(currentPassword, newPassword, confirmPassword);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      // Invalidate existing session requiring re-authentication
      clearSessionCookie(res);

      return res.status(200).json({
        success: true,
        requiresRelogin: true,
        message: 'Administrator password updated successfully. Please log in with your new password.'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Supported actions: change_email, change_password.'
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
