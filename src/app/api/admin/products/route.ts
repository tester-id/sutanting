import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';


export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description, price, category, imageUrl, isAvailable } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Nama dan harga wajib diisi' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: Number(price),
        category: category || 'CLASSIC',
        imageUrl: imageUrl || null,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah produk' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description, price, category, imageUrl, isAvailable } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID produk wajib disertakan' }, { status: 400 });
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (price !== undefined) updatedData.price = Number(price);
    if (category !== undefined) updatedData.category = category;
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl;
    if (isAvailable !== undefined) updatedData.isAvailable = isAvailable;

    const product = await prisma.product.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
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
      return NextResponse.json({ error: 'ID produk wajib disertakan' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 });
  }
}
