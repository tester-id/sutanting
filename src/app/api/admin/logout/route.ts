import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sutanting_admin_session')?.value;
    if (token) {
      await prisma.session.delete({ where: { token } }).catch(() => {});
    }
    cookieStore.delete('sutanting_admin_session');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
