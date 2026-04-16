import { SignJWT, jwtVerify } from 'jose';
import { parse as parseCookie, serialize as serializeCookie } from 'cookie';
import { sendJson } from './http.js';

const COOKIE_NAME = 'admin_token';
const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing environment variable: JWT_SECRET');
  return encoder.encode(secret);
}

export async function signAdminToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyAdminToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}

export function getAuthToken(req) {
  const cookies = parseCookie(req.headers.cookie || '');
  return cookies[COOKIE_NAME] || null;
}

export function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', serializeCookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }));
}

export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', serializeCookie(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  }));
}

export async function requireAdmin(req, res) {
  const token = getAuthToken(req);
  if (!token) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return null;
  }

  try {
    return await verifyAdminToken(token);
  } catch {
    sendJson(res, 401, { error: 'Invalid session' });
    return null;
  }
}
