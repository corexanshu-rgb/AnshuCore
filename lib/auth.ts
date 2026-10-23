import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

const SESSION_COOKIE_NAME = 'anshu_admin_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Salt & secret fallback
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'anshucore_admin_session_secret_key_prod_2026';
export const DEFAULT_ADMIN_USER = {
  id: 'usr_admin_1',
  username: process.env.ADMIN_USERNAME || 'Anshu',
  email: process.env.ADMIN_EMAIL || 'admin@anshucore.in',
  name: process.env.ADMIN_USERNAME || 'Anshu',
  role: 'Super Admin'
};

// In-memory rate limiting map
interface RateLimitEntry {
  attempts: number;
  lockedUntil: number;
}
const loginRateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Clean up stale rate limits
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginRateLimitMap.entries()) {
    if (entry.lockedUntil > 0 && entry.lockedUntil < now) {
      loginRateLimitMap.delete(ip);
    }
  }
}, 60 * 1000);

export function checkLoginRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);
  if (!entry) return { allowed: true };

  if (entry.lockedUntil > now) {
    const waitSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}

export function recordLoginFailure(ip: string): { locked: boolean; waitSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0 };
  entry.attempts += 1;

  if (entry.attempts >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000; // 15 min lock
    loginRateLimitMap.set(ip, entry);
    return { locked: true, waitSeconds: 15 * 60 };
  }

  loginRateLimitMap.set(ip, entry);
  return { locked: false };
}

export function resetLoginRateLimit(ip: string): void {
  loginRateLimitMap.delete(ip);
}

/**
 * Sign session payload to JWT-like format with HMAC SHA-256
 */
export function signSession(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifySession(token: string | null | undefined): Record<string, any> | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get client IP address safely
 */
export function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Hash password securely using Node.js crypto.scryptSync with 16-byte random salt
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Verify password against stored scrypt hash and salt using timingSafeEqual
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    const bufA = Buffer.from(computed, 'hex');
    const bufB = Buffer.from(hash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Verify plain text or SHA-256 hash using timing-safe comparison
 */
export function verifyPlainOrSha256(inputPassword: string, expectedPlainOrHash: string): boolean {
  if (!inputPassword || !expectedPlainOrHash) return false;
  try {
    const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
    if (expectedPlainOrHash.length === 64 && /^[0-9a-fA-F]+$/.test(expectedPlainOrHash)) {
      const bufA = Buffer.from(inputHash, 'hex');
      const bufB = Buffer.from(expectedPlainOrHash.toLowerCase(), 'hex');
      return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
    }
    const expectedHash = crypto.createHash('sha256').update(expectedPlainOrHash).digest('hex');
    const bufA = Buffer.from(inputHash, 'hex');
    const bufB = Buffer.from(expectedHash, 'hex');
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Verify admin password using timing-safe comparison
 */
export function verifyAdminPassword(inputPassword: string): boolean {
  if (typeof inputPassword !== 'string' || !inputPassword) return false;

  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const envPlain = process.env.ADMIN_PASSWORD;

  if (envHash) {
    return verifyPlainOrSha256(inputPassword, envHash);
  }
  if (envPlain) {
    return verifyPlainOrSha256(inputPassword, envPlain);
  }

  return false;
}

/**
 * Set HttpOnly session cookie
 */
export function setSessionCookie(res: NextApiResponse, token: string): void {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const cookieOptions = [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
    isProd ? 'Secure' : ''
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieOptions);
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(res: NextApiResponse): void {
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const cookieOptions = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    isProd ? 'Secure' : ''
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieOptions);
}

/**
 * Extract session token from request (Cookie or Authorization header)
 */
export function extractSessionToken(req: NextApiRequest): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check Cookie header
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );
    if (cookies[SESSION_COOKIE_NAME]) {
      return cookies[SESSION_COOKIE_NAME];
    }
  }

  return null;
}

/**
 * Middleware: Verify Admin Authentication for API routes
 */
export function requireAdminAuth(
  req: NextApiRequest,
  res: NextApiResponse
): { user: Record<string, any> } | null {
  const token = extractSessionToken(req);
  const session = verifySession(token);

  if (!session || !session.username) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid administrator session required.'
    });
    return null;
  }

  return { user: session };
}
