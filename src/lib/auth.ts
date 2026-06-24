import crypto from 'crypto';
import { prisma } from './prisma';
import { cookies } from 'next/headers';

// Hash password using PBKDF2 (secure, no external dependencies)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Verify password against stored hash
export function verifyPassword(password: string, storedValue: string): boolean {
  const parts = storedValue.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Retrieve currently authenticated admin based on cookie session token
export async function getSessionAdmin() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sutanting_admin_session');
    if (!sessionCookie?.value) return null;

    // Find token in DB
    const session = await prisma.session.findUnique({
      where: { token: sessionCookie.value },
      include: { admin: true },
    });

    if (!session) return null;

    // Check expiry
    if (new Date() > session.expiresAt) {
      // Clean up expired session asynchronously
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    return session.admin;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

// Standard boolean check for page / route authorization guards
export async function isAuthenticated() {
  const admin = await getSessionAdmin();
  return admin !== null;
}
