import type { NextApiRequest, NextApiResponse } from 'next';
import {
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
  signSession,
  setSessionCookie,
  getClientIp,
  verifyPassword,
  verifyPlainOrSha256
} from '../../../lib/auth';
import { getStore, ensureAdminAccount, logAdminAction } from '../../../lib/adminStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const ip = getClientIp(req);
  const rateLimit = checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      error: `Too many failed login attempts. Please wait ${rateLimit.waitSeconds} seconds before trying again.`
    });
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both username/email and password.'
      });
    }

    const store = await getStore();
    const account = ensureAdminAccount(store);

    const cleanInputUser = String(username).trim().toLowerCase();
    const isUserMatch =
      cleanInputUser === account.username.toLowerCase() ||
      cleanInputUser === account.email.toLowerCase();

    const inputPass = String(password);
    const isPassMatch = (account.passwordHash && account.salt)
      ? verifyPassword(inputPass, account.passwordHash, account.salt)
      : verifyPlainOrSha256(inputPass, process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || '');

    if (!isUserMatch || !isPassMatch) {
      const failure = recordLoginFailure(ip);
      await logAdminAction(
        cleanInputUser || 'Unknown',
        'LOGIN_FAILED',
        'Admin Console',
        `Failed authentication attempt from IP ${ip}`
      );

      if (failure.locked) {
        return res.status(429).json({
          success: false,
          error: 'Maximum login attempts exceeded. Account locked for 15 minutes.'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials. Please check your username/email and password.'
      });
    }

    // Success
    resetLoginRateLimit(ip);
    const sessionPayload = {
      id: account.id || 'usr_admin_1',
      username: account.username,
      email: account.email,
      name: account.name || account.username,
      role: account.role || 'Super Admin',
      loginTime: new Date().toISOString()
    };

    const token = signSession(sessionPayload);
    setSessionCookie(res, token);

    await logAdminAction(
      account.username,
      'LOGIN_SUCCESS',
      'Admin Console',
      `Administrator authenticated successfully from IP ${ip}`
    );

    return res.status(200).json({
      success: true,
      token,
      user: sessionPayload
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected authentication error occurred. Please try again.'
    });
  }
}
