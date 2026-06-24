import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Helper to check authentication
async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get('sutanting_admin_session');
  return session?.value === 'true';
}

export async function GET() {
  try {
    const toppings = await prisma.topping.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(toppings);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data topping' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, extraPrice, isAvailable } = body;

    if (!name || extraPrice === undefined) {
      return NextResponse.json({ error: 'Nama dan harga ekstra wajib diisi' }, { status: 400 });
    }

    const topping = await prisma.topping.create({
      data: {
        name,
        extraPrice: Number(extraPrice),
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    return NextResponse.json(topping);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah topping' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, extraPrice, isAvailable } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID topping wajib disertakan' }, { status: 400 });
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (extraPrice !== undefined) updatedData.extraPrice = Number(extraPrice);
    if (isAvailable !== undefined) updatedData.isAvailable = isAvailable;

    const topping = await prisma.topping.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(topping);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui topping' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID topping wajib disertakan' }, { status: 400 });
    }

    await prisma.topping.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus topping' }, { status: 500 });
  }
}
