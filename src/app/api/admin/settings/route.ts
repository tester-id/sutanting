import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionAdmin, hashPassword } from '@/lib/auth';

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

    // Retrieve active logged in admin's username
    const admin = await getSessionAdmin();
    settingsObj.admin_username = admin ? admin.username : 'admin';

    return NextResponse.json(settingsObj);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pengaturan' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { shipping_fee, tax_percentage, promo_codes, new_username, new_password } = body;

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

    // Update username if requested
    if (new_username !== undefined && new_username.trim() !== '') {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { username: new_username.trim() },
      });
    }

    // Update password if requested
    if (new_password !== undefined && new_password.trim() !== '') {
      const newHash = hashPassword(new_password);
      await prisma.admin.update({
        where: { id: admin.id },
        data: { passwordHash: newHash },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Gagal memperbarui pengaturan' }, { status: 500 });
  }
}
