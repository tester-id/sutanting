import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Helper to check authentication
async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get('sutanting_admin_session');
  return session?.value === 'true';
}

export async function GET() {
  try {
    const dbSettings = await prisma.setting.findMany();
    
    // Convert array to key-value object
    const settingsObj: Record<string, any> = {
      shipping_fee: 10000,
      tax_percentage: 5,
      promo_codes: [{ code: 'SUTANTINGHALAL', discount: 5000 }]
    };

    dbSettings.forEach((s) => {
      if (s.key === 'admin_password_hash') {
        // Prevent exposing hashed credentials
        return;
      }
      if (s.key === 'promo_codes') {
        try {
          settingsObj[s.key] = JSON.parse(s.value);
        } catch {
          settingsObj[s.key] = [];
        }
      } else if (s.key === 'shipping_fee' || s.key === 'tax_percentage') {
        settingsObj[s.key] = Number(s.value);
      } else {
        settingsObj[s.key] = s.value;
      }
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pengaturan' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shipping_fee, tax_percentage, promo_codes, new_password } = body;

    if (shipping_fee !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'shipping_fee' },
        update: { value: String(shipping_fee) },
        create: { key: 'shipping_fee', value: String(shipping_fee) },
      });
    }

    if (tax_percentage !== undefined) {
      await prisma.setting.upsert({
        where: { key: 'tax_percentage' },
        update: { value: String(tax_percentage) },
        create: { key: 'tax_percentage', value: String(tax_percentage) },
      });
    }

    if (promo_codes !== undefined) {
      const promoCodesStr = typeof promo_codes === 'string' ? promo_codes : JSON.stringify(promo_codes);
      await prisma.setting.upsert({
        where: { key: 'promo_codes' },
        update: { value: promoCodesStr },
        create: { key: 'promo_codes', value: promoCodesStr },
      });
    }

    if (new_password !== undefined && new_password.trim() !== '') {
      const newHash = crypto.createHash('sha256').update(new_password).digest('hex');
      await prisma.setting.upsert({
        where: { key: 'admin_password_hash' },
        update: { value: newHash },
        create: { key: 'admin_password_hash', value: newHash },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pengaturan' }, { status: 500 });
  }
}
