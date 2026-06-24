import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password wajib diisi!' }, { status: 400 });
    }

    // 1. Fetch password hash from DB setting
    const dbHashSetting = await prisma.setting.findUnique({
      where: { key: 'admin_password_hash' },
    });

    // 2. Hash input password
    const inputHash = crypto.createHash('sha256').update(password).digest('hex');

    // 3. Verify authenticity
    let authenticated = false;
    if (dbHashSetting) {
      authenticated = inputHash === dbHashSetting.value;
    } else {
      // Safe fallback to ENV/default if DB is not seeded/configured yet
      const fallbackPassword = process.env.ADMIN_PASSWORD || 'admin';
      authenticated = password === fallbackPassword;
    }

    if (authenticated) {
      const cookieStore = await cookies();
      cookieStore.set('sutanting_admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Password salah!' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
