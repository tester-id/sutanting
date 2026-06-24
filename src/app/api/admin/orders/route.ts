import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';


export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID pesanan dan status wajib disertakan' }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui status pesanan' }, { status: 500 });
  }
}
