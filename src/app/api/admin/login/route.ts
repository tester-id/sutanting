import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan Password wajib diisi!' },
        { status: 400 }
      );
    }

    // 1. Fetch Admin from DB
    const admin = await prisma.admin.findUnique({
      where: { username: username.trim() },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Username atau Password salah!' },
        { status: 401 }
      );
    }

    // 2. Verify password hash using the new pbkdf2 verifier
    const isValid = verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Username atau Password salah!' },
        { status: 401 }
      );
    }

    // 3. Clear any expired sessions for this admin in the DB
    await prisma.session.deleteMany({
      where: {
        adminId: admin.id,
        expiresAt: { lt: new Date() },
      },
    }).catch(() => {});

    // 4. Generate random secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours expiry

    // 5. Store session in DB
    await prisma.session.create({
      data: {
        token,
        adminId: admin.id,
        expiresAt,
      },
    });

    // 6. Set httpOnly secure cookie
    const cookieStore = await cookies();
    cookieStore.set('sutanting_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
