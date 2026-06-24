import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, whatsappNumber, address, city, notes, items, totalPrice } = body;

    if (!customerName || !whatsappNumber || !address || !city || !items || !totalPrice) {
      return NextResponse.json(
        { error: 'Semua kolom wajib diisi (kecuali catatan).' },
        { status: 400 }
      );
    }

    // Save order to the database
    const order = await prisma.order.create({
      data: {
        customerName,
        whatsappNumber,
        address,
        city,
        notes,
        items: typeof items === 'string' ? items : JSON.stringify(items),
        totalPrice: Number(totalPrice),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Gagal memproses pesanan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
